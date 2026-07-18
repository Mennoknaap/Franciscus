import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BadjasEntry, BadjasSettings, FransApiClient, UpdateBadjasSettings } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class BadjasspelApiService {
    private readonly _api = inject(FransApiClient);

    // Only ever the caller's own entry — who else got picked is private ("geheim
    // onderling"), enforced server-side, not just left out of this response's shape.
    getToday(): Observable<BadjasEntry> {
        return this._api.badjasToday();
    }

    getHistory(): Observable<BadjasEntry[]> {
        return this._api.badjasHistory();
    }

    getSettings(): Observable<BadjasSettings> {
        return this._api.badjasSettingsGet();
    }

    // startDate/endDate as plain 'YYYY-MM-DD' strings (straight from a native
    // <input type="date">). NSwag types these as dayjs.Dayjs since the backend's
    // DateOnly? maps through the same client config as a full DateTime, but the backend's
    // DateOnly? model binder only accepts a bare "yyyy-MM-dd" string — a Dayjs object's
    // JSON.stringify() output (a full UTC ISO datetime) gets rejected with a 400. Casting
    // past the generated (here, slightly wrong) parameter type sends the plain string as-is.
    updateSettings(startDate: string | null, endDate: string | null): Observable<BadjasSettings> {
        return this._api.badjasSettingsPut({ startDate, endDate } as unknown as UpdateBadjasSettings);
    }

    trigger(force: boolean): Observable<boolean> {
        return this._api.badjasTrigger(force);
    }

    choose(chosenUserId: string): Observable<BadjasEntry> {
        return this._api.badjasChoose(chosenUserId);
    }
}
