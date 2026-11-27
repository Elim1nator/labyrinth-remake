# Kersplat Labyrinth: The Descent — M1.73.1

QA build (debug hook on). Release build in `../m1.73.1/`.

## What changed since M1.73

- **Paid coin doors keep their cost.** Paying a coin door still stays open on CONTINUE (from M1.67) and is not charged again, and the new coin count is saved at the moment you pay, so CONTINUE does not refund the first payment. Old saves still load.
- **Score board caching.** The online high-score list is fetched at most once per page load (and may be fetched again after a successful score POST). Re-opening the board and the All/This version toggle use the cached rows. A 429 on GET or POST falls back to the local top 10, like a 404 or other error, and does not retry in a loop. A 429 on POST still keeps the local save.

Frozen build; sha256 in `../SHA256SUMS`.
