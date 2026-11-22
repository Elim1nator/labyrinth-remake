# Labyrinth Remake — M1.9 prototype (placeholder title)

A single-file browser maze shooter, inspired by early-90s maze shooters. Open `index.html` in a browser.
This is the **release** build: it exposes no debug hook unless the URL has `?debug`. The QA build (hook always on) is `../m1.9-qa/`.

## What changed since M1.8
- **Slot machine.**
  - Spins cost 3 coins, with no per-floor limit. The odds are printed on the machine.

    | Result | Chance |
    |---|---|
    | Nothing | 62% |
    | Coins +5 | 14% |
    | +1 heart | 8% |
    | Power-up | 6% |
    | Jackpot: 25 coins spray out across the room | 2% |
    | 3 skulls (crit fail): 1 + 1 per 3 floors monsters appear next to the machine (max 8) | 8% |

  - Average payback is 0.4× the cost (verified over 100k simulated spins).
- **Water balloons.** The throw cooldown went from 0.42 s to 0.80 s. The hand animation follows the new timing.
- **Power-ups last the whole floor once used.** The HUD shows active effects as icons instead of a countdown ring. Values were rebalanced for floor-long use:
  - Sneakers: ×1.35 speed (was ×1.6).
  - Shield: blocks 3 hits (was 8 s).
  - Freeze: mobs at 60% speed (was 35%).
  - Magnet: 6-cell radius.
  - Giant: 1.2 splash radius for 1 damage (2 on a direct hit).
  - Triple: unchanged.
- **The shop of Old Murkle.** A hooded merchant appears every other floor from floor 2 (never the tutorial). Talk to him with E / USE / gamepad X / tap. He sells:
  - Permanent items, saved with your run:

    | Item | Price | Effect |
    |---|---|---|
    | Red Balloons | 35 | Faster, further |
    | Green Balloons | 45 | Poison: 2 extra damage ticks |
    | Yellow Balloons | 50 | A puddle that hurts mobs, never you |
    | Backpack | 30 | A second power-up slot |

  - Two one-use power-ups at 10 coins each.
- **Controls.**
  - Switch balloon type: R / 1–4 / mouse wheel / gamepad LB / the BALL touch button. The type shows in the HUD and in the hand colour.
  - Switch backpack slot: F / gamepad RB / tap the item box.
- **Secret rooms** on every generated floor. A subtly cracked wall breaks after 3 balloon hits and opens a hidden room with a treasure and usually a mob. The opened state is saved per floor.
- **No empty rooms.** Every room gets a mob or decorations. Decorations (plant, table, bones, skull, candles, mushrooms, crate, urn) have no hitbox and never sit next to doors, keys or exits.
- **Pits** from floor 3 (1 + 1 per 2 floors, max 6).
  - Falling in is fatal. Pits show dark in the floor and on both maps.
  - Ground mobs path around them; flyers (Zapfly, Screamer, Hazewisp) cross over.
  - Pits never block the only route and never sit on the spawn or on loot.
- **Rattlebone (skeleton).**
  - Stats: 4 hp, guaranteed on floor 6, then about 1 in 7 mobs.
  - At 0 hp it collapses into a bone pile, rattles as a warning after 3 s and stands up again after 4.5 s.
  - A balloon on the pile smashes it for good: 50 points and a coin.
- **Ghosts** (Hazewisp) drift through doors as well as fences.
- The score formula is unchanged (capped at floor × 100,000).

Known issues: the shop panel covers the top-left HUD while open (it is modal and pauses the game); in crowded rooms a decoration can sit diagonally next to a door.

Frozen build; sha256 in `../SHA256SUMS`.
