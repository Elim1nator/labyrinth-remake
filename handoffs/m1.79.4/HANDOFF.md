# M1.79.4 handoff

Bug fix on `Grok-Code-16` from the M1.79.3 tip `6b12697be84cef24dae8449df0a2435695992f1f`. Jacob asked about the stretched, streaky texture in the M1.79.3 `m1793_wings_edge.png` screenshot (Basalt Heights, pressed against the outer pit ring with Wax Wings). No PR, no merge, no force-push. M1.79.3 and earlier builds are left intact. No PNGs were changed.

Main was rechecked before numbering: still M1.74.1 at `447992a`, and M1.75–M1.79.3 are not on main, so this is **M1.79.4**.

## Root cause

The stretched band was not a pit-shaft sampling error in the usual sense. It was the **wall raycaster**. When a ray leaves the map, the code drew a full-height stone wall (`TEX[1]`) at the out-of-bounds crossing, but it always sampled texture column `u = 0.5`. Every screen column therefore showed the same texel column, stretched into horizontal streaks.

On a normal floor the border is real walls, so this fallback is almost never seen. On Basalt Heights the border is pits (`t===11`), there is no roof (`openSky`), and the raycaster already walks through those pit cells, so every look toward the edge hits out-of-bounds and drew that fake wall. It sat between about y=81 and y=218 of the 300-pixel buffer (about y=215–580 in the 1280×800 screenshot), which matches the smeared band. The pit-shaft pass then correctly drew the near shaft walls over the lower part of it, which is why a real stone wall still appeared at the bottom of the shot.

The pit shaft had a related issue: when the far side of an edge pit is out of bounds, it treated that as a stone inner wall too. Combined with the smeared OOB wall, the view past the map edge could not fade into fog or dark sky.

## What changed

- On an open-sky floor, rays that leave the map no longer draw a wall. The open-sky fade and the pit shafts stay visible.
- Floor samples that land past the map edge on an open-sky floor are painted with the same fog/sky mix as the open ceiling, so a fake floor does not continue into the void.
- A pit shaft whose next cell is out of bounds now opens into dark fog (`P1`, depth-fogged), not a stone face. Interior Heights pits and regular falling pits (`t===6`) are unchanged: they still show textured inner shaft walls when the far cell is a real wall or floor.
- On other floors, the out-of-bounds fallback wall (if a ray ever leaves the map) now uses a real texture `u`, so it cannot smear a single column across the view.

Movement, collision, Wax Wings, and the solid edge ring are unchanged.

## Tests

New M1.79.4 checks (`V1794` / `ONLY=m179.4`):

- Facing the Heights edge ring draws no world-edge wall (`wallPx === 0`, open sky).
- The band above the horizon at that pose is a smooth fade, not a horizontally smeared wall (no long runs of uniform rows that jump sharply from the row above; the pre-fix screenshot scored a max row-to-row luma step of ~306, the fix scores 10).
- The edge view stays clean from 1 and 3 cells away, looking diagonally along the edge, and standing in a corner looking into the corner.
- A mid-floor Heights pit still uses the regular shaft renderer with textured inner walls.
- A full Heights floor on a phone-sized canvas (844×390, dsf 2) stays under the 8 ms/frame budget.

## Freeze

- Official freeze: `node tools/release.mjs m1.79.4` at **12:38 PM America/Vancouver (UTC-7)**.
- Release `builds/m1.79.4/index.html` 2418.7 KB (2,476,795 bytes), sha256 `892dfa99fb215a4ed7d4c59d979ece2af2e4c1156d88cffdd39f2fa31d55e17e`, git blob `c4f420664e0b8278712b202d5da7037e4a2d4c9c` (same as packed `src/index.html`).
- QA `builds/m1.79.4-qa/index.html` 2418.7 KB (2,476,791 bytes), sha256 `3311fad93ca32fa1771f37e8831cac5278f8a0d81a2724046c160972fbe0ac7f`, git blob `16c35ee94e3528f0d1493fae3f74cd5fc67ac1f8`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **767/767** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts. M1.79.3 was 762; this release adds the five checks above.
- Frame time on that official run, same phone-canvas method as M1.79.2: **2.24 ms/frame** (look-down 2.19). M1.79.2 was 2.45 / 2.32. No regression.
- M1.79.3 release/QA hashes were rechecked after this freeze and are unchanged (`202279b4` / `a5fe5e49`).

## Screenshots

Gitignored under `test-output/m1.79.4/screens/` (also copied to `/workspace/labyrinth-main/m179.4/`). Not pushed.

- Same edge pose as M1.79.3, before the fix: `m1794_edge_before.png` (copy of `m1793_wings_edge.png`)
- Same pose after the fix: `m1794_edge_after.png`
- Mid-floor pit before: `m1794_mid_pit_before.png` (copy of `m1793_wings_hover.png`)
- Mid-floor pit after (shaft walls still textured): `m1794_mid_pit_after.png`
- Extra angles: `m1794_edge_1cell.png`, `m1794_edge_3cell.png`, `m1794_edge_diag.png`, `m1794_edge_corner.png`

## PNGs

None. No asset sheets were edited for this milestone.

## Decisions

- Do not invent a new edge-rim wall or cliff. Heights is pits and open sky; looking past the map should fade into fog or dark sky.
- Leave `solidAt` and the solid edge ring alone. This is a render-only fix.
- Keep a properly UV-mapped out-of-bounds fallback wall on non-open-sky floors, so a rare escaped ray still does not smear.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Fri 27 Nov 2026, 12:28 PM
- **Official freeze:** 12:38 PM (`node tools/release.mjs m1.79.4`)
- **Official `npm test`:** 12:40 PM–12:48 PM (about 8 minutes, **767/767**)
- **Wall-clock, start to freeze:** about 10 minutes
- **Model turns (approx.):** about 12
- **Tool calls (approx.):** about 55 (screenshot diagnosis, shaft and wall-ray trace, the fix, regression tests, freeze, official suite, this handoff, the text/HTML push). Tokens: not available
