import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth-service';

declare const google: any;

@Component({
    standalone: false,
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
    private readonly _authService = inject(AuthService);

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
