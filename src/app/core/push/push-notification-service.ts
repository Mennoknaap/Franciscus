import { inject, Injectable, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FransApiClient } from '../../apiclients/fransapi.client';

// Centralizes push-subscription handling so both the home screen's opt-in prompt and
// the poop-app page's own controls share one subscribe path, instead of duplicating it.
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
    private readonly _swPush = inject(SwPush);
    private readonly _api = inject(FransApiClient);

    private _refreshedThisSession = false;

    readonly permissionGranted = signal<boolean>(
        typeof Notification !== 'undefined' && Notification.permission === 'granted',
    );

    // 'denied' can't be undone from script — the user has to change it themselves in
    // their browser/OS settings, so there's no point showing an "enable" prompt for it.
    readonly permissionDenied = signal<boolean>(
        typeof Notification !== 'undefined' && Notification.permission === 'denied',
    );

    async subscribe(): Promise<boolean> {
        if (!this._swPush.isEnabled)
            return false;

        try {
            const subscription = await this._swPush.requestSubscription({
                serverPublicKey: environment.vapidPublicKey,
            });

            const sub = subscription.toJSON();
            const keys = sub.keys as { p256dh: string; auth: string };

            await firstValueFrom(this._api.pushSubscribePost({
                endpoint: sub.endpoint!,
                p256dh: keys.p256dh,
                auth: keys.auth,
            }));

            this.permissionGranted.set(true);
            this.permissionDenied.set(false);
            return true;
        } catch (error) {
            console.error('Kon geen abonnement op meldingen aanmaken:', error);
            this.permissionDenied.set(typeof Notification !== 'undefined' && Notification.permission === 'denied');
            return false;
        }
    }

    // Meant to run once per app load, for users who already granted permission earlier.
    // Safari/iOS push subscriptions can silently go stale without ever firing the
    // standard `pushsubscriptionchange` event, so proactively re-subscribing — a no-op
    // permission-prompt-wise once already granted — is the practical way to keep them
    // fresh instead of relying on a browser event that iOS doesn't reliably send.
    async refreshIfAlreadyGranted(): Promise<void> {
        if (this._refreshedThisSession)
            return;

        if (typeof Notification === 'undefined' || Notification.permission !== 'granted')
            return;

        this._refreshedThisSession = true;
        await this.subscribe();
    }
}
