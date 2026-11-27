Follow-up: **M1.75.2** (same branch) retouches the moss wall tile so it wraps seamlessly left to right. This M1.75.1 freeze is left intact.

# M1.75.1 handoff

Two Jacob corrections on the same M1.75.1 freeze, cut from remote `Grok-Code-16` at `9dbd070` (Mr Lead's five Sovereign PNG commits on top of the M1.75 text/HTML). Branch `Grok-Code-16`. No PR, no merge, no force-push. Grok-Code-14 and Grok-Code-15 were left alone. The M1.75 freeze (`builds/m1.75*` and its hashes) is left intact.

Main was rechecked before numbering and again after the official suite: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75 is not on main, so this is **M1.75.1**.

## 1. Small piles use the regular Rattlebone pile

The Sovereign's scattered small piles now draw with the regular Rattlebone `bonePile` sprite and scale (`h:.2`, including the tell/glow frame `SPR.bonePile[tl?1:0]`). Smash and 4.5 s rebuild behaviour is unchanged. The Sovereign's own big collapse pile is unchanged.

`sovpile` was removed from `assets/atlas.json`, `MOB_SHEETS`, `SPR`, the pile draw path and the boss gallery. `assets/mobs/sovpile.png` is left on disk in the repo, unused, not packed, not deleted.

## 2. Wall textures — root cause

Jacob's Level 10 Basalt Depths screenshot (`/workspace/labyrinth-main/sovereign/wall_tiling_bug.png`) shows the vine-covered moss (`M`) wall looking stretched, with huge blocky pixels on the close left face and along the long wall.

This is **not** a texture-coordinate wrap bug, a wrong tile size, or a column/offset error for moss (or any other style):

- All 23 packed wall tiles (the 20 wall styles plus door, locked and fence) are **128×128**. Packed `assets/walls.png` is 1280×384 (10×3), unchanged since M1.74.
- `renderWorld` already computes `u` as the fractional position inside the hit cell (`u = wx - Math.floor(wx)`, flipped by side/ray), and `drawSlice` samples `tx = (u * TS) | 0` with `TS=128`. A DDA of every column on the seed-1 floor-10 moss run (y=22, x=6–11) shows each fully visible cell covers nearly the full U range (spans 0.99 / 0.997, tx 0–127). If U were stretched across the whole face, each cell would show only a thin slice (span ≪ 0.45).
- The same per-cell full-range U holds for a painted 8-cell straight wall of **every** one of the 20 wall styles.

What Jacob is seeing is the **moss art** itself: the 128×128 moss tile is a 3-panel vine-covered stone mural, so one cell already contains three large painted blocks. Up close, and especially on a glancing left face (nearest-neighbour, internal 480×300 upscaled), those panels look like a texture stretched over several world cells. Standing ~2.5 cells back, the 3-panel motif clearly repeats once per cell (about two full copies plus partials in a 66° FOV). "Normal" walls on the same floors (basalt, rust, slate) have many smaller bricks or plates per cell, so they do not give that illusion. No renderer U change was made: altering repeat rate would shrink brick/slate/rust as well.

A regression test now fails on the stretched case (a fully visible cell whose U span is under 0.45, or that does not cover tx 0–127) and passes when each fully visible cell maps a full 0–1 copy of its 128×128 tile. It checks all 20 wall styles plus Jacob's natural Basalt moss wall.

`api.setCell` was added as a test hook so the suite can paint a straight run of each style.

## Freeze

- Official freeze: `node tools/release.mjs m1.75.1` at **9:03 PM America/Vancouver**, only after both the pile-art change and the wall-tiling test were in. (An earlier premature pack of pile-art alone was discarded after a workspace rollback; this freeze replaces it.)
- Release `builds/m1.75.1/index.html` 1984.7 KB (2,032,368 bytes), sha256 `104f9739ad27046ccfb4438982b126510c2952d5806d5fbdef0bc7c773c4d69b`, git blob `8d1a9501001b424ce2455a9e880d2e86e3fe1eb0` (same as packed `src/index.html`).
- QA `builds/m1.75.1-qa/index.html` 1984.7 KB (2,032,364 bytes), sha256 `7883ab71e0e59e53e64b78d34520ddf6cf4f407cfd824226a09a77d2cedc864a`, git blob `59206979682062eefd45958b0b7abf9cae0263a4`.
- Official `cd tests && npm test` on the frozen QA build: **695/695** passed (30 retired pre-M1.23 / pre-M1.31 checks). All M1.75 Sovereign checks, the new M1.75.1 pile-art check, and all three wall-tiling checks passed. The existing M1.3 Zapfly random-path flake did not show. Fetch is mocked; the suite made no live score-board posts.
- M1.75 release/QA hashes were rechecked after this freeze and are unchanged (`85a18a3d…` / `e1ce5201…`).

## Screenshots

Gitignored under `test-output/m1.75.1/screens/` (and copies under `/tmp/wall-diag/`). Not pushed.

Fresh official Sovereign shots (small piles now use `bonePile`):

- `test-output/m1.75.1/screens/m175_walking.png`
- `test-output/m1.75.1/screens/m175_shooting_skull.png`
- `test-output/m1.75.1/screens/m175_collapsed_piles.png`
- `test-output/m1.75.1/screens/m175_rattlebone_rebuild.png`
- `test-output/m1.75.1/screens/m175_reformed.png`

Wall before (frozen M1.75 QA, same renderer) and after (frozen M1.75.1 QA), same cameras. They match, as expected — U already tiled once per cell:

- Basalt Depths moss, face-on / along (Jacob's glance) / farther back: `wall_before_basalt_moss_{faceon,along,far}.png` and `wall_after_basalt_moss_{faceon,along,far}.png`
- Rust Works long rust wall, face-on: `wall_before_rust_works_faceon.png` / `wall_after_rust_works_faceon.png`
- Slate Halls long slate wall, face-on: `wall_before_slate_halls_faceon.png` / `wall_after_slate_halls_faceon.png`

## PNGs

No PNG in the repo was added, modified, or deleted. `sovpile.png` remains at blob `9e5eb0a13422bd9b3dcb39091d9868a327f5c7fe` (3936 B, 42×47), untracked by the atlas. Wall art was not changed.

## Decisions

- Do not change wall U or retile moss (or any other) art: the 20 styles already repeat once per cell, the same way brick/slate/rust do. The moss mural's large 3-panel features are why the close-up looks stretched.
- Leave `sovpile.png` in the repo, unused.
- One freeze for both corrections, as M1.75.1, so earlier M1.75 builds stay intact.
- Test hook `api.setCell` is for the tiling suite only; it floors coordinates and clears crack/dent when a tex is set.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

This correction session started at **8:41 PM**. At **8:46 PM** the wall-tiling report was added to the same freeze. A workspace rollback around then dropped an in-progress pile-art tree (and a premature pile-art-only `m1.75.1` pack) back to a dirty M1.75 / `447992a` worktree; local was re-synced to remote `9dbd070` without popping stashes, both fixes were re-applied, and the official freeze ran only after both were in. An official-suite spawn from that premature pack had also been interrupted and is not this freeze's result.

- **Correction start:** Thu 26 Nov 2026, 8:41 PM
- **Wall-tiling added to the brief:** 8:46 PM
- **Official freeze:** 9:03 PM (`node tools/release.mjs m1.75.1`)
- **Official `npm test`:** about 9:04–9:12 PM (about 8 minutes)
- **Wall-clock, start to freeze:** about 22 minutes (including the rollback and re-sync)
- **Model turns (approx.):** about 35 for this correction, including mid-session context compaction
- **Tool calls (approx.):** about 90 (DDA diagnosis, re-sync, pile-art + tests, pack, official suite, this handoff). Tokens: not available
