# M1.67 brief

One fix, approved by Jacob after Mr Playtest's M1.66 review: a PAID coin door re-locked after CONTINUE, so the player could pay twice and lose coins for an empty room (repro: seed 9 L5, pay 5, CONTINUE, pay 5 again).

Persist paid coin doors in the save (`sv.coinPaid`, keyed like `coinTaken`), restore them as open on CONTINUE, and never charge a door opened by payment again. Keep Music Box coin-door and `coinTaken` behaviour. Old saves without the field must still load.

Do not change the score-display bug (a local save isn't shown when the POST fails); Jacob did not pick it.
