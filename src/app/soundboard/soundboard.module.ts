import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Title } from '../components/title';
import { Soundboard } from './soundboard';

@NgModule({
    declarations: [Soundboard],
    imports: [
        Title,

        CommonModule,
        RouterLink,

        MatButtonModule,
        MatIconModule,
    ],
})
export class SoundboardModule { }
