import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '../../components/title';
import { KudResultDialog } from './kud-result-dialog';
import { KUD_WORDS } from './kud-words';

const SCRAMBLE_TICK_MS = 60;
const SCRAMBLE_TICK_COUNT = 32;
const SCRAMBLE_SLOWDOWN_MS = 220; // added on top of the base tick, scaled by progress^2

function randomWord(): string {
    return KUD_WORDS[Math.floor(Math.random() * KUD_WORDS.length)];
}

@Component({
    selector: 'app-kud',
    standalone: true,
    imports: [Title],
    templateUrl: './kud.html',
    styleUrl: './kud.scss',
})
export class Kud {
    private readonly _dialog = inject(MatDialog);

    readonly isGenerating = signal(false);
    readonly scrambleText = signal('');

    // Picks the target word up front, then spends ~2s "revealing" it through a slot-machine
    // style scramble (ticks slowing down toward the end) purely for show — the randomness
    // that matters already happened at the start.
    generate(): void {
        if (this.isGenerating())
            return;

        this.isGenerating.set(true);

        const target = randomWord();
        let tick = 0;

        const runTick = (): void => {
            tick++;
            const isLastTick = tick >= SCRAMBLE_TICK_COUNT;
            this.scrambleText.set(isLastTick ? target : randomWord());

            if (isLastTick) {
                this.isGenerating.set(false);
                this._dialog.open(KudResultDialog, { data: { word: target }, width: '420px', maxWidth: '95vw' });
                return;
            }

            const progress = tick / SCRAMBLE_TICK_COUNT;
            const delay = SCRAMBLE_TICK_MS + progress * progress * SCRAMBLE_SLOWDOWN_MS;
            setTimeout(runTick, delay);
        };

        runTick();
    }
}
