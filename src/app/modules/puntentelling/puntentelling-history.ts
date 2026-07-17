import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import dayjs from 'dayjs';
import { ScoreboardSession } from '../../apiclients/fransapi.client';
import { ConfirmDialog } from '../../components/confirm-dialog';
import { Title } from '../../components/title';
import { AuthService } from '../../core/auth/auth-service';
import { PuntentellingApiService } from './puntentelling-api';

// RoleType.Admin = 0 (see admin-auth-guard.ts for the same check).
const ADMIN_ROLE = 0;

@Component({
    selector: 'app-puntentelling-history',
    standalone: true,
    imports: [Title, RouterLink, MatButtonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
    templateUrl: './puntentelling-history.html',
    styleUrl: './puntentelling-history.scss',
})
export class PuntentellingHistory {
    private readonly _api = inject(PuntentellingApiService);
    private readonly _authService = inject(AuthService);
    private readonly _dialog = inject(MatDialog);
    private readonly _destroyRef = inject(DestroyRef);

    readonly isAdmin = (): boolean => this._authService.user()?.role === ADMIN_ROLE;

    readonly loading = signal(true);
    readonly sessions = signal<ScoreboardSession[]>([]);

    constructor() {
        this.loadSessions();
    }

    topTeamName(session: ScoreboardSession): string | null {
        if (session.teams.length === 0)
            return null;

        return [...session.teams].sort((a, b) => b.score - a.score)[0].name;
    }

    formatDate(date: dayjs.Dayjs): string {
        return dayjs(date).format('D MMM YYYY, HH:mm');
    }

    deleteSession(event: MouseEvent, session: ScoreboardSession): void {
        event.preventDefault();
        event.stopPropagation();

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
                this.sessions.update(sessions => sessions.filter(s => s.id !== session.id));
            });
        });
    }

    private loadSessions(): void {
        this._api.getSessions().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(sessions => {
            this.sessions.set(sessions);
            this.loading.set(false);
        });
    }
}
