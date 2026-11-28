# M1.79.7 handoff

Art swap on `Grok-Code-16` from the M1.79.6 tip `8b78058f823b1e98aca14c6b851dd02838ac2b53`. Jacob asked to replace the knight in the code with his new idle, attack and walk animations, then added a guard (shield-up) frame. No PR merge, no force-push. Local checkout was synced to that tip first. M1.79.6 and earlier builds are left intact. PNGs are not pushed; they are listed below for Mr Lead.

Main was rechecked before numbering: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75–M1.79.6 are not on main, so this is **M1.79.7**.

## Entity chosen

The entity changed is the **Treasure Knight** (`type:'knight'`, `MOBS.knight`, `assets/mobs/knight.png`). He is the gold-armoured knight with a plumed helm, kite shield and broad sword — a mini-boss on every floor from 2. The King (Screamer King) and other bosses were left alone. There is no separate "knight guard" mob; the new guard pose is wired to this knight's existing shield-up state (`e.shieldT>0`: damage-immune, cannot move).

## What changed

Jacob's sheets (already transparent RGBA), kept at native size (no resize), source copies in `/workspace/labyrinth-main/knight/src-art/`:

- Idle: `knight_idle.png` (136×64). Two figures with a 19 px gap. A slow breathing / stance shift, sword and red-cross shield visible.
- Walk: `knight_walk.png` (272×139). Eight frames in two rows of four, a 10 px gap between rows. Ordered row-major; they form a two-step walk cycle.
- Attack: `knight_attack.png` (343×70). Five figures, gap-sliced: sword raised, wind-up, swing with motion blur, ground slam with debris, recovery.
- Guard: `knight_guard.png` (53×64). A single frame, crouched behind the red-cross shield.

Figures were cut from alpha-column runs (and the walk sheet's two row bands). Where needed, under-50% alpha fringe was dropped (0 / 20 / 37 / 4 pixels on idle / attack / walk / guard). Opaque gold, the red plume and the red cross were not touched. There are no green-dominant pixels.

Each figure was placed 1:1 (nearest-neighbour identity) into equal **86×77** cells (1376×77 sheet), feet on a shared baseline (foot y=65) and horizontally feet-centred within 0.5 px of the cell mid (43.00). At least 2 px of pad so nothing touches a frame edge. The slam frame's debris extends 9 px below the boots (to y=74) and is allowed to sit below the baseline. Atlas is `{file:"mobs/knight.png", frames:16, k:1.5}`.

Frame map:

- **0-1** idle, slow 2-frame loop (`((e.ph*1.25)|0)%2`, about 0.8 s per pose).
- **2-9** walk, 8-frame loop at a cadence matched to his 1.15 speed (`2+(((e.ph*10)|0)%8)`). A charge uses the same walk at a faster cadence (`*20`).
- **10-14** attack, timed to the existing 1.2 s ground-slam tell (`KNIGHT.slamTele`): 0.40 s sword raised (10), 0.50 s wind-up (11), 0.30 s swing (12). The shockwave still fires when `slamT` hits 0, now on the slam pose (13), then 0.28 s of slam and 0.22 s of recovery (`KNIGHT.slamRec=0.5`). The charge telegraph (`e.tele>0`) uses sword-raised (10).
- **15** guard, used while `e.shieldT>0` (the existing shield-up / block state).

World height stays **0.965**. A draw offset `foot:11/77` lowers the sprite so the shared baseline sits on the floor; slam debris can draw slightly below his feet, and the other poses do not float.

## Tests

New M1.79.7 checks (`V1797` / `ONLY=m179.7`):

- The sheet is 16 equal 86×77 frames with unique art, atlas `mobs/knight.png`, 16 frames, k 1.5. World height stays 0.965.
- Non-slam frames share foot baseline 65 and are feet-centred within 1 px; the slam frame has pixels on that baseline and debris below it. No frame touches a cell edge.
- Idle is 0-1; walk is 2-9; attack is 10-14 on the slam timers; shield-up uses frame 15; the charge telegraph uses frame 10. No green-dominant pixels.
- In-game: idle (frame 0), mid-walk (frame 6), the slam pose as the dust ring is released (frame 13), and guard (frame 15).

The M1.11 shield-up check now expects frame 15 on this build (was 2). The M1.14.2/M1.19 slam tell looks for the sword-raised frame 10 (was 4). The M1.19.2 "legs in the bottom 8 px of all 5 frames" check is retired from this build, because cells have pad and slam debris below the baseline; the new alignment checks cover it. On older builds those checks still run as before.

The M1.79.1 green-spill scan still passes. Only `bonePile` is still whitelisted.

- Official freeze: `node tools/release.mjs m1.79.7`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **796/796** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts.
- M1.79.6 release/QA hashes were rechecked after this freeze and are unchanged (`812e5802` / `e3bda002`).

## Freeze

- Official freeze: `node tools/release.mjs m1.79.7` at **10:55 PM America/Vancouver (UTC-7)**.
- Release `builds/m1.79.7/index.html` 2565.6 KB (2,627,156 bytes), sha256 `c3baf161bb0c56b0b8b29ecab1fbb64a44f45633331fb04bb5b1e03385b39144`, git blob `e10dd0dfc8201b8edd9b41374ab018fb9d010050` (same as packed `src/index.html`).
- QA `builds/m1.79.7-qa/index.html` 2565.6 KB (2,627,152 bytes), sha256 `e316cf33eeb476c186a739169a82de61216e3f2d4b5b0b9d9ae72f47c46f4e0d`, git blob `7e944be2ed14715514ba1251cabd51d326125117`.

## Screenshots

Gitignored under `test-output/m1.79.7/screens/` (also copied to `/workspace/labyrinth-main/m179.7/`). Not pushed.

- Packed 16 frames on a checkerboard with the shared baseline drawn: `m1797_frames_checker.png`
- Idle in-game (seed 777, floor 3, Timber Attic, frame 0): `m1797_knight_idle.png`
- Mid-walk (frame 6): `m1797_knight_walk.png`
- Ground-slam (frame 13) as the dust ring is released: `m1797_knight_slam.png`
- Guard / shield-up (frame 15): `m1797_knight_guard.png`

## PNGs (for Mr Lead — not pushed)

| path | git blob SHA | bytes | sha256 | local path | notes |
|---|---|---:|---|---|---|
| `assets/mobs/knight.png` | `d5960c0825dfcd4273336538acdb059230682c94` | 81736 | `4487e4911b48e90538ace9d1b4c3e245011a51e3dba5db619c284f9917950c81` | `/workspace/labyrinth-remake/assets/mobs/knight.png` | New 16-frame idle+walk+attack+guard from Jacob's four sheets, 1376×77 (86×77 per frame), k 1.5. Replaces the old 240×90 5-frame sheet (blob `1a20d8202a0433322dcb313b0f5ef0a6cadff811`, 3739 B, sha256 `22726b4498b4366d808831839c9f3f8a330538ce00aa8bced80c33b45ce8a9d0`). |

Source art copies (not in the repo): `/workspace/labyrinth-main/knight/src-art/knight_idle.png`, `knight_walk.png`, `knight_attack.png`, `knight_guard.png`.

## Decisions

- Pack all four sheets into one 16-frame horizontal strip (the atlas splitter requires equal-width frames in a row), with a shared cell and baseline, rather than separate atlas entries.
- Keep native pixel size. Pad to equal cells and centre on the feet rather than scaling down to the old 90 px cell height.
- Keep world height 0.965 and atlas `k` 1.5. Offset the draw by 11/77 of the cell so the baseline sits on the floor and slam debris can go below the feet.
- Detect cuts from alpha-column runs. Walk frames are row-major.
- Time the 5-frame attack to the existing 1.2 s slam tell; fire the shockwave at the same moment as before, now on the slam frame, then play recovery. Do not invent a new shield mechanic: the guard frame is the existing `shieldT` block pose.
- During a charge (running) use a faster walk; the charge telegraph uses sword-raised.
- Drop only under-50% alpha fringe. Do not touch gold, the red plume or the red cross.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Fri 27 Nov 2026, 10:38 PM
- **Official freeze:** 10:55 PM (`node tools/release.mjs m1.79.7`)
- **Official `npm test`:** 10:55 PM–11:03 PM **796/796**
- **Wall-clock, start to freeze:** about 17 minutes
- **Model turns (approx.):** about 30
- **Tool calls (approx.):** about 90 (sync, pack, tests, official suite, this handoff, the text/HTML push). Tokens: not available
