# Labyrinth Remake — M1.4 prototype (placeholder title)

Inspired by early-90s maze shooters. Not monetized. All art and sound are original and made in code inside `index.html`. It is one self-contained file and makes no network requests.

## Run
Open `index.html` in any modern browser.
- `index.html?seed=4242` plays a fixed map set. Any text works: `?seed=hello` is hashed to a number.
- Without `?seed=`, each new game gets a random seed. The seed is shown in the pause menu and kept in the auto-save.

## Controls
| Action | Keyboard / mouse | Gamepad (standard) | Touch |
|---|---|---|---|
| Move / strafe | WASD or ↑/↓ (A/D strafe) | Left stick | Stick under your left thumb |
| Turn | Mouse (click to lock) or ←/→ | Right stick | Drag on the right side |
| Look up / down | Mouse Y | Right stick Y | Drag up/down |
| Re-centre view | C or middle mouse | R3 | Double-tap the look side |
| Run | Shift | — | Stick pushed 80%+ |
| Throw | Space, Ctrl, left click | A or RT | THROW button |
| Use / open door | E or Enter | X | USE button |
| **Use item (new)** | **Q or right mouse** | **Y** | **ITEM button** (only shown while you hold an item) |
| Pause | Esc or P | Start | Pause button |

## Changelog (from M1.3)
1. **Elite mobs.** On each floor, every mob has a chance to become an elite: **5% × floor number, capped at 100%** (floor 2 = 10%, floor 8 = 40%, floor 20+ = 100%). The tutorial (floor 1) has none. The rate lives in one constant, `ELITE_CFG.perFloor`. Elites get 1 modifier, or 2 from floor 6. Rolls are seeded, so the same seed gives the same elites.
2. **Elite modifiers.** Each one has its own coloured outline glow and a small icon above the mob (2-mod elites alternate glow colours):

   | Modifier | Glow | Effect |
   |---|---|---|
   | RANGED | red | Stops and flashes white (telegraph), then fires its own projectile. Shots can be dodged and are stopped by walls, closed doors and fences (the same as balloons). 1 heart on hit. |
   | SLIME TRAIL | lime | Leaves a goo puddle every 0.7 cells it moves. Puddles last 9 s and shrink as they fade (40 max; the oldest is removed first). Standing in goo costs 1 heart, then there is a 1.5 s cooldown. |
   | BEEFY | amber | 1.5× size, 2.5× HP, 0.82× speed, bites for 2 hearts. |
   | FAST | cyan | +40% speed. |
   | REGEN | pink | Heals 1 HP every 2.5 s it goes unhit. |

   Ranged projectiles (speed / cooldown / telegraph):
   - Kettlegrump: steam blob (4.2 / 2.6 s / 0.5 s)
   - Zapfly: zap bolt (7 / 2.1 s / 0.35 s)
   - Clunkbot: eye laser (9.5 / 3.2 s / 0.75 s)
   - Screamer: sonic ring (5 / 2.8 s / 0.5 s)
   - Hazewisp: ghost wisp (3.2 / 3 s / 0.55 s, gently homing)
   - Springle: spit fluff (5.5 / 2.4 s / 0.4 s)

   Up to 40 enemy shots can be in flight at once. Enemy melee is unchanged.
3. **Elite loot.** A 1-mod elite drops 2 extra coins and has a 50% chance of a power-up. A 2-mod elite drops 4 extra coins and always drops a power-up.
4. **Power-ups and the item bar.** There is a single item slot under the hearts panel, with an active-effect icon beside it. The active icon has a countdown ring and shows seconds left.
   - **Pickup:** walk over a power-up.
   - **Swap rule:** if you already hold an item, the new one goes into the slot and your old one is dropped where you stand. You won't pick it straight back up; step away and come back for it. If you walk over the same item you already hold, it stays on the floor with an "ALREADY HOLDING" message.
   - **Use:** the item leaves the slot and its effect runs. Only one effect runs at a time, so using a new item replaces the current effect.
   - **Placement:** 1 in the tutorial (Speed Sneakers). Generated floors have 2, or 3 from floor 5, on floor tiles at least 5 steps from the start. More drop from elites.
   - **Save:** the held item is saved at each level start and restored by CONTINUE and by retrying after a death.

   | Power-up | Lasts | Effect | Screen cue |
   |---|---|---|---|
   | SPEED SNEAKERS | 10 s | 1.6× move speed | Cyan border, speed lines |
   | SHIELD BUBBLE | 8 s | Blocks all damage (bites, shots, goo) | Blue border, bubble wave |
   | TRIPLE BALLOON | 10 s | Each throw is a 3-way spread (±10°) | Pink border |
   | FREEZE POP | 8 s | Enemies and their shots move at 35% speed | Icy tint |
   | COIN MAGNET | 12 s | Pulls coins within 6 cells (line of sight) | Gold border, sparkles |
   | GIANT BALLOON | 9 s | Big balloons: on impact, 2 damage to every mob within 1.4 cells | Orange border |

   Every power-up has its own pixel icon, world token, and pickup / use / wear-off sounds.
5. The HUD, minimap (mint dots for power-ups), title hint and pause hint mention the item key. The touch ITEM button sits above THROW, clear of the message band, HUD, item bar and minimap at every tested size.
6. The test hook gained elite and power-up helpers for the automated tests.

## Known limits
- The save is written at level start, so an item picked up mid-level is kept only if you clear the level.
- Elite projectiles fly at a fixed height; they don't arc over fences.
