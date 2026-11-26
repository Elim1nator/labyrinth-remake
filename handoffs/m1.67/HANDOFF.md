# M1.67 handoff

## What was wrong
Paying a coin door, then quitting and choosing CONTINUE, spawned the door locked and priced again. A second payment deducted coins for a room whose loot was often already taken (`coinTaken` from M1.66). Mr Playtest reproduced it on seed 9 L5 (paid 5 twice, got the red balloon once). See the M1.66 playtest notes (`logs/coindoor.json` baselinePaid).

The first payment can still be refunded on CONTINUE (the floor-start save still holds the pre-pay coin count). That leftover was not in scope. The approved fix is: the door stays open and is not charged again.

## The fix
- Paying a coin door calls `markCoinPaid()`, which sets `G.coinPaid` and writes `sv.coinPaid=levelIdx` next to `coinTaken`.
- `startLevel` restores the flag when `carry.coinPaid===idx`, then `applyPaidCoinDoors()` opens every remaining priced coin door, clears the price, and holds it open.
- The start-level save, the revive save, and the Music Box save all carry `coinPaid` when it is set. Music Box + `coinTaken` behaviour is unchanged.
- An old save with no `coinPaid` field loads as before: the door is locked and priced.

## Freeze
- Tests: **627/627** passed (30 retired pre-M1.23/M1.31 checks), including the official frozen QA build (`cd tests && npm test`).
- Release `builds/m1.67/index.html` 1708.5 KB (1,749,497 bytes), sha256 `6e4181ddeeded0103000668f75fb233a810148754edfa368309670176871de3b`.
- QA `builds/m1.67-qa/index.html` 1708.5 KB (1,749,495 bytes), sha256 `3ff0148624c9ab8d08e46027534787635cb5c1b996f975616462bcdaac2ee06f`.
- Base: main `6047c00a` (M1.66, after the Grok-Code-8/9 merge on top of the Debt Collector). Branch `Grok-Code-10`.
- No new PNGs. Screenshot of the open paid door after CONTINUE: `/workspace/labyrinth-main/m167/m167_paid_coindoor_continue.png`.
