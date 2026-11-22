# Labyrinth Remake — M1.9.1 prototype (placeholder title)

A single-file browser maze shooter, inspired by early-90s maze shooters. Open `index.html` in a browser.
This is the **release** build: it exposes no debug hook unless the URL has `?debug`. The QA build (hook always on) is `../m1.9.1-qa/`.

## What changed since M1.9

A bug-fix release for the two known issues listed in M1.9.

- **The shop panel no longer covers the HUD.** It now sits below the hearts/coins panel and to the right of the item bar. While it is open, hearts, coins, keys, the balloon type and the item slots stay at full brightness, so you can see what you can afford and what you hold. The minimap is hidden behind the panel while you shop.
- **No decoration sits diagonally next to a door.** The last-resort placement for small rooms ringed by doors used to check only the four side cells. It now checks the diagonals too.
  - In 300 seeds × 9 floors, M1.9 put 83 of about 32,000 decorations diagonally next to a door; M1.9.1 puts none.
  - A tiny start room that is ringed by doors and has no clear cell now stays bare (about 1 in 3,500 rooms). You start in it, so it is never an empty room you walk into.
  - Walls, doors, keys, the exit, shops, slot machines, pits and secret rooms are the same as in M1.9 for every seed. On about 1 floor in 70 the changed placement shifts a few room-filler mobs, coins or a heart to other cells (the placement shares one random stream).

Frozen build; sha256 in `../SHA256SUMS`.
