import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FransApiClient, ScoreboardSession } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class PuntentellingApiService {
    private readonly _api = inject(FransApiClient);

    getActive(): Observable<ScoreboardSession> {
        return this._api.scoreboardActive();
    }

    getSessions(): Observable<ScoreboardSession[]> {
        return this._api.scoreboardSessionsGet();
    }

    getSession(id: string): Observable<ScoreboardSession> {
        return this._api.scoreboardSessionsDetail(id);
    }

    startSession(name: string | undefined, teamNames: string[]): Observable<ScoreboardSession> {
        return this._api.scoreboardSessionsPost({ name, teamNames });
    }

    adjustScore(sessionId: string, teamId: string, delta: number): Observable<ScoreboardSession> {
        return this._api.scoreboardSessionsTeamsScore(sessionId, teamId, { delta });
    }

    undo(sessionId: string): Observable<ScoreboardSession> {
        return this._api.scoreboardSessionsUndo(sessionId);
    }

    finish(sessionId: string): Observable<ScoreboardSession> {
        return this._api.scoreboardSessionsFinish(sessionId);
    }
}
