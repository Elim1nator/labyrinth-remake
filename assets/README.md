# Game art (PNG sheets)

The game draws its art from the PNG sheets in this folder. They're embedded into `src/index.html` (as base64), so the
game stays a single file that runs by double-click. **Edit the PNGs, never the long `var ASSETS=` line.**

## What's here

| File | What |
|---|---|
| `walls.png` | All 20 wall textures (see below). |
| `doors.png` | A door for each wall style, plus the gold lock for locked doors (see below). |
| `hand.png` | Your arm holding a balloon: 4 frames (idle, wind-up, throw, empty hand) for each of the 7 balloon colours, 100 x 80 each (the hand in the top-left 69 x 60, the sleeve running on to the bottom-right corner). |
| `boom.png` | Explosions: 4 frames of 32 x 32 (burst, fireball, peak, smoke). |
| `balloon.png` | The thrown balloon in each of the 7 colours, 12 x 14 each. |
| `items.png` | All item icons (run items, balloon colours, use-items), a grid of 24 x 24 tiles. |
| `mobs/<name>.png` | One file per monster or boss: its animation frames side by side, all the same width. |
| `boss/<name>.png` | Boss props and effects: portals, the lectern, signs, Hali, goo, the play script, and every projectile (`shot_*.png`). |
| `mods.png` | The power icons shown over Infernal mobs (16 x 16 tiles, order in `atlas.json` under `mods`). |
| `atlas.json` | Lists every file, the wall tile order, and each strip's frame count. |

## Editing the walls

`walls.png` is 1280 x 256: a grid of 10 x 2 tiles, each 128 x 128 pixels (64 x 64 before M1.51), in this order:

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
- The shaded side of each wall, the pillar and rune variations, cracks and dents are made in code from your
  tile, so they follow your edits automatically.
- The order of the tiles is fixed (the maps refer to them by position). `atlas.json` lists the names.
- `node tools/assets.mjs check` tells you if `src/index.html` is out of date; `node tools/release.mjs ...` always packs
  first, so a frozen build never has stale art.
- `node tools/assets.mjs export walls` (or `export all`) rewrites a PNG from the art the game has loaded (needs the
  test dependencies: `cd tests && npm install`).
- Any PNG your editor saves is fine (palette, RGB, RGBA, greyscale; not interlaced). `pack` converts it for the game.

## Editing the doors

`doors.png` is 384 x 192: a grid of 6 x 3 tiles, 64 x 64 each, in this order: brick, stone, wood, tile, moss, basalt, rust, slate, glyph, ember, sandstone, granite, cobble, limestone, dripstone, shale, ironbound, lock (the same names as the wall tiles; the list is in `atlas.json`).

- Each door tile is the door leaf: paint it inside the box x 6-57, y 7-63. The game stretches that box to fill the whole door (M1.37), so nothing outside it shows; leave the rest see-through. A door takes the style of the wall cell next to it.
- `lock` is laid over a door to make the locked version (the gold plate, keyhole and bands). Paint only the lock; everything else stays see-through.
- Then run `node tools/assets.mjs pack`.

## Editing the arm and balloons

Every balloon colour is its own art, in this order: **blue, red, green, yellow, black, purple, pink**.

- `hand.png` is 2800 x 80: 28 frames of 100 x 80 side by side (the hand sits in the top-left 69 x 60; let the sleeve run off the bottom-right corner), 4 per colour in that order - idle (holding the balloon), wind-up,
  throw (open hand, balloon gone), empty hand. So frames 1-4 are the blue balloon, 5-8 red, and so on. The empty-hand and throw
  frames are the same for every colour unless you change them.
- `balloon.png` is 84 x 14: 7 frames of 12 x 14, one balloon per colour in the same order. It is the balloon you throw and the
  HUD icon.
- The arm is drawn at 2x on screen, anchored at the bottom right; keep it reaching off the bottom-right corner.
- Then run `node tools/assets.mjs pack`.

## Editing boss props, portals and projectiles

Each `boss/*.png` is a strip of frames like the monsters:

| File | What | Frames |
|---|---|---|
| `portal.png` | the green EXIT sign hanging from the ceiling over the stairwell (36 x 15 frames with its chains; the stairs themselves are drawn in code, M1.41) | 4 |
| `portalS.png` | the red EXIT sign while a boss lives (36 x 15) | 2 |
| `lectern.png` | the King in Yellow's lectern (unlit, lit) | 2 |
| `ysign.png` | the Yellow Sign he scrawls | 2 |
| `hali.png` | the mist of Lake Hali | 2 |
| `goo.png` | goo puddles (slime-trail elites) | 2 |
| `groundCrack.png` | the Treasure Knight's slam crack | 1 |
| `script.png` | the torn play script (the pickup token is made from it) | 1 |
| `shot_*.png` | projectiles: Infernal shots (arrow, fireball, skull, potion), boss shots (porb and bigorb = the Screamer King's purple orbs, gloop, sock, gear, goldball, web, egg, rag, sun) and elite shots (steam, zap, laser, sonic, wisp, fluff) | 1 |

## Editing item icons

`items.png` is 240 x 96: 10 icons per row, each 24 x 24 pixels, in the order listed under `items`
in `atlas.json` (shoes, dumbbell, burger, ... red, green, yellow, black, purple, pink, herb, bell,
flare, freeze, firecracker, veil, trowel, plunger, spirit, musicbox). Draw on a transparent background. The round pickup tokens on the floor,
the small HUD and shop icons, and their coloured rims are made in code from your icon. What each
item does lives in the game (`ITEMS`, `ITEM_FX`, `PU`), not in the PNG.

## Editing monsters and bosses

Each `mobs/*.png` is a strip of animation frames, left to right, all the same width:

| File | Who | Frames |
|---|---|---|
| `screamer.png`, `screamerO.png` | Screamer (normal / mouth open while screaming) | 4 wing flaps each |
| `springle.png`, `kettle.png`, `wisp.png`, `clunk.png`, `skeleton.png` | Springle, Kettlegrump, Hazewisp, Clunkbot, Rattlebone | 4 |
| `lichen.png` | the Lichen Face (5-frame tendril-wave / float loop) | 5 |
| `bather.png` | the Bather (4-frame marble statue walk loop) | 4 |
| `slickman.png` | the Slick Man (5-frame hunched walk loop; former Bather art) | 5 |
| `rafterdoll.png` | the Rafter Doll (2-frame scurry loop) | 2 |
| `hexeye.png` | the Hexeye (open, half-blink, closed, red stare) | 4 |
| `zapfly.png`, `zapflyC.png` | Tragedy mask, Comedy mask | 4 |
| `bonePile.png` | Rattlebone's collapsed pile (resting, rattling) | 2 |
| `knight.png` | Treasure Knight (stand/walk, walk, shield up, charge, sword raised) | 5 |
| `skitter.png`, `bigspider.png` | pit spiders (walk cycle) | 4 |
| `eggsac.png` | egg sac, growing until it hatches | 4 |
| `worm.png` | googly worm, drawn in pink `#ff5a8a` (see below) | 4 |
| `faceSpider.png` | the spider sprawled over your face (full-screen overlay) | 2 |
| `king.png` | the Screamer King: 4 wing flaps, then the same 4 with his mouth open (an orb glowing) | 8 |
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

- `mobs/mortar.png` (M1.53): the Mortared Man, 3 frames of 96 x 96 (shut, opening, open). It is drawn onto the wall surface, not as a standing sprite.
- `mobs/bather.png` (M1.57, recut M1.58): the Bather, 4 walk frames at 120 px tall, cut from the supplied statue sheet (gutters cropped, feet-centred and bottom-aligned so the walk does not wobble, fringe cleaned; corners fully transparent).
- `mobs/slickman.png` (M1.57): the Slick Man, the earlier 5-frame hunched walk sheet (also 120 px tall, transparent corners).
- `mobs/rafterdoll.png` (M1.62): the Rafter Doll, 2 walk frames at 120 px tall, cut from the supplied sheet (white background flood-filled out from the edges, black outline kept, feet-centred and bottom-aligned; corners fully transparent).
- `items.png` (M1.62): Music Box icon added in the next free 24 x 24 slot after the Spirit Slate.
- `mobs/gargoyle.png` (M1.63): the Weeping Gargoyle, 3 frames of 72 x 108 (asleep, awake, screaming); frame 1 is also the statue decoration.
- `mobs/collector.png` (M1.65): the Debt Collector, 3 walk frames of 64 x 112 (feet on the bottom), cut from the supplied sheet.
- `walls.png` (M1.68): a third row with the Icy Prison walls (icetile, frostwall, icebrick) in its first three slots; the sheet is 1280 x 384.
- `mobs/icewiz.png` (M1.69): the Ice Wizard, 5 frames of 84 x 104 (cast, then 4 walk); `mobs/icespike.png`: his ice spike, 48 x 48; `boss/shot_iceorb.png` / `shot_icebig.png`: his orbs; `items.png` gained a fifth row for the Frozen Wand.
- `mobs/snowman.png` (M1.70): the Snowman, 3 frames of 108 x 100 at the supplied size (walk, wind-up, throw); `boss/shot_snowball.png`: his snowball.
