import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ScoreboardSession } from '../../apiclients/fransapi.client';
import { PuntentellingResults } from './puntentelling-results';

interface ConfettiPiece {
    left: string;
    background: string;
    delay: string;
    duration: string;
    rotate: string;
    drift: string;
}

const CONFETTI_COLORS = ['#ff8a3d', '#ffd23d', '#e8452c', '#4dd0e1', '#7c4dff', '#69f0ae'];
const CONFETTI_PIECE_COUNT = 60;

function randomConfettiPiece(): ConfettiPiece {
    return {
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: `${Math.random() * 0.4}s`,
        duration: `${1.4 + Math.random() * 1}s`,
        rotate: `${Math.random() * 360}deg`,
        drift: `${(Math.random() * 2 - 1) * 60}px`,
    };
}

@Component({
    selector: 'app-puntentelling-finish-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, PuntentellingResults],
    templateUrl: './puntentelling-finish-dialog.html',
    styleUrl: './puntentelling-finish-dialog.scss',
})
export class PuntentellingFinishDialog {
    readonly data = inject<{ session: ScoreboardSession }>(MAT_DIALOG_DATA);

    readonly confetti: ConfettiPiece[] = Array.from({ length: CONFETTI_PIECE_COUNT }, randomConfettiPiece);
}
