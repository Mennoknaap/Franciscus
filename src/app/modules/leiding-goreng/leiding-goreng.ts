import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '../../components/title';
import { LeidingGorengResultDialog } from './leiding-goreng-result-dialog';

const SLICE_COUNT = 8;
const SLICE_DEGREES = 360 / SLICE_COUNT;
const SPIN_DURATION_MS = 4500;
const MIN_EXTRA_SPINS = 5;
const MAX_EXTRA_SPINS = 8;
const WINNER_LANDING_JITTER_DEGREES = 10; // stays well inside a 45deg winning slice

interface WheelSlice {
    label: string;
    color: string;
    textColor: string;
    startAngle: number;
    midAngle: number;
}

// Even slices say "Ja", odd ones "Nee". The wheel only ever lands on a "Ja" slice.
const SLICES: WheelSlice[] = Array.from({ length: SLICE_COUNT }, (_, i) => {
    const isJa = i % 2 === 0;
    return {
        label: isJa ? 'Ja' : 'Nee',
        color: isJa ? '#2f9e44' : '#d64545',
        textColor: '#ffffff',
        startAngle: i * SLICE_DEGREES,
        midAngle: i * SLICE_DEGREES + SLICE_DEGREES / 2,
    };
});

const JA_SLICE_INDICES = SLICES.map((slice, i) => slice.label === 'Ja' ? i : -1).filter(i => i >= 0);

// Ease-out curve driving the manual rAF rotation below — fast at the start, settling in
// near the end, similar in shape to the CSS cubic-bezier this used to run on.
function easeOutRotation(t: number): number {
    return 1 - (1 - t) ** 3;
}

@Component({
    selector: 'app-leiding-goreng',
    standalone: true,
    imports: [Title, MatButtonModule],
    templateUrl: './leiding-goreng.html',
    styleUrl: './leiding-goreng.scss',
})
export class LeidingGoreng {
    private readonly _dialog = inject(MatDialog);
    private _audioContext: AudioContext | null = null;

    readonly slices = SLICES;
    readonly isSpinning = signal(false);
    readonly rotation = signal(0);

    readonly wheelBackground = computed(() =>
        `conic-gradient(${this.slices.map(slice => `${slice.color} ${slice.startAngle}deg ${slice.startAngle + SLICE_DEGREES}deg`).join(', ')})`,
    );

    // The wheel always lands on a "Ja" slice (a random one of the four) — only the flourish
    // (extra full turns, a small jitter within the slice) is random, so it still looks
    // and feels like a genuine 50/50 spin. The rotation itself is driven frame-by-frame
    // (rather than a CSS transition) so we can detect every slice-boundary crossing and
    // fire the ticking sound at the right moments, just like a physical wheel's clicker.
    spin(): void {
        if (this.isSpinning())
            return;

        this.isSpinning.set(true);

        // Must happen synchronously within this click handler, not inside the later rAF
        // callback, so browsers count it as user-gesture-initiated and don't suspend it.
        this._audioContext ??= new AudioContext();
        if (this._audioContext.state === 'suspended')
            this._audioContext.resume();

        const jitter = (Math.random() * 2 - 1) * WINNER_LANDING_JITTER_DEGREES;
        const jaIndex = JA_SLICE_INDICES[Math.floor(Math.random() * JA_SLICE_INDICES.length)];
        const desiredMod = (360 - (jaIndex * SLICE_DEGREES + SLICE_DEGREES / 2) - jitter + 360) % 360;
        const currentMod = (this.rotation() % 360 + 360) % 360;
        const deltaToAlign = (desiredMod - currentMod + 360) % 360;
        const extraSpins = MIN_EXTRA_SPINS + Math.floor(Math.random() * (MAX_EXTRA_SPINS - MIN_EXTRA_SPINS + 1));

        const startRotation = this.rotation();
        const totalDelta = deltaToAlign + 360 * extraSpins;
        const targetRotation = startRotation + totalDelta;
        const startTime = performance.now();
        let lastTickBoundary = Math.floor(startRotation / SLICE_DEGREES);

        const animate = (now: number): void => {
            const t = Math.min((now - startTime) / SPIN_DURATION_MS, 1);
            const currentRotation = startRotation + totalDelta * easeOutRotation(t);
            this.rotation.set(currentRotation);

            const currentTickBoundary = Math.floor(currentRotation / SLICE_DEGREES);
            for (let boundary = lastTickBoundary + 1; boundary <= Math.min(currentTickBoundary, lastTickBoundary + 8); boundary++)
                this.playTick();

            lastTickBoundary = currentTickBoundary;

            if (t < 1) {
                requestAnimationFrame(animate);
                return;
            }

            this.rotation.set(targetRotation);
            this.isSpinning.set(false);

            this.playCheer();

            this._dialog.open(LeidingGorengResultDialog, { width: '400px', maxWidth: '95vw' });
        };

        requestAnimationFrame(animate);
    }

    // A short synthesized "hoera": a rising arpeggio that ends in a bright chord. Built with
    // the Web Audio API (like the tick) so no audio file is needed.
    private playCheer(): void {
        const ctx = this._audioContext;
        if (!ctx)
            return;

        const notes: [number, number, number][] = [
            [523.25, 0, 0.14], [659.25, 0.12, 0.14], [783.99, 0.24, 0.14], [1046.5, 0.36, 0.14],
            [783.99, 0.52, 0.7], [1046.5, 0.52, 0.7], [1318.5, 0.52, 0.7],
        ];
        for (const [frequency, offset, duration] of notes) {
            const start = ctx.currentTime + offset;
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.type = 'triangle';
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            oscillator.connect(gain).connect(ctx.destination);
            oscillator.start(start);
            oscillator.stop(start + duration + 0.05);
        }
    }

    private playTick(): void {
        const ctx = this._audioContext;
        if (!ctx)
            return;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = 1000;
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.03);
    }
}
