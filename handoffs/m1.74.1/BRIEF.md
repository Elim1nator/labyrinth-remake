# M1.74.1 brief

Mr Playtest's bug list for M1.73.1, fixed on top of main at M1.74 (which includes M1.73.1).

1. **Double coins on CONTINUE (blocker, new).** Pick up a floor's coins, pay a coin door, then CONTINUE: every coin respawns and can be picked up again. In his test that was 67 coins instead of 36. It works on any floor with a coin door, about 4 in 10 floors.
2. **Debt Collector coins lost for good (low to medium, new).** If the Collector steals coins and you then pay a door, CONTINUE does not give the stolen coins back. Fixing the blocker fixes this too.
3. **Small refund when the price is more than your saved coins (low, already there before).** If a door, shop item or mystery box costs more than you had at the start of the floor, CONTINUE gives a little back.
4. **Score board isn't retried (low).** If the online board fails to load once, it stays on local scores for the rest of the session. A page reload fixes it.
5. **Ice Spike stuck on wall edges (low).** A spike can wedge against a wall. You can't hit it from right against the wall, but stepping out into open ground kills it right away, so it can't trap you.
6. **"This version" tab (low, left as-is earlier).** It still only filters the top 50 scores.
