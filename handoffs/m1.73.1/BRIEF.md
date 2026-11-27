# M1.73.1 brief

Two approved fixes, both from Jacob via Mr Lead, on top of main at M1.73.

1. After you pay for a coin door and press CONTINUE, the door stays open (`coinPaid` from M1.67), but the first payment comes back, once per floor. Save the coin count at the moment you pay so CONTINUE does not refund it. Old saves still load. Do not add Ferryman's Coin or any other coin-door payout.

2. The live score API is rate-limited to 5 requests a minute per IP (burst 5), and GETs count. Cache the leaderboard GET for the session: fetch at most once per page load, or after a successful score POST. Re-opening the board, including the All/This version toggle, uses the cached rows and filters on the client. A 429 on GET or POST falls back to the local top-10 board, the same way a 404 or other error already did, with no retry loop. A 429 on POST still keeps the local save.

Do not add anything else.
