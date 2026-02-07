import { Component, DestroyRef, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth-service';

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
                color: var(--mat-sys-on-surface);
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);

                &.menu {
                    left: unset;
                    right: 8px;
                    background-size: cover;
                }
            }
        `],
})
export class Title {
    private readonly _authService = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _router = inject(Router);

    readonly previousPath = input<string>();
    readonly user = this._authService.user;

    goBack(): void {
        const path = this.previousPath();
        if (path)
            this._router.navigate([path]);

    }

    signOut(): void {
        this._authService.signOut();
    }
}
