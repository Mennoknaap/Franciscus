import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import { Title } from '../../components/title';
import { SoundSettingsDialog } from './sound-settings-dialog';
import { Soundboard } from './soundboard';

@NgModule({
    declarations: [
        Soundboard,
        SoundSettingsDialog,
    ],
    imports: [
        Title,

        CommonModule,
        FormsModule,
        RouterLink,

        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSliderModule,
    ],
})
export class SoundboardModule {}
