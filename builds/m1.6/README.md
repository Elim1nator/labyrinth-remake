# Labyrinth Remake — M1.6 prototype (placeholder title)

A single-file browser maze shooter, inspired by early-90s maze shooters. Open `index.html` in a browser; no network access is needed.

## What changed since M1.5
- **QA fixes:**
  - Gamepad A or RT held while closing the map or choosing RESUME no longer throws. The press is ignored until you let go.
  - Holding Space through a map close no longer throws.
  - Hiding the minimap with Shift+M is saved in settings.
  - Coins and power-ups from an elite that dies inside a fence cell land in the nearest walkable cell.
  - The Giant Balloon splash no longer hits through walls, closed doors or fences.
  - A `?seed=` link with the same seed as your save keeps CONTINUE selected.
- **Screamer:** the ears are now one wide bat-wing wedge per side. The top edge carries on from the top of the head and flares up and out to a blunt point, with a dark hollow, and the ears still flap. The face (eyes, mouth, colours) is unchanged.
- **Balance:**
  - Level 3 always has a Kettlegrump and 8 mobs, so it's tougher than level 2.
  - Elites with two modifiers phase in: 50% on level 6, 75% on level 7, 100% from level 8.
- **Phone:** the pause button sits in the HUD strip right of the item bar, and MAP sits under the message band, left of the minimap. A touch that starts in the HUD strip never starts the stick or a look drag.
- **Elite readability:**
  - The modifier icons have a thick dark border and grow with distance (about 18 px tall at 6 cells).
  - The glow has a dark frame, gets wider when far away and fades less in fog.
  - RANGED is now crimson, FAST a lighter cyan, and REGEN mint (no longer pink like the Hazewisp).

## Controls
- **Keyboard and mouse:**
  - WASD to move, mouse to look.
  - Space, Ctrl or click to throw. E to use, Q to use your item.
  - M or Tab for the map, Shift+M to hide the minimap.
  - P or Esc to pause, N for sound, C to recentre.
- **Gamepad:** standard layout.
- **Touch:** stick on the left, look on the right, plus THROW, USE, ITEM, MAP and pause buttons.

Frozen build; sha256 in `../SHA256SUMS`.
