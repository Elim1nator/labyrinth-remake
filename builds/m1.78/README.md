# Kersplat Labyrinth: The Descent — M1.78

Release build (no debug hook unless `?debug`); QA build in `../m1.78-qa/`.

## What changed since M1.77

- Jacob's new **Debt Collector** walk sheet replaces the old 192×112 art. The 225×128 source already has real transparency; frame boundaries were taken from the alpha columns (69 / 70 / 69 px). Frames are feet-centred on one baseline, horizontally centred, and padded so the hood and robe never touch a cell edge. Packed 1:1 as `assets/mobs/collector.png` (three 75×132 frames, k 1.5). Walk is still the ping-pong 0-1-2-1. Idle and paid-off poses now use the planted mid frame. Behaviour and on-screen height (`h` 0.62) are unchanged.
- Jacob's new **Skittering Creep** walk sheet replaces the old 340×52 art. The 926×128 source already has real transparency; frame boundaries were taken from the alpha columns (169 / 171 / 171 / 173 / 170 px, with 17–20 px gaps). Legs and antennae are uncropped. Frames are feet-centred on one baseline, horizontally centred, and padded so nothing touches a cell edge or bleeds into a neighbour. Packed 1:1 as `assets/mobs/creep.png` (five 177×132 frames, k 1.5). World height stays 0.30. The walk cycle is still 0-1-2-3-4; spawn and combat logic are unchanged.

Frozen build; sha256 in `../SHA256SUMS`.
