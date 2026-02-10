import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddUser, FransApiClient, PutUser, User } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class AdminApiService {
    private readonly _api = inject(FransApiClient);

    getAllUsers(): Observable<User[]> {
        return this._api.userGet();
    }

    addUser(userData: AddUser): Observable<void> {
        return this._api.userPost(userData);
    }

    updateUser(userId: string, userData: PutUser): Observable<void> {
        return this._api.userPut(userId, userData);
    }

    deleteUser(userId: string): Observable<void> {
        return this._api.userDelete(userId);
    }
}
