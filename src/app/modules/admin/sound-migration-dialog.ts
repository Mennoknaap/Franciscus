import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { getDownloadURL, getMetadata, listAll, ref, Storage } from '@angular/fire/storage';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MigrateSoundError {
    fileName: string;
    error: string;
}

interface MigrateSoundsResult {
    succeeded: string[];
    failed: MigrateSoundError[];
}

// TEMPORARY: one-time migration of existing soundboard files from Firebase Storage to
// the .NET API's own file storage. Must be run by a real (non-dev-login) session, since
// Firebase Storage rules require actual Firebase auth. Delete this file (and its trigger
// in admin.html/admin.ts) once the migration has been confirmed complete.
//
// Fetches every file from Firebase Storage client-side, then posts them all in a SINGLE
// request to /sounds/migrate-batch — not one request per file. That avoids repeating the
// auth/CORS-preflight round trip per sound (which is where earlier attempts silently
// failed) and gets back the real per-file error message instead of a generic one.
@Component({
    selector: 'app-sound-migration-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
    templateUrl: './sound-migration-dialog.html',
    styleUrl: './sound-migration-dialog.scss',
})
export class SoundMigrationDialog {
    private readonly _storage = inject(Storage);
    private readonly _http = inject(HttpClient);

    readonly running = signal(false);
    readonly done = signal(false);
    readonly log = signal<string[]>([]);

    async startMigration(): Promise<void> {
        this.running.set(true);
        this.done.set(false);
        this.log.set(['Bestanden ophalen uit Firebase...']);

        const res = await listAll(ref(this._storage));
        const formData = new FormData();
        let collected = 0;

        for (const item of res.items) {
            try {
                const metadata = await getMetadata(item);
                const name = metadata.customMetadata?.['name'] || item.name;
                const url = await getDownloadURL(item);

                const response = await fetch(url);
                const blob = await response.blob();
                const dotIndex = item.name.lastIndexOf('.');
                const extension = dotIndex !== -1 ? item.name.slice(dotIndex) : '.mp3';
                const file = new File([blob], `${name}${extension}`, { type: blob.type });

                // Diagnostic: confirm the fetched blob actually has content before it's
                // appended, so a 0-byte result on the server can be traced back to either
                // this fetch step or the upload/transit step.
                console.log(`[migratie] ${item.name}: blob.size=${blob.size}, file.size=${file.size}`);

                formData.append('Files', file);
                collected++;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'onbekende fout';
                this.log.update(lines => [...lines, `✗ ${item.name} (ophalen mislukt): ${message}`]);
            }
        }

        if (collected === 0) {
            this.log.update(lines => [...lines, 'Geen bestanden konden opgehaald worden.']);
            this.running.set(false);
            this.done.set(true);
            return;
        }

        this.log.update(lines => [...lines, `${collected} bestand(en) opgehaald, uploaden naar de API...`]);

        try {
            const result = await firstValueFrom(
                this._http.post<MigrateSoundsResult>(`${environment.apiUrl}/sounds/migrate-batch`, formData),
            );

            this.log.update(lines => [
                ...lines,
                ...result.succeeded.map(name => `✓ ${name}`),
                ...result.failed.map(f => `✗ ${f.fileName}: ${f.error}`),
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'onbekende fout';
            this.log.update(lines => [...lines, `✗ Upload mislukt: ${message}`]);
        }

        this.running.set(false);
        this.done.set(true);
    }
}
