# Rad (wheel-of-fortune)

Pure `localStorage`, via `wheel-data.ts` — there is no backend endpoint for this app at all (no `WheelController` exists in the API). Gated only by the frontend's `appAccessGuard('wheel')` on its route; see [platform/app-access.md](../platform/app-access.md) for the gating system in general.

Because there's no backend involvement, granting/revoking `wheel` access only affects whether the route is reachable — there's no server-side data to protect the way there is for the other apps.
