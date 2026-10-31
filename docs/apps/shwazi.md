# Shwazi

A multi-touch finger chooser (`modules/shwazi/`), in the spirit of the "finger picker" party apps. Everyone puts a finger on the screen; once the same group has held still for 2.5s the app either picks one finger ("Eén kiezen") or splits the fingers into 2-4 teams ("Teams"). Gated by `appAccessGuard('shwazi')` (AppKey `shwazi`, also in `GATEABLE_APPS` in `app-access-dialog.ts`); see [platform/app-access.md](../platform/app-access.md). Pure frontend, no backend. The pick is fair (`Math.random`), nothing is rigged.

## How it works

- The touch surface uses Pointer Events (`pointerdown/move/up/cancel`) with `touch-action: none`, so each finger is its own `pointerId`; one `Finger` per id lives in the `fingers` signal.
- `schedule()` restarts the countdown every time a finger is added or lifted. With fewer than 2 fingers the phase stays `idle`; otherwise it is `counting` until the timer calls `resolve()`. The progress bar is re-created with `@for (run of [runId()])` so its CSS animation restarts each time.
- Result phase: new fingers are ignored; the result stays until every finger is lifted, which resets to `idle`.
- Sounds are synthesized with the Web Audio API (no asset files); the `AudioContext` is created inside the first `pointerdown` so it is not suspended. `navigator.vibrate` is used where supported (not on iOS).
