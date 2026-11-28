# Kersplat Labyrinth: The Descent — M1.79.7

Release build (no debug hook unless `?debug`); QA build in `../m1.79.7-qa/`.

## What changed since M1.79.6

The Treasure Knight uses Jacob's new idle, walk, attack and guard art, packed at native pixel size into one 16-frame sheet. Idle is a slow 2-frame loop, walk is an 8-frame cycle, the ground slam plays a 5-frame attack timed to the existing 1.2 s tell, and his shield-up state uses the new guard pose. World height is unchanged; a shared foot baseline keeps him from jittering or floating.

Frozen build; sha256 in `../SHA256SUMS`.
