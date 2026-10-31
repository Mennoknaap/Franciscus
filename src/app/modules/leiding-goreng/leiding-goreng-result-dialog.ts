import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-leiding-goreng-result-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './leiding-goreng-result-dialog.html',
    styleUrl: './leiding-goreng-result-dialog.scss',
})
export class LeidingGorengResultDialog {}
