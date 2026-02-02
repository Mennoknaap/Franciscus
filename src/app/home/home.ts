import { Component } from '@angular/core';

export interface AppCard {
    title: string;
    description: string;
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
            description: 'Alle geluiden van Fransiscus',
            image: 'assets/icons/speaker.png',
            path: 'soundboard',
        },
    ];
}