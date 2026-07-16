import { Component, inject, signal } from '@angular/core';
import { getDownloadURL, getMetadata, listAll, ref, Storage } from '@angular/fire/storage';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { FransApiClient } from '../../apiclients/fransapi.client';

// TEMPORARY: one-time migration of existing soundboard files from Firebase Storage to
// the .NET API's own file storage. Must be run by a real (non-dev-login) session, since
// Firebase Storage rules require actual Firebase auth. Delete this file (and its trigger
// in admin.html/admin.ts) once the migration has been confirmed complete.
@Component({
    selector: 'app-sound-migration-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
    templateUrl: './sound-migration-dialog.html',
    styleUrl: './sound-migration-dialog.scss',
})
export class SoundMigrationDialog {
    private readonly _storage = inject(Storage);
    private readonly _api = inject(FransApiClient);

    readonly running = signal(false);
    readonly done = signal(false);
    readonly log = signal<string[]>([]);

    async startMigration(): Promise<void> {
        this.running.set(true);
        this.done.set(false);
        this.log.set([]);

        const res = await listAll(ref(this._storage));

        for (const item of res.items) {
            try {
                const metadata = await getMetadata(item);
                const name = metadata.customMetadata?.['name'] || item.name;
                const url = await getDownloadURL(item);

                const response = await fetch(url);
                const blob = await response.blob();
                const file = new File([blob], item.name, { type: blob.type });

                await firstValueFrom(this._api.soundsPost(name, { data: file, fileName: item.name }));
                this.log.update(lines => [...lines, `✓ ${name}`]);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'onbekende fout';
                this.log.update(lines => [...lines, `✗ ${item.name}: ${message}`]);
            }
        }

        this.running.set(false);
        this.done.set(true);
    }
}
