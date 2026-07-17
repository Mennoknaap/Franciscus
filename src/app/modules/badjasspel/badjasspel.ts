import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import dayjs from 'dayjs';
import { BadjasEntry, BadjasSettings } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { AuthService } from '../../core/auth/auth-service';
import { BadjasspelApiService } from './badjasspel-api';

// RoleType.Admin = 0 (see admin-auth-guard.ts for the same check).
const ADMIN_ROLE = 0;

@Component({
    selector: 'app-badjasspel',
    standalone: true,
    imports: [
        Title,
        RouterLink,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './badjasspel.html',
    styleUrl: './badjasspel.scss',
})
export class Badjasspel {
    private readonly _api = inject(BadjasspelApiService);
    private readonly _authService = inject(AuthService);

    readonly isAdmin = (): boolean => this._authService.user()?.role === ADMIN_ROLE;

    readonly loading = signal(true);
    // Only ever the caller's own entry — see badjasspel-api.ts's getToday().
    readonly ownEntry = signal<BadjasEntry | null>(null);
    readonly settings = signal<BadjasSettings | null>(null);
    readonly triggering = signal(false);
    readonly savingSettings = signal(false);

    readonly startDateInput = signal('');
    readonly endDateInput = signal('');

    constructor() {
        this.loadToday();
        this.loadSettings();
    }

    formatDate(date: dayjs.Dayjs): string {
        return dayjs(date).format('D MMMM YYYY');
    }

    saveSettings(): void {
        this.savingSettings.set(true);
        this._api.updateSettings(this.startDateInput() || null, this.endDateInput() || null).subscribe({
            next: settings => {
                this.settings.set(settings);
                this.savingSettings.set(false);
            },
            error: () => this.savingSettings.set(false),
        });
    }

    triggerDraw(force: boolean): void {
        this.triggering.set(true);
        this._api.trigger(force).subscribe({
            next: () => {
                this.triggering.set(false);
                this.loadToday();
            },
            error: () => this.triggering.set(false),
        });
    }

    private loadToday(): void {
        this.loading.set(true);
        this._api.getToday().subscribe({
            next: entry => {
                this.ownEntry.set(entry);
                this.loading.set(false);
            },
            error: () => {
                this.ownEntry.set(null);
                this.loading.set(false);
            },
        });
    }

    private loadSettings(): void {
        this._api.getSettings().subscribe(settings => {
            this.settings.set(settings);
            this.startDateInput.set(settings.startDate ? dayjs(settings.startDate).format('YYYY-MM-DD') : '');
            this.endDateInput.set(settings.endDate ? dayjs(settings.endDate).format('YYYY-MM-DD') : '');
        });
    }
}
