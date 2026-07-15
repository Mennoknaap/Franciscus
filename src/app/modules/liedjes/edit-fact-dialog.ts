import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Fact } from '../../apiclients/fransapi.client';

@Component({
    selector: 'app-edit-fact-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    templateUrl: './edit-fact-dialog.html',
    styleUrl: './edit-fact-dialog.scss',
})
export class EditFactDialog {
    readonly data = inject<{ fact: Fact }>(MAT_DIALOG_DATA);
    private readonly _dialogRef = inject(MatDialogRef<EditFactDialog>);

    readonly text = model<string>('');

    constructor() {
        this.text.set(this.data.fact.text);
    }

    save(): void {
        this._dialogRef.close({
            text: this.text(),
        });
    }
}
