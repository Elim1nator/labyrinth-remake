# Labyrinth Remake — M1.7 prototype (placeholder title)

A single-file browser maze shooter, inspired by early-90s maze shooters. Open `index.html` in a browser; no network access needed.
This is the **release** build: it exposes no debug hook unless the URL has `?debug`. The QA build (hook always on) is `../m1.7-qa/`.

## What changed since M1.6
- Elite modifier icons sit in the space above the mob (shrunk to fit). When there isn't room, or that spot is off-screen, they stack beside the mob, outside its glow. They are never drawn over the sprite, so a BEEFY Hazewisp's eyes stay visible.
- `window.__game` only exists with `?debug` (release) or in the QA build.
- The RANGED colour is a lighter red-pink (#ff6a7a), about 2.9:1 against red brick (was 2.2:1).
- Level 3 is never easier than level 2 for the same seed, in both total and elite-adjusted mob HP. If needed, weak mobs on L3 become Kettlegrumps, and very rarely one extra Kettlegrump is added.
- Phone: in the top strip, only the HUD panel, item bar, minimap and buttons ignore touches. Drags starting anywhere else there work for the stick and look as normal.
- Screamer ears are about 30% thicker, with a wider wingbeat (0.40 rad). The face is unchanged.

Controls are as in M1.6 (WASD + mouse, Space/Ctrl/click to throw, E use, Q item, M/Tab map, Shift+M minimap, P/Esc pause; gamepad; touch).
Frozen build; sha256 in `../SHA256SUMS`.
