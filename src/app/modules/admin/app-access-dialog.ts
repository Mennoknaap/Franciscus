import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../apiclients/fransapi.client';
import { AdminApiService } from './admin-api';

// Apps that can be gated per-person. Add an entry here whenever a new app needs this —
// the backend's AppAccess table is already generic (just an AppKey string per user).
const GATEABLE_APPS = [
    { key: 'soundboard', label: 'Soundboard' },
    { key: 'wheel', label: 'Radje' },
    { key: 'liedjes', label: 'Liedjes' },
    { key: 'poop-app', label: 'Poeplog' },
    { key: 'biertje', label: 'Biertje?' },
    { key: 'kud', label: 'Kud' },
    { key: 'puntentelling', label: 'Puntentelling' },
    { key: 'badjasspel', label: 'Badjasspel' },
];

@Component({
    selector: 'app-app-access-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatCheckboxModule, MatListModule, MatProgressSpinnerModule],
    templateUrl: './app-access-dialog.html',
    styleUrl: './app-access-dialog.scss',
})
export class AppAccessDialog {
    private readonly _adminApi = inject(AdminApiService);
    private readonly _destroyRef = inject(DestroyRef);

    readonly data = inject<{ user: User }>(MAT_DIALOG_DATA);

    readonly apps = GATEABLE_APPS;
    readonly grantedAppKeys = signal<string[]>([]);
    readonly loading = signal<boolean>(true);

    constructor() {
        this._adminApi.getUserAppAccess(this.data.user.id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(keys => {
            this.grantedAppKeys.set(keys);
            this.loading.set(false);
        });
    }

    hasAccess(appKey: string): boolean {
        return this.grantedAppKeys().includes(appKey);
    }

    toggleAccess(appKey: string): void {
        const request = this.hasAccess(appKey)
            ? this._adminApi.revokeAppAccess(this.data.user.id, appKey)
            : this._adminApi.grantAppAccess(this.data.user.id, appKey);

        request.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
            this.grantedAppKeys.update(keys =>
                this.hasAccess(appKey) ? keys.filter(k => k !== appKey) : [...keys, appKey],
            );
        });
    }
}
