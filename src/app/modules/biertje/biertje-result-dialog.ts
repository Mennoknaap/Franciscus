import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-biertje-result-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './biertje-result-dialog.html',
    styleUrl: './biertje-result-dialog.scss',
})
export class BiertjeResultDialog { }
