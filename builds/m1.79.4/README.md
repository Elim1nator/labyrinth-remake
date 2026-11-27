# Kersplat Labyrinth: The Descent — M1.79.4

Release build (no debug hook unless `?debug`); QA build in `../m1.79.4-qa/`.

## What changed since M1.79.3

Looking at the Basalt Heights map-edge pit ring no longer draws a stretched, streaky stone wall across the middle of the screen. Out-of-bounds used to be rendered as a solid wall sampled at a fixed texture column, which smeared one texel column across the view. On Heights there is no roof, so that fake wall filled the open sky.

The world edge on an open-sky floor now fades into fog and dark sky. A pit whose far side is past the map opens into that void, not a stone face. Interior Heights pits and regular falling pits are unchanged.

Frozen build; sha256 in `../SHA256SUMS`.
