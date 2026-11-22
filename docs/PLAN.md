# Labyrinth Remake: plan

An original first-person maze shooter for the browser by Eliminator Productions, inspired by
early-90s maze shooters. This is the public summary of the project plan; the research notes
on the inspiration are kept out of this repository.

## Pillars

- **Feel of a classic raycaster:** grid mazes, keys and doors, visible dodgeable projectiles,
  coins and a luck minigame, timed power-ups, a light-hearted, non-gory tone.
- **Everything original:** title, protagonist, every enemy and item design, textures,
  sprites, UI, sound and level layouts. Enemy designs get an originality check before they go in.
- **Modern comforts:** minimap and full map, auto-save per floor, mouse look and pitch,
  gamepad and touch controls, landscape-only phone layout with no overlapping UI.

## Tech approach

- **One self-contained HTML file:** all JS, CSS, generated assets and the web manifest inline;
  no external requests.
- **Canvas 2D software raycaster** into a low-res `ImageData` buffer (320×200 in M1, 480×300
  from M1.3), scaled with `image-rendering: pixelated`:
  - DDA wall casting with a z-buffer
  - see-through fences and sliding doors
  - billboard sprites
  - fog shading and pitch via y-shearing
- **Fixed-timestep logic,** decoupled from rendering.
- **Assets generated in code at startup:**
  - procedural wall textures
  - hand-made palette-indexed pixel art
  - a pixel font
  - WebAudio-synthesised sound effects
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
| Next | planned | More weapon families, shop machine, music, further polish |

## Risks we watch

- Staying clearly original (no borrowed names, art, sound or data).
- Phone performance and touch feel.
- iOS quirks: audio unlock, fullscreen, gamepad.
- File size budget.
- Keeping the slot machine coin-only with printed odds.
