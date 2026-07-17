# Biertje?

A joke spin wheel (`modules/biertje/`) with 10 equal slices — 1 "Biertje!" and 9 "Naar bed" — that *looks* like a ~10% chance but always lands on "Biertje!". Gated by the frontend's `appAccessGuard('biertje')` on its route; see [platform/app-access.md](../platform/app-access.md) for the gating system in general. Like the wheel-of-fortune, it's pure frontend with no backend involvement at all — no `BiertjeController` exists in the API, and there's no persisted state to protect.

## How the rig works

Unlike `wheel-of-fortune`, which spins via a physics-friction animation loop and reads off whatever sector the momentum happens to land on, `biertje.ts` never leaves that to chance. The wheel is a CSS `conic-gradient` rotated via `transform: rotate(...)`, and `spin()` computes the exact rotation needed to land the "Biertje!" slice (index 0, spanning 0–36°) under the fixed top pointer, then adds a random number of extra full turns (5–8) plus a small random jitter (±10°, well inside the 36°-wide slice) so it still looks and feels like a genuine spin. The `setTimeout` in `spin()` must match the CSS `transition` duration in `biertje.scss` (both 4.5s) — if one changes, change the other.

## Win sound

`public/assets/nog-eentje-dan.mp3` ("Nog ééntje dan") plays via a plain `new Audio(...)` the moment the spin resolves — same pattern as `wheel-of-fortune`'s `_heySlay`/`_nummer11` (`public/assets/*.mp3`, not `src/assets/`; this repo's audio assets live in `public/assets/`, served as static files unrelated to the NSwag-backed `/uploads/sounds/*` used by the actual Soundboard app). This file is a copy of the Soundboard's existing "Nog ééntje dan" sound (`Sounds` table, pulled from the Pi's `wwwroot/uploads/sounds/`), duplicated here because Biertje? has no backend/DB access of its own — see the "How the rig works" section above.
