# Labyrinth Remake — M1.11 prototype (placeholder title)

Release build (no debug hook unless `?debug`); QA build in `../m1.11-qa/`.

## What changed since M1.10.2

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

Frozen build; sha256 in `../SHA256SUMS`.
