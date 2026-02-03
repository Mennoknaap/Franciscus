import { CommonModule } from '@angular/common';
import { Component, isDevMode, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-pwa-install-prompt',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
    templateUrl: './pwa-install-prompt.html',
    styleUrl: './pwa-install-prompt.scss',
})
export class PwaInstallPrompt implements OnInit {
    showBlocker = signal(false);

    ngOnInit(): void {
        // In development mode, don't block the app
        if (isDevMode())
            return;

        // Check if running as PWA
        const isInPWA = this.isPWA();

        // If not in PWA mode, block the app
        if (!isInPWA)
            this.showBlocker.set(true);

    }

    isPWA(): boolean {
        // Check if running in standalone mode (PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // @ts-expect-error - navigator.standalone is iOS specific
        const isIOSStandalone = window.navigator.standalone === true;

        return isStandalone || isIOSStandalone;
    }

    isIOS(): boolean {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    isAndroid(): boolean {
        return /Android/.test(navigator.userAgent);
    }
}
