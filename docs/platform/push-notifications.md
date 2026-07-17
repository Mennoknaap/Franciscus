# Push notifications

Push subscriptions are centralized in `core/push/push-notification-service.ts` (`PushNotificationService`), not owned by the `poop-app` module — both the home screen's opt-in prompt and the poop-app page's own controls share this one subscribe path. It exposes:

- `permissionGranted`/`permissionDenied` signals, derived from `Notification.permission` (not from whether a subscribe call has ever succeeded).
- `subscribe()` — requests permission if needed, via Angular's built-in `SwPush` + `environment.vapidPublicKey`, then posts the subscription to the API's `/push/subscribe`.
- `refreshIfAlreadyGranted()` — silently re-subscribes, once per app load, only when permission is already granted (see "silently stale subscriptions" below for why this exists).

**Web Push notifications on iOS only work if the PWA has been "Added to Home Screen"** — plain Safari tabs can't receive them (iOS 16.4+ requirement), keep this in mind if push "doesn't work" during testing on an iPhone.

`environment.prod.ts`'s `vapidPublicKey` must match whatever private key is configured on the Pi (see the API repo's `docs/push-notifications.md`) — dev and prod intentionally use different VAPID keypairs.

## Permission state can go stale in the UI

There's no cross-browser "permission changed in OS settings" event, so `PushNotificationService` re-reads `Notification.permission` on every `visibilitychange` rather than only once at construction — otherwise revoking notification permission manually in the OS settings would leave the app's banner still claiming they're enabled.

## Subscriptions can go silently stale, with no error anywhere

The server and Apple's push relay both report success even though the notification never reaches the device (confirmed by reproducing it with a completely independent library, ruling out a bug in our own send code). There's no reliable signal from the browser when this happens either: the standard `pushsubscriptionchange` event that's supposed to fire when a push service invalidates a subscription isn't dependable on Safari/iOS.

The practical mitigation, not a full fix:

- `App`'s constructor (`app.ts`) runs an `effect()` that calls `PushNotificationService.refreshIfAlreadyGranted()` once per app load for anyone with `poop-app` access who already granted permission — cheap and idempotent, since re-subscribing when already granted doesn't re-prompt.
- `home.ts`'s `showNotificationPrompt` (a small banner above the app tiles, only for users with `poop-app` access) is the *first* ask.
- `poop-app.ts`'s "Vernieuw abonnement" button is the manual fallback for forcing a fresh subscription on demand, since the initial "enable" button disappears once permission is already granted.

**Gotcha**: `showNotificationPrompt`'s condition has to special-case a just-failed attempt — hiding the banner whenever permission is `'denied'` (normally correct, since the browser won't prompt again) would also hide the error message a failed `subscribe()` call just set, at the exact moment it's supposed to be shown. It stays visible whenever there's a pending `notificationError`, denied or not.

See the API repo's `docs/push-notifications.md` for the full push-delivery incident story (also covers the `notification`-wrapper payload gotcha).
