import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import dayjs from 'dayjs';
import { environment } from '../../../environments/environment';
import { PoopLogEntry, PoopLogType } from '../../apiclients/fransapi.client';
import { ConfirmDialog } from '../../components/confirm-dialog';
import { Title } from '../../components/title';
import { AuthService } from '../../core/auth/auth-service';
import { PushNotificationService } from '../../core/push/push-notification-service';
import { PoopAppApiService } from './poop-app-api';

// Matches the backend's PoopLogType enum (Poop = 0, Pee = 1) — NSwag generates enums as
// plain number-literal union types, not runtime objects, so the values are just numbers.
const POOP_LOG_TYPE_POOP: PoopLogType = 0;
const POOP_LOG_TYPE_PEE: PoopLogType = 1;

// RoleType.Admin = 0 (see admin-auth-guard.ts for the same check).
const ADMIN_ROLE = 0;

type DisplayMode = 'text' | 'sticker';
const DISPLAY_MODE_STORAGE_KEY = 'poeplog-display-mode';

interface LogViewEntry {
    id: string;
    type: PoopLogType;
    isMine: boolean;
    canDelete: boolean;
    senderName: string;
    text: string;
    time: string;
    dateKey: string;
    dateLabel: string;
    showDateSeparator: boolean;
}

@Component({
    selector: 'app-poop-app',
    standalone: true,
    imports: [MatButtonModule, MatButtonToggleModule, MatDialogModule, MatIconModule, MatMenuModule, Title],
    templateUrl: './poop-app.html',
    styleUrl: './poop-app.scss',
})
export class PoopApp implements OnInit {
    private readonly _pushService = inject(PushNotificationService);
    private readonly _api = inject(PoopAppApiService);
    private readonly _authService = inject(AuthService);
    private readonly _dialog = inject(MatDialog);

    readonly notificationsEnabled = this._pushService.permissionGranted;
    readonly isAdmin = (): boolean => this._authService.user()?.role === ADMIN_ROLE;

    readonly log = signal<LogViewEntry[]>([]);
    readonly loadingLog = signal<boolean>(true);
    readonly logging = signal<boolean>(false);

    readonly lastResult = signal<string | null>(null);

    private readonly _chatLog = viewChild<ElementRef<HTMLDivElement>>('chatLog');

    // Purely a personal, local display preference — not synced anywhere — so one person
    // viewing in sticker mode doesn't affect what anyone else sees.
    readonly displayMode = signal<DisplayMode>(
        (localStorage.getItem(DISPLAY_MODE_STORAGE_KEY) as DisplayMode | null) ?? 'text',
    );

    // undefined = "not fetched yet", null = "fetched, nothing uploaded" — only relevant to
    // distinguish while the initial GET is in flight; both render as plain text either way.
    readonly poopStickerUrl = signal<string | null | undefined>(undefined);
    readonly peeStickerUrl = signal<string | null | undefined>(undefined);

    // Newest entry is always last (see GetLog's OrderBy CreatedAt), so both opening the
    // page and sending a new one should land you at the bottom, like any chat app.
    // setTimeout (a macrotask) rather than rAF/microtask — needed so this runs *after*
    // Angular's zoneless change detection has actually applied the signal update to the
    // DOM, which a same-tick or same-microtask read would still be stale for.
    private scrollToBottom(): void {
        setTimeout(() => {
            const el = this._chatLog()?.nativeElement;
            if (el)
                el.scrollTop = el.scrollHeight;
        });
    }

    ngOnInit(): void {
        this._api.getLog().subscribe({
            next: entries => {
                const viewEntries = entries.map(entry => this.toViewEntry(entry));
                this.markDateSeparators(viewEntries);
                this.log.set(viewEntries);
                this.loadingLog.set(false);
                this.scrollToBottom();
            },
            error: () => this.loadingLog.set(false),
        });

        this._api.getStickers().subscribe(stickers => {
            const poop = stickers.find(s => s.type === POOP_LOG_TYPE_POOP);
            const pee = stickers.find(s => s.type === POOP_LOG_TYPE_PEE);
            this.poopStickerUrl.set(poop ? environment.apiUrl + poop.url : null);
            this.peeStickerUrl.set(pee ? environment.apiUrl + pee.url : null);
        });
    }

    setDisplayMode(mode: DisplayMode): void {
        this.displayMode.set(mode);
        localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode);
    }

    stickerUrlFor(type: PoopLogType): string | null | undefined {
        return type === POOP_LOG_TYPE_POOP ? this.poopStickerUrl() : this.peeStickerUrl();
    }

    uploadPoopSticker(event: Event): void {
        this.uploadSticker(POOP_LOG_TYPE_POOP, event);
    }

    uploadPeeSticker(event: Event): void {
        this.uploadSticker(POOP_LOG_TYPE_PEE, event);
    }

    private uploadSticker(type: PoopLogType, event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file)
            return;

        this._api.uploadSticker(type, file).subscribe(sticker => {
            const url = environment.apiUrl + sticker.url;
            if (type === POOP_LOG_TYPE_POOP)
                this.poopStickerUrl.set(url);
            else
                this.peeStickerUrl.set(url);

            input.value = '';
        });
    }

    logPoop(): void {
        this.logAction(POOP_LOG_TYPE_POOP);
    }

    logPee(): void {
        this.logAction(POOP_LOG_TYPE_PEE);
    }

    private logAction(type: PoopLogType): void {
        this.logging.set(true);
        this._api.addLogEntry(type).subscribe({
            next: entry => {
                this.log.update(entries => {
                    const updated = [...entries, this.toViewEntry(entry)];
                    this.markDateSeparators(updated);
                    return updated;
                });
                this.logging.set(false);
                this.scrollToBottom();
            },
            error: () => this.logging.set(false),
        });
    }

    clearLog(): void {
        const dialogRef = this._dialog.open(ConfirmDialog, {
            data: {
                title: 'Poeplog wissen',
                message: ['Weet je zeker dat je het hele Poeplog wilt wissen?', 'Deze actie kan niet ongedaan worden gemaakt.'],
                confirmLabel: 'Wissen',
            },
            width: '400px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (!confirmed)
                return;

            this._api.clearLog().subscribe(() => this.log.set([]));
        });
    }

    deleteEntry(id: string): void {
        const dialogRef = this._dialog.open(ConfirmDialog, {
            data: { title: 'Bericht verwijderen', message: 'Weet je zeker dat je dit bericht wilt verwijderen?' },
            width: '400px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (!confirmed)
                return;

            this._api.deleteEntry(id).subscribe(() => {
                this.log.update(entries => {
                    const updated = entries.filter(entry => entry.id !== id);
                    // Removing an entry can un-orphan the date separator that used to sit
                    // on the deleted entry — recompute rather than just filtering it out.
                    this.markDateSeparators(updated);
                    return updated;
                });
            });
        });
    }

    private toViewEntry(entry: PoopLogEntry): LogViewEntry {
        const isMine = entry.loggedByUserId === this._authService.user()?.id;
        const created = dayjs(entry.createdAt);
        return {
            id: entry.id,
            type: entry.type,
            isMine,
            canDelete: isMine || this.isAdmin(),
            senderName: entry.loggedByName,
            text: entry.type === POOP_LOG_TYPE_POOP ? 'Hij heeft gepoept 💩' : 'Hij heeft geplast 💦',
            time: created.format('HH:mm'),
            dateKey: created.format('YYYY-MM-DD'),
            dateLabel: this.dateLabelFor(created),
            showDateSeparator: false, // decided afterwards, in context of the full list — see markDateSeparators
        };
    }

    // WhatsApp-style grouping: "Vandaag"/"Gisteren" for the two most recent days, the Dutch
    // day name for the rest of the current week, and a full date beyond that — otherwise a
    // long-running log reads as one undifferentiated wall of messages with no sense of time.
    private dateLabelFor(date: dayjs.Dayjs): string {
        const today = dayjs();
        if (date.isSame(today, 'day'))
            return 'Vandaag';

        if (date.isSame(today.subtract(1, 'day'), 'day'))
            return 'Gisteren';

        if (date.isAfter(today.subtract(7, 'day'), 'day')) {
            const dayName = date.format('dddd');
            return dayName.charAt(0).toUpperCase() + dayName.slice(1);
        }

        return date.format('D MMMM YYYY');
    }

    private markDateSeparators(entries: LogViewEntry[]): void {
        let lastDateKey: string | null = null;
        for (const entry of entries) {
            entry.showDateSeparator = entry.dateKey !== lastDateKey;
            lastDateKey = entry.dateKey;
        }
    }

    async enableNotifications(): Promise<void> {
        const success = await this._pushService.subscribe();

        // A failure here without the browser ever showing its own permission prompt
        // usually means it's already blocked at the system level — clicking again
        // won't help, only changing it in the device's own Settings will.
        this.lastResult.set(success
            ? 'Meldingen staan aan!'
            : 'Kon geen toestemming vragen — controleer de meldingeninstellingen van dit toestel.');
    }
}
