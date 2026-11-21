# Changelog

All builds are single HTML files in `builds/<milestone>/`; checksums in `builds/SHA256SUMS`.
Test counts are the number of passing checks in `tests/m1.test.mjs` for that build.

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
