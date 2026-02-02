import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '@angular/fire/auth';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../login/login-service';

@Component({
    imports: [MatButtonModule, MatIconModule, MatMenuModule],
    templateUrl: './title.html',
    selector: 'app-title',
        styles: [`
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .title-button {
                color: var(--mat-sys-error);
                position: absolute;
                left: 0.5rem;
                top: 50%;
                transform: translateY(-50%);

                &.menu {
                    left: unset;
                    right: 0.5rem;
                    // image stretching
                    background-size: cover;
                }
            }
        `],
})
export class Title {
    private readonly _authService = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);

    readonly user = signal<User | null>(null);

    constructor() {
        this._authService.user$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(user => {
            this.user.set(user);
        });
    }

    signOut() {
        this._authService.signOut();
    }
}
