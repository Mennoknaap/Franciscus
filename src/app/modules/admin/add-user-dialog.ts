import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-add-user-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    templateUrl: './add-user-dialog.html',
    styleUrl: './add-user-dialog.scss',
})
export class AddUserDialog {
    private readonly _dialogRef = inject(MatDialogRef<AddUserDialog>);

    readonly firstName = model<string>('');
    readonly lastName = model<string>('');
    readonly email = model<string>('');

    save(): void {
        this._dialogRef.close({
            firstName: this.firstName(),
            lastName: this.lastName(),
            email: this.email(),
        });
    }
}
