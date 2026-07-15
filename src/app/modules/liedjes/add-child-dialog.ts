import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export interface AddChildDialogResult {
    name: string;
    photo: File | null;
}

@Component({
    selector: 'app-add-child-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
    ],
    templateUrl: './add-child-dialog.html',
    styleUrl: './add-child-dialog.scss',
})
export class AddChildDialog {
    private readonly _dialogRef = inject(MatDialogRef<AddChildDialog>);

    readonly name = model<string>('');
    readonly photo = signal<File | null>(null);
    readonly photoError = signal<string | null>(null);

    handlePhotoChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file)
            return;

        if (!file.type.startsWith('image/')) {
            this.photoError.set('Alleen afbeeldingen zijn toegestaan.');
            this.photo.set(null);
            input.value = '';
            return;
        }

        if (file.size > MAX_PHOTO_SIZE_BYTES) {
            this.photoError.set('De foto mag maximaal 5MB zijn.');
            this.photo.set(null);
            input.value = '';
            return;
        }

        this.photoError.set(null);
        this.photo.set(file);
    }

    removePhoto(): void {
        this.photo.set(null);
        this.photoError.set(null);
    }

    save(): void {
        const result: AddChildDialogResult = {
            name: this.name(),
            photo: this.photo(),
        };
        this._dialogRef.close(result);
    }
}
