# Kersplat Labyrinth: The Descent — M1.21

Release build (no debug hook unless `?debug`); QA build in `../m1.21-qa/`.

## What changed since M1.20

- The wall art now lives in `assets/walls.png` (a real PNG sprite sheet) and is embedded into this file at build time. The walls look exactly as in M1.20.
- To change a wall, edit the PNG and run `node tools/assets.mjs pack`; see `assets/README.md`.

Frozen build; sha256 in `../SHA256SUMS`.
