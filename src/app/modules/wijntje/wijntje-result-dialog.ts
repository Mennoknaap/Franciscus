import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-wijntje-result-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './wijntje-result-dialog.html',
    styleUrl: './wijntje-result-dialog.scss',
})
export class WijntjeResultDialog {}
