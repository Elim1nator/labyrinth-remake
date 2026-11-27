# M1.79.5 handoff

Bug fixes and a boss promotion on `Grok-Code-16` from the M1.79.4 tip `58e6aad6436578c6d3991fc734d2527848affa9a`. Jacob reported two Icy Prison bugs: minimap walls showed pixels from behind the map instead of their own colour, and the Ice Wizard was acting as a regular mob (no sealed stairs, intro, arena treatment, or a bubble that actually went up). No PR merge, no force-push. M1.79.4 and earlier builds are left intact. No PNGs were changed.

Main was rechecked before numbering: still M1.74.1 at `447992a`, and M1.75–M1.79.4 are not on main, so this is **M1.79.5**.

## Root causes

**Minimap walls.** Icy Prison wall textures (`icetile`, `frostwall`, `icebrick`, tex 20–22) were added in M1.68, but `MAPCOL` stopped at ironbound (tex 19). Drawing `MAPCOL[c.tex]` wrote 0 into the shared pixel buffer, so the 3D view showed through those wall cells on the minimap and the full-screen map. Every other theme's wall letters already had an opaque colour; only ice was missing.

**Ice Wizard as a mob.** He was documented as the Icy Prison's boss and already had a far-room spawn and a wake line, but he was only `extra:true`, not `boss:true`. He was not on the `G.boss` path, so he did not get a VS intro, a boss HP bar, sealed stairs, or a stamped 13×11 arena. He could also appear as a placed extra, not as the floor's boss fight.

**Shield never bubbled.** The 75% / 50% / 25% phases existed (`ICEWIZ.shieldAt`) and were checked in `updateIceWiz` after damage was already applied. A normal barrage could skip a threshold or kill him in one burst, so the bubble never went up. The Sovereign and the Awakened Basalt already clamp the hitting blow at the next phase (`sovNextHp` / `deepNextHp`); he did not.

## What changed

- `MAPCOL[20..22]` are solid pale icy blues (`#b8e4f4`, `#9ecce0`, `#c8eef8`). `mapWallCol()` uses those colours on the minimap and full map, and falls back to icy blue if a texture is ever missing an opaque entry.
- Every Icy Prison floor is now the Ice Wizard's boss floor: a 13×11 arena, a VS intro, a boss HP bar in the message band, and stairs that stay sealed until he falls. The start banner is `ICY PRISON: COLD. THE ICE WIZARD AWAITS`. The defeat banner is `ICE WIZARD DEFEATED! THE STAIRS APPEAR!` (both fit the 42-character message band). The Frozen Wand still drops at his feet; it is not named in the banner.
- He keeps his name, art, orbs, blizzard, spikes and Frozen Wand. He is not in the normal mob pools and no longer spawns in a far room as a regular mob. He does not replace the every-5th-floor bosses (King, Sovereign, Coghoot) or the Yellow, Masque, Brood or Awakened Basalt fights. `icyAt` still refuses the tutorial and those boss floors. `applyDeepBossFloor` leaves an Ice Wizard floor alone.
- A hit that would cross a shield threshold now clamps his HP, raises the bubble, and summons 2–5 ice spikes. Further hits deal no damage until the spikes are shattered (same break method as before; no wait-it-out timeout, so existing spike tests still hold). The bubble is thicker and pulses so it is obvious he is shielded.
- Icy Prison boss placement does not steal the only gold key or turn the exit door into a key-lock. The sealed portal is enough. (Doing the regular-boss key delete on floor 3, which has no vault, left a lock with no reachable key.)
- `api.bosses` now also lists the Ice Wizard so his map letter fills the arena in the empty-room check; the three rotating bosses and `bossFor` / `bossOrder` are unchanged. `api.unseal` opens the stairs for tests. `api.defeatBoss` drops his bubble so a test hook can actually finish the fight.

## Floor and balance

- **Floor assignment:** every Icy Prison floor (from floor 3, every 4 floors, never over a rotating or special boss floor). Example used in the screenshots: seed 1, floor 9 (`LEVEL 9: ICY PRISON`), 13×11 arena, wizard at the arena centre, 70 HP.
- **HP:** `applyBoss` with `hpMul` 1: `ceil(30) + 5 * max(0, floor-1)`. Earliest floor 3 = 40 HP; floor 9 = 70 HP. (King on floor 5 is 56.) Speed 0.9, `bodyR` 0.4, `reach` 0.7. Same casts, blizzard, spike counts and Frozen Wand as M1.69. Unlock-as-start-floor still only follows the rotating bosses (`bossFor`); an Icy Prison clear does not add a START FLOOR row.

## Tests

New M1.79.5 checks (`V1795` / `ONLY=m179.5`):

- Every wall type on every theme has an opaque minimap colour; the ice textures are pale icy blue.
- Icy Prison minimap wall pixels are a solid pale icy blue (no see-through 3D pixels).
- Every Icy Prison floor is an Ice Wizard boss floor (13×11+ arena, exactly one `y`, sealed stairs, named in the start banner). He is not in `MOB_POOLS` and not placed on non-icy floors. Floor 5 stays a regular rotating boss.
- Stepping into the arena starts the VS intro (`BOSS FLOOR` / his name).
- A hit that would cross 75% health raises the bubble, summons 2–5 spikes, and further hits deal no damage. Once he is awake, the message band shows his name and HP bar.
- When he falls, the stairs unseal, the defeat banner names him, and the Frozen Wand drops.

Also: M1.8 / A5 finishing floor 8 still leads to floor 9 in play (if 8 or 9 is Icy Prison, the test unseals or skips the intro first). M1.9 empty-room and pit-solvability still hold (arena letter `y` counts; icy floors keep a reachable key). M1.10 still requires the three rotating bosses, and now also expects `icewiz` in `api.bosses` and out of the regular mob table. The M1.69 kill step sets `shieldIdx:3` so the last blow is not clamped into a bubble.

## Freeze

- Official freeze: `node tools/release.mjs m1.79.5` at **1:45 PM America/Vancouver (UTC-7)**.
- Release `builds/m1.79.5/index.html` 2421.2 KB (2,479,288 bytes), sha256 `b9c12de542893eec33a21612e9f87bf7e83029d97414f580df60cfdd5c092e8c`, git blob `ccdb0e966bfb7f624ea9bb35d772a2fb6566b6a7` (same as packed `src/index.html`).
- QA `builds/m1.79.5-qa/index.html` 2421.2 KB (2,479,284 bytes), sha256 `6207d6fe0b36f5b31b9334607482addb9925ef51e4eb1a561000af5fa9681874`, git blob `64b37def747898958adaea1531f7a7f7e47ec3fe`.
- Official `cd tests && npm test` on the frozen QA build: **777/777** passed (30 checks of pre-M1.23 items or pre-M1.31 layouts retired). Fetch is mocked; the suite made no live score-board posts. M1.79.4 was 767; this release adds the ten M1.79.5 checks above.
- A first official pass on this freeze was 776/777: the only failure was the M1.10 "exactly three entries in `api.bosses`" assertion after the Ice Wizard was listed there. The assertion now counts the three rotating bosses and requires `icewiz` as the extra entry. That group was re-run (`ONLY=m110`, 78/78) and the full official suite was re-run on the same frozen HTML.
- M1.79.4 release/QA hashes were rechecked after this freeze and are unchanged (`892dfa99` / `3311fad9`).

## Screenshots

Gitignored under `test-output/m1.79.5/screens/` (also copied to `/workspace/labyrinth-main/m179.5/`). Not pushed.

- Ice minimap before (M1.79.4-qa, seed 1 floor 9, 3D pixels showing through the walls): `m1795_ice_minimap_before.png`, `m1795_ice_minimap_before_zoom.png`
- Ice minimap after (solid pale icy blue): `m1795_ice_minimap_after.png`, `m1795_ice_minimap_after_zoom.png`
- Ice Wizard intro banner: `m1795_ice_wizard_intro.png`
- Arena with the boss HP bar: `m1795_ice_wizard_arena.png`
- Shield bubble and spikes active: `m1795_ice_wizard_shield.png`
- Defeat banner, unsealed stairs and Frozen Wand: `m1795_ice_wizard_defeat.png`

## PNGs

None. No asset sheets were edited for this milestone. The shield bubble is procedural.

## Decisions

- Promote him on the Icy Prison floors where he already appeared, as an extra boss-floor type alongside the rotating every-5th-floor bosses, not instead of them.
- Keep his existing name and art (original names only).
- Break the bubble by shattering spikes, as designed in M1.69; do not add a wait-it-out timeout.
- Do not steal the only key on an Icy Prison floor. Sealed stairs are the lock.
- Short banners so they are not clipped to 42 characters.

## Usage

Token meters are not visible to this executor, so read and written tokens are **not available**. Counts below are **approximate** and labelled as such. Wall-clock is America/Vancouver (UTC-7).

- **Start:** Fri 27 Nov 2026, 1:22 PM
- **Official freeze:** 1:45 PM (`node tools/release.mjs m1.79.5`)
- **Official `npm test`:** 1:45 PM–1:53 PM (first run 776/777), then the M1.10 assertion fix and a full re-run 1:54 PM–2:02 PM for **777/777**
- **Wall-clock, start to freeze:** about 23 minutes
- **Model turns (approx.):** about 20
- **Tool calls (approx.):** about 80 (diagnosis, src and test patches, targeted suites, freeze, official suite, the M1.10 follow-up, this handoff, the text/HTML push). Tokens: not available
