# Vleesdoos (module/route/AppKey: `kud`)

**User-facing name is "Vleesdoos"** (home tile, in-app title, admin "App-toegang" label) — renamed from "Kud" per feedback. The module folder, component/file names, route (`/kud`), and `AppKey` (`'kud'`) deliberately **stayed** `kud` rather than being renamed too: changing the `AppKey` would have silently revoked everyone's existing granted access (a fresh key nobody has been granted yet), and renaming the route would break any existing bookmarks/links — neither was worth it for a cosmetic rename. If you're grepping for this feature, search `kud`, not `vleesdoos`.

A silly word generator (`modules/kud/`) — one big button that "generates" a random creative/juvenile substitute word (`kud-words.ts`, a flat pool of ~130 entries) and reveals it in a confetti dialog. Gated by the frontend's `appAccessGuard('kud')` on its route; see [platform/app-access.md](../platform/app-access.md) for the gating system in general. Same as `wheel-of-fortune`/`biertje`: pure frontend, no backend involvement, no persisted state — there's no `KudController`.

## The "generating" animation

`kud.ts`'s `generate()` picks the target word up front (`randomWord()`), then spends ~2s revealing it through a slot-machine-style scramble — each tick (`runTick()`, `setTimeout`-chained rather than `setInterval`) shows a different random word from the pool, and the delay between ticks grows quadratically with progress (`SCRAMBLE_TICK_MS + progress² × SCRAMBLE_SLOWDOWN_MS`) so it visibly slows down like a slot machine settling, not a flat-rate flicker. The actual randomness happens once, at the very start — everything after that is just for show. The orb button (`kud.scss`) layers a breathing box-shadow glow (idle) with a faster pulse + spinning conic-gradient ring (`.generating`) via a `::before` pseudo-element.

## Confetti dialog

`kud-result-dialog.ts` generates `CONFETTI_PIECE_COUNT` (60) confetti pieces with randomized left offset, color, fall duration/delay, rotation, and horizontal drift, rendered as absolutely-positioned `<span>`s that fall via a CSS `@keyframes` animation using CSS custom properties (`--kud-rotate`/`--kud-drift`) for the per-piece randomization — no external confetti library. The confetti layer sits at `z-index: 0` behind the dialog's actual content (`z-index: 1`), clipped by the dialog's own `overflow: hidden`; the fall distance (300px) is an approximation of the dialog's typical rendered height, not measured dynamically.

## The word list

`kud-words.ts`'s `KUD_WORDS` is deliberately silly/invented-leaning (`Vleesdoos`, `Parmasandwich`, `Wondersteeg`, `Geurgordijn`, ...) rather than literal vulgar terms — all entries are playful, metaphorical references to female anatomy (compound nouns/short phrases in a consistent poetic-absurdist register: `Geheime`/`Liefdes`/`Vochtige`/`Roze` + `Tuin`/`Grot`/`Doos`/`Kastje`/etc.), not clinical anatomical language and not general-purpose curse-word exclamations — an earlier version mixed in "fuck"-style exclamations (`Potjandrie`, ...) and penis euphemisms, both removed per feedback to keep the pool tightly themed. Add new entries there, matching that register; the generator has no other configuration.
