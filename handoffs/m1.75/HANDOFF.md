# M1.75 handoff: the Clockwork Mourner and the Tin Heart

Built on main at M1.74.1 (`447992a`). Branch `claude/busy-pascal-16yr2s`. Brief: `BRIEF.md`.

## What changed

### The Clockwork Mourner (Rust Works only)
- `MOBS.mourner`: 7 HP, speed 0.98 (unique; 1.05 clashed with the Snowman for the M1.3 "own speed" check), `h` 0.68, `hitR` 0.32, map letter `i`, voice `mourner`.
- Common on Rust Works floors: added twice to the M1.8 pool and the M1.9 room-fill pool, featured twice, and `ensureThemeMob('mourner',3)`. In `THEME_MOBS`, so the kettle and Rattlebones swaps skip it. Never on other themes.
- Every landed bite applies Rust for 8 s (`MOURNER.rustT`). A shield or bubble block skips it along with the damage.
- Animation: frames 0 right foot, 1 standing, 2 left foot. Walk is 0,1,2,1 at 6 frames/s (`MOURNER.walk`). Not moving shows frame 1.
- Sound: a tick-tock while it walks within 7 cells (`MOURNER.tick` 0.32 s, `hearR` 7), a wind-up ratchet and music-box sigh as its voice, and a ratchet-and-spring crash on death.
- Death: `mournerShatter` throws 16 cog particles (`kind:'gear'`, rusty or iron, drawn in code by `sprGear`), then the usual loot, plus a 5% Tin Heart drop.

### The Tin Heart (Rust Works only)
- `ITEMS.tinheart`: max 1, price 40, `theme:'RUST WORKS'`, so it is only in the item pool and shop on Rust Works floors. A Mourner kill also has a 5% chance to drop it (`TINHEART.drop`), skipped if you hold it or one is already on the floor.
- Rust immunity: `addStatus('rust')` returns early while held. The Mourner, Rafter Doll and Infernal Rust bites skip their Rust message (the Mourner shows "YOUR TIN HEART SHRUGS OFF THE RUST"). `addRunItem` clears any Rust you already have.
- Throws are 15% faster: cooldown x0.85 (`TINHEART.throwMul`), applied inside the `ITEM_FX.minThrow` floor like Coffee. Measured: 1.20 s to 1.02 s.
- Saved with the other run items, so CONTINUE keeps it.

### Art (committed with the code)
- `assets/mobs/mourner.png`: 300x137, 3 frames of 100x137, cut from the supplied sheet. The alpha is hard-thresholded, each frame is bottom-aligned and centred on the head, and the file is a 47-colour palette PNG with transparent corners. `atlas.json` lists it with `k` 1.5.
- `assets/items.png`: the Tin Heart is at (96,96), slot 45. It is a Lanczos downscale of the 965x1006 source to 22x22, with a 1 px dark outline.

## Numbers
- Seeds 1-30, floors 13-30: 112 Rust Works floors. Each had 3 to 11 Mourners (average 6.2 of about 23 mobs), and no Mourners appeared on any other theme. The Tin Heart was in the item pool on every Rust Works floor and on no other floor.

## Freeze
- Release `builds/m1.75/index.html` 1,960,132 bytes, sha256 `310e22ab0ec92ba4cfb883a07b93eb101a51c8e2f7c9b79267b57a1918970795`.
- QA `builds/m1.75-qa/index.html` 1,960,130 bytes, sha256 `64e207c5e9af9d0100c86aeca4d6d4f8e28cbf82c5a0022834ad92b0645e91ab`.
- Tests: `cd tests && npm test` on the frozen QA build gave **689/690** (30 retired). The new `m175` group (7 checks) passed.
- The one failure is `M1.52 blinded mobs lose track of you and wander`. It is an existing flaky check: blinded mobs wander in a random direction, and sometimes 4 of 6 happen to move toward you. On its own (`ONLY=m152`) it failed 1 of 5 runs on M1.75 and 1 of 5 on the unchanged M1.74.1. The `A1` fullscreen check (flaky in M1.74.1) passed this time.

## Repro for Playtest
1. Type `cheat`, then jump to a deep floor until the walls say RUST WORKS (seed 1, floor 13 is one).
2. Mourners tick as they walk and alternate their feet. Let one bite you: you lose a heart and get RUSTED for 8 s.
3. Kill one: it bursts into gears.
4. Pick up or buy a Tin Heart on a Rust Works floor. Any Rust is cleared, bites no longer Rust you, and throws are faster.

## Known issues
- `M1.52` blinded-wander check is flaky (see above). It is unrelated to this release.
