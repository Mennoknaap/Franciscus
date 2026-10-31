import { booleanAttribute, Component, DestroyRef, inject, input } from '@angular/core';
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
    host: { '[class.title-hero]': 'hero()' },
    styles: [`
            :host {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 14px 10px;
            }
            h1 {
                flex: 1;
                min-width: 0;
                margin: 0;
                font-size: 1.5rem;
                font-weight: 800;
                line-height: 1.1;
                color: var(--frans-ink);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .title-button {
                flex-shrink: 0;
                width: 40px;
                height: 40px;
                padding: 0;
                border-radius: 12px;
                background: var(--frans-card);
                border: 1px solid var(--frans-line);
                color: var(--frans-ink);
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .avatar {
                flex-shrink: 0;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 0;
                padding: 0;
                cursor: pointer;
                color: #fff;
                font: 700 0.85rem var(--frans-font-display);
                background: linear-gradient(135deg, #F4B46A, #D9734A) center / cover;
                box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--frans-line);
            }
            :host(.title-hero) {
                padding: 8px 20px 0;
                align-items: flex-start;
            }
            :host(.title-hero) h1 {
                font-size: 1.9rem;
                color: #fff;
                white-space: normal;
                letter-spacing: -0.02em;
            }
            :host(.title-hero) .avatar {
                box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85);
            }
        `],
})
export class Title {
    private readonly _authService = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _router = inject(Router);
    private readonly _dialog = inject(MatDialog);

    readonly previousPath = input<string>();
    readonly hero = input(false, { transform: booleanAttribute });
    readonly user = this._authService.user;

    initials(): string {
        const user = this.user();
        return ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase();
    }

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
