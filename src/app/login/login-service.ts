import { inject, Injectable } from '@angular/core';
import { Auth, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly _router = inject(Router);

  public user$ = user(this.auth);

  constructor() {
    this.auth.setPersistence(browserLocalPersistence);
  }

  async googleLogin(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      this._router.navigate(['/']);
    } catch (error) {
      console.error('Google-Login error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this._router.navigate(['/login']);
  }
}