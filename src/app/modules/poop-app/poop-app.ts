import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../../environments/environment';
import { Title } from '../../components/title';
import { PoopAppApiService } from './poop-app-api';

@Component({
    selector: 'app-poop-app',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, Title],
    templateUrl: './poop-app.html',
    styleUrl: './poop-app.scss',
})
export class PoopApp {
    private readonly _swPush = inject(SwPush);
    private readonly _api = inject(PoopAppApiService);

    readonly notificationsEnabled = signal<boolean>(
        typeof Notification !== 'undefined' && Notification.permission === 'granted',
    );

    readonly sending = signal<boolean>(false);
    readonly lastResult = signal<string | null>(null);
    readonly countdown = signal<number | null>(null);

    private static readonly _countdownSeconds = 5;

    async enableNotifications(): Promise<void> {
        if (!this._swPush.isEnabled) {
            this.lastResult.set('Service worker is niet actief (alleen beschikbaar in een productie-build).');
            return;
        }

        try {
            const subscription = await this._swPush.requestSubscription({
                serverPublicKey: environment.vapidPublicKey,
            });

            const sub = subscription.toJSON();
            const keys = sub.keys as { p256dh: string; auth: string };

            this._api.subscribe({
                endpoint: sub.endpoint!,
                p256dh: keys.p256dh,
                auth: keys.auth,
            }).subscribe(() => {
                this.notificationsEnabled.set(true);
                this.lastResult.set('Meldingen staan aan!');
            });
        } catch (error) {
            console.error('Kon geen toestemming krijgen voor meldingen:', error);
            this.lastResult.set('Kon geen toestemming krijgen voor meldingen.');
        }
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
