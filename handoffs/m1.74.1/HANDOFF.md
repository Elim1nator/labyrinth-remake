# M1.74.1 handoff

Fixes for Mr Playtest's M1.73.1 list (`BRIEF.md`), built on main at M1.74 (`cbdfb5f`), which already includes M1.73.1. Branch `claude/elegant-cannon-12xhhm`.

## What was wrong

1. **Double coins (blocker).** The floor save is a floor-start snapshot, and CONTINUE replays the floor with every coin back on the ground. M1.73.1 wrote your *current* coin total into it when you paid a coin door, so coins you had already picked up came back on top of that total. M1.74 did the same for Ferryman payouts, Master Key / key unlocks and the Music Box.
2. **Debt Collector coins.** That same total also recorded any coins stolen before the payment, so CONTINUE no longer restored them.
3. **Small refund.** Shop buys and the Mystery Box subtracted the price from the saved floor-start coins but clamped at 0. If the price was more than you started the floor with, CONTINUE gave the difference back.
4. **Score board.** Any failed load set the session cache flag, so the board stayed local until a page reload.
5. **Ice Spike.** It aims 1.2 cells behind you. With a wall behind you, that spot is inside the wall, so the spike slid onto your own position (0.03 cells away). A balloon starts 0.25 cells ahead and moves before its first hit check, so it flew straight past.
6. **This version.** The board asked for the top 50 and filtered on the client.

## The fix

- **Coins:** the save keeps the floor-start `coins`. Changes that CONTINUE keeps go in `sv.coinAdj`: coin door price, Ferryman +3, shop run items, permanent buys, the Mystery Box, claimed coin-room bags (+10) and maxed coin-room items (+5), and the revive cost (the revive save used to write the current total too). CONTINUE gives `coins + coinAdj - coinDebt`. Below 0, you start at 0 and owe the rest (`sv.coinDebt`, message "THE NEXT N COINS YOU FIND ARE OWED"), repaid by the next floor coins and non-loot coin bags you pick up. Leaving the floor drops the debt, because those coins were already spent. Old saves without the new fields load as before. This fixes 1, 2 and 3.
- **Score board:** a failed load (unreachable, error, 404, 429 on GET or POST) is retried on a later open, at most once a minute (`HS_RETRY_MS`). A retry is 2 requests (health + scores), inside the live 5 a minute. A successful load is still cached for the page load.
- **This version:** GET asks for `limit=100`, the API maximum. **Only partly fixed.** The API has no version filter, so a version with few rows in the top 100 can still show fewer than 10. A full fix needs a `version` parameter on the score API.
- **Ice Spike:** it aims for the open spot nearest to straight behind you (with a clear line from you) and never comes closer than 0.5 cells (`ICEWIZ.spikeMin`). Its bite still reaches 0.6.

## Freeze

- Tests: `cd tests && npm test` on the frozen QA build: **682/683** passed (30 retired pre-M1.23/M1.31 checks). Six new M1.74.1 checks all pass. Against the unchanged M1.74 code, the five gameplay ones fail. The coin check reproduces the blocker there: 58 coins at CONTINUE, 81 after collecting again.
- The one failure is `A1 touch START: fullscreen requested once`. It is an existing flaky check: the emulated tap on START is sometimes missed and the game stays on the title. Rerun on its own 5 times each: M1.74.1 passed 3 of 5, the unchanged M1.74 passed 2 of 5. M1.74.1 does not touch the title, touch input or fullscreen code.
- Release `builds/m1.74.1/index.html` 1883.6 KB (1,928,798 bytes), sha256 `d5504358ad6a680083e1a27a02210d996e017d24631fb0a633bdeaea4c424ba5`.
- QA `builds/m1.74.1-qa/index.html` 1883.6 KB (1,928,794 bytes), sha256 `a7c6a6f5baed72cb3373f5a215b61ad195452c4c9ad793041d81034ca16a174c`.
- No new art.

## Repro for Mr Playtest

**Double coins / refunds**

1. Start a floor that has a coin door. Pick up every coin on the floor, note your total, then pay the door.
2. Quit to the title and press CONTINUE. You should have your floor-start coins minus the door price.
3. Pick up the floor's coins again. Expected: the same total you had right after paying, not more. CONTINUE again: same result.
4. Let a Debt Collector take coins, then pay a door and CONTINUE. Expected: the stolen coins are back (floor-start coins minus the door).
5. Start a floor with fewer coins than a door or shop item costs, collect enough and buy it, then CONTINUE. Expected: 0 coins and "THE NEXT N COINS YOU FIND ARE OWED". The first N coins you pick up do not count, then coins count normally.

**Score board:** with the board offline or rate-limited, open HIGH SCORES (local board). Close it and open it again within a minute: no new request. After a minute, opening it tries the online board again.

**Ice Spike:** on an Icy Prison floor, back against a wall while the Ice Wizard's spikes chase you. They should hover at least half a tile away and die to a balloon thrown at them.

## Known issues

- This version can still show fewer than 10 rows (needs a server-side version filter, see above).
- `A1` fullscreen touch check is flaky, unrelated to this release.
