import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import dayjs from 'dayjs';
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

interface LogViewEntry {
    id: string;
    isMine: boolean;
    canDelete: boolean;
    senderName: string;
    text: string;
    time: string;
}

@Component({
    selector: 'app-poop-app',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, MatIconModule, Title],
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

    ngOnInit(): void {
        this._api.getLog().subscribe({
            next: entries => {
                this.log.set(entries.map(entry => this.toViewEntry(entry)));
                this.loadingLog.set(false);
            },
            error: () => this.loadingLog.set(false),
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
                this.log.update(entries => [...entries, this.toViewEntry(entry)]);
                this.logging.set(false);
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

    // A quick undo for an accidental misclick — no confirmation, unlike clearing the
    // whole log, since deleting a single message you (or, for an admin, someone else)
    // just sent is low-stakes and trivially redone.
    deleteEntry(id: string): void {
        this._api.deleteEntry(id).subscribe(() => {
            this.log.update(entries => entries.filter(entry => entry.id !== id));
        });
    }

    private toViewEntry(entry: PoopLogEntry): LogViewEntry {
        const isMine = entry.loggedByUserId === this._authService.user()?.id;
        return {
            id: entry.id,
            isMine,
            canDelete: isMine || this.isAdmin(),
            senderName: entry.loggedByName,
            text: entry.type === POOP_LOG_TYPE_POOP ? 'Hij heeft gepoept 💩' : 'Hij heeft geplast 💦',
            time: dayjs(entry.createdAt).format('HH:mm'),
        };
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
