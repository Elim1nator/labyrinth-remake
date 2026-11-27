# Kersplat Labyrinth: The Descent — M1.77

Release build (no debug hook unless `?debug`); QA build in `../m1.77-qa/`.

## What changed since M1.76

- The **Awakened Deep** is the boss of **Basalt Heights**. It replaces the rotating `BOSS_ORDER` boss on Basalt boss floors only (on the usual floor 10 that is the Rattle Sovereign). The Sovereign and the rest of the rotation still appear on non-Basalt floors. The Grand Masque, the Broodmother and the King in Yellow are left alone.
- The Heights floor uses the Basalt floor texture. Every wall cell is a solid dark pit with a rim (no wall faces, doors or fences). Pits block movement like walls and you cannot fall in. There is no ceiling: the top of the view fades into the fog.
- **Skittering Creeps** climb out of the pit cells on a tighter boss-fight cadence (8–12 s, cap 2).
- The Deep walks, stops to cast, and hurls a fireball. The fireball explodes on impact or at the end of its range, deals 1 heart in a 1.15-cell blast, and turns hit floor tiles into the same solid pits, never cutting the path between you and the boss (cap 14 fireball-holes).

Frozen build; sha256 in `../SHA256SUMS`.
