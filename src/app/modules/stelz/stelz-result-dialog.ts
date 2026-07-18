import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-stelz-result-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './stelz-result-dialog.html',
    styleUrl: './stelz-result-dialog.scss',
})
export class StelzResultDialog {}
