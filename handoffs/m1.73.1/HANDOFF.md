# M1.73.1 handoff

## What was wrong

1. **Paid coin door refund.** M1.67 already saved `coinPaid` and restored the door as open on CONTINUE, so you were not charged a second time. The floor-start save still held the *pre-payment* coin count. CONTINUE loaded that older total, so the first payment came back once per floor. Repro (same as M1.66/M1.67 playtest): seed 9, floor 5, a 5-coin door.

2. **Score board rate limit.** The live API is nginx-limited to 5 requests a minute per IP (burst 5), and GETs count. Opening the board always called `hsLoad()`, which did GET `/health` and GET `/scores`. Re-opening the board therefore spent those slots. A 429 on POST stayed on name entry and offered a retry (`retry:true`).

## The fix

- Paying a coin door still calls `markCoinPaid()`, which writes `sv.coinPaid=levelIdx`. It now also writes `sv.coins` as the post-payment total (`G.p.coins`) at that same moment. CONTINUE keeps the door open, does not refund the payment, and does not charge again. Music Box and `coinTaken` behaviour is unchanged. An old save with no `coinPaid` field still loads with the door priced. There is no Ferryman's Coin (or any other coin-door payout) on this baseline.

- The leaderboard GET is cached for the page session (`HS.fetched`). The first open fetches once; re-opening the board, and the All/This version toggle, reuse the cached rows and filter them on the client. A successful score POST may re-read the board once. A 429 on GET or POST falls back to the local top-10 board, the same way a 404 or other error already did, and does not retry in a loop. A 429 on POST still keeps the local save (`localAdd`), then shows the local board.

## Freeze

- Tests: **652** checks in `tests/m1.test.mjs` for this build (30 retired pre-M1.23/M1.31 checks). Official `cd tests && npm test` against the frozen QA build: all new M1.73.1 checks passed. One official full run was 651/652 because of an unrelated flaky M1.2 look-speed check (`pitch=0.00 expected 23.64`); that group was rerun on the same frozen QA build and passed 77/77 (the look-speed check included). An earlier full run of the same game code also passed that M1.2 check.
- Release `builds/m1.73.1/index.html` 1825.9 KB (1,869,691 bytes), sha256 `590b381cba7dcf3b2a85a69985411be840b1c27f0044bbfd0d750a4e0a8b5bb8`.
- QA `builds/m1.73.1-qa/index.html` 1825.9 KB (1,869,687 bytes), sha256 `9d4891c5d73b0faecc96b698cf95791f7cbdfe3a2bb88272adaa9d1ff051c3cb`.
- Base: main `e123661f` (M1.73). Branch `Grok-Code-12`. Compare: https://github.com/Elim1nator/labyrinth-remake/compare/main...Grok-Code-12
- No new PNGs.

## Repro for Mr Playtest

**Coin door refund**

1. New game, seed 9, go to floor 5 (or any floor with a coin door and enough coins).
2. Stand at the coin door, note your coins, pay it (seed 9 L5 wants 5). Note the new total (e.g. 40 → 35).
3. Quit to the title and press CONTINUE. Repeat CONTINUE two more times (three continues in all).
4. Expected: the door is still open, your coins stay at the post-payment total (they do not come back), and USE does not charge again.
5. An older save that never had `coinPaid` should still load, with that door locked and priced as before.

**Score board caching** (do not post to the live board just to test this; a local or already-open session is enough)

1. Open HIGH SCORES from the title. If the online board loads, close it and open it again, then switch All versions / This version.
2. Expected: the list comes back from the first fetch; re-opening and the toggle should not hammer the API (the live limit is 5 requests a minute per IP, and GETs count).
3. If a GET or a score POST returns 429, the local top-10 board should appear, with no retry loop. A 429 on POST should still keep the local save.

## Usage

Counts below are approximate and labelled as such. Exact written/read tokens: not available. No extra research was done to produce these figures; they are a record of this hotfix session only. Wall-clock is America/Vancouver (UTC-7).

- **Session start:** Thu 26 Nov 2026, 4:50 PM
- **Freeze:** Thu 26 Nov 2026, 5:06 PM (`node tools/release.mjs m1.73.1`)
- **Wall-clock, start to freeze:** about 16 minutes
- **Official `npm test` after freeze:** about 6 minutes more (plus a short M1.2 rerun)
- **Model turns (start to freeze, approx.):** about 40
- **Tool calls (start to freeze, approx.):** about 85 (GitHub connector, shell, file reads, test runs and waits). Tokens: not available

Per feature (shared setup, the branch cut, freeze and tests are in the totals; the split below is a rough share of the work, not a second clock):

- **Refund fix:** about 12 tool calls and about 8 model turns to read `markCoinPaid` / the M1.67 tests, write `sv.coins` at payment time, add the CONTINUE×3 regression, and note it in the changelog and controls. Tokens: not available
- **Score board caching:** about 25 tool calls and about 15 model turns to read the high-score client, add the session GET cache and the 429 local fallback, add the mocked-fetch tests, and gate the older M1.8 / M1.66 429 expectations. Tokens: not available
