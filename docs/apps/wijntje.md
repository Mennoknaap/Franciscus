# Wijntje?

An exact clone of [Biertje?](biertje.md) (`modules/wijntje/`), reskinned for wine instead of beer — same rigged 10-slice wheel (1 "Wijntje!", 9 "Naar bed"), same rotation/tick/win-sound logic verbatim, same lack of any backend involvement. Gated by `appAccessGuard('wijntje')` on its route; see [platform/app-access.md](../platform/app-access.md) for the gating system in general.

The only differences from Biertje? are surface-level: the winning slice's label ("Wijntje!"), the route/module/AppKey (`wijntje`), and the result dialog's copy ("🍷 Nog 1 wijntje dan!"). It reuses the same `public/assets/nog-eentje-dan.mp3` win sound as Biertje? — the phrase isn't beer-specific, and the request was for something that behaves identically. See [biertje.md](biertje.md) for the rig mechanics (rotation math, tick sound, win sound) — they're unchanged here.
