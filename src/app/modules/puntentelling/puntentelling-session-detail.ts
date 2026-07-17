import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ScoreboardSession } from '../../apiclients/fransapi.client';
import { ConfirmDialog } from '../../components/confirm-dialog';
import { Title } from '../../components/title';
import { AuthService } from '../../core/auth/auth-service';
import { PuntentellingApiService } from './puntentelling-api';
import { PuntentellingResults } from './puntentelling-results';

// RoleType.Admin = 0 (see admin-auth-guard.ts for the same check).
const ADMIN_ROLE = 0;

@Component({
    selector: 'app-puntentelling-session-detail',
    standalone: true,
    imports: [Title, MatButtonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule, PuntentellingResults],
    templateUrl: './puntentelling-session-detail.html',
    styleUrl: './puntentelling-session-detail.scss',
})
export class PuntentellingSessionDetail {
    private readonly _route = inject(ActivatedRoute);
    private readonly _router = inject(Router);
    private readonly _api = inject(PuntentellingApiService);
    private readonly _authService = inject(AuthService);
    private readonly _dialog = inject(MatDialog);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _sessionId = this._route.snapshot.paramMap.get('id')!;

    readonly isAdmin = (): boolean => this._authService.user()?.role === ADMIN_ROLE;

    readonly loading = signal(true);
    readonly session = signal<ScoreboardSession | null>(null);

    constructor() {
        this._api.getSession(this._sessionId).subscribe({
            next: session => {
                this.session.set(session);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    deleteSession(): void {
        const session = this.session();
        if (!session)
            return;

        const dialogRef = this._dialog.open(ConfirmDialog, {
            data: {
                title: 'Potje verwijderen',
                message: `Weet je zeker dat je "${session.name || 'Potje'}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`,
                confirmLabel: 'Verwijderen',
            },
            width: '400px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(confirmed => {
            if (!confirmed)
                return;

            this._api.deleteSession(session.id).subscribe(() => {
                this._router.navigate(['/puntentelling/geschiedenis']);
            });
        });
    }
}
