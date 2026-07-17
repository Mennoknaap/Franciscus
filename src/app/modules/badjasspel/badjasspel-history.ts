import { Component, computed, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import dayjs from 'dayjs';
import { BadjasEntry } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { BadjasspelApiService } from './badjasspel-api';

interface BadjasDayGroup {
    dateKey: string;
    dateLabel: string;
    entries: BadjasEntry[];
}

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
    readonly entries = signal<BadjasEntry[]>([]);

    // Entries already come back ordered by Date desc (one row per participant per day) —
    // group them into per-day sections for display without needing a separate endpoint.
    readonly dayGroups = computed<BadjasDayGroup[]>(() => {
        const groups: BadjasDayGroup[] = [];
        for (const entry of this.entries()) {
            const dateKey = dayjs(entry.date).format('YYYY-MM-DD');
            const lastGroup = groups[groups.length - 1];
            if (lastGroup?.dateKey === dateKey)
                lastGroup.entries.push(entry);
            else
                groups.push({ dateKey, dateLabel: dayjs(entry.date).format('D MMMM YYYY'), entries: [entry] });

        }
        return groups;
    });

    constructor() {
        this._api.getHistory().subscribe(entries => {
            this.entries.set(entries);
            this.loading.set(false);
        });
    }
}
