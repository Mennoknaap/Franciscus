import { Component, computed, inject, signal } from '@angular/core';
import { FransApiClient, User } from '../../apiclients/fransapi.client';
import { PushNotificationService } from '../../core/push/push-notification-service';

export interface AppCard {
    title: string;
    icon: string;
    color: string;
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
            icon: 'volume_up',
            color: '#F97316',
            path: '/soundboard',
            requiresAppKey: 'soundboard',
        },
        {
            title: 'Radje',
            icon: 'casino',
            color: '#8B5CF6',
            path: '/wheel',
            requiresAppKey: 'wheel',
        },
        {
            title: 'Liedjes',
            icon: 'music_note',
            color: '#EC4899',
            path: '/liedjes',
            requiresAppKey: 'liedjes',
        },
        {
            title: 'Poeplog',
            icon: 'wc',
            color: '#92562A',
            path: '/poop-app',
            requiresAppKey: 'poop-app',
        },
        {
            title: 'Biertje?',
            icon: 'sports_bar',
            color: '#E3A008',
            path: '/biertje',
            requiresAppKey: 'biertje',
        },
        {
            title: 'Wijntje?',
            icon: 'wine_bar',
            color: '#9F1239',
            path: '/wijntje',
            requiresAppKey: 'wijntje',
        },
        {
            title: 'Stelz?',
            icon: 'local_drink',
            color: '#0D9488',
            path: '/stelz',
            requiresAppKey: 'stelz',
        },
        {
            title: 'Leiding Goreng?',
            icon: 'restaurant',
            color: '#0EA5E9',
            path: '/leiding-goreng',
            requiresAppKey: 'leiding-goreng',
        },
        {
            title: 'Shwazi',
            icon: 'touch_app',
            color: '#06B6D4',
            path: '/shwazi',
            requiresAppKey: 'shwazi',
        },
        {
            title: 'Vleesdoos',
            icon: 'auto_awesome',
            color: '#E11D48',
            path: '/kud',
            requiresAppKey: 'kud',
        },
        {
            title: 'Puntentelling',
            icon: 'leaderboard',
            color: '#2563EB',
            path: '/puntentelling',
            requiresAppKey: 'puntentelling',
        },
        {
            title: 'Badjasspel',
            icon: 'checkroom',
            color: '#4F46E5',
            path: '/badjasspel',
            requiresAppKey: 'badjasspel',
        },
    ];

    readonly today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    readonly greeting = greetingFor(new Date().getHours());

    readonly visibleApps = computed(() => {
        const grantedApps = this.user()?.grantedApps ?? [];
        return this.apps.filter(app => !app.requiresAppKey || grantedApps.includes(app.requiresAppKey));
    });

    // Only worth asking for push permission if the person actually has an app that
    // uses it — showing this to everyone would just be a pointless, confusing prompt.
    // Once permission is 'denied' there's normally nothing left to show (the browser
    // won't prompt again), *except* right after a just-failed attempt — the banner has
    // to stay up in that case, otherwise notificationError would be set but instantly
    // hidden along with the rest of the banner.
    readonly showNotificationPrompt = computed(() => {
        const grantedApps = this.user()?.grantedApps ?? [];
        return (grantedApps.includes('poop-app') || grantedApps.includes('badjasspel'))
            && !this._pushService.permissionGranted()
            && (!this._pushService.permissionDenied() || !!this.notificationError());
    });

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

function greetingFor(hour: number): string {
    if (hour < 6)
        return 'Goedenacht';
    if (hour < 12)
        return 'Goedemorgen';
    if (hour < 18)
        return 'Goedemiddag';
    return 'Goedenavond';
}
