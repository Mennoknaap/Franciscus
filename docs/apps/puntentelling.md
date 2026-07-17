# Puntentelling (`modules/puntentelling/`)

A shared, multi-device live scoreboard — the first app this session with a real backend component (`ScoreboardController` in Franciscus-API); every earlier app (Radje, Biertje?, Kud) was pure `localStorage`/frontend-only. Gated by `appAccessGuard('puntentelling')`; see [platform/app-access.md](../platform/app-access.md).

## Sessions ("potjes"), not one eternal board

Every "potje" is its own `ScoreboardSession` with its own team list and history — starting a new one is blocked (409 from the API) while another is still active. Team **count and names are both locked at creation** — there is no rename/add/remove-team endpoint at all, which is why the setup screen (`puntentelling.ts`, shown whenever `GET /scoreboard/active` 404s) is the only place team names are ever entered.

## Sync is polling, not WebSockets

`puntentelling.ts` polls `GET /scoreboard/active` every 3s (`setInterval`, cleared in `ngOnDestroy`) while the live board is open, merging in changes made by other people on other devices. Every local mutation (score adjust, undo, finish) also applies its own response immediately, so the person who just clicked doesn't wait for the next poll tick — only *other* viewers see it up to ~3s later. This was a deliberate simplification over real-time WebSockets (SignalR): no new backend infrastructure, and a few seconds of latency doesn't matter for a scoreboard people are looking at, unlike a chat app.

A poll that comes back 404 specifically means someone else finished (or the session otherwise no longer exists) — that's the one error case that kicks the viewer back to the setup screen; any other polling error is treated as a transient hiccup and ignored rather than dumping the user out of the live board.

## Scoring UI

Each team card has quick ±1/±5/±10 buttons plus a custom-amount number input + "Toepassen" (typing a leading `-` applies a decrease directly — no separate sign toggle). "Ongedaan maken" reverses only the single most recent history entry for the whole session (not per-team) via `POST /scoreboard/sessions/{id}/undo`, matching the backend's undo semantics.

## Finishing and ranking

"Spel afronden" (behind the shared `ConfirmDialog`, see [platform/dialogs.md](../platform/dialogs.md)) calls `POST .../finish`, which is **permanent** — the backend rejects any further score/undo calls on a finished session (409), there is no "un-finish". The resulting ranking uses competition-style rank ordering (`puntentelling-results.ts`'s `ranked` computed signal): tied scores share a rank and the next distinct score skips ahead (e.g. `1, 2, 2, 4`), not a naive index-based `1, 2, 3, 4`.

`puntentelling-results.ts` (ranked team list + full history log) is a shared presentational component (`session = input.required<ScoreboardSession>()`) used both by `puntentelling-finish-dialog.ts` (the confetti "🏆 Potje afgelopen!" reveal — same self-contained CSS-confetti technique as `kud-result-dialog.ts`, no library) and by `puntentelling-session-detail.ts` (`/puntentelling/geschiedenis/:id`, a plain page, no confetti) — the ranking/tie logic exists in exactly one place.

## Dates from the API

`ScoreboardSession.createdAt`/`finishedAt` and `ScoreboardHistoryEntry.createdAt` all come back from NSwag as `dayjs.Dayjs`, not native `Date` — format with `dayjs(...).format(...)` (see `formatTime()`/`formatDate()` in this module), not Angular's `date` pipe, same gotcha already documented in [poop-app.md](poop-app.md).
