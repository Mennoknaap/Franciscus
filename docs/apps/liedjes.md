# Liedjes

`liedjes` (kamp-feitjes per kind, later used to write camp songs) follows the **admin** pattern (standalone components + `loadComponent`, no `.module.ts`). `liedjes.ts` is the overview grid (`/liedjes`), `child-detail.ts` is a single child's page with its facts list (`/liedjes/:id`) — both behind the plain `authGuard` (any logged-in user, no admin restriction, matching the backend's permission model for this feature). `liedjes-api.ts` wraps the generated client the same way `admin-api.ts` does.

## Photo path gotcha

Child profile pictures are uploaded to the .NET API and the API returns a **relative** path (e.g. `/uploads/children/{guid}.jpg`) — unlike a user's Google profile picture, which is already an absolute URL. Any `<img>` showing a child's photo must prefix that path with `environment.apiUrl` (see `photoUrl()` in `liedjes.ts`/`child-detail.ts`); forgetting the prefix is the most likely bug if this ever looks broken.
