# Kersplat Labyrinth: The Descent — plan

An original first-person maze shooter for the browser by Eliminator Productions, inspired by
early-90s maze shooters. This is the public summary of the project plan; the research notes
on the inspiration are kept out of this repository.

## Pillars

- **Feel of a classic raycaster:** grid mazes, keys and doors, visible dodgeable projectiles,
  coins and a luck minigame, stacking run items, a light-hearted, non-gory tone.
- **Everything original:** title, protagonist, every enemy and item design, textures,
  sprites, UI, sound and level layouts. Enemy designs get an originality check before they go in.
- **Modern comforts:** minimap and full map, auto-save per floor, mouse look and pitch,
  gamepad and touch controls, landscape-only phone layout with no overlapping UI.

## Tech approach

- **One self-contained HTML file:** all JS, CSS, packed PNG art, synthesized audio and the web
  manifest inline; no external requests.
- **Canvas 2D software raycaster** into a low-res `ImageData` buffer (320×200 in M1, 480×300
  from M1.3), scaled with `image-rendering: pixelated`:
  - DDA wall casting with a z-buffer
  - see-through fences and sliding doors
  - billboard sprites
  - fog shading and pitch via y-shearing
- **Fixed-timestep logic,** decoupled from rendering.
- **Art and audio:**
  - From M1.21, wall, monster, boss, projectile and item art lives as PNG sheets in `assets/`
    and is embedded by `tools/assets.mjs pack` (releases pack automatically). Variations,
    shading, cracks and some HUD or decoration sprites are still derived in code.
  - A pixel font and WebAudio-synthesised sound effects and music are generated at startup.
- **Levels:**
  - floor 1 is hand-built
  - floors 2+ use seeded "Rooms and Mazes" generation ([research/procgen.md](research/procgen.md)), verified solvable by tests
- **Tests:**
  - Playwright headless Chromium drives the build through a `window.__game` test hook, which only exists in QA builds or with `?debug`
  - checks: game state, layouts at many phone and desktop sizes, console errors, network isolation

## Milestones

| # | Status | Contents |
|---|---|---|
| M0 | done | Concept art (see `concepts/`) |
| M1–M1.2 | done | First playable, input fixes, pitch, hand frames, Screamer |
| M1.3–M1.9 | done | Procedural floors, new mobs, elites and power-ups, balance, endless floors, score, high scores, slot machine, shop, pits, Rattlebone (see [CHANGELOG.md](CHANGELOG.md)) |
| M1.9.1 | done | Fixes for the M1.9 known issues, release tooling |
| M1.10 | done | Bosses every 5th floor: King Gloop, Luggernaut, Coghoot; the portal opens when the boss falls |
| M1.11–M1.23 | done | Treasure Knight, masks, coin pits and shrines, King in Yellow, fog of war, cheat console, music, revive, item revamp (run items, balloon colours, use-items); world art moves to PNG sheets (see [CHANGELOG.md](CHANGELOG.md)) |
| M1.24 | done | Boss props, portals and projectiles also packed from `assets/boss/*.png` |
| M1.25–M1.31 | done | Hand-made wall and item art, the Screamer King, Infernal mobs and status effects, start floors, less backtracking (see [CHANGELOG.md](CHANGELOG.md)) |
| M1.32–M1.48 | done | Further items, monsters, art and fixes, including the Hexeye and pit rooms (see [CHANGELOG.md](CHANGELOG.md)) |
| M1.49–M1.51 | done | New wall art (128x128 tiles) and the transparent fence. |
| M1.52 | done | Mourner's Veil and the Lichen Face in the Mossy Cellar (merged from Grok-Code-3). |
| M1.53 | done | Brick Halls: the Masonry Trowel and the Mortared Man. |
| M1.54 | done | Mortared Man art from the supplied sheet. |
| M1.55 | done | Mortared Man recoloured to match the bricks. |
| M1.56 | done | Infernal Mounted modifier (riders) removed. |
| M1.57 | done | Tiled Baths: the Plunger and the Bather (statue art, pool-blue puddles); Slate Halls: the Slick Man. |
| M1.58 | done | Guaranteed minimum of theme mobs (1, or 2 from floor 5) after later swaps; Bather walk centred and sped up. |
| M1.59 | done | The Spirit Slate and the item screen (I). Current release is M1.59. |
| Next | planned | More weapon families, further polish |

## Risks we watch

- Staying clearly original (no borrowed names, art, sound or data).
- Phone performance and touch feel.
- iOS quirks: audio unlock, fullscreen, gamepad.
- File size budget: 2 MB cap from M1.47 (1 MB from M1.21); the M1.59 release build is about 1.5 MB.
- Keeping the slot machine coin-only with printed odds.
