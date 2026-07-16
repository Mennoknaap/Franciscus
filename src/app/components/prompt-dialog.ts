import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface PromptDialogData {
    title: string;
    label?: string;
    initialValue?: string;
    confirmLabel?: string;
}

// Generic single-text-field input, replacing native window.prompt() calls — those can't
// be styled, don't match the rest of the app, and (unlike a proper Material dialog)
// silently return null in some embedded/PWA contexts without any visible reason why.
@Component({
    selector: 'app-prompt-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
    templateUrl: './prompt-dialog.html',
})
export class PromptDialog {
    readonly data = inject<PromptDialogData>(MAT_DIALOG_DATA);

    readonly value = signal(this.data.initialValue ?? '');
}
