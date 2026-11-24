# Team workflow

How releases move between the bots that build, illustrate, test and publish Kersplat Labyrinth.

## Roles

| Role | Does |
|---|---|
| Owner | Asks for features and approves releases. |
| Lead | Coordinates, pushes binaries, and brings PRs to the owner. |
| Code bot | Writes code and docs, freezes builds, and opens PRs from the `Grok-Code` branch. |
| Game Art Director | Makes all new visuals (sprites, textures, icons, UI art). |
| Playtest | Reviews frozen releases (paused until the owner resumes it). |
| Web | Publishes major releases to the live site. |

## Branches and PRs

- All code bot changes go on `Grok-Code`, with a PR into `main` that has a clear title and description. The code bot never merges its own PR.
- Never force-push, rewrite history, or delete another contributor's unmerged branch.
- Commits are text only. Binaries (PNG, JPG) go through the Lead for the push.
- Never commit secrets, server paths, IP addresses, private hosts or credentials, or anyone's real name. Credit is Eliminator Productions only.

## Handoff files

Each release has a folder `handoffs/<release>/` (for example `handoffs/m1.25/`):

- `BRIEF.md`: what the owner asked for.
- `HANDOFF.md`: what changed, the release build's sha256, the test count and known issues.
- `REVIEW.md`: Playtest's verdict.

Bots pass these file paths to each other instead of long messages.

## Visuals

The code bot does not draw new art. For each asset it sends Game Art Director a short request covering what's needed, its size, palette and style, and its target path in `assets/`. The finished files come back and are embedded with `node tools/assets.mjs pack`. See `assets/README.md`.

## Building and testing

1. Edit `src/index.html` and/or `assets/`.
2. `node tools/release.mjs dev --test` builds a dev build and runs the suite.
3. `node tools/release.mjs m1.x` freezes `builds/m1.x` plus `builds/m1.x-qa` and updates `builds/SHA256SUMS`.
4. `cd tests && npm test` runs the Playwright suite. High-score tests use the local stub (`tests/hs_stub.mjs`) and never post to the live board.

## Review loop (when Playtest is active)

1. After freezing, the code bot sends Playtest the `HANDOFF.md` path.
2. Playtest returns PASS, or FAIL with one blocking defect.
3. On FAIL, the code bot fixes only that defect and re-freezes.
4. A second FAIL goes to the Lead to take to the owner.

## Going live

A major release is a numbered milestone frozen with `tools/release.mjs` (m1.25, m1.26, ...), not a dev build or a hotfix. Once it is frozen and passes its tests (and Playtest PASS, while testing is active), the code bot sends Web the release file path and its sha256, copying the Lead. Web publishes it to the live play page, and the Lead tells the owner it is live.
