# Auth

Auth is two-layered:

1. Firebase Auth (`@angular/fire`) is used only to sign in with Google and obtain an ID token — it is not the app's actual session.
2. That Google ID token is exchanged with the FransApi backend (`AuthService.handleGoogleLogin` → `_api.auth(idToken)`) for the app's own `authToken`/`refreshToken` pair, stored in `localStorage`. All authenticated API calls use this pair, not Firebase's session.

`auth-interceptor.ts` attaches the bearer token to outgoing requests, decodes JWT expiry client-side (`jwt-decode`), and transparently calls `authRefresh` when the access token (but not the refresh token) has expired.

`auth-guard.ts` and `admin-auth-guard.ts` gate routes on `AuthService.isInitialized`/`user()`; admin access is `user().role !== 0`.

Firebase (`@angular/fire`) is now used only for this — nothing in this repo touches Firebase Storage anymore (Soundboard's migration away from it is covered in [apps/soundboard.md](../apps/soundboard.md)).
