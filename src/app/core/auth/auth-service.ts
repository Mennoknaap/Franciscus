import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FransApiClient, User } from '../../apiclients/fransapi.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _router = inject(Router);
    private readonly _api = inject(FransApiClient);
    private readonly _destroyRef = inject(DestroyRef);

    private readonly _user = signal<User | null>(null);
    readonly user = this._user.asReadonly();

    private readonly _isInitialized = signal<boolean>(false);
    readonly isInitialized = toObservable(this._isInitialized);

    constructor() {
        this.initializeAuth();
    }

    private initializeAuth(): void {
        const authToken = localStorage.getItem('authToken');

        if (authToken) {
            this._api.userCurrent()
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe({
                    next: user => {
                        this._user.set(user);
                        this._isInitialized.set(true);
                    },
                    error: () => this.signOut(),
                });
        } else {
            this._isInitialized.set(true);
        }
    }

    handleGoogleLogin(idToken: string): void {
        this._api.auth(idToken).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(response => {
            console.log('API response:', response);
            localStorage.setItem('authToken', response.authToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            this._api.userCurrent().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(user => {
                this._user.set(user);
                this._router.navigate(['/home']);
            });
        });
    }

    async signOut(): Promise<void> {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        this._user.set(null);
        this._router.navigate(['/login']);
    }
}
