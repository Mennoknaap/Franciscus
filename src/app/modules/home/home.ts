import { Component, inject, signal } from '@angular/core';
import { FransApiClient, User } from '../../apiclients/fransapi.client';

export interface AppCard {
    title: string;
    image: string;
    path?: string;
    disabled?: boolean;
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
            title: 'Top Secret (coming soon)',
            image: 'assets/icons/poop.png',
            disabled: true,
        },
    ];
}
