import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog } from '../../components/confirm-dialog';
import { PromptDialog } from '../../components/prompt-dialog';
import { ISound, SoundService } from './sound-service';

@Component({
    selector: 'app-sound-settings-dialog',
    standalone: false,
    templateUrl: './sound-settings-dialog.html',
    styleUrls: ['./sound-settings-dialog.scss'],
})
export class SoundSettingsDialog {
    private readonly _dialogRef = inject(MatDialogRef<SoundSettingsDialog>);
    private readonly _dialog = inject(MatDialog);
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
            const dialogRef = this._dialog.open(PromptDialog, {
                data: { title: 'Naam voor dit geluid', label: 'Naam' },
                width: '400px',
                maxWidth: '95vw',
            });

            const name = await firstValueFrom(dialogRef.afterClosed());
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

        const dialogRef = this._dialog.open(ConfirmDialog, {
            data: { title: 'Geluid verwijderen', message: `Weet je zeker dat je "${sound.name}" wilt verwijderen?` },
            width: '400px',
            maxWidth: '95vw',
        });

        const confirmed = await firstValueFrom(dialogRef.afterClosed());
        if (!confirmed)
            return;

        await this.soundService.removeSound(sound);
    }
}
