# Kersplat Labyrinth: The Descent — M1.75.1

Release build (no debug hook unless `?debug`); QA build in `../m1.75.1-qa/`.

## What changed since M1.75

- The Rattle Sovereign's scattered small piles now use the regular Rattlebone `bonePile` sprite and scale. Smash and 4.5 s rebuild behaviour is unchanged. `sovpile.png` stays in the repo but is no longer packed.
- Wall textures already mapped `u` in 0–1 per cell (all 20 wall styles are 128×128). A regression test now fails if a long wall face stretches one copy of a tile across several cells, including the Basalt Depths moss wall from Jacob's Level 10 report. M1.75 builds are left intact.

Frozen build; sha256 in `../SHA256SUMS`.
