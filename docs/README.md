# Docs structure

- **`apps/`** — one file per user-facing, access-gated app (`soundboard`, `wheel`, `liedjes`, `poop-app` — named after their `AppKey`, see [platform/app-access.md](platform/app-access.md)). This is where the docs grow as new apps get added — when adding a new gated app, add its doc here and link it from the root `CLAUDE.md`'s routing table.
- **`platform/`** — cross-cutting systems every app sits on (routing, auth, dialogs, push notifications, the access-control system itself). Changes here are rarer and affect multiple apps at once.

If a `platform/` doc grows too large for one topic, split it into its own file rather than letting it sprawl — the same instinct that created this folder split in the first place.
