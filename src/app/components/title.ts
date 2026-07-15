import { Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth-service';
import { ProfileDialog } from './profile-dialog';

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
    private readonly _dialog = inject(MatDialog);

    readonly previousPath = input<string>();
    readonly user = this._authService.user;

    goToAdminPage(): void {
        this._router.navigate(['/admin']);
    }

    openProfile(): void {
        const currentUser = this.user();
        if (!currentUser)
            return;

        const dialogRef = this._dialog.open(ProfileDialog, {
            data: { user: currentUser },
            width: '500px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(result => {
            if (result)
                this._authService.updateProfile(result).subscribe();

        });
    }

    goBack(): void {
        const path = this.previousPath();
        if (path)
            this._router.navigate([path]);

    }

    signOut(): void {
        this._authService.signOut();
    }
}
