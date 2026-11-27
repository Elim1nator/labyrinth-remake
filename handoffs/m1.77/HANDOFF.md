# M1.77 handoff

Next release on `Grok-Code-16`, on top of Mr Lead's M1.76 PNG upload (`58464fb930884aceec57028a6c3a8bfadedb4e22`). No PR, no merge, no force-push. Local checkout was synced to that tip first. M1.76 and earlier builds are left intact. Grok-Code-14 and Grok-Code-15 were not touched.

Main was rechecked before numbering and again after the official suite: still M1.74.1 at `447992a28d6a94db9257d17ff70e7ef039a45cc1`, and M1.75 / M1.76 are not on main, so this is **M1.77**.

## What was replaced

The Awakened Deep replaces the rotating `BOSS_ORDER` boss **on Basalt boss floors only**. `bossFor()` is unchanged (floor 10 still returns `sovereign`). The swap happens in `applyDeepBossFloor()` at the end of `loadLevel`, after the reserved-floor King in Yellow / Broodmother / Grand Masque overrides.

- On the usual floor 10 (always Basalt) the slot that would have been the **Rattle Sovereign** is now the Awakened Deep, and the floor is renamed **BASALT HEIGHTS**.
- A later Basalt roll of the King or Coghoot slot is also replaced (for example seed 6, floor 25).
- The Sovereign stays in `BOSS_ORDER` and still appears on non-Basalt rotation floors (seed 1, floor 25, THE EMBER CORE).
- The Grand Masque, the Broodmother and the King in Yellow are left alone, even if that floor happens to be Basalt.

## Floor: Basalt Heights

The floor uses the Basalt floor texture. Every wall cell (`t===1`) and existing falling-pit cell (`t===6`) becomes a **solid dark pit** (`t===11`): no wall faces, doors or fences. Pits block movement like walls (`solidAt` / pathfinding include `t===11`) and you cannot fall in (`pitUnder` / `startFall` stay `t===6` only). Door and fence cells become open floor so rooms stay connected; leftover `L.doors` / `L.fences` entries are filtered out so the arena-lock hook cannot slam a missing door. Pits are drawn as dark holes in the floor with an edge rim. There is **no ceiling**: `L.openSky` fades the top of the view into the fog. `basaltFloor()` matches `/Basalt (Depths|Heights)/i`, so the Obsidian Column and ordinary Basalt Depths (floors 9, 11, 12) are unchanged.

## Skittering Creeps

Creeps still climb out of the pit cells, reusing the M1.76 creep (`pitSpawnCell` accepts `t===6` or `t===11`). On the Deep floor the cadence is tighter, in `DEEP`: **8–12 s**, cap **2**, +1 while the Deep is furious. Other Basalt floors keep the M1.76 cadence (14–22 s, cap 1, +1 from floor 12).

## The Awakened Deep

Map letter `!`, type `deep`, original name. It walks, stops to **cast** (0.55 s telegraph, `deep_cast` pose), and hurls a **fireball** (`deepfire`, `deep_attack` pose on the throw). The fireball explodes on impact, at the end of its range, or on player contact: **1 heart** in a **1.15**-cell blast, and hit floor tiles (`t===0`) become solid pits (`t===11`). A tile is skipped if converting it would cut the path between the player and the boss, trap the player, or sit on the player's or the boss's tile. Cap **14** fireball-holes per fight (`G.deepHoles`; original wall-pits do not count). Procedural boom + the same rimmed pit drawing for new holes.

Balance, in line with the Rattle Sovereign (base 48 HP, walk 1.05, skull 4.2 after a 0.4 s tell, cadence 2.2 / 1.9 / 1.6 / 1.4 s):

- Base HP **50** (floor 10: `ceil(50*1)+5*9` = **95**)
- Phase clamps at **75%, 50% and 25%** HP (`DEEP.thresh` / `deepNextHp`). A huge hit cannot skip a phase. The Deep does not collapse.
- Walk **1.0** cells/s, fireball **4.0** cells/s, range **7.2**, telegraph **0.55 s**
- Cadence **2.3 / 2.0 / 1.7 / 1.45 s** by phase (times `cdMul`)
- Blast radius **1.15**, area damage **1 heart**, hole cap **14**
- Creep cadence **8–12 s**, cap **2** (+1 while furious)

Defeat and loot match the other bosses (death puff, then 15 coins plus a run item and a use-item, sealed portal opens). Banner: `THE DEEP IS DEFEATED! THE STAIRS APPEAR!` (40 characters).

## Art

Jacob's sheets in `/workspace/labyrinth-main/deep/src-art/`. White backgrounds removed (dark stone, orange cracks and the body kept; stray pebbles dropped). The fireball's fake checkerboard and faint smoke were removed, not treated as real transparency. Nearest-neighbour scaled, feet-centred, shared sheet height 122 so pose switches do not resize the boss. Packed through `assets/atlas.json`.

## Tests

Related suites retargeted so floor 10 being Heights does not break them: M1.10 door/intro and M1.75 Sovereign tests use `findSovFloor` (a non-Basalt Sovereign floor, typically seed 1 / floor 25 / THE EMBER CORE) and must not leave `bossIntro` disabled; M1.12 Brood-Spider pit climbs and M1.66 rotation cut-scenes skip Heights (no falling pits / no arena doors) and walk later slots of the same boss; M1.75.1's natural moss run uses floor 9; M1.76 Basalt-with-walls checks stay on floors 9/11/12; the Obsidian 12% drop-rate rolls use the discovered Basalt seed so an Icy roll cannot zero the sample. M1.77 covers the pit-wall floor, fog with no ceiling, creeps from pits, fireball conversion, the connectivity guard and hole cap, phases and defeat, and that other floors and bosses are unchanged. Fetch is mocked.

## Freeze

- Official freeze: `node tools/release.mjs m1.77` at **10:45 PM America/Dawson_Creek (UTC-7)**.
- Release `builds/m1.77/index.html` 2150.2 KB (2,201,854 bytes), sha256 `317e69eda4cea5407f27629a92bd7d7d2f052737be0cd4a2bd6b5a59d140de5d`, git blob `c61eb13662ab7511649b906068fb60d1369f9cd2` (same as packed `src/index.html`).
- QA `builds/m1.77-qa/index.html` 2150.2 KB (2,201,852 bytes), sha256 `9a56938c709366c6a281b392b01beb2fec0f33b59181c30bb447f7e02108a57b`, git blob `e0f4319164b66ac602a383de3aaea25521265bd5`.
- Official `cd tests && npm test` on the frozen QA build: **723/723** passed (30 retired). Fetch is mocked; the suite made no live score-board posts.
- M1.76 release/QA hashes were rechecked after this freeze and are unchanged (`25c58d79` / `f7ad1f08`).

## Screenshots

Gitignored under `test-output/m1.77/screens/` (also copied to `/workspace/labyrinth-main/m177/`). Not pushed.

- Floor overview (pits and fog sky): `m177_floor_overview.png`
- Boss walking: `m177_boss_walk.png`
- Cast pose: `m177_cast_pose.png`
- Fireball in flight: `m177_fireball_flight.png`
- Explosion with fresh holes: `m177_explosion_holes.png`
- Creeps climbing out of the pits: `m177_creeps_from_pits.png`
- Defeat: `m177_defeat.png`

## PNGs (for Mr Lead — not pushed)

| path | git blob SHA | bytes | notes |
|---|---|---:|---|
| `assets/mobs/deep.png` | `c8deebaaeab7356a1d48226ad4838c4b2a83d549` | 58216 | 4-frame walk from Jacob's `deep_walk.jpg`, 248×122 (62×122 per frame), k 1.6. |
| `assets/mobs/deep_idle.png` | `c260e5544e447c511377f41770b5cd98ed172bda` | 18427 | Front/idle from `deep_front.jpg`, 80×122, k 1.6. |
| `assets/mobs/deep_cast.png` | `368cf59f1cfc474a5acf9f3165e253ea60e95070` | 16636 | Cast/charge pose from `deep_cast.jpg`, 72×122, k 1.6. |
| `assets/mobs/deep_attack.png` | `4cc465cf3e88599318be85ede989eed29d457c5f` | 20767 | Arms-spread throw/attack pose from `deep_attack.jpg`, 129×122, k 1.6. |
| `assets/boss/shot_deepfire.png` | `41939c53d8b4b3d425c9397c4f7b0a0bc16930b4` | 1438 | Fireball from `fireball.jpg` with the fake checkerboard and faint smoke removed, 24×24, k 1. |

## Decisions

- Replace only the shared rotating boss on Basalt, not a reserved-floor boss, and leave the Rattle Sovereign in `BOSS_ORDER` so other themes are untouched.
- New solid cell type `t===11` rather than reuse falling pits (`t===6`), so wall-pits block like walls and falling stays impossible.
- Door/fence cells become open floor, not pits, or rooms would seal.
- Fireball holes skip a tile when conversion would disconnect the player from the boss or trap the player, and are capped at 14.
- Attack sheet is the throw/attack pose (hurt/rage was the other option).
- Original names only. Touch, keyboard and gamepad unchanged. On-screen messages stay in the top band, clear of the touch buttons; the defeat banner is 40 characters (fits 42).

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Dawson_Creek (UTC-7).

- **Start:** Thu 26 Nov 2026, 10:17 PM
- **Official freeze:** 10:45 PM (`node tools/release.mjs m1.77`)
- **Official `npm test`:** 10:54–11:02 PM (about 8 minutes; a first official run at 10:45–10:53 caught two floor-10 test retargets, then this passing rerun. Source was not re-frozen.)
- **Wall-clock, start to freeze:** about 28 minutes
- **Model turns (approx.):** about 25
- **Tool calls (approx.):** about 120 (sync, art, feature, related-suite fixes, official suite, this handoff, the text/HTML push). Tokens: not available
