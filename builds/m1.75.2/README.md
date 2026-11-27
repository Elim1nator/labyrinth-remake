# Kersplat Labyrinth: The Descent — M1.75.2

Release build (no debug hook unless `?debug`); QA build in `../m1.75.2-qa/`.

## What changed since M1.75.1

- The Basalt Depths moss wall tile (the vine-covered stone in `assets/walls.png`) now tiles left to right without a cut-off block, a doubled joint or a sheared vine at the wrap. Block joints sit at even spacing, with one mortar line at the tile edge. The look, palette and 128×128 size are unchanged. Other wall tiles were checked for the same kind of horizontal seam; none were clearly broken. The wall renderer is unchanged. M1.75 and M1.75.1 builds are left intact.

Frozen build; sha256 in `../SHA256SUMS`.
