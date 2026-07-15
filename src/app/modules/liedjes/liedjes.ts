import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Child } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { AddChildDialog } from './add-child-dialog';
import { LiedjesApiService } from './liedjes-api';

@Component({
    selector: 'app-liedjes',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatDialogModule, Title],
    templateUrl: './liedjes.html',
    styleUrl: './liedjes.scss',
})
export class Liedjes {
    private readonly _api = inject(LiedjesApiService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _dialog = inject(MatDialog);
    private readonly _router = inject(Router);

    readonly allChildren = signal<Child[]>([]);

    constructor() {
        this.loadChildren();
    }

    photoUrl(path: string): string {
        return environment.apiUrl + path;
    }

    openChild(child: Child): void {
        this._router.navigate(['/liedjes', child.id]);
    }

    deleteChild(event: MouseEvent, child: Child): void {
        event.stopPropagation();
        if (!window.confirm(`Weet je zeker dat je "${child.name}" en alle feitjes wilt verwijderen?`))
            return;

        this._api.deleteChild(child.id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
            this.allChildren.update(children => children.filter(c => c.id !== child.id));
        });
    }

    addChild(): void {
        const dialogRef = this._dialog.open(AddChildDialog, {
            width: '500px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(result => {
            if (!result)
                return;

            this._api.addChild({ name: result.name }).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(child => {
                if (result.photo) {
                    this._api.uploadPhoto(child.id, result.photo)
                        .pipe(takeUntilDestroyed(this._destroyRef))
                        .subscribe(() => this.loadChildren());
                } else {
                    this.loadChildren();
                }
            });
        });
    }

    private loadChildren(): void {
        this._api.getAllChildren().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(children => {
            this.allChildren.set(children);
        });
    }
}
