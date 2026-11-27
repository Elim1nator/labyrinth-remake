# M1.79 handoff

Next release on `Grok-Code-16`, on top of Mr Lead's M1.78 PNG upload (`f8066c8167ddcaef1c7e3c708e813e6c302f8427`). No PR, no merge, no force-push. Local checkout was synced to that tip first (origin only tracks `main` by default; `Grok-Code-16` was fetched explicitly). M1.78 and earlier builds are left intact. Grok-Code-14 and Grok-Code-15 were not touched.

Main was rechecked before numbering: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75–M1.78 are not on main, so this is **M1.79**.

## What changed

### Skittering Creep 4-frame sheet

Jacob sent a new 4-frame walk (`/workspace/labyrinth-main/creep/src-art/creep_v3.png`, 563×128 RGBA, already transparent; a dark purple-black bug with glowing white eyes). Same bytes as the attachment.

The previous Creep was a 5-frame walk in `assets/mobs/creep.png` (885×132, 177×132 per frame, k 1.5), with `animFrame` `((e.ph*14)|0)%5`. The walk is now **0-1-2-3** (`((e.ph*14)|0)%4`). Atlas is `{file:"mobs/creep.png", frames:4, k:1.5}`. Spawn and combat logic are unchanged. World height stays **0.30**.

Frame boundaries were not assumed to be 140 px: alpha-column runs are 142 / 138 / 135 / 143 px, with 1 / 1 / 3 px gaps. Each figure was extracted with all alpha>0 pixels (no leg cropping), placed 1:1 (nearest-neighbour identity) into equal 147×132 cells, feet on a shared baseline (foot y=129) and horizontally centred within 0.5 px of the cell mid (cx 73.50 / 73.50 / 73.00 / 73.00, mid 73.50), with at least 2 px of pad so nothing touches a frame edge or bleeds into a neighbour.

**Visibility:** the new art is very dark (body median luminance about 22–28) but it still reads. Against the Basalt Depths and Basalt Heights walkable floor (luminance about 46) the body is clearly darker, and the glowing white eyes and teeth carry it at any range. The body is close in value to Heights solid-pit holes and the open-sky fog, so a distant creep overlapping a pit would be harder to see, but the eyes still give it away. It is not nearly invisible. The art was not recoloured.

### The Awakened Basalt (rename + new art)

Jacob asked to update all the Awakened Deep art and rename it to **Awakened Basalt**.

Player-facing name is now `THE AWAKENED BASALT` (boss bar, level-clear card, intro banner `THE AWAKENED BASALT AWAKENS!` — 28 characters). Defeat banner: `THE BASALT IS DEFEATED! THE STAIRS APPEAR!` (42 characters). The internal type remains **`deep`**, the `DEEP` constants are unchanged, and the files stay `deep.png` / `deep_idle.png` / `deep_cast.png` / `deep_attack.png` (and `shot_deepfire.png`) to limit churn. Combat, phases, fireball and world height (`h` 1.08, k 1.6) are unchanged.

New art from `/workspace/labyrinth-main/deep/src-art-v2/` (already transparent RGBA) replaces the four existing boss sheets. The fireball was left as it is.

- Walk (`walk.png`, 428×204, 4 frames): alpha-column runs 103 / 101 / 102 / 102 px, gaps 6 / 7 / 7. Packed 1:1 as `assets/mobs/deep.png` (four 107×208 frames).
- Idle (`idle.png`, 128×197, front pose) → `deep_idle.png` (133×208).
- Cast (`cast.png`, 115×197, holding the fireball) → `deep_cast.png` (119×208).
- Attack (`attack.png`, 197×186, arms spread) → `deep_attack.png` (201×208).

Every pose and walk frame is feet-centred on the same baseline (foot y=205, shared cell height 208) and horizontally centred within 0.5 px of its cell mid, with a 2 px pad so nothing is cropped or bleeds (the source figures already touched their canvas edges). Packed nearest-neighbour identity only. On-screen size stays close because world height is unchanged and the visible fraction of the 208-px cell is similar to the old 122-px sheets.

## Freeze

A first creep-only freeze at 9:58 AM (2250.3 KB) was superseded once the Awakened Basalt rename and art were packed into the same version.

- Official re-freeze: `node tools/release.mjs m1.79` at **10:05 AM America/Dawson_Creek (UTC-7)**.
- Release `builds/m1.79/index.html` 2416.8 KB (2,474,837 bytes), sha256 `6e16a1dc7abfaa6592aaeb028ef04ecbcb4fc7bf4e38aca7e4b28fc943abaa00`, git blob `22f90897af4104f3c27d168c410c3dd5a207ae96` (same as packed `src/index.html`).
- QA `builds/m1.79-qa/index.html` 2416.8 KB (2,474,835 bytes), sha256 `997cf0bb2003a034c328b78094f2f479b20707b74a36b34f8517e7db86fc81b8`, git blob `a2210fb05a5afbaab8615201855ef772a2c71d3e`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **743/743** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts.
- M1.78 release/QA hashes were rechecked after this freeze and are unchanged (`b27e3b37` / `ceac0773`). M1.77 is also unchanged (`317e69ed` / `9a56938c`).

## Screenshots

Gitignored under `test-output/m1.79/screens/` (also copied to `/workspace/labyrinth-main/m179/`). Not pushed.

Creep:

- Packed frames on a checkerboard: `m179_frames_checker.png`
- Near / far in-game: `m179_near.png`, `m179_far.png`
- In-game animation strip, 2×2 at 640×400 panels: `m179_anim_strip.png`
- A creep coming out of a pit: `m179_from_pit.png`
- A creep on the Basalt Heights boss floor: `m179_heights.png`

Awakened Basalt:

- Contact sheet of all poses and walk frames: `m179_deep_frames_checker.png`
- Boss walk: `m179_deep_walk.png`
- Cast (holding the fireball, telegraph flash): `m179_deep_cast.png`
- Attack (arms spread, fireball leaving): `m179_deep_attack.png`
- Intro banner: `m179_deep_intro.png`
- Defeat banner: `m179_deep_defeat.png`

## PNGs (for Mr Lead — not pushed)

| path | git blob SHA | bytes | notes |
|---|---|---:|---|
| `assets/mobs/creep.png` | `25c30a86d4434dfeb5cf4eca8de705d0fc00d39f` | 80966 | New 4-frame walk from `creep_v3.png`, 588×132 (147×132 per frame), k 1.5. Replaces the M1.78 5-frame 885×132 sheet (blob `39e7ffb3b7db53b8013848040521e8cb613b7e9a`, 141057 B). |
| `assets/mobs/deep.png` | `383b48d9aeaf72c230efb4dc45932414797ecb39` | 121285 | New 4-frame walk from `walk.png`, 428×208 (107×208 per frame), k 1.6. Replaces the old 248×122 sheet (blob `c8deebaaeab7356a1d48226ad4838c4b2a83d549`, 58216 B). |
| `assets/mobs/deep_idle.png` | `8eb6600668d73d39d27cd4371402d78add38a613` | 36252 | Front/idle from `idle.png`, 133×208, k 1.6. Replaces the old 80×122 sheet (blob `c260e5544e447c511377f41770b5cd98ed172bda`, 18427 B). |
| `assets/mobs/deep_cast.png` | `21cbd45ed01fc2aaf16849515f24ca391a0c25b9` | 35589 | Cast / fireball hold from `cast.png`, 119×208, k 1.6. Replaces the old 72×122 sheet (blob `368cf59f1cfc474a5acf9f3165e253ea60e95070`, 16636 B). |
| `assets/mobs/deep_attack.png` | `56e6fd8cc6b319a8aba3f3dcc6ba061be0082fac` | 40618 | Arms-spread attack from `attack.png`, 201×208, k 1.6. Replaces the old 129×122 sheet (blob `4cc465cf3e88599318be85ede989eed29d457c5f`, 20767 B). |

## Decisions

- Keep the Creep's 0-1-2-3-4 math would have been wrong for a 4-frame sheet, so the cycle is now `%4`. Logic and world height stayed the same; pack 1:1 with pad rather than scaling.
- Detect Creep and Deep walk cuts from alpha columns, not a flat split.
- Keep the Deep internal type, file names and `DEEP` constants. Only the player-facing name and banners changed.
- Pack every Deep pose into a shared 208-px cell with one foot baseline so switching walk / idle / cast / attack does not jump. Different cell widths are kept (attack is genuinely wider).
- Defeat banner uses "THE BASALT" (42 characters exactly) rather than "THE AWAKENED BASALT IS DEFEATED!…", which would overflow the HUD.
- Do not recolour the dark creep: it still reads against the Basalt floor and Heights pit floor, mainly from the white eyes.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Dawson_Creek (UTC-7).

- **Start:** Fri 27 Nov 2026, 9:53 AM
- **First (creep-only) freeze:** 9:58 AM — superseded
- **Official re-freeze (Creep + Awakened Basalt):** 10:05 AM (`node tools/release.mjs m1.79`)
- **Official `npm test`:** 10:06 AM–10:14 AM (about 8 minutes)
- **Wall-clock, start to freeze:** about 12 minutes
- **Model turns (approx.):** about 10
- **Tool calls (approx.):** about 60 (sync, Creep pack, Deep pack and rename, tests, official suite, this handoff, the text/HTML push). Tokens: not available
