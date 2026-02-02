import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './login-service';

@Component({
    standalone: false,
    selector: 'app-login',
    templateUrl: './login.html',
})
export class Login {
    private readonly _router = inject(Router);
    private readonly _authService = inject(AuthService);

  async login() {
    try {
      const user = await this._authService.googleLogin();
      this._router.navigate(['/']);
    } catch (err: any) {
      console.error(err);
        }
  }

  async logout() {
    try {
      await this._authService.signOut();
      this._router.navigate(['/login']);
    }
    catch (err: any) {
      console.error(err);
    }
  }
}