# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Keep this file short and general — feature/topic detail lives in `docs/`, linked below. When a task touches one of these areas, open the relevant doc rather than relying on memory of it.

## Project overview

This is **frans-app**, the Angular (v21, zoneless) frontend for a committee/community app ("Franciscus"). It's one of two repos for this project — the other is a separate .NET backend API (`FransApi`, hosted at `franciscus-api.stanenmennocomite.nl`) that this repo has no direct access to. When backend behavior needs to change, that's out of scope here; this repo only consumes the API via the generated client described in `docs/architecture.md`.

Features live under `src/app/modules/`: `login`, `home`, `soundboard`, `wheel-of-fortune`, `admin`, `liedjes`, `poop-app`.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml` is present — use `pnpm install`, not npm/yarn).

- `ng serve` / `npm start` — dev server at `http://localhost:4200/`, using `environment.ts` (points at `https://localhost:7225`, i.e. a locally running FransApi backend).
- `ng build` — production build (uses `environment.prod.ts`, service worker enabled).
- `ng test` — Karma/Jasmine unit tests. Run a single spec by passing a filter through Karma, e.g. `ng test --include='**/auth-service.spec.ts'`.
- `ng lint` — ESLint (`eslint.config.js`, flat config, `angular-eslint` + `@stylistic`).
- `npm run deploy` (`ng deploy --base-href=/Franciscus/`) — builds and force-pushes `dist/` to the `gh-pages` branch via `angular-cli-ghpages`, which is what GitHub Pages actually serves. **Never run this yourself unless the user explicitly asks you to deploy** — treat it the same as a push to a live environment.

There is no CI workflow in this repo (`.github/workflows` doesn't exist) — going live is always this manual `deploy` step, not an automatic side effect of pushing to `master`.

## Where to find things

Docs are split into `docs/apps/` (one file per user-facing, access-gated app — grows as new apps are added) and `docs/platform/` (shared plumbing every app sits on). See [docs/README.md](docs/README.md) for the rule on where a new doc belongs.

| Topic | Doc | Read it when touching... |
|---|---|---|
| Routing, module pattern, API client, environments, PWA | [docs/platform/architecture.md](docs/platform/architecture.md) | core plumbing, a new feature module, `environment.ts`, NSwag regeneration |
| Auth | [docs/platform/auth.md](docs/platform/auth.md) | login flow, guards, the auth interceptor/token refresh |
| Confirm/prompt dialogs | [docs/platform/dialogs.md](docs/platform/dialogs.md) | any confirmation or single-input prompt UI |
| Per-app access control | [docs/platform/app-access.md](docs/platform/app-access.md) | home tile gating, admin "App-toegang", adding a new gated app |
| Push notifications | [docs/platform/push-notifications.md](docs/platform/push-notifications.md) | `PushNotificationService`, the home banner, anything push-related "not working" |
| Poeplog | [docs/apps/poop-app.md](docs/apps/poop-app.md) | the chat log, stickers, auto-scroll, date separators |
| Liedjes | [docs/apps/liedjes.md](docs/apps/liedjes.md) | child facts/photos |
| Soundboard | [docs/apps/soundboard.md](docs/apps/soundboard.md) | sound upload/list/delete |
| Rad (wheel-of-fortune) | [docs/apps/wheel.md](docs/apps/wheel.md) | the wheel's local-storage data, access gating |
| Biertje? | [docs/apps/biertje.md](docs/apps/biertje.md) | the rigged spin wheel, its landing-angle math |
| Kud | [docs/apps/kud.md](docs/apps/kud.md) | the word generator, its scramble animation, the word list |
| Puntentelling | [docs/apps/puntentelling.md](docs/apps/puntentelling.md) | the scoreboard, polling, sessions/"potjes", the backend `ScoreboardController` |

## Code style notes (beyond what ESLint enforces automatically)

- Indent is 4 spaces for `.ts` (the repo's `.editorconfig` default of 2 is overridden by ESLint's `@stylistic/js/indent` rule — ESLint wins).
- Private class members must be `_camelCase` (leading underscore required); private methods must **not** have a leading underscore.
- Explicit return types are required on all functions/methods (`allowExpressions: true` for arrow functions assigned inline).
- `curly: multi-or-nest` — single-statement `if`/`for` bodies should omit braces, consistently within a block.
