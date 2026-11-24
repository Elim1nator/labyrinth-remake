# Labyrinth Remake — M1.10 prototype (placeholder title)

A single-file browser maze shooter, inspired by early-90s maze shooters. Open `index.html` in a browser.
This is the **release** build: it exposes no debug hook unless the URL has `?debug`. The QA build (hook always on) is `../m1.10-qa/`.

## What changed since M1.9.1

**Bosses.** Every 5th floor (5, 10, 15, ...) a boss guards the way down. Its portal is barred until the boss falls. The three bosses come from the M0 concept art and take turns:

| Floor | Boss | How it fights |
|---|---|---|
| 5, 20, 35, ... | **King Gloop**, a cross jelly with a candle crown | Hops at you and lobs fans of jelly. At 2/3 and 1/3 health two minions pop out. At half health it gets furious: wider fans, faster hops, and its landings leave goo. |
| 10, 25, 40, ... | **Luggernaut**, a tower of three biting suitcases | Walks at you, throws fans of socks or charges (it is stunned if it hits a wall). At 2/3 and 1/3 health a suitcase bursts in a ring of socks and coins, and the shorter stack gets faster. Aim lower as it shrinks. |
| 15, 30, 45, ... | **Coghoot**, a clockwork owl | Flies circles around you, fires homing gears and sometimes swoops. Furious at half health: rings of gears. |

- **The arena.** The boss lives in the exit room when that room is big enough (35+ cells), so it stands right by the portal. Otherwise it takes the biggest room. It never leaves the arena and wakes when you walk in. Other mobs move out of the arena, and no pits are dug there.
- **The portal.** It is barred and dim, in the world and on both maps, until the boss falls. The exit door on a boss floor needs no key. Step into the barred portal and the band tells you whom to beat.
- **During the fight** the boss's name and a health bar show in the message band. It flashes orange when the boss is furious. The bar takes no extra screen space, so no touch button can cover it.
- **Loot.** 15 coins spray out, plus a heart and a power-up. The boss counts as a kill and an elite (+150 score; the score formula is unchanged). The clear screen names the boss you beat.
- **Deeper bosses are tougher.** Each round of three adds +40% HP (max ×3), more frequent attacks (up to 1/0.6) and +6% speed (max ×1.3).
- CONTINUE on a boss floor restarts the fight.
- Floors without a boss are generated exactly as in M1.9.1.

Numbers: `docs/BALANCE.md`, "Bosses". File size 264 KB (limit 300 KB).

Frozen build; sha256 in `../SHA256SUMS`.
