import { inject, Injectable, signal } from '@angular/core';
import {
    deleteObject,
    getDownloadURL,
    getMetadata,
    listAll,
    ref,
    Storage,
    StorageReference,
    updateMetadata,
    uploadBytes,
} from '@angular/fire/storage';

export interface ISound {
    name: string;
    src: string;
    volume: number;
    audio: HTMLAudioElement;
    ref: StorageReference;
}

@Injectable({ providedIn: 'root' })
export class SoundService {
    private readonly _storage = inject(Storage);

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
            await deleteObject(sound.ref);
            this._sounds.update(prev => prev.filter(s => s.name !== sound.name));
        } catch (error) {
            console.error('Error deleting sound:', error);
        }
    }

    async updateSound(sound: ISound, newName: string, newVolume: number): Promise<void> {
        await updateMetadata(sound.ref, {
            customMetadata: { name: newName, volume: newVolume.toString() },
        });

        this._sounds.update(prev =>
            prev.map(s => s.name === sound.name ? { ...s, name: newName, volume: newVolume } : s),
        );
    }

    async uploadSound(file: File, customName: string): Promise<void> {
        try {
            const fileRef = ref(this._storage, file.name);

            await uploadBytes(fileRef, file, {
                customMetadata: {
                    name: customName,
                    volume: '0.5',
                },
            });

            const url = await getDownloadURL(fileRef);
            const metadata = await getMetadata(fileRef);

            const audio = new Audio(url);
            audio.preload = 'auto';

            const newSound: ISound = {
                name: metadata.customMetadata?.['name'] || file.name,
                volume: metadata.customMetadata?.['volume'] ? parseFloat(metadata.customMetadata['volume']) : 0.5,
                src: url,
                audio,
                ref: fileRef,
            };

            this._sounds.update(prev => [...prev, newSound]);
        } catch (error) {
            console.error('Upload mislukt:', error);
        }
    }

    private async fetchSounds(): Promise<void> {
        try {
            this._isLoading.set(true);
            const listRef = ref(this._storage);
            const res = await listAll(listRef);

            const soundPromises = res.items.map(async item => {
                const metadata = await getMetadata(item);
                const src = await getDownloadURL(item);

                const audio = new Audio(src);
                audio.preload = 'auto';

                return {
                    name: metadata.customMetadata?.['name'] || item.name,
                    volume: metadata.customMetadata?.['volume']
                        ? parseFloat(metadata.customMetadata['volume'])
                        : 0.5,
                    src: src,
                    audio,
                    ref: item,
                };
            });

            const soundsList = await Promise.all(soundPromises);
            this._sounds.set(soundsList);
            this._isLoading.set(false);
        } catch (error: unknown) {
            this._error.set(error instanceof Error ? error.message : 'Unknown error');
            this._isLoading.set(false);
        }
    }
}
