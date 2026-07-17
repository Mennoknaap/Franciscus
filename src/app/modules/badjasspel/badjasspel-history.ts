import { Component, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import dayjs from 'dayjs';
import { BadjasEntry } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { BadjasspelApiService } from './badjasspel-api';

@Component({
    selector: 'app-badjasspel-history',
    standalone: true,
    imports: [Title, MatProgressSpinnerModule],
    templateUrl: './badjasspel-history.html',
    styleUrl: './badjasspel-history.scss',
})
export class BadjasspelHistory {
    private readonly _api = inject(BadjasspelApiService);

    readonly loading = signal(true);
    // Only ever the caller's own entries (one per day this game has run) — see
    // badjasspel-api.ts's getHistory(). A personal "was I ever picked" list, not a
    // group reveal — nobody's outcome but your own is visible here.
    readonly entries = signal<BadjasEntry[]>([]);

    constructor() {
        this._api.getHistory().subscribe(entries => {
            this.entries.set(entries);
            this.loading.set(false);
        });
    }

    formatDate(date: dayjs.Dayjs): string {
        return dayjs(date).format('D MMMM YYYY');
    }
}
