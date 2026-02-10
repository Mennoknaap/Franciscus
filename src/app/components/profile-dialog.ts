import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../apiclients/fransapi.client';

@Component({
    selector: 'app-profile-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    templateUrl: './profile-dialog.html',
    styleUrl: './profile-dialog.scss',
})
export class ProfileDialog {
    readonly data = inject<{ user: User }>(MAT_DIALOG_DATA);
    private readonly _dialogRef = inject(MatDialogRef<ProfileDialog>);

    readonly firstName = model<string>('');
    readonly lastName = model<string>('');

    private readonly _originalFirstName: string;
    private readonly _originalLastName: string;

    constructor() {
        this._originalFirstName = this.data.user.firstName;
        this._originalLastName = this.data.user.lastName;
        this.firstName.set(this.data.user.firstName);
        this.lastName.set(this.data.user.lastName);
    }

    save(): void {
        const changes: Partial<{ firstName: string; lastName: string }> = {};

        if (this.firstName() !== this._originalFirstName)
            changes.firstName = this.firstName();

        if (this.lastName() !== this._originalLastName)
            changes.lastName = this.lastName();

        // Alleen sluiten met changes als er daadwerkelijk iets is gewijzigd
        if (Object.keys(changes).length > 0)
            this._dialogRef.close(changes);
        else
            this._dialogRef.close(null);
    }
}
