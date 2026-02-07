import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FransApiClient, User } from '../../apiclients/fransapi.client';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.html',
    styleUrl: './admin.scss',
})
export class Admin {
    private readonly _api = inject(FransApiClient);
    private readonly _destroyRef = inject(DestroyRef);

    readonly allUsers = signal<User[]>([]);
    readonly loading = signal<boolean>(false);

    constructor() {
        this.loading.set(true);

        this._api.userGet().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(users => {
            this.allUsers.set(users);
            this.loading.set(false);
        });
    }
}
