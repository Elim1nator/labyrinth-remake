# Kersplat Labyrinth: The Descent — M1.74.1

Release build (no debug hook unless `?debug`); QA build in `../m1.74.1-qa/`.

## What changed since M1.74

Playtest fixes for M1.73.1 (M1.74 already includes M1.73.1).

- **No double coins on CONTINUE.** The save keeps the coins you started the floor with, plus the coin changes that CONTINUE keeps (paid doors, the Ferryman, shop buys, the Mystery Box, coin-room loot, revives). Picking up a floor's coins, paying a door and pressing CONTINUE no longer lets you collect those coins twice.
- **Debt Collector coins come back on CONTINUE**, even after you pay a door.
- **No small refund** when a door, shop item or Mystery Box cost more than your floor-start coins: CONTINUE starts you at 0 and the next coins you find repay the rest ("THE NEXT N COINS YOU FIND ARE OWED").
- **Score board retries.** After a failed load, a later open tries the online board again, at most once a minute. The board asks for the top 100 (was 50) for the This version filter.
- **Ice spikes keep off you.** With a wall behind you a spike no longer slides onto your spot; it stays at least half a tile away, so balloons hit it.
- Old saves still load.

Frozen build; sha256 in `../SHA256SUMS`.
