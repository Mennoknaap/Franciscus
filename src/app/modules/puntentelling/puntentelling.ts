import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import dayjs from 'dayjs';
import { FransApiException, ScoreboardSession } from '../../apiclients/fransapi.client';
import { ConfirmDialog } from '../../components/confirm-dialog';
import { Title } from '../../components/title';
import { PuntentellingApiService } from './puntentelling-api';
import { PuntentellingFinishDialog } from './puntentelling-finish-dialog';

const MIN_TEAMS = 2;
const MAX_TEAMS = 10;
const DEFAULT_TEAMS = 4;
const POLL_INTERVAL_MS = 3000;
const QUICK_AMOUNTS = [1, 5, 10];

function defaultTeamNames(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Team ${i + 1}`);
}

@Component({
    selector: 'app-puntentelling',
    standalone: true,
    imports: [
        Title,
        RouterLink,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        MatDialogModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './puntentelling.html',
    styleUrl: './puntentelling.scss',
})
export class Puntentelling implements OnInit, OnDestroy {
    private readonly _api = inject(PuntentellingApiService);
    private readonly _dialog = inject(MatDialog);
    private readonly _destroyRef = inject(DestroyRef);

    private _pollHandle: ReturnType<typeof setInterval> | null = null;

    readonly minTeams = MIN_TEAMS;
    readonly maxTeams = MAX_TEAMS;
    readonly quickAmounts = QUICK_AMOUNTS;

    readonly loading = signal(true);
    readonly session = signal<ScoreboardSession | null>(null);
    readonly busy = signal(false);

    // Setup form state — only relevant while there's no active session yet.
    readonly teamCount = signal(DEFAULT_TEAMS);
    readonly teamNames = signal<string[]>(defaultTeamNames(DEFAULT_TEAMS));
    readonly sessionName = signal('');

    // Custom-amount input value, kept per team id so each card remembers its own last entry.
    readonly customAmounts = signal<Record<string, number>>({});

    ngOnInit(): void {
        this.loadActive();
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    onTeamCountChange(count: number): void {
        this.teamCount.set(count);
        this.teamNames.update(names => {
            const next = names.slice(0, count);
            while (next.length < count)
                next.push(`Team ${next.length + 1}`);
            return next;
        });
    }

    updateTeamName(index: number, name: string): void {
        this.teamNames.update(names => {
            const next = [...names];
            next[index] = name;
            return next;
        });
    }

    canStart(): boolean {
        return !this.busy() && this.teamNames().every(name => name.trim().length > 0);
    }

    startSession(): void {
        if (!this.canStart())
            return;

        const names = this.teamNames().map(name => name.trim());

        this.busy.set(true);
        this._api.startSession(this.sessionName().trim() || undefined, names).subscribe({
            next: session => {
                this.session.set(session);
                this.busy.set(false);
                this.startPolling();
            },
            error: () => this.busy.set(false),
        });
    }

    customAmountFor(teamId: string): number {
        return this.customAmounts()[teamId] ?? 0;
    }

    setCustomAmount(teamId: string, value: string): void {
        const parsed = parseInt(value);
        this.customAmounts.update(amounts => ({ ...amounts, [teamId]: Number.isFinite(parsed) ? parsed : 0 }));
    }

    applyCustom(teamId: string): void {
        const amount = this.customAmountFor(teamId);
        if (amount === 0)
            return;

        this.adjust(teamId, amount);
    }

    adjust(teamId: string, delta: number): void {
        const session = this.session();
        if (!session || this.busy())
            return;

        this.busy.set(true);
        this._api.adjustScore(session.id, teamId, delta).subscribe({
            next: updated => {
                this.session.set(updated);
                this.busy.set(false);
            },
            error: () => this.busy.set(false),
        });
    }

    lastHistoryLabel(): string | null {
        const entry = this.session()?.history[0];
        if (!entry)
            return null;

        const sign = entry.delta > 0 ? '+' : '';
        return `${entry.teamName} ${sign}${entry.delta} ongedaan maken`;
    }

    undo(): void {
        const session = this.session();
        if (!session || this.busy() || session.history.length === 0)
            return;

        this.busy.set(true);
        this._api.undo(session.id).subscribe({
            next: updated => {
                this.session.set(updated);
                this.busy.set(false);
            },
            error: () => this.busy.set(false),
        });
    }

    finishSession(): void {
        const session = this.session();
        if (!session)
            return;

        const dialogRef = this._dialog.open(ConfirmDialog, {
            data: {
                title: 'Potje afronden',
                message: 'Weet je zeker dat je dit potje wilt afronden? Hierna kan er niet meer aangepast worden.',
                confirmLabel: 'Afronden',
            },
            width: '400px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(confirmed => {
            if (!confirmed)
                return;

            this.busy.set(true);
            this._api.finish(session.id).subscribe(finished => {
                this.stopPolling();
                this.busy.set(false);
                this.session.set(null);
                this.resetSetupForm();

                this._dialog.open(PuntentellingFinishDialog, {
                    data: { session: finished },
                    width: '480px',
                    maxWidth: '95vw',
                });
            });
        });
    }

    private loadActive(): void {
        this.loading.set(true);
        this._api.getActive().subscribe({
            next: session => {
                this.session.set(session);
                this.loading.set(false);
                this.startPolling();
            },
            error: () => {
                // No active session (404) is the expected, common case — show the setup
                // screen. Any other error also falls back to setup rather than a dead page.
                this.session.set(null);
                this.loading.set(false);
            },
        });
    }

    private startPolling(): void {
        this.stopPolling();
        this._pollHandle = setInterval(() => {
            if (!this.session() || this.busy())
                return;

            this._api.getActive().subscribe({
                next: updated => this.session.set(updated),
                error: error => {
                    // A 404 specifically means someone else finished (or never re-created)
                    // this session — fall back to setup. Any other error is likely transient
                    // (network hiccup) and shouldn't kick the user out of the live board.
                    if (error instanceof FransApiException && error.status === 404) {
                        this.stopPolling();
                        this.session.set(null);
                        this.resetSetupForm();
                    }
                },
            });
        }, POLL_INTERVAL_MS);
    }

    private stopPolling(): void {
        if (this._pollHandle !== null) {
            clearInterval(this._pollHandle);
            this._pollHandle = null;
        }
    }

    formatTime(date: dayjs.Dayjs): string {
        return dayjs(date).format('HH:mm');
    }

    private resetSetupForm(): void {
        this.teamCount.set(DEFAULT_TEAMS);
        this.teamNames.set(defaultTeamNames(DEFAULT_TEAMS));
        this.sessionName.set('');
        this.customAmounts.set({});
    }
}
