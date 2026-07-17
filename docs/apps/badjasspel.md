# Badjasspel (`modules/badjasspel/`)

Every night at 01:00 Europe/Amsterdam, 2 random people (from everyone with `badjasspel` access) get "niet" (no underwear allowed that day), everyone else "wel" — each finds out via a personalized push notification and by checking the app. The actual draw is entirely backend-driven (`BadjasSchedulerService`/`BadjasDrawService` in Franciscus-API — see that repo's `docs/apps/badjasspel.md`); this app is a read/admin-control surface, not the thing that runs the draw.

## The game is off by default

Added mid-build per explicit feedback: without an admin-configured `[StartDate, EndDate]` window, nothing happens at 01:00 — no surprise notifications before someone consciously turns the game on for a period. `badjasspel.ts` loads `GET /badjas/settings` for everyone (so participants can see the active window, not just the admin) and shows an admin-only date-range form (`isAdmin()`, same `RoleType.Admin = 0` check as `poop-app.ts`) to set it via `PUT /badjas/settings`.

**`EndDate` is the last day that still gets a notification** (sent at 01:00 that morning) — not "the last night", which is the source of a genuine ambiguity flagged before building this: a job that runs at 01:00 is technically already inside the *next* calendar day, so "which day does the range boundary mean" isn't obvious. Confirmed with the user: both dates are inclusive calendar days matching `BadjasEntry.date`'s own meaning (the day the outcome applies to).

## Gotcha: sending dates back to the API

`BadjasSettings.startDate`/`endDate` (backend `DateOnly?`) come back from NSwag typed as `dayjs.Dayjs`, same as it types every `DateTime`-shaped field — there's no separate date-only client type. But the backend's `DateOnly?` model binder only accepts a bare `"yyyy-MM-dd"` string; a `Dayjs` object's own `JSON.stringify()` output (a full UTC ISO datetime, e.g. `"2026-07-19T22:00:00.000Z"`) gets rejected with a 400 (confirmed empirically while building this). `badjasspel-api.ts`'s `updateSettings()` therefore takes plain `'YYYY-MM-DD'` strings (straight from a native `<input type="date">`) and casts past the generated (here, slightly wrong) parameter type rather than constructing a `Dayjs` object — read that method's comment before "fixing" it back to the seemingly-more-correct generated type.

## Today's view

`badjasspel.ts` (`/badjasspel`) fetches `GET /badjas/today`: an empty state if nothing's been drawn yet (before 01:00, or outside the active window), otherwise the caller's own result front-and-center (`ownEntry`, matched by `entry.userId === user()?.id`) plus the **full participant list** below — same everyone-sees-everyone transparency as Poeplog, not a private-only view. Admins additionally get "Trekking nu uitvoeren" / "Trekking van vandaag opnieuw" buttons (`POST /badjas/trigger`, `force=false`/`true`) — the same admin escape hatch the backend doc describes, useful for testing and for recovering a botched night.

`badjasspel-history.ts` (`/badjasspel/geschiedenis`) fetches `GET /badjas/history` (a flat list, newest `Date` first) and groups it into per-day sections client-side — same "one flat list, group in the UI" simplicity as other small-data-volume history views in this app (e.g. Puntentelling).

## Push notifications

`home.ts`'s `showNotificationPrompt` used to only fire for `poop-app` access; it now also fires for `badjasspel` access (`grantedApps.includes('poop-app') || grantedApps.includes('badjasspel')`), otherwise Badjasspel participants would never be prompted to enable push at all. The banner copy was generalized from "Meldingen aanzetten voor Poeplog?" to "Meldingen aanzetten?" since it's no longer specific to one app.
