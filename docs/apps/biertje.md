# Biertje?

A joke spin wheel (`modules/biertje/`) with 10 equal slices — 1 "Biertje!" and 9 "Naar bed" — that *looks* like a ~10% chance but always lands on "Biertje!". Gated by the frontend's `appAccessGuard('biertje')` on its route; see [platform/app-access.md](../platform/app-access.md) for the gating system in general. Like the wheel-of-fortune, it's pure frontend with no backend involvement at all — no `BiertjeController` exists in the API, and there's no persisted state to protect.

## How the rig works

Unlike `wheel-of-fortune`, which spins via a physics-friction animation loop and reads off whatever sector the momentum happens to land on, `biertje.ts` never leaves that to chance. `spin()` computes the exact rotation needed to land the "Biertje!" slice (index 0, spanning 0–36°) under the fixed top pointer, then adds a random number of extra full turns (5–8) plus a small random jitter (±10°, well inside the 36°-wide slice) so it still looks and feels like a genuine spin.

The wheel's `conic-gradient` background is rotated via `transform: rotate(...)`, but — unlike a typical CSS-transition-driven spin — the rotation is advanced manually frame-by-frame in a `requestAnimationFrame` loop (`easeOutRotation()`, a cubic ease-out) rather than left to the browser's CSS transition engine. This is so `spin()` can detect every slice-boundary crossing (`Math.floor(currentRotation / SLICE_DEGREES)` changing) and fire the ticking sound (see below) at the right moments — a CSS transition gives no mid-flight hook to react to. `SPIN_DURATION_MS` (4.5s) is the only timing constant now; there's no separate CSS `transition` duration to keep in sync with it anymore.

## Win sound

`public/assets/nog-eentje-dan.mp3` ("Nog ééntje dan") plays via a plain `new Audio(...)` the moment the spin resolves — same pattern as `wheel-of-fortune`'s `_heySlay`/`_nummer11` (`public/assets/*.mp3`, not `src/assets/`; this repo's audio assets live in `public/assets/`, served as static files unrelated to the NSwag-backed `/uploads/sounds/*` used by the actual Soundboard app). This file is a copy of the Soundboard's existing "Nog ééntje dan" sound (`Sounds` table, pulled from the Pi's `wwwroot/uploads/sounds/`), duplicated here because Biertje? has no backend/DB access of its own — see the "How the rig works" section above.

## Tick sound

Each slice-boundary crossing during the spin plays a short synthesized "tick" — a `square`-wave `OscillatorNode` burst (~30ms, exponential gain decay) via the Web Audio API, not an audio file. This is deliberate: no asset exists for a mechanical-clicker sound, and synthesizing it avoids sourcing/storing another file for something this trivial. The single `AudioContext` is created (or resumed, if already `suspended`) synchronously inside `spin()` itself — not inside the later `requestAnimationFrame` callback — because browsers only allow audio to start without a user-gesture warning/block when the context is created in the same call stack as the triggering click; creating it later, inside the rAF callback, would risk it starting suspended. The tick frequency naturally follows the wheel's easing curve — rapid/blurred at the start, spacing out near the end — since it's driven by the same per-frame rotation value as the visual spin, not a separate timer.
