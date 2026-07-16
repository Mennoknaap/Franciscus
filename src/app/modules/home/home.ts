import { Component, computed, inject, signal } from '@angular/core';
import { FransApiClient, User } from '../../apiclients/fransapi.client';
import { PushNotificationService } from '../../core/push/push-notification-service';

export interface AppCard {
    title: string;
    image?: string;
    icon?: string;
    path?: string;
    disabled?: boolean;
    requiresAppKey?: string;
}

@Component({
    standalone: false,
    selector: 'app-home',
    styleUrls: ['./home.scss'],
    templateUrl: './home.html',
})
export class Home {
    private readonly _api = inject(FransApiClient);
    private readonly _pushService = inject(PushNotificationService);

    user = signal<User | null>(null);
    enablingNotifications = signal<boolean>(false);
    notificationError = signal<string | null>(null);

    constructor() {
        this._api.userCurrent().subscribe(options => {
            this.user.set(options);
        });
    }

    apps: AppCard[] = [
        {
            title: 'Soundboard',
            image: 'assets/icons/speaker.png',
            path: '/soundboard',
            requiresAppKey: 'soundboard',
        },
        {
            title: 'Radje',
            image: 'assets/icons/rad.png',
            path: '/wheel',
            requiresAppKey: 'wheel',
        },
        {
            title: 'Liedjes',
            icon: 'music_note',
            path: '/liedjes',
            requiresAppKey: 'liedjes',
        },
        {
            title: 'Poeplog',
            image: 'assets/icons/poop.png',
            path: '/poop-app',
            requiresAppKey: 'poop-app',
        },
    ];

    readonly visibleApps = computed(() => {
        const grantedApps = this.user()?.grantedApps ?? [];
        return this.apps.filter(app => !app.requiresAppKey || grantedApps.includes(app.requiresAppKey));
    });

    // Only worth asking for push permission if the person actually has an app that
    // uses it — showing this to everyone would just be a pointless, confusing prompt.
    readonly showNotificationPrompt = computed(() =>
        (this.user()?.grantedApps ?? []).includes('poop-app')
        && !this._pushService.permissionGranted()
        && !this._pushService.permissionDenied(),
    );

    async enableNotifications(): Promise<void> {
        this.enablingNotifications.set(true);
        this.notificationError.set(null);
        const success = await this._pushService.subscribe();
        this.enablingNotifications.set(false);

        // A failure here without the browser ever showing its own permission prompt
        // usually means the user (or iOS) already blocked it at the system level —
        // clicking again won't help, only changing it in the device's own Settings will.
        if (!success)
            this.notificationError.set('Kon geen toestemming vragen — controleer de meldingeninstellingen van dit toestel.');
    }
}
