import { Component } from '@angular/core';

export interface AppCard {
    title: string;
    image: string;
    path: string;
}

@Component({
    standalone: false,
    selector: 'app-home',
    styleUrls: ['./home.scss'],
    templateUrl: './home.html',
})
export class Home {
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
    ];
}
