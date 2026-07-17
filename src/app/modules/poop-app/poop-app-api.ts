import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FransApiClient, PoopLogEntry, PoopLogType, PoopSticker } from '../../apiclients/fransapi.client';

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

    clearLog(): Observable<void> {
        return this._api.poopAppLogDelete();
    }

    deleteEntry(id: string): Observable<void> {
        return this._api.poopAppLogEntry(id);
    }

    getStickers(): Observable<PoopSticker[]> {
        return this._api.poopAppStickersGet();
    }

    uploadSticker(type: PoopLogType, file: File): Observable<PoopSticker> {
        return this._api.poopAppStickersPost(type, { data: file, fileName: file.name });
    }
}
