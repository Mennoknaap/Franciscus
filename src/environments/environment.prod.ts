import { FirebaseOptions } from '@angular/fire/app';

interface Environment {
    production: boolean;
    apiUrl: string;
    firebase: FirebaseOptions;
    google: {
        clientId: string;
    };
    vapidPublicKey: string;
}

export const environment: Environment = {
    production: true,
    apiUrl: 'https://franciscus-api.stanenmennocomite.nl',
    firebase: {
        apiKey: 'AIzaSyCInoEQW6NsIvJNbX4KNAV7r2G3iaaNf6Y',
        authDomain: 'fransiscus-soundboard.firebaseapp.com',
        projectId: 'fransiscus-soundboard',
        messagingSenderId: '664118805963',
        appId: '1:664118805963:web:bb784302fee49b2663a24e',
    },
    google: {
        clientId: '664118805963-ejuvvnucruv5073k7dcb6n2tap0bo4es.apps.googleusercontent.com',
    },
    vapidPublicKey: 'BKB8R0ngbGEQh7e713ghuJ_4MnF3S7eK2yCJJBgrGhWnHgjLxmMfhpwS0Q7dqjy7O9zKvjNWsXzE-sXjyBY7J9Q',
};
