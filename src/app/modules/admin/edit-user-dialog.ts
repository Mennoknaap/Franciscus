import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../apiclients/fransapi.client';

@Component({
    selector: 'app-edit-user-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    templateUrl: './edit-user-dialog.html',
    styleUrl: './edit-user-dialog.scss',
})
export class EditUserDialog {
    readonly data = inject<{ user: User }>(MAT_DIALOG_DATA);
    private readonly _dialogRef = inject(MatDialogRef<EditUserDialog>);

    readonly firstName = model<string>('');
    readonly lastName = model<string>('');

    constructor() {
        this.firstName.set(this.data.user.firstName);
        this.lastName.set(this.data.user.lastName);
    }

    save(): void {
        this._dialogRef.close({
            firstName: this.firstName(),
            lastName: this.lastName(),
        });
    }
}
