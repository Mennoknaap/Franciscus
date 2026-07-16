import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FransApiClient, SendTestNotificationResult } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class PoopAppApiService {
    private readonly _api = inject(FransApiClient);

    sendTestNotification(): Observable<SendTestNotificationResult> {
        return this._api.poopAppSendTestNotification();
    }
}
