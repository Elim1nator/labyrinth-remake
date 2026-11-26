# M1.66 review

Checks to confirm after freeze:

- The Jailer's Eye appears only on Stone Keep floors, at most once per floor, and on well under half of them (measured 16/199 = 8.04% on seeds 1–200 × L2–24; 0 off-theme, 0 doubles). It is a run item (passive, lasts the run, max 1). The slot machine does not drop it.
- Without the Eye, fences stay closed. With it, walk or USE opens a fence like a door (same 1.8/s animation), the band says THE FENCE YIELDS!, and the fence stays open. CONTINUE keeps opened fences open. The HUD message sits in the band, clear of the touch buttons.
- On every boss floor (Screamer King, Luggernaut, Masque, Broodmother, King in Yellow, Coghoot) across several seeds, mid cut-scene has a clear raycast to the boss and the boss is on screen. Fog is lifted during the intro and the exact previous fog (including a Slick Man + Glasses clamp) is restored on the first play frame.
- After the Music Box opens a coin door and the reward is taken, quitting and CONTINUE several times does not respawn that loot. Doll balance is untouched.
- A score POST to relative `/api/labyrinth/scores` is `{name,score,floor,seed,version}` with this build's version (e.g. M1.66). GET stays `?limit=N`. A 404 or fetch error shows the local top 10. The board toggle filters All versions vs This version; old rows with no version are unknown. Tests mock fetch only — never post to the live board.
- Untouched: Music Box drop rate, boss-floor seals, seed 138 L7 skeleton, Rafter Doll size and bite.
