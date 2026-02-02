import { FirebaseOptions } from "@angular/fire/app";

interface Environment {
  production: boolean;
  firebase: FirebaseOptions;
}

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCInoEQW6NsIvJNbX4KNAV7r2G3iaaNf6Y",
    authDomain: "fransiscus-soundboard.firebaseapp.com",
    projectId: "fransiscus-soundboard",
    storageBucket: "fransiscus-soundboard.firebasestorage.app",
    messagingSenderId: "664118805963",
    appId: "1:664118805963:web:bb784302fee49b2663a24e"
  }
};