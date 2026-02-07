import { Component, inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './login-service';

declare const google: any;

@Component({
    standalone: false,
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
    private readonly _router = inject(Router);
    private readonly _authService = inject(AuthService);
    private readonly _ngZone = inject(NgZone);

    ngOnInit(): void {
        this.initializeGoogleSignIn();
    }

    initializeGoogleSignIn(): void {
        google.accounts.id.initialize({
            client_id: environment.google.clientId,
            callback: (response: any) => this.handleCredentialResponse(response),
        });

        google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'outline', size: 'large' },
        );

        google.accounts.id.prompt();
    }

    handleCredentialResponse(response: any): void {
        this._authService.handleGoogleLogin(response.credential);
    }
}
