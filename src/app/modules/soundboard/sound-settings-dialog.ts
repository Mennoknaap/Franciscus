import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ISound, SoundService } from './sound-service';

@Component({
    selector: 'app-sound-settings-dialog',
    standalone: false,
    templateUrl: './sound-settings-dialog.html',
    styleUrls: ['./sound-settings-dialog.scss'],
})
export class SoundSettingsDialog {
    private readonly _dialogRef = inject(MatDialogRef<SoundSettingsDialog>);
    readonly soundService = inject(SoundService);

    fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

    readonly selectedSound = signal<ISound | null>(null);
    name = '';
    volume = 0.5;

    handleClose(): void {
        setTimeout(() => {
            this.selectedSound.set(null);
        }, 200);
        this._dialogRef.close();
    }

    async handleFileChange(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const name = prompt('Geef een naam op voor dit geluid:');
            if (name)
                await this.soundService.uploadSound(file, name);

            // Reset input
            input.value = '';
        }
    }

    handleSoundClick(sound: ISound): void {
        this.selectedSound.set(sound);
        this.name = sound.name;
        this.volume = sound.volume;
    }

    async handleUpdateSoundMetadata(): Promise<void> {
        const sound = this.selectedSound();
        if (sound) {
            await this.soundService.updateSound(sound, this.name, this.volume);
            this.handleClose();
        }
    }

    async handleRemoveSound(event: MouseEvent, sound: ISound): Promise<void> {
        event.stopPropagation();
        if (!window.confirm(`Weet je zeker dat je "${sound.name}" wilt verwijderen?`))
            return;

        await this.soundService.removeSound(sound);
    }
}
