import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../apiclients/fransapi.client';
import { Title } from '../../components/title';
import { AddUserDialog } from './add-user-dialog';
import { AdminApiService } from './admin-api';
import { EditUserDialog } from './edit-user-dialog';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.html',
    styleUrl: './admin.scss',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatDialogModule, Title],
})
export class Admin {
    private readonly _adminApi = inject(AdminApiService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _dialog = inject(MatDialog);

    readonly allUsers = signal<User[]>([]);
    readonly loading = signal<boolean>(false);

    constructor() {
        this.loading.set(true);

        this._adminApi.getAllUsers().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(users => {
            this.allUsers.set(users);
            this.loading.set(false);
        });
    }

    addUser(): void {
        const dialogRef = this._dialog.open(AddUserDialog, {
            width: '500px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(result => {
            if (result) {
                this._adminApi.addUser(result).subscribe(() => {
                    // Refresh de lijst om de nieuwe gebruiker op te halen
                    this._adminApi.getAllUsers().subscribe(users => {
                        this.allUsers.set(users);
                    });
                });
            }
        });
    }

    editUser(user: User): void {
        const dialogRef = this._dialog.open(EditUserDialog, {
            data: { user },
            width: '500px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(result => {
            if (result) {
                this._adminApi.updateUser(user.id, result).subscribe(() => {
                    const users = this.allUsers();
                    const index = users.findIndex(u => u.id === user.id);
                    if (index !== -1) {
                        users[index] = { ...user, ...result };
                        this.allUsers.set([...users]);
                    }
                });
            }
        });
    }

    deleteUser(user: User): void {
        const dialogRef = this._dialog.open(ConfirmDeleteDialog, {
            data: { userName: `${user.firstName} ${user.lastName}` },
            width: '400px',
            maxWidth: '95vw',
        });

        dialogRef.afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(confirmed => {
            if (confirmed) {
                this._adminApi.deleteUser(user.id).subscribe(() => {
                    this.allUsers.set(this.allUsers().filter(u => u.id !== user.id));
                });
            }
        });
    }
}

@Component({
    selector: 'app-confirm-delete-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    template: `
        <h2 mat-dialog-title>Gebruiker verwijderen</h2>
        <mat-dialog-content>
            <p>Weet je zeker dat je <strong>{{ data.userName }}</strong> wilt verwijderen?</p>
            <p>Deze actie kan niet ongedaan worden gemaakt.</p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button [mat-dialog-close]="false">Annuleren</button>
            <button mat-raised-button color="warn" [mat-dialog-close]="true">Verwijderen</button>
        </mat-dialog-actions>
    `,
    styles: [`
        mat-dialog-content {
            p {
                margin: 0.5rem 0;
            }
            strong {
                color: #e74c3c;
            }
        }
    `],
})
export class ConfirmDeleteDialog {
    readonly data = inject<{ userName: string }>(MAT_DIALOG_DATA);
}
