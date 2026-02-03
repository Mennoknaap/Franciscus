import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class WheelDataService {
    _defaultOpts = [
        'Diego',
        'Ignacio',
        'JaviGo',
        'Mendi',
        'Sergio',
        'Virginia',
        'Tod@s',
    ];

    optionSource: BehaviorSubject<string[]>;
    option$;

    winnersSource: BehaviorSubject<string[]>;
    winner$: Observable<string[]>;

    constructor() {
        this.optionSource = new BehaviorSubject<string[]>(this.getOptions());
        this.option$ = this.optionSource.asObservable();

        this.winnersSource = new BehaviorSubject<string[]>([]);
        this.winner$ = this.winnersSource.asObservable();
    }

    addNewOption(value: string): void {
        const currentOpts = [...this.optionSource.getValue()];
        currentOpts.push(value);
        this.optionSource.next(currentOpts);
        this.persistOptions();
    }

    deleteNewOption(value: string): void {
        const currentOpts = this.optionSource.getValue();
        this.optionSource.next(currentOpts.filter(opts => opts != value));
        this.persistOptions();
    }

    addWinner(value: string): void {
        let winners = this.winnersSource.getValue();
        winners = [...winners, value];
        this.winnersSource.next(winners);
    }

    restartWinners(): void {
        this.winnersSource.next([]);
    }

    persistOptions(): void {
        localStorage.setItem('OPTS', JSON.stringify(this.optionSource.getValue()));
    }

    getOptions(): string[] {
        const value = localStorage.getItem('OPTS');
        return value ? JSON.parse(value) : this._defaultOpts;
    }

    resetToDefault(): void {
        this.optionSource.next(this._defaultOpts);
    }
}
