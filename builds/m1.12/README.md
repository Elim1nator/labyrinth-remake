# Labyrinth Remake — M1.12 prototype (placeholder title)

Release build (no debug hook unless `?debug`); QA build in `../m1.12-qa/`.

## What changed since M1.11.1

- **Coins into the pits.** Stand next to a pit and press E (USE / gamepad X) to toss in a coin. The band shows how many coins are in the pits; the count lasts the whole run. Milestones unlock things on later floors:
  - **10 coins: Skitters.** Small spiders crawl out of pits and run at you very fast. If one reaches you it jumps on your face and covers the screen for 3 s (no damage). 1 HP.
  - **50 coins: Brood Spiders.** Big spiders (8 HP) also climb out of the pits and fight like normal mobs (they can be elites, take power-up effects).
  - **100 coins by floor 15: the Broodmother.** It shoots webs (3 s slow), lobs egg sacs (4 HP; left alone they grow for 10 s and burst into 3 spiders), and calls in Skitters and Brood Spiders. It drops the **Golden Web**: kept for good, your hits slow monsters.
- **Floor 15** otherwise belongs to **the Grand Masque**, a huge comedy mask. It is invincible while it laughs and can be hurt while it weeps. It shoots gold balls in both moods, calls in Tragedy masks, and sometimes goes wild: 2 shots a second for 10 s. Coghoot now first appears on floor 30.
- **Coin doors** (5, 10 or 20 coins) on some floors open a small side room with a power-up. There is a small chance of a golden power-up or a Piggy Bank instead, and sometimes a Treasure Knight or another mob is waiting inside.
- **Shrines** on some floors: offer 15 coins for a blessing (hearts, a power-up for the floor, a shower of coins or a holy shield). About 1 in 7 offerings is cursed instead: you lose a heart or monsters appear. Once per floor.
- **Coin trapdoors** on some floors (never boss floors): pay 15 coins and drop straight to the next floor.
- **Piggy Bank** (coin rooms, shop): each throw costs a coin and does double damage. It shatters when your coins run out.
- **Rare wares.** Old Murkle has a second page:

  | Item | Price |
  |---|---|
  | Heart Container | 60, +30 each time |
  | Strong Arm | 80, +40 |
  | Quick Hands | 70, +35 |
  | Piggy Bank | 40 |
  | Golden Wonder (a random golden power-up) | 150 |
  | Mystery Box | 25 |

- File size 324 KB; the test limit is now 400 KB.

Frozen build; sha256 in `../SHA256SUMS`.
