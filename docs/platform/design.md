# Design system

The app uses a light "pale moss" canvas with the Franciscus green as an accent (hero header, primary buttons), not as the page background. Tokens live in `src/styles.scss` (`:root`):

| Token | Use |
|---|---|
| `--frans-primary` | brand green (hero gradient, focus outlines) |
| `--frans-deep` / `--frans-deep-soft` | primary buttons, FABs, own chat bubbles / pale-green fills |
| `--frans-canvas`, `--frans-card`, `--frans-line` | page background, card surface, card border |
| `--frans-ink`, `--frans-muted` | text, secondary text |
| `--frans-shadow`, `--frans-radius` | the standard card shadow / radius |
| `--frans-font-display` | Bricolage Grotesque (headings); body text is Figtree |

Rules of thumb:

- Text is dark by default (`--mat-sys-on-surface` is the ink colour). Never hard-code `#fff` text on the page background; white text is only for coloured surfaces (hero, app tiles, sound cards).
- Cards: `background: var(--frans-card); border: 1px solid var(--frans-line); box-shadow: var(--frans-shadow)` (or the `.frans-card` class).
- Each home tile has its own colour (`AppCard.color` in `home.ts`); pick a new one when adding an app.
- `<app-title>` is the shared header (back button, title, avatar menu). `<app-title [hero]="true">` is the big greeting variant used only on the home screen.
- Fonts are loaded from Google Fonts in `src/index.html`.
