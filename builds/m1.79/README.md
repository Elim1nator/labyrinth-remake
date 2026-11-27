# Kersplat Labyrinth: The Descent — M1.79

Release build (no debug hook unless `?debug`); QA build in `../m1.79-qa/`.

## What changed since M1.78

- Jacob's new **Skittering Creep** walk sheet (`creep_v3.png`, 563×128, 4 frames) replaces the M1.78 5-frame art. Frame boundaries were taken from the alpha columns (142 / 138 / 135 / 143 px, with 1–3 px gaps). Legs are uncropped. Frames are feet-centred on one baseline, horizontally centred, and padded so nothing touches a cell edge or bleeds into a neighbour. Packed 1:1 as `assets/mobs/creep.png` (four 147×132 frames, k 1.5). World height stays 0.30. The walk cycle is now **0-1-2-3**. Spawn and combat logic are unchanged.
- The Basalt Heights boss is renamed **the Awakened Basalt**. Player-facing name is `THE AWAKENED BASALT` (boss bar, intro `THE AWAKENED BASALT AWAKENS!`). Defeat banner: `THE BASALT IS DEFEATED! THE STAIRS APPEAR!` (42 characters). The internal type `deep`, the `DEEP` constants and the `deep*.png` file names are unchanged.
- Jacob's new Awakened Basalt art replaces the four existing boss sheets. Walk packs to `assets/mobs/deep.png` (four 107×208 frames). Idle, cast and attack pack to `deep_idle.png` (133×208), `deep_cast.png` (119×208) and `deep_attack.png` (201×208). Every pose and walk frame is feet-centred on the same baseline and horizontally centred, with a 2 px pad. Packed 1:1, k 1.6, world height still 1.08. The fireball is unchanged.

Frozen build; sha256 in `../SHA256SUMS`.
