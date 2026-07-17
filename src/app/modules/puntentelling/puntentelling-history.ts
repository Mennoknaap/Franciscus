import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import dayjs from 'dayjs';
import { ScoreboardSession } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { PuntentellingApiService } from './puntentelling-api';

@Component({
    selector: 'app-puntentelling-history',
    standalone: true,
    imports: [Title, RouterLink, MatIconModule, MatProgressSpinnerModule],
    templateUrl: './puntentelling-history.html',
    styleUrl: './puntentelling-history.scss',
})
export class PuntentellingHistory {
    private readonly _api = inject(PuntentellingApiService);
    private readonly _destroyRef = inject(DestroyRef);

    readonly loading = signal(true);
    readonly sessions = signal<ScoreboardSession[]>([]);

    constructor() {
        this._api.getSessions().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(sessions => {
            this.sessions.set(sessions);
            this.loading.set(false);
        });
    }

    topTeamName(session: ScoreboardSession): string | null {
        if (session.teams.length === 0)
            return null;

        return [...session.teams].sort((a, b) => b.score - a.score)[0].name;
    }

    formatDate(date: dayjs.Dayjs): string {
        return dayjs(date).format('D MMM YYYY, HH:mm');
    }
}
