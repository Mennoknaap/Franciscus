# Dialogs

**Never use native `window.confirm()`/`window.prompt()`/`alert()` — always `MatDialog`.** The app used to mix the two inconsistently (several delete confirmations used `window.confirm()` while sibling features in the same module already used `MatDialog` for other dialogs), which is why these shared components exist:

- `components/confirm-dialog.ts` — generic Yes/No, `data: { title, message: string | string[], confirmLabel?, cancelLabel? }`, resolves `true`/`false` via `afterClosed()`.
- `components/prompt-dialog.ts` — generic single text field, `data: { title, label?, initialValue?, confirmLabel? }`, resolves the trimmed string or `null`.

Use these for every new confirm/prompt instead of reaching for a native dialog or writing another bespoke one-off dialog component. Full custom forms (multiple fields, non-trivial validation) still get their own dedicated dialog component (e.g. `add-child-dialog.ts`, `edit-user-dialog.ts`) — the shared ones are only for the single-confirm/single-field case.

## Gotcha: `mat-checkbox` label contrast inside dialogs

The app forces `--mat-sys-on-surface` to white globally (for the green page shell), and `mat-checkbox`'s label (`.mdc-label`) uses that token directly rather than just inheriting `color` — so a plain `mat-checkbox { color: ... }` override in a dialog's component styles does *not* reach it (Angular's view encapsulation scopes it to the wrong element, since `.mdc-label` lives inside `mat-checkbox`'s own template). Needs `:host ::ng-deep .mdc-label { color: ...; }` to actually land. If a checkbox (or likely other MDC form controls) ever looks washed-out/invisible inside a light dialog again, this is why.
