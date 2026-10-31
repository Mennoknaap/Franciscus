# Leiding Goreng?

A joke yes/no spin wheel (`modules/leiding-goreng/`), cloned from [Stelz?](stelz.md)/[Biertje?](biertje.md). The wheel has 8 equal slices alternating "Ja" (green) and "Nee" (red) and *looks* like a fair 50/50, but always lands on "Ja". Gated by `appAccessGuard('leiding-goreng')` on its route (AppKey `leiding-goreng`, also listed in `GATEABLE_APPS` in `app-access-dialog.ts`); see [platform/app-access.md](../platform/app-access.md). Pure frontend, no backend involvement.

## How the rig works

Same mechanics as Biertje? (see [biertje.md](biertje.md) for the rotation loop, tick sound and win sound). The only difference: `spin()` picks a random "Ja" slice (`JA_SLICE_INDICES`, the even indices) instead of always slice 0, then computes the rotation that puts it under the top pointer, plus 5–8 extra full turns and a ±10° jitter (well inside the 45° slice). The result dialog always says "Ja!". It reuses `public/assets/nog-eentje-dan.mp3` as the win sound.

Because access is per app key, nobody sees the tile until an admin grants "Leiding Goreng?" in `/admin` > "App-toegang".
