import { Component, signal } from '@angular/core';
import { Title } from '../../components/title';

type Phase = 'idle' | 'counting' | 'result';
type Mode = 'one' | 'teams';

interface Finger {
    id: number;
    x: number;
    y: number;
    color: string;
    outcome: 'pending' | 'winner' | 'loser' | 'team';
    team: number;
}

const COUNTDOWN_MS = 2500;
const MIN_FINGERS = 2;
const FINGER_COLORS = ['#FF5C8A', '#38C6F4', '#FFD23F', '#9B6BFF', '#FF8A2B', '#2EE6A6', '#FF4B4B', '#4D8BFF', '#C6F432', '#F472D0'];
const TEAM_COLORS = ['#FF5C8A', '#38C6F4', '#FFD23F', '#9B6BFF'];
const TEAM_LETTERS = ['A', 'B', 'C', 'D'];

@Component({
    selector: 'app-shwazi',
    standalone: true,
    imports: [Title],
    templateUrl: './shwazi.html',
    styleUrl: './shwazi.scss',
})
export class Shwazi {
    private _audioContext: AudioContext | null = null;
    private _timer: ReturnType<typeof setTimeout> | null = null;

    readonly fingers = signal<Finger[]>([]);
    readonly phase = signal<Phase>('idle');
    readonly mode = signal<Mode>('one');
    readonly teamCount = signal<number>(2);
    readonly runId = signal<number>(0);
    readonly teamOptions = [2, 3, 4];
    readonly teamLetters = TEAM_LETTERS;

    setMode(mode: Mode): void {
        this.mode.set(mode);
    }

    setTeamCount(count: number): void {
        this.teamCount.set(count);
    }

    hint(): string {
        const count = this.fingers().length;
        if (this.phase() === 'result')
            return this.mode() === 'one' ? 'Gekozen! Til je vingers op voor een nieuwe ronde.' : 'Teams verdeeld! Til je vingers op voor een nieuwe ronde.';
        if (this.phase() === 'counting')
            return 'Niet loslaten...';
        if (count === 0)
            return 'Leg met z\'n allen een vinger op het scherm';
        return 'Nog minstens 1 vinger nodig';
    }

    onDown(event: PointerEvent): void {
        event.preventDefault();
        this.startAudio();

        if (this.phase() === 'result' || this.fingers().some(finger => finger.id === event.pointerId))
            return;

        const used = new Set(this.fingers().map(finger => finger.color));
        const color = FINGER_COLORS.find(candidate => !used.has(candidate)) ?? FINGER_COLORS[this.fingers().length % FINGER_COLORS.length];
        const position = this.position(event);
        this.fingers.update(list => [...list, { id: event.pointerId, ...position, color, outcome: 'pending', team: 0 }]);
        this.playTone(520 + this.fingers().length * 60, 0.08);
        this.schedule();
    }

    onMove(event: PointerEvent): void {
        const position = this.position(event);
        this.fingers.update(list => list.map(finger => finger.id === event.pointerId ? { ...finger, ...position } : finger));
    }

    onUp(event: PointerEvent): void {
        this.fingers.update(list => list.filter(finger => finger.id !== event.pointerId));

        if (this.phase() === 'result') {
            if (this.fingers().length === 0)
                this.phase.set('idle');
            return;
        }

        this.schedule();
    }

    private position(event: PointerEvent): { x: number; y: number } {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    // Every time the set of fingers changes the countdown starts over; only once the same
    // group has held still for COUNTDOWN_MS does the app pick.
    private schedule(): void {
        if (this._timer)
            clearTimeout(this._timer);

        if (this.fingers().length < MIN_FINGERS) {
            this.phase.set('idle');
            return;
        }

        this.phase.set('counting');
        this.runId.update(id => id + 1);
        this._timer = setTimeout(() => this.resolve(), COUNTDOWN_MS);
    }

    private resolve(): void {
        const list = this.fingers();
        if (list.length < MIN_FINGERS)
            return;

        if (this.mode() === 'one') {
            const winner = Math.floor(Math.random() * list.length);
            this.fingers.set(list.map((finger, index) => ({ ...finger, outcome: index === winner ? 'winner' : 'loser' })));
        } else {
            const order = this.shuffle(list.map((_, index) => index));
            const teams = Math.min(this.teamCount(), list.length);
            const teamOf = new Map(order.map((fingerIndex, position) => [fingerIndex, position % teams]));
            this.fingers.set(list.map((finger, index) => {
                const team = teamOf.get(index) ?? 0;
                return { ...finger, outcome: 'team', team, color: TEAM_COLORS[team] };
            }));
        }

        this.phase.set('result');
        this.playCheer();
        navigator.vibrate?.(200);
    }

    private shuffle<T>(items: T[]): T[] {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // The context is created inside the pointerdown handler (a user gesture) so browsers
    // don't keep it suspended.
    private startAudio(): void {
        this._audioContext ??= new AudioContext();
        if (this._audioContext.state === 'suspended')
            this._audioContext.resume();
    }

    private playTone(frequency: number, duration: number, delay = 0): void {
        const ctx = this._audioContext;
        if (!ctx)
            return;

        const start = ctx.currentTime + delay;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.05);
    }

    private playCheer(): void {
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => this.playTone(frequency, 0.16, index * 0.1));
    }
}
