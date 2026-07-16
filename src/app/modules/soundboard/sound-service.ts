import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FransApiClient, FransApiException } from '../../apiclients/fransapi.client';

export interface ISound {
    id: string;
    name: string;
    src: string;
    volume: number;
    audio: HTMLAudioElement;
}

@Injectable({ providedIn: 'root' })
export class SoundService {
    private readonly _api = inject(FransApiClient);

    private readonly _sounds = signal<ISound[]>([]);
    private readonly _isLoading = signal(true);
    private readonly _error = signal<string | null>(null);

    readonly sounds = this._sounds.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();

    constructor() {
        this.fetchSounds();
    }

    async removeSound(sound: ISound): Promise<void> {
        try {
            await firstValueFrom(this._api.soundsDelete(sound.id));
            this._sounds.update(prev => prev.filter(s => s.id !== sound.id));
        } catch (error) {
            console.error('Error deleting sound:', error);
        }
    }

    async updateSound(sound: ISound, newName: string, newVolume: number): Promise<void> {
        await firstValueFrom(this._api.soundsPut(sound.id, { name: newName, volume: newVolume }));

        this._sounds.update(prev =>
            prev.map(s => s.id === sound.id ? { ...s, name: newName, volume: newVolume } : s),
        );
    }

    async uploadSound(file: File, customName: string): Promise<void> {
        try {
            const result = await firstValueFrom(
                this._api.soundsPost(customName, { data: file, fileName: file.name }),
            );

            const src = environment.apiUrl + result.url;
            const audio = new Audio(src);
            audio.preload = 'auto';

            const newSound: ISound = {
                id: result.id,
                name: result.name,
                volume: result.volume,
                src,
                audio,
            };

            this._sounds.update(prev => [...prev, newSound]);
        } catch (error) {
            console.error('Upload mislukt:', error);
        }
    }

    private async fetchSounds(): Promise<void> {
        try {
            this._isLoading.set(true);
            const sounds = await firstValueFrom(this._api.soundsGet());

            const soundsList = sounds.map(sound => {
                const src = environment.apiUrl + sound.url;
                const audio = new Audio(src);
                audio.preload = 'auto';

                return {
                    id: sound.id,
                    name: sound.name,
                    volume: sound.volume,
                    src,
                    audio,
                };
            });

            this._sounds.set(soundsList);
            this._isLoading.set(false);
        } catch (error: unknown) {
            if (error instanceof FransApiException && error.status === 403)
                this._error.set('permission');
            else
                this._error.set(error instanceof Error ? error.message : 'Unknown error');

            this._isLoading.set(false);
        }
    }
}
