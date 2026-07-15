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
    production: false,
    apiUrl: 'https://localhost:7225',
    // apiUrl: 'https://franciscus-api.stanenmennocomite.nl',
    firebase: {
        apiKey: 'AIzaSyCInoEQW6NsIvJNbX4KNAV7r2G3iaaNf6Y',
        authDomain: 'fransiscus-soundboard.firebaseapp.com',
        projectId: 'fransiscus-soundboard',
        storageBucket: 'fransiscus-soundboard.firebasestorage.app',
        messagingSenderId: '664118805963',
        appId: '1:664118805963:web:bb784302fee49b2663a24e',
    },
    google: {
        clientId: '664118805963-ejuvvnucruv5073k7dcb6n2tap0bo4es.apps.googleusercontent.com',
    },
    vapidPublicKey: 'BGqTHPqY84YOqtKvbj6f-qdu5Sck8p-QLgXD4IVedKP7Wn0FzKzMoWjGmc9Hp48wOxK7S8WJk4VYGOWsgnNQ7ek',
};
