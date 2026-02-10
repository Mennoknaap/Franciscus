import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Auth, signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FransApiClient, PutUser, User } from '../../apiclients/fransapi.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _router = inject(Router);
    private readonly _api = inject(FransApiClient);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _firebaseAuth = inject(Auth);

    private readonly _user = signal<User | null>(null);
    readonly user = this._user.asReadonly();

    private readonly _isInitialized = signal<boolean>(false);
    readonly isInitialized = toObservable(this._isInitialized);

    constructor() {
        this.initializeAuth();
    }

    private initializeAuth(): void {
        const authToken = localStorage.getItem('authToken');
        const googleAuthToken = localStorage.getItem('googleAuthToken');

        if (googleAuthToken)
            this.signInToFirebase(googleAuthToken);

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
        localStorage.setItem('googleAuthToken', idToken);

        this.signInToFirebase(idToken);

        this._api.auth(idToken).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(response => {
            localStorage.setItem('authToken', response.authToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            this._api.userCurrent().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(user => {
                this._user.set(user);
                this._router.navigate(['/home']);
            });
        });
    }

    private async signInToFirebase(googleIdToken: string): Promise<void> {
        try {
            const credential = GoogleAuthProvider.credential(googleIdToken);
            await signInWithCredential(this._firebaseAuth, credential);
        } catch (error) {
            console.error('Firebase Auth error:', error);
        }
    }

    updateProfile(userData: PutUser): Observable<void> {
        const currentUser = this._user();
        if (!currentUser)
            throw new Error('No user logged in');

        return new Observable(observer => {
            this._api.userPut(currentUser.id, userData)
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe({
                    next: () => {
                        // Update local user state
                        this._user.set({ ...currentUser, ...userData });
                        observer.next();
                        observer.complete();
                    },
                    error: err => observer.error(err),
                });
        });
    }

    async signOut(): Promise<void> {
        await firebaseSignOut(this._firebaseAuth);

        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('googleAuthToken');
        this._user.set(null);
        this._router.navigate(['/login']);
    }
}
