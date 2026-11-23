# Changelog

All builds are single HTML files in `builds/<milestone>/`; checksums in `builds/SHA256SUMS`.
Test counts are the number of passing checks in `tests/m1.test.mjs` for that build.

## M1.14.1: pit shafts, centred coin toss, lectern shatters
- Pits render as stone shafts fading into darkness; tossed coins land dead centre and fall in; the lectern breaks when the King appears.
- QA build `m1.14.1-qa` (debug hook on).

## M1.14: the King in Yellow (floor 20)
- Gold-brick floor; find the play script, place it on the lectern to summon him. Attacks: Yellow Sign (reversed controls), tattered robes, Carcosa (tint, scrambled map and text, twin suns), Lake of Hali pools. King Gloop's 3rd round moves to floor 35.
- QA build `m1.14-qa` (debug hook on).

## M1.13.1: bosses scale with depth
- Boss HP + 5 per floor below the first (on top of +40% per round). Luggernaut on floor 10: 90 (was 45).
- QA build `m1.13.1-qa` (debug hook on).

## M1.13: +1 HP per floor, more elite modifiers, googly worms, face-hug image
- Regular mobs +1 base HP per floor (replaces x1.06 past floor 8).
- Elite modifiers SHIELDED, SPLITTER, VAMPIRE, EXPLOSIVE, BLINK, FROST (floor 4+).
- 1-3 random-colour googly worms per floor (decoration).
- New sprawled-spider face-hug overlay.
- QA build `m1.13-qa` (debug hook on).

## M1.12.2: own looks for the small spiders
- Skitter: small, mostly black, long thin legs. Brood Spider: glossy black widow with a red hourglass.
- QA build `m1.12.2-qa` (debug hook on).

## M1.12.1: spider redraw
- Broodmother, Brood Spiders and Skitters redrawn after the reference art (X-patterned abdomen, red eye cluster, fangs, spiked legs).
- QA build `m1.12.1-qa` (debug hook on).

## M1.12: coins into pits, spiders, floor-15 bosses, coin doors, shrines, trapdoors, piggy bank, rare wares
- Toss coins into pits (E); 10 unlocks Skitters (face-huggers), 50 Brood Spiders, 100 by floor 15 the Broodmother (webs, egg sacs, Golden Web drop). Otherwise floor 15 is the Grand Masque (laughs = invincible, weeps = vulnerable, gold balls, Tragedy masks, 10 s barrage). Coghoot moves to floor 30.
- Coin doors (5/10/20) with a side room, shrines (15 coins, blessing or rare curse), coin trapdoors (15 coins, next floor; not on boss floors), Piggy Bank (coin per throw, double damage), rare wares page in the shop.
- Test file size limit raised to 400 KB.
- QA build `m1.12-qa` (debug hook on).

## M1.11.1: mask redraw
- Comedy and Tragedy masks redrawn as classic theatre masks (shield-shaped face, crescent eyes, wide grin or frown).
- QA build `m1.11.1-qa` (debug hook on).

## M1.11: masks, Treasure Knight, golden and new items (431 checks)
- **Comedy and Tragedy masks** replace the Zapfly (floors 5+). Golden theatre masks with black eyes and a wide mouth. About a third smile (Comedy): they follow you around, never attack and can't be hurt. The rest frown (Tragedy) and fight like the old Zapfly.
- **Treasure Knight**, a mini-boss on every floor from 2. HP 10 on floor 2, +1 per floor (max 40). His name and health bar show in the message band.
  - Raises his shield when a balloon flies at him: no damage gets through, but he can't move.
  - Telegraphs, then charges straight across the room at 6.5 cells/s. Hitting a wall leaves a round crack in it and dazes him for 1.3 s: your opening.
  - Drops a **golden power-up** (plus 5 coins). A golden one is yours for good and switches on at the start of every floor. Once you own it, the ordinary kind of that power-up no longer turns up anywhere. If CONTINUE restarts that floor, he doesn't come back for a second drop.
- **8 new power-ups:**
  - Thorn Vest: the next bite is absorbed, the biter takes 3 damage and is knocked back, then the vest is used up. A golden one works once per floor.
  - Rock Sack: rocks instead of balloons, fast and flat, 2 damage a hit.
  - Lucky Clover: coins count double.
  - Healing Herb: +2 hearts at once.
  - Mirror Charm: bounces 3 enemy shots back.
  - Candle Lantern: lights up the whole map.
  - Wax Wings: float safely over pits.
  - Warding Bell: knocks back and stuns nearby monsters for 2 s.
- **3 permanent items**, found in secret rooms (about a third of the secret power-ups) and dropped by bosses (instead of their heart):
  - Heart Container: +1 max heart, up to 8. Past 5, hearts show at half size.
  - Strong Arm: +1 damage, up to 2.
  - Quick Hands: throws 20% faster, up to 2.
- **Maps**: every monster (bosses too) shows as the same red mark on the minimap and the full map, so the map no longer tells you what is coming.
- QA build `m1.11-qa` (debug hook on).

## M1.10.2: boss cut scene (416 checks)
- Opening a boss room door plays a 5 s cut scene: you are pulled in, the doors slam and lock (sound + shake), the view turns to the boss with "VS <NAME>". Then the fight starts.
- QA build `m1.10.2-qa` (debug hook on).

## M1.10.1: boss arenas lock (413 checks)
- Entering a boss arena locks all its doors until the boss falls; keys don't open them.
- QA build `m1.10.1-qa` (debug hook on).

## M1.10: bosses (412 checks)
- A boss guards the portal on every 5th floor, in turn **King Gloop** (hopping jelly king: jelly fans, minions at 2/3 and 1/3 HP), **Luggernaut** (stack of biting suitcases: sock fans and charges, loses a suitcase at 2/3 and 1/3 HP) and **Coghoot** (clockwork owl: flies, homing gears, swoops). All get furious at half HP.
- Each round of three is tougher: +40% HP (max ×3), attacks more often (max 1/0.6), +6% speed (max ×1.3).
- Arena: the exit room if it has 35+ cells, else the biggest room; the boss never leaves it and wakes when you walk in. No pits or other mobs inside.
- The portal is barred (in the world and on both maps) until the boss falls; the boss floor's exit door needs no key.
- Boss name and health bar inside the message band; loot of 15 coins, a heart and a power-up; +150 score (kill + elite); the clear screen names the boss.
- Floors without a boss are generated exactly as in M1.9.1.
- Tests: `ONLY=m110 node m1.test.mjs m1.10` runs selected groups.
- QA build `m1.10-qa` (debug hook on).

## M1.9.1: fixes for the M1.9 known issues (390 checks)
- The shop panel sits below the HUD and right of the item bar; hearts, coins, keys, balloon type and item slots stay bright while it is open.
- Decorations are never diagonally next to a door (M1.9 had 83 in ~32,000 over 300 seeds). A tiny start room ringed by doors may now stay bare.
- On about 1 floor in 70 a few room-filler mobs, coins or a heart move to other cells (shared random stream). Walls, doors, keys, shops, slots, pits and secret rooms are unchanged.
- Tooling: `tools/release.mjs` freezes a release + QA pair, refreshes checksums and the test package version; `dev --test` tests `src/` without freezing. The test suite compares versions part by part (so `m1.10` is newer than `m1.9`).
- QA build `m1.9.1-qa` (debug hook on).

## M1.9: shop, slot rework, pits, Rattlebone (388 checks)
- Slot machine: 3 coins a spin, no per-floor limit. Odds: 62% nothing, 14% +5 coins, 8% heart, 6% power-up, 2% jackpot (25 coins spray into the room), 8% three skulls (spawns 1 + 1 monster per 3 floors, capped at 8). Expected return about 0.40× the cost.
- Balloon throw cooldown 0.42 s → 0.80 s.
- Power-ups last the whole floor, shown as a HUD icon row. Rebalanced: Sneakers ×1.35, Freeze 60% speed, Shield absorbs 3 hits.
- Merchant Old Murkle on every even floor from 2. Permanent items: Red balloons 35 (faster, longer range), Green 45 (poison ticks), Yellow 50 (a splash puddle that only hurts mobs), Backpack 30 (a second item slot). Two power-ups at 10 coins each, once per floor.
- Balloon type switches with R / 1–4 / LB / BALL; backpack slots with F / RB / a tap.
- Secret room on every generated floor behind a cracked wall that opens after 3 balloon hits.
- No empty rooms. 8 decoration kinds with no hitbox.
- Pits from L3 (max 6). Fatal; ground mobs avoid them, fliers cross them.
- Rattlebone skeleton from L6: becomes a bone pile, gives a tell at 3 s and reforms at 4.5 s unless the pile is smashed.
- Hazewisp passes through doors.
- Known issues: the shop panel covers the top-left HUD while open; in crowded rooms a decoration can sit diagonally next to a door.
- QA build `m1.9-qa` (debug hook on).

## M1.8: endless floors, score, high scores, slot machine (325 checks)
- Endless floors: every exit leads to the next floor, up to floor 10,000. Floors 1–8 keep their M1.7 layouts.
- Scaling caps past floor 8: up to 22 mobs (L13), 30 coins, mob HP +6% per floor up to ×1.6 (L18), elite chance capped at 60%, two modifiers from L8.
- Deep wall styles every 4 floors past 8: basalt (L9), rusted iron (L13), crystal (L17), glyph stone (L21), void runes (L25).
- Score (1,000 per floor below the first, 50 per pop, +100 per elite, 5 per coin), shown on the pause, level-clear and death screens.
- Death ends the run, then name entry (keyboard, gamepad d-pad, touch) and the high score page (also on the title).
- Same-origin high score API with client-side validation, friendly 429 handling and a LOCAL top-10 fallback.
- Slot machine (coins only, printed odds, 3 spins per floor, EV 0.35× cost).
- Fixes: `#` glyph added to the pixel font; the test harness doesn't match its own guard patterns; a timing-sensitive glow check now samples a full pulse.
- QA build `m1.8-qa` (debug hook on).

## M1.7: readability, gated debug hook, L3 floor rule (256 checks)
- Elite modifier icons sit above the mob (or stack beside it), never over the sprite.
- `window.__game` is only exposed in the release build with `?debug`; a separate **QA build** (`m1.7-qa`) has it always on.
- RANGED colour changed to a lighter red-pink (#ff6a7a) for contrast against brick.
- L3 per-seed difficulty floor: level 3 is never easier than level 2 for the same seed (total and elite-adjusted HP).
- Phone: in the top strip only the HUD panel, item bar, minimap and buttons ignore touches.
- Screamer ears about 30% thicker with a wider wingbeat.

## M1.6: QA fixes and balance (238 checks)
- QA fixes: no stray throws after closing the map or resuming, minimap hide is saved, elite loot never lands in a fence, Giant Balloon splash blocked by walls/doors/fences, `?seed=` links keep CONTINUE.
- Screamer gets bat-wing ears.
- Level 3 always has a Kettlegrump and 8 mobs; two-modifier elites phase in (50% L6, 75% L7, 100% L8+).
- Phone pause and MAP buttons moved; touches starting in the HUD strip never move or look.
- Elite readability: bordered modifier icons that scale with distance, framed glow, clearer colours.

## M1.5: QA fixes, redraw, balance (217 checks)
- QA fixes: phone pause button size, steep throws no longer splash on the ceiling, a Hazewisp in a fence cell can be hit, LOOK SPEED arrows in the pause menu.
- Screamer redrawn; Springle moved to L3.
- Balance pass, minimap colours, seed links on the level-clear screen, full-screen map with a MAP button.

## M1.4: elites and power-ups (195 checks)
- Elite mobs with modifiers (RANGED, SLIME TRAIL, BEEFY, FAST, REGEN) and loot.
- Six timed power-ups (SPEED SNEAKERS, SHIELD BUBBLE, TRIPLE BALLOON, FREEZE POP, COIN MAGNET, GIANT BALLOON) and an item bar.

## M1.3: bigger picture, new mobs, procedural levels (158 checks)
- Internal resolution 480×300 and 64×64 textures.
- Five new mobs: Springle, Kettlegrump, Hazewisp, Clunkbot, Zapfly.
- Procedurally generated levels 2–8 ("Rooms and Mazes"), reproducible with `?seed=`.
- Assorted fixes.

## M1.2: look up and down (106 checks)
- Pitch (look up/down) for mouse, gamepad right stick and touch drag, with INVERT Y in the pause menu.
- Four hand frames (idle, wind-up, throw, empty) and an idle bob.
- The Screamer replaces the first placeholder enemy (four ear-flap frames, scream on sight).

## M1.1: input and QA fixes (83 checks)
- A1–A9: fullscreen requested once on touch start; hybrid touch/mouse switching; inputs cleared and game paused on blur, hidden tab or pointer-lock loss; one click resumes; instant taps and clicks throw; death beats level-exit on the same step; gamepad prompts; low taps on the win screen don't skip into a new game.
- B1–B8: contact knockback and re-bite delay tuned, balloon arc tuned, N mutes (saved), touch pause button and pause menu, touch run threshold, LOOK SPEED setting (saved).

## M1: first playable (54 checks)
- Canvas 2D raycaster (320×200), textured walls, see-through fences, sliding doors, gold key and locked door.
- Balloon throwing, an enemy with hurt flash and pop, coins, hearts, exit, two levels, win screen.
- Auto-save per level with CONTINUE; keyboard and mouse, gamepad and touch controls; landscape lock.
