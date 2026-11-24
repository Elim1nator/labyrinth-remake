# Game art (PNG sheets)

The game draws its art from the PNG sheets in this folder. They're embedded into `src/index.html` (as base64), so the
game stays a single file that runs by double-click. **Edit the PNGs, never the long `var ASSETS=` line.**

## Editing the walls

`walls.png` is 640 x 128: a grid of 10 x 2 tiles, each 64 x 64 pixels, in this order:

| Row | Tiles (left to right) |
|---|---|
| 1 | brick, stone, wood, tile, moss, door, locked door, fence, basalt, rust |
| 2 | slate, glyph, ember, sandstone, granite, cobble, limestone, dripstone, shale, ironbound |

1. Open `walls.png` in any pixel editor (Aseprite, Photoshop, GIMP, Piskel...). Paint inside a tile; keep the sheet size.
2. Run `node tools/assets.mjs pack` to embed it into `src/index.html`.
3. Open `src/index.html` in a browser to see it (type `cheat`, then `jump 29` and so on, to visit the deep floors).

Notes:
- Keep pixels fully opaque, except where you want to see through (only the fence uses transparency). Pixels under
  50% alpha are treated as see-through, the rest as solid.
- The shaded side of each wall, the damaged / pillared / torch variations, cracks and dents are made in code from your
  tile, so they follow your edits automatically.
- The order of the tiles is fixed (the maps refer to them by position). `atlas.json` lists the names.
- `node tools/assets.mjs check` tells you if `src/index.html` is out of date; `node tools/release.mjs ...` always packs
  first, so a frozen build never has stale art.
- `node tools/assets.mjs export walls` rewrites `walls.png` from the art the game has loaded (needs the test
  dependencies: `cd tests && npm install`).
