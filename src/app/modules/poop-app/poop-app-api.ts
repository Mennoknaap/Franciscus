import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FransApiClient, SubscribePush } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class PoopAppApiService {
    private readonly _api = inject(FransApiClient);

    subscribe(subscription: SubscribePush): Observable<void> {
        return this._api.pushSubscribePost(subscription);
    }

    sendTestNotification(): Observable<void> {
        return this._api.poopAppSendTestNotification();
    }
}
