---
name: deploy
description: Deploy the Franciscus frontend (frans-app) to production on GitHub Pages. Use whenever the user asks to deploy, publish, ship, release, or "live zetten" this frontend/app, or explicitly types /deploy in this repo. Runs build and lint first, then requires explicit confirmation before the actual publish step, since the live site gets overwritten immediately.
---

# Deploy Franciscus frontend

## Context

A plain `git push origin master` is safe here — it does **not** go live. The only thing that publishes to the real site (`https://mennoknaap.github.io/Franciscus/`) is `pnpm run deploy`, which runs `ng deploy --base-href=/Franciscus/`: builds the app and force-pushes `dist/` to the `gh-pages` branch. Treat that command as the actual production action — never run it without the user confirming in the current conversation, even if `master` has already been pushed.

## Steps

1. If there are uncommitted or unpushed changes on `master`, commit and push them first (ask the user if it's unclear whether they want that included).
2. Run `pnpm run build` — catches compile errors before anything goes live.
3. Run `pnpm run lint` — fix any errors before continuing; don't deploy with a broken lint gate.
4. Confirm explicitly with the user that they want to publish now, unless they've already given clear, specific go-ahead for this exact change earlier in the conversation.
5. Run `pnpm run deploy`.
6. Report the result — success ends with "Successfully published via angular-cli-ghpages".

## If something looks off after deploying

Check this repo's `CLAUDE.md` for the environment/CORS architecture — e.g. if the live site can't reach the API, check `environment.prod.ts`'s `apiUrl` and confirm the Franciscus-API CORS allow-list still includes `https://mennoknaap.github.io`.
