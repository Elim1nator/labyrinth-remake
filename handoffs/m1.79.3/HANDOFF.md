# M1.79.3 handoff

Small feature on `Grok-Code-16` from the M1.79.2 tip `9ef6a99f97204bf41b0199ec52a65ff9a3cea738`. Jacob asked what happens with Wax Wings on Basalt Heights: previously nothing, because Heights pits and fireball holes are `t===11`, which `solidAt` treats as solid. No PR, no merge, no force-push. M1.79.2 and earlier builds are left intact. No PNGs were changed.

Main was rechecked before numbering: still M1.74.1 at `447992a`, and M1.75–M1.79.2 are not on main, so this is **M1.79.3**.

## What changed

Wax Wings (`effectIs('wings')`) and the same levitation that already floats over regular pits (`stOn('lev')`) now let the player cross **interior** Basalt Heights pits (`t===11`) and fireball holes.

`solidAt` itself is unchanged: `t===11` is still solid for walking mobs, items, loot, the generic collision path, and a player without wings. The player only uses a new `solidWings` path (`moveBody` mode `'w'`) while wings or lev are active, which treats an interior `t===11` cell like a regular pit (`t===6`).

### Expiry behaviour (same as regular pits)

If wings or levitation expire or are lost while the player is over an interior Heights pit, the game calls **`startFall()`**, the same function used when they run out over a regular falling pit. `pitUnder` is still `t===6` only (M1.79.2 tests stay valid). A sibling check, `heightPitUnder`, uses the same margin and trips the existing fall line. You do **not** get shoved to the nearest walkable cell. Without wings you still cannot walk onto a Heights pit in the first place (it stays solid), so a fall from `t===11` only happens if you were already hovering when the effect ended.

### Border

Any `t===11` cell on the map edge (`x==0`, `y==0`, `x==w-1`, `y==h-1`) stays solid for everyone, including a winged player. Out-of-bounds stays solid (`cellAt` returns null → `solidAt` is true). The player cannot leave the map.

### Everyone else

Walking mobs, creeps and the Awakened Basalt still treat Heights pits as solid (`solidGround` / default `solidAt`). Flying mobs that already crossed regular pits (`M.fly`, previously `solidAt`) now use `solidWings`, so they also cross interior Heights pits. Ghosts (Hazewisp) already drifted over `t===6`; they now do the same for interior `t===11`, but not the border ring.

### Shots, use ray, conversion

`shotSolid` no longer treats interior `t===11` as solid, so balloons (and other shots) fly over those cells the same way they already fly over regular pits. The map-edge ring still blocks shots. `findUse` no longer stops the use-ray on `t===11` (regular pits never did).

The connectivity guard and 14-hole cap are unchanged. Converting the tile under a hovering player is still refused (the guard is about the walking path). Minimap and pit rendering are unchanged.

## Tests

New M1.79.3 checks (`V1793` / `ONLY=m179.3`):

- Wings let you walk across an interior `t===11` cell; without wings it still blocks and `pitUnder` stays false.
- Wings let you cross a fireball hole; converting the tile under a hovering player is still refused.
- The map-edge ring stays solid with wings, and the player never leaves the map.
- Losing wings over an interior Heights pit starts a fall (`mode==='fall'`), the same as a regular pit.
- Levitation also floats over interior Heights pits and starts a fall when it expires.
- Creeps and the Awakened Basalt still treat Heights pits as solid.
- Balloons fly over interior Heights pits.

## Freeze

- Official freeze: `node tools/release.mjs m1.79.3` at **12:14 PM America/Vancouver (UTC-7)**.
- Release `builds/m1.79.3/index.html` 2418.3 KB (2,476,334 bytes), sha256 `202279b4c72cdd00029dcf5bb7ca51baac4c9d96d3d70ef14fe2e4d981759fad`, git blob `db1ca6c92fdc3835f3a491fc705c0d2fbac562d2` (same as packed `src/index.html`).
- QA `builds/m1.79.3-qa/index.html` 2418.3 KB (2,476,330 bytes), sha256 `a5fe5e4908953c41296eb89bd77d401113e506b87a74220c7130675b39d14883`, git blob `06b9766d3414433a291b600b5b8d73cd38d33251`.
- Official `cd tests && BUILDS_DIR=/workspace/labyrinth-remake/builds npm test` on the frozen QA build: **762/762** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts. M1.79.2 was 755; this release adds the seven checks above.
- M1.79.2 release/QA hashes were rechecked after this freeze and are unchanged (`67831475` / `67f1ed1f`).

## Screenshots

Gitignored under `test-output/m1.79.3/screens/` (also copied to `/workspace/labyrinth-main/m179.3/`). Not pushed.

- Hovering over a Heights pit with Wax Wings, looking down the shaft: `m1793_wings_hover.png`
- At the map-edge ring with wings (the rim stays solid): `m1793_wings_edge.png`

## PNGs

None. No asset sheets were edited for this milestone.

## Decisions

- Do not change `solidAt` or `pitUnder`. Without wings, Heights pits must still *block* (you cannot walk in and fall). Only the winged/lev player path, flying mobs that already crossed `t===6`, ghosts, and `shotSolid` open interior `t===11`.
- Expiry uses `startFall()`, not a shove to the nearest floor, because that is what regular pits already do.
- Leave the connectivity guard as it is (it is about the non-flying path). The player's current tile still cannot be converted.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Fri 27 Nov 2026, 12:03 PM
- **Official freeze:** 12:14 PM (`node tools/release.mjs m1.79.3`)
- **Official `npm test`:** 12:14 PM–12:22 PM (about 8 minutes, **762/762**)
- **Wall-clock, start to freeze:** about 11 minutes
- **Model turns (approx.):** about 10
- **Tool calls (approx.):** about 45 (sync, trace of wings/pits, implementation, tests, freeze, official suite, this handoff, the text/HTML push). Tokens: not available
