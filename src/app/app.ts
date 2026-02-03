import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { PwaInstallPrompt } from './components/pwa-install-prompt';

@Component({
    imports: [MatButtonModule, RouterOutlet, MatIconModule, PwaInstallPrompt],
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
}
