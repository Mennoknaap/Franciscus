# Design system ("Glas")

The app is a green gradient page (the Franciscus green `#94C11E`) with translucent, blurred "glass" cards and white text. Tokens live in `src/styles.scss` (`:root`):

| Token | Use |
|---|---|
| `--frans-primary` | brand green (gradient middle, focus outlines) |
| `--frans-deep` | deep green for text/icons on white surfaces |
| `--frans-card`, `--frans-line`, `--frans-shadow`, `--frans-blur` | the glass card: translucent white fill, light border, soft shadow, backdrop blur |
| `--frans-ink`, `--frans-muted` | page text (white) and secondary text |
| `--frans-radius` | standard card radius (24px) |
| `--frans-font-display` | Bricolage Grotesque (headings); body text is Figtree |

Rules of thumb:

- Page text is white (`--frans-ink`). Dialogs and menus keep Material's white surface, so `--mat-sys-on-surface` stays dark. Do not mix them up: use `--frans-ink` for text on the green page, nothing special inside dialogs.
- Glass cards: `background: var(--frans-card); border: 1px solid var(--frans-line); box-shadow: var(--frans-shadow)` and a `backdrop-filter`. Class names that get the blur are listed in `styles.scss` (add new card classes there, or use `.frans-card`).
- Buttons: on the page, primary buttons are white with deep-green text, others are glass. Inside `.mat-mdc-dialog-container` primary buttons are deep green with white text (see the overrides in `styles.scss`).
- Each home tile has its own colour (`AppCard.color` in `home.ts`); pick a new one when adding an app.
- `<app-title>` is the shared header (back button, title, avatar menu). `<app-title [hero]="true">` is the big greeting variant used only on the home screen.
- Fonts are loaded from Google Fonts in `src/index.html`.
