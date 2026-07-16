import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FRANS_API_BASE_URL } from './apiclients/fransapi.client';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth-interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: FRANS_API_BASE_URL, useValue: environment.apiUrl },
        provideAuth(() => getAuth()),
        provideBrowserGlobalErrorListeners(),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideHttpClient(withInterceptors([authInterceptor])), // Voeg dit toe
        provideZonelessChangeDetection(),
        provideRouter(routes, withHashLocation()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
};
