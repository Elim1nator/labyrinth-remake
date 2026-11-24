# Game art (PNG sheets)

The game draws its art from the PNG sheets in this folder. They're embedded into `src/index.html` (as base64), so the
game stays a single file that runs by double-click. **Edit the PNGs, never the long `var ASSETS=` line.**

## What's here

| File | What |
|---|---|
| `walls.png` | All 20 wall textures (see below). |
| `mobs/<name>.png` | One file per monster or boss: its animation frames side by side, all the same width. |
| `atlas.json` | Lists every file, the wall tile order, and each strip's frame count. |

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
- `node tools/assets.mjs export walls` (or `export all`) rewrites a PNG from the art the game has loaded (needs the
  test dependencies: `cd tests && npm install`).
- Any PNG your editor saves is fine (palette, RGB, RGBA, greyscale; not interlaced). `pack` converts it for the game.

## Editing monsters and bosses

Each `mobs/*.png` is a strip of animation frames, left to right, all the same width:

| File | Who | Frames |
|---|---|---|
| `screamer.png`, `screamerO.png` | Screamer (normal / mouth open while screaming) | 4 wing flaps each |
| `springle.png`, `kettle.png`, `wisp.png`, `clunk.png`, `skeleton.png` | Springle, Kettlegrump, Hazewisp, Clunkbot, Rattlebone | 4 |
| `zapfly.png`, `zapflyC.png` | Tragedy mask, Comedy mask | 4 |
| `bonePile.png` | Rattlebone's collapsed pile (resting, rattling) | 2 |
| `knight.png` | Treasure Knight (stand/walk, walk, shield up, charge, sword raised) | 5 |
| `skitter.png`, `bigspider.png` | pit spiders (walk cycle) | 4 |
| `eggsac.png` | egg sac, growing until it hatches | 4 |
| `worm.png` | googly worm, drawn in pink `#ff5a8a` (see below) | 4 |
| `faceSpider.png` | the spider sprawled over your face (full-screen overlay) | 2 |
| `king.png` | King Gloop (rest, squash, airborne, rest 2) | 4 |
| `owl.png`, `brood.png`, `yellow.png` | Coghoot, the Broodmother, the King in Yellow | 4 |
| `lugg.png` | Luggernaut, two frames each with a stack of 3, 2, then 1 suitcase | 6 |
| `masque.png`, `masqueH.png` | the Grand Masque (tragedy face / comedy face) | 4 |

1. Edit the PNG. Keep the number of frames; the background must be transparent.
2. `node tools/assets.mjs pack`, then open `src/index.html`. Type `cheat` for the console to jump to a floor.

Notes:
- You can redraw a monster at a higher resolution: the game sizes sprites by their height in the world and keeps
  your width-to-height ratio. Keep every frame the same size and the creature standing on the bottom edge.
- `k` in `atlas.json` is the strip's detail scale; leave it as it is.
- Worms come in 8 colours made from `worm.png`: pixels in exactly `#ff5a8a`, its 70% shade and its 40%-white
  highlight are swapped for each colour. Other colours (eyes, outline) stay as drawn.
- Elite glows, freeze tints, hit flashes and the balloon colours are made in code from your frames.
- A missing or broken file shows that monster as a magenta check instead of crashing; `pack` tells you what's wrong.
