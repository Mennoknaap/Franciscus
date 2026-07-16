import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
    title: string;
    message: string | string[];
    confirmLabel?: string;
    cancelLabel?: string;
}

// Generic Yes/No confirmation, replacing every ad-hoc window.confirm() call and every
// one-off "ConfirmXDialog" component that used to duplicate this same title/message/
// confirm-cancel-button structure. Always resolves to true (confirmed) or false/undefined
// (cancelled/dismissed) via afterClosed().
@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
    readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

    get messageLines(): string[] {
        return Array.isArray(this.data.message) ? this.data.message : [this.data.message];
    }
}
