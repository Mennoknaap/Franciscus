import { Component, computed, input } from '@angular/core';
import dayjs from 'dayjs';
import { ScoreboardSession } from '../../apiclients/fransapi.client';

interface RankedTeam {
    id: string;
    name: string;
    score: number;
    rank: number;
}

@Component({
    selector: 'app-puntentelling-results',
    standalone: true,
    imports: [],
    templateUrl: './puntentelling-results.html',
    styleUrl: './puntentelling-results.scss',
})
export class PuntentellingResults {
    readonly session = input.required<ScoreboardSession>();

    // Competition ranking — tied scores share a rank and the next rank skips ahead
    // (1, 2, 2, 4), not a plain 1-2-3-4 regardless of ties.
    readonly ranked = computed<RankedTeam[]>(() => {
        const teams = [...this.session().teams].sort((a, b) => b.score - a.score);
        const result: RankedTeam[] = [];
        let rank = 0;
        let lastScore: number | null = null;

        teams.forEach((team, index) => {
            if (team.score !== lastScore) {
                rank = index + 1;
                lastScore = team.score;
            }
            result.push({ id: team.id, name: team.name, score: team.score, rank });
        });

        return result;
    });

    formatTime(date: dayjs.Dayjs): string {
        return dayjs(date).format('D MMM HH:mm');
    }

    medalFor(rank: number): string | null {
        if (rank === 1)
            return '🥇';
        if (rank === 2)
            return '🥈';
        if (rank === 3)
            return '🥉';

        return null;
    }
}
