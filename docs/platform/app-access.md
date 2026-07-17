# Per-app access control

Per-app access gating applies to every app now (Soundboard, Rad, Liedjes, Poeplog) — not just the poop-app it started with. `AppCard` supports `requiresAppKey`, set on all four tiles in `home.ts`; the `visibleApps` computed signal filters a tile out unless `user()?.grantedApps` (from the backend's `User.grantedApps`) contains that key. **This is UI convenience only** — the actual enforcement is the backend's `[RequireAppAccess]` filter on the corresponding controller (see the API repo's `docs/app-access.md`), never rely on hiding the tile as the real security boundary.

`core/auth/app-access-guard.ts` exports a **factory** `appAccessGuard(appKey)` (not a single fixed guard) used on every gated route alongside `authGuard`, e.g. `canActivate: [authGuard, appAccessGuard('soundboard')]`.

## No automatic backfill

When Soundboard/Rad/Liedjes were added to this system, nobody's existing access carried over on purpose — every user (including the admin) had to be re-granted access per app via the admin UI after deploying. If an app ever stops working right after a deploy and the fix is "nobody has access", that's expected, not a bug — check `/admin`'s per-user "App-toegang" menu item first.

## Managing access is per-person, not per-app

Each `.user-card` in `admin.html` has a single overflow menu (`mat-menu`, "Bewerken"/"App-toegang"/"Verwijderen") rather than separate always-visible icon buttons — this replaced an earlier design with a floating per-app button, which didn't scale UX-wise once you think in terms of "what can this person access" rather than "who can access this one app". `app-access-dialog.ts`'s `GATEABLE_APPS` constant (currently `soundboard`/`wheel`/`liedjes`/`poop-app`) is the single place to add a new app to the toggle list when something else becomes access-gated later — the dialog itself and the backend's `AppAccess`/`RequireAppAccess` are already generic per-app.
