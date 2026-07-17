import { Component, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardSession } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { PuntentellingApiService } from './puntentelling-api';
import { PuntentellingResults } from './puntentelling-results';

@Component({
    selector: 'app-puntentelling-session-detail',
    standalone: true,
    imports: [Title, MatProgressSpinnerModule, PuntentellingResults],
    templateUrl: './puntentelling-session-detail.html',
    styleUrl: './puntentelling-session-detail.scss',
})
export class PuntentellingSessionDetail {
    private readonly _route = inject(ActivatedRoute);
    private readonly _api = inject(PuntentellingApiService);
    private readonly _sessionId = this._route.snapshot.paramMap.get('id')!;

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
}
