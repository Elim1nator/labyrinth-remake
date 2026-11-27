# Kersplat Labyrinth: The Descent — M1.79.2 (QA)

QA build (`QA_BUILD=true`, debug hook on). Release build in `../m1.79.2/`.

## What changed since M1.79.1

On Basalt Heights, the solid pit cells that replace walls and the holes the Awakened Basalt's fireballs burn in the floor now use the existing regular-pit shaft renderer (the same path as falling Basalt pits). They are square cell-shaped openings with visible inner shaft walls, stone texture, shading and depth fade, and neighbouring pit cells merge. They are no longer flat dark ellipses.

When a fireball converts a floor tile it becomes a regular pit visually at once (the existing explosion flash is the transition). The no-ceiling fog sky, movement blocking, no-fall rule, connectivity guard and 14-hole cap are unchanged. Creeps still climb out of the pits.

A full Heights floor of pit cells on a phone-sized canvas went from 1.55 ms/frame to 2.45 ms/frame in headless Chromium, still well under a 60 fps budget.

Frozen build; sha256 in `../SHA256SUMS`.
