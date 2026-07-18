# Stelz?

Another exact clone of [Biertje?](biertje.md) (`modules/stelz/`), reskinned for Stelz — canned sweet-drink alcopops — instead of beer. Same rigged 10-slice wheel (1 "Stelz!", 9 "Naar bed"), same rotation/tick/win-sound logic verbatim, same lack of any backend involvement. Gated by `appAccessGuard('stelz')` on its route; see [platform/app-access.md](../platform/app-access.md) for the gating system in general.

Only surface-level differences from Biertje?/[Wijntje?](wijntje.md): the winning slice's label ("Stelz!"), the route/module/AppKey (`stelz`), and the result dialog's copy ("🥤 Nog 1 stelzje dan!"). Reuses the same `public/assets/nog-eentje-dan.mp3` win sound as its siblings. See [biertje.md](biertje.md) for the rig mechanics (rotation math, tick sound, win sound) — unchanged here.
