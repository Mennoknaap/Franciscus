import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FransApiClient, SendTestNotificationResult, SubscribePush } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class PoopAppApiService {
    private readonly _api = inject(FransApiClient);

    subscribe(subscription: SubscribePush): Observable<void> {
        return this._api.pushSubscribePost(subscription);
    }

    sendTestNotification(): Observable<SendTestNotificationResult> {
        return this._api.poopAppSendTestNotification();
    }
}
