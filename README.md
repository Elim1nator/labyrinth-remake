# Kersplat Labyrinth: The Descent

by **Eliminator Productions**

An original first-person maze shooter for the browser, inspired by classic 90s raycasters.
Explore rooms and maze corridors, find keys, throw water balloons at silly monsters, collect
coins, beat a boss every 5th floor, and see how deep you can go in endless procedurally generated floors.

Everything in the game (code, pixel art, textures, sounds, music, levels) is original and generated
in code. The whole game is one self-contained HTML file with no external requests.

| | | |
|---|---|---|
| ![Slot machine in a maze](docs/img/slot-machine.png) | ![High score board](docs/img/high-scores.png) | ![Deep wall styles](docs/img/deep-wall-styles.png) |

## Run it

- Open `src/index.html` in a modern browser, **or**
- serve the folder statically, e.g. `npx serve src` or `python3 -m http.server -d src`.

The online high score board needs a same-origin API at `/api/labyrinth`
(contract: [docs/research/highscore-api.md](docs/research/highscore-api.md)). When it can't
be reached (opened from `file://`, offline, or no API on the host) the game falls back to a
local top-10 list in the browser, labelled LOCAL.

URL options: `?seed=<text>` plays a reproducible run; `?debug` exposes the test hook
(`window.__game`) in the release build.

## Repository layout

| Path | What |
|---|---|
| `src/index.html` | The current game (M1.19 release build). The single file *is* the source. |
| `builds/<milestone>/index.html` | Frozen builds M1 to M1.19, checksums in `builds/SHA256SUMS`. |
| `builds/m1.7-qa` … `builds/m1.19-qa` | **QA builds**: debug hook always on. For tests only; don't publish. |
| `tools/release.mjs` | Freezes `src/` into a release + QA build pair (see Release below). |
| `tests/` | Playwright test suite, local high score API stub. |
| `docs/` | Plan, changelog, controls and features, balance, research notes, API contract. |
| `concepts/` | Original concept art from the M0 milestone. |

## Test

Needs Node 18+.

```sh
cd tests
npm ci
npx playwright install chromium
npm test                     # full suite against builds/m1.19 (+ builds/m1.19-qa)
node m1.test.mjs m1.8        # any older milestone: m1, m1.1 ... m1.19
```

Results and screenshots go to `test-output/<build>/` (gitignored). From M1.7 on, the
hook-based tests run on the `-qa` build and the release build is checked alongside it.
High score tests use the local stub `tests/hs_stub.mjs` (loopback only), never a live board.
To preview with the stub API: `cd tests && npm run stub`, then open `localhost:8787` in a browser.

Expected results: m1 54, m1.1 83, m1.2 106, m1.3 158, m1.4 195, m1.5 217, m1.6 238,
m1.7 256, m1.8 325, m1.9 388, m1.9.1 390, m1.10 412, m1.10.1 413, m1.10.2 416, m1.11 431, m1.11.1 431, m1.12 447, m1.12.1 447, m1.12.2 447, m1.13 453, m1.13.1 453, m1.14 458, m1.14.1 460, m1.14.2 461, m1.15 462, m1.16 465, m1.17 472, m1.17.1 472, m1.18 476, m1.19 477 checks, all passing.

## Release

```sh
node tools/release.mjs dev --test          # test the current src/ as a throwaway build in .work/builds/
node tools/release.mjs dev m1.10 --test    # ...under the version it will get
node tools/release.mjs m1.10               # freeze builds/m1.10 + builds/m1.10-qa, update src/, SHA256SUMS, tests/package.json
```

Then write `builds/<version>/README.md` (and the QA one) and the changelog entry by hand.

## Credits

Game design, code and art: Eliminator Productions.
Map generation follows Bob Nystrom's "Rooms and Mazes" algorithm (2014), implemented from
the article's description.

Copyright (c) 2026 Eliminator Productions. All rights reserved. See [LICENSE](LICENSE).
