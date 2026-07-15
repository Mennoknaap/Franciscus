import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ISound, SoundService } from './sound-service';
import { SoundSettingsDialog } from './sound-settings-dialog';

@Component({
    standalone: false,
    selector: 'app-soundboard',
    templateUrl: './soundboard.html',
    styleUrls: ['./soundboard.scss'],
})
export class Soundboard {
    private readonly _dialog = inject(MatDialog);
    private readonly _router = inject(Router);
    readonly soundService = inject(SoundService);

    async handleSoundClick(sound: ISound): Promise<void> {
        try {
            sound.audio.volume = sound.volume;
            sound.audio.currentTime = 0; // Reset to start
            const playPromise = sound.audio.play();

            if (playPromise !== undefined) {
                await playPromise.catch(error => {
                    console.error('Kan geluid niet afspelen:', error);
                });
            }
        } catch (error) {
            console.error('Kan geluid niet afspelen:', error);
        }
    }

    async handleClickAllSounds(): Promise<void> {
        const sounds = this.soundService.sounds();
        for (const sound of sounds) {
            try {
                sound.audio.volume = sound.volume;
                sound.audio.currentTime = 0;
                const playPromise = sound.audio.play();

                if (playPromise !== undefined) {
                    await playPromise.catch(error => {
                        console.error('Kan geluid niet afspelen:', error);
                    });
                }
            } catch (error) {
                console.error('Kan geluid niet afspelen:', error);
            }
        }
    }

    handleStopAllSounds(): void {
        const sounds = this.soundService.sounds();
        for (const sound of sounds) {
            sound.audio.pause();
            sound.audio.currentTime = 0;
        }
    }

    handleSettingsClick(): void {
        this._dialog.open(SoundSettingsDialog, {
            width: '500px',
        });
    }
}
