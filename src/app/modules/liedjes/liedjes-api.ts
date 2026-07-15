import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddChild, AddFact, Child, Fact, FransApiClient, UpdateFact } from '../../apiclients/fransapi.client';

@Injectable({
    providedIn: 'root',
})
export class LiedjesApiService {
    private readonly _api = inject(FransApiClient);

    getAllChildren(): Observable<Child[]> {
        return this._api.childrenGet();
    }

    getChildDetails(id: string): Observable<Child> {
        return this._api.childrenDetails(id);
    }

    addChild(child: AddChild): Observable<Child> {
        return this._api.childrenPost(child);
    }

    deleteChild(id: string): Observable<void> {
        return this._api.childrenDelete(id);
    }

    uploadPhoto(id: string, file: File): Observable<Child> {
        return this._api.childrenPhoto(id, { data: file, fileName: file.name });
    }

    addFact(childId: string, fact: AddFact): Observable<Fact> {
        return this._api.childrenFacts(childId, fact);
    }

    updateFact(id: string, fact: UpdateFact): Observable<void> {
        return this._api.factsPut(id, fact);
    }

    deleteFact(id: string): Observable<void> {
        return this._api.factsDelete(id);
    }
}
