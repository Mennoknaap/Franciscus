import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '../../components/title';
import { BiertjeResultDialog } from './biertje-result-dialog';

const SLICE_COUNT = 10;
const SLICE_DEGREES = 360 / SLICE_COUNT;
const SPIN_DURATION_MS = 4500;
const MIN_EXTRA_SPINS = 5;
const MAX_EXTRA_SPINS = 8;
const WINNER_LANDING_JITTER_DEGREES = 10; // stays well inside the 36deg winning slice

interface WheelSlice {
    label: string;
    color: string;
    textColor: string;
    startAngle: number;
    midAngle: number;
}

const SLICES: WheelSlice[] = Array.from({ length: SLICE_COUNT }, (_, i) => {
    const isWinner = i === 0;
    return {
        label: isWinner ? 'Biertje!' : 'Naar bed',
        color: isWinner ? '#e8a93a' : i % 2 === 0 ? '#25335c' : '#334577',
        textColor: isWinner ? '#3a2504' : '#f2f2f7',
        startAngle: i * SLICE_DEGREES,
        midAngle: i * SLICE_DEGREES + SLICE_DEGREES / 2,
    };
});

@Component({
    selector: 'app-biertje',
    standalone: true,
    imports: [Title, MatButtonModule],
    templateUrl: './biertje.html',
    styleUrl: './biertje.scss',
})
export class Biertje {
    private readonly _dialog = inject(MatDialog);
    private readonly _winSound = new Audio('assets/nog-eentje-dan.mp3');

    readonly slices = SLICES;
    readonly isSpinning = signal(false);
    readonly rotation = signal(0);

    constructor() {
        this._winSound.volume = 0.8;
        this._winSound.preload = 'auto';
        this._winSound.load();
    }

    readonly wheelBackground = computed(() =>
        `conic-gradient(${this.slices.map(slice => `${slice.color} ${slice.startAngle}deg ${slice.startAngle + SLICE_DEGREES}deg`).join(', ')})`,
    );

    // The wheel always lands on the winning slice — only the flourish (how many extra
    // full turns, and a small jitter within the slice) is random, so it still looks
    // and feels like a genuine, ~10%-odds spin.
    spin(): void {
        if (this.isSpinning())
            return;

        this.isSpinning.set(true);

        const jitter = (Math.random() * 2 - 1) * WINNER_LANDING_JITTER_DEGREES;
        const desiredMod = (360 - SLICE_DEGREES / 2 - jitter + 360) % 360;
        const currentMod = (this.rotation() % 360 + 360) % 360;
        const deltaToAlign = (desiredMod - currentMod + 360) % 360;
        const extraSpins = MIN_EXTRA_SPINS + Math.floor(Math.random() * (MAX_EXTRA_SPINS - MIN_EXTRA_SPINS + 1));

        this.rotation.update(current => current + deltaToAlign + 360 * extraSpins);

        setTimeout(() => {
            this.isSpinning.set(false);

            this._winSound.currentTime = 0;
            const playPromise = this._winSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Audio play prevented:', error);
                });
            }

            this._dialog.open(BiertjeResultDialog, { width: '400px', maxWidth: '95vw' });
        }, SPIN_DURATION_MS);
    }
}
