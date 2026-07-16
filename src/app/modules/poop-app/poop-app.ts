import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import dayjs from 'dayjs';
import { PoopLogEntry, PoopLogType } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { AuthService } from '../../core/auth/auth-service';
import { PushNotificationService } from '../../core/push/push-notification-service';
import { PoopAppApiService } from './poop-app-api';

// Matches the backend's PoopLogType enum (Poop = 0, Pee = 1) — NSwag generates enums as
// plain number-literal union types, not runtime objects, so the values are just numbers.
const POOP_LOG_TYPE_POOP: PoopLogType = 0;
const POOP_LOG_TYPE_PEE: PoopLogType = 1;

interface LogViewEntry {
    id: string;
    isMine: boolean;
    senderName: string;
    text: string;
    time: string;
}

@Component({
    selector: 'app-poop-app',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, Title],
    templateUrl: './poop-app.html',
    styleUrl: './poop-app.scss',
})
export class PoopApp implements OnInit {
    private readonly _pushService = inject(PushNotificationService);
    private readonly _api = inject(PoopAppApiService);
    private readonly _authService = inject(AuthService);

    readonly notificationsEnabled = this._pushService.permissionGranted;

    readonly log = signal<LogViewEntry[]>([]);
    readonly loadingLog = signal<boolean>(true);
    readonly logging = signal<boolean>(false);

    readonly sending = signal<boolean>(false);
    readonly lastResult = signal<string | null>(null);
    readonly countdown = signal<number | null>(null);

    private static readonly _countdownSeconds = 5;

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

    private toViewEntry(entry: PoopLogEntry): LogViewEntry {
        return {
            id: entry.id,
            isMine: entry.loggedByUserId === this._authService.user()?.id,
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

    // Gives the tester time to lock the phone or switch away from the app before the
    // notification actually goes out — a push that arrives while this page is frontmost
    // is easy to miss, since you'd have to background the app after clicking anyway.
    sendTestNotification(): void {
        this.lastResult.set(null);
        this.sending.set(true);
        this.countdown.set(PoopApp._countdownSeconds);
        this.tickCountdown();
    }

    private tickCountdown(): void {
        setTimeout(() => {
            const remaining = this.countdown();
            if (remaining === null)
                return;

            if (remaining <= 1) {
                this.countdown.set(null);
                this.actuallySendTestNotification();
                return;
            }

            this.countdown.set(remaining - 1);
            this.tickCountdown();
        }, 1000);
    }

    private actuallySendTestNotification(): void {
        this._api.sendTestNotification().subscribe({
            next: result => {
                this.sending.set(false);

                if (result.sentCount === 0) {
                    this.lastResult.set(
                        result.subscriptionCount === 0
                            ? 'Geen abonnementen gevonden — zet meldingen eerst aan.'
                            : `Verstuurd naar 0 van ${result.subscriptionCount} abonnement(en). ${result.errors.join(' | ')}`,
                    );
                    return;
                }

                this.lastResult.set(`Test-bericht verstuurd naar ${result.sentCount} van ${result.subscriptionCount} abonnement(en)!`);
            },
            error: () => {
                this.sending.set(false);
                this.lastResult.set('Versturen mislukt.');
            },
        });
    }
}
