import { Component, computed, inject, signal } from '@angular/core';
import { FransApiClient, User } from '../../apiclients/fransapi.client';

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

    user = signal<User | null>(null);

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
        },
        {
            title: 'Radje',
            image: 'assets/icons/rad.png',
            path: '/wheel',
        },
        {
            title: 'Liedjes',
            icon: 'music_note',
            path: '/liedjes',
        },
        {
            title: 'Top Secret',
            image: 'assets/icons/poop.png',
            path: '/poop-app',
            requiresAppKey: 'poop-app',
        },
    ];

    readonly visibleApps = computed(() => {
        const grantedApps = this.user()?.grantedApps ?? [];
        return this.apps.filter(app => !app.requiresAppKey || grantedApps.includes(app.requiresAppKey));
    });
}
