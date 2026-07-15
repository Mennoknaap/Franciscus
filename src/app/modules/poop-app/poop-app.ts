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

    sendTestNotification(): void {
        this.sending.set(true);
        this.lastResult.set(null);

        this._api.sendTestNotification().subscribe({
            next: () => {
                this.sending.set(false);
                this.lastResult.set('Test-bericht verstuurd!');
            },
            error: () => {
                this.sending.set(false);
                this.lastResult.set('Versturen mislukt.');
            },
        });
    }
}
