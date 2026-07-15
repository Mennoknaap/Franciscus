import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserAppAccess } from '../../apiclients/fransapi.client';
import { AdminApiService } from './admin-api';

const APP_KEY = 'poop-app';

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

    readonly users = signal<UserAppAccess[]>([]);
    readonly loading = signal<boolean>(true);

    constructor() {
        this._adminApi.getAppAccess(APP_KEY).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(users => {
            this.users.set(users);
            this.loading.set(false);
        });
    }

    toggleAccess(user: UserAppAccess): void {
        const request = user.hasAccess
            ? this._adminApi.revokeAppAccess(user.userId, APP_KEY)
            : this._adminApi.grantAppAccess(user.userId, APP_KEY);

        request.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
            this.users.update(users =>
                users.map(u => u.userId === user.userId ? { ...u, hasAccess: !u.hasAccess } : u),
            );
        });
    }
}
