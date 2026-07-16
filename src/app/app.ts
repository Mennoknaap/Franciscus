import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { PwaInstallPrompt } from './components/pwa-install-prompt';
import { AuthService } from './core/auth/auth-service';
import { PushNotificationService } from './core/push/push-notification-service';

@Component({
    imports: [MatButtonModule, RouterOutlet, MatIconModule, PwaInstallPrompt],
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    private readonly _authService = inject(AuthService);
    private readonly _pushService = inject(PushNotificationService);

    constructor() {
        // Refresh an existing push subscription every time the app opens, for anyone
        // with poop-app access who already granted permission — see
        // PushNotificationService.refreshIfAlreadyGranted for why this is needed.
        effect(() => {
            if (this._authService.user()?.grantedApps?.includes('poop-app'))
                this._pushService.refreshIfAlreadyGranted();
        });
    }
}
