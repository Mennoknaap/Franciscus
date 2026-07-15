import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import dayjs from 'dayjs';
import { environment } from '../../../environments/environment';
import { Child, Fact } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { EditFactDialog } from './edit-fact-dialog';
import { LiedjesApiService } from './liedjes-api';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
    selector: 'app-child-detail',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FormsModule,
        Title,
    ],
    templateUrl: './child-detail.html',
    styleUrl: './child-detail.scss',
})
export class ChildDetail {
    private readonly _route = inject(ActivatedRoute);
    private readonly _api = inject(LiedjesApiService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _dialog = inject(MatDialog);

    private readonly _childId = this._route.snapshot.paramMap.get('id')!;

    readonly child = signal<Child | null>(null);
    readonly isLoading = signal<boolean>(true);
    readonly photoError = signal<string | null>(null);
    newFactText = '';

    constructor() {
        this.loadChild();
    }

    photoUrl(path: string): string {
        return environment.apiUrl + path;
    }

    handlePhotoChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file)
            return;

        if (!file.type.startsWith('image/')) {
            this.photoError.set('Alleen afbeeldingen zijn toegestaan.');
            input.value = '';
            return;
        }

        if (file.size > MAX_PHOTO_SIZE_BYTES) {
            this.photoError.set('De foto mag maximaal 5MB zijn.');
            input.value = '';
            return;
        }

        this.photoError.set(null);
        this._api.uploadPhoto(this._childId, file).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
            input.value = '';
            this.loadChild();
        });
    }

    formatDate(date: dayjs.Dayjs): string {
        return dayjs(date).format('D MMM YYYY');
    }

    addFact(): void {
        const text = this.newFactText.trim();
        if (!text)
            return;

        this._api.addFact(this._childId, { text }).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
            this.newFactText = '';
            this.loadChild();
        });
    }

    editFact(fact: Fact): void {
        const dialogRef = this._dialog.open(EditFactDialog, {
            data: { fact },
            width: '500px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(result => {
            if (!result)
                return;

            this._api.updateFact(fact.id, { text: result.text })
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe(() => this.loadChild());
        });
    }

    deleteFact(fact: Fact): void {
        if (!window.confirm('Weet je zeker dat je dit feitje wilt verwijderen?'))
            return;

        this._api.deleteFact(fact.id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
            this.loadChild();
        });
    }

    private loadChild(): void {
        this._api.getChildDetails(this._childId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(child => {
            this.child.set(child);
            this.isLoading.set(false);
        });
    }
}
