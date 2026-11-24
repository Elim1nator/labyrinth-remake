# Kersplat Labyrinth: The Descent — M1.22

Release build (no debug hook unless `?debug`); QA build in `../m1.22-qa/`.

## What changed since M1.21

- Monster and boss art now lives in `assets/mobs/*.png` (one strip of animation frames per creature) and is embedded into this file at build time. Everything looks exactly as in M1.21.
- To change a monster, edit its PNG and run `node tools/assets.mjs pack`; see `assets/README.md`.

Frozen build; sha256 in `../SHA256SUMS`.
