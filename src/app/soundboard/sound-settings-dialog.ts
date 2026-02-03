import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ISound, SoundService } from './sound-service';

@Component({
    selector: 'app-sound-settings-dialog',
    standalone: false,
    template: `
    <h2 mat-dialog-title style="text-align: center;">Sound Instellingen</h2>

    <mat-dialog-content>
      @if (selectedSound()) {
        <button
          mat-icon-button
          style="position: absolute; top: 8px; left: 8px"
          (click)="selectedSound.set(null)"
        >
          <mat-icon>arrow_back</mat-icon>
        </button>

        <mat-form-field style="width: 100%; margin-bottom: 16px">
          <mat-label>Naam</mat-label>
          <input matInput [(ngModel)]="name" />
        </mat-form-field>

        <div style="padding: 0 16px">
          <mat-label>Volume</mat-label>
          <mat-slider min="0" max="1" step="0.01" style="width: 100%">
            <input matSliderThumb [(ngModel)]="volume" />
          </mat-slider>
        </div>
      } @else {
        <button
          mat-icon-button
          style="position: absolute; top: 8px; left: 8px"
          (click)="handleClose()"
        >
          <mat-icon>arrow_back</mat-icon>
        </button>

        <mat-list>
          @for (sound of soundService.sounds(); track sound.name) {
            <mat-list-item (click)="handleSoundClick(sound)">
              <div matListItemAvatar>
                <div
                  style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #bbdefb;
                    color: #0d47a1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 500;
                  "
                >
                  {{ sound.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div matListItemTitle style="color: black;">{{ sound.name }}</div>
              <button
                mat-icon-button
                color="warn"
                matListItemMeta
                (click)="handleRemoveSound($event, sound)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </mat-list-item>
          }
        </mat-list>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (selectedSound()) {
        <button
          mat-raised-button
          color="primary"
          style="width: 100%"
          (click)="handleUpdateSoundMetadata()"
        >
          Update
        </button>
      } @else {
        <button
          mat-raised-button
          color="primary"
          style="width: 100%"
          (click)="fileInput.click()"
        >
          Toevoegen
        </button>
      }
      <input
        #fileInput
        type="file"
        accept=".wav,.aif,.aiff,.flac,.alac,.aac,.ogg,.mp3"
        style="display: none"
        (change)="handleFileChange($event)"
      />
    </mat-dialog-actions>
  `,
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
