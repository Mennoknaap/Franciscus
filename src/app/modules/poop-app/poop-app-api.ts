import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FransApiClient, PoopLogEntry, PoopLogType, SendTestNotificationResult } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class PoopAppApiService {
    private readonly _api = inject(FransApiClient);

    getLog(): Observable<PoopLogEntry[]> {
        return this._api.poopAppLogGet();
    }

    addLogEntry(type: PoopLogType): Observable<PoopLogEntry> {
        return this._api.poopAppLogPost({ type });
    }

    sendTestNotification(): Observable<SendTestNotificationResult> {
        return this._api.poopAppSendTestNotification();
    }
}
