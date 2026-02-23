import math

# Keno 40 balls, 10 drawn
TOTAL_BALLS = 40
DRAWN_BALLS = 10

def nCr(n, r):
    if r < 0 or r > n: return 0
    f = math.factorial
    return f(n) // f(r) // f(n - r)

from keno_config import PAYTABLE_CLASSIC, PAYTABLE_LOW, PAYTABLE_MEDIUM, PAYTABLE_HIGH

tables = {
    "classic": PAYTABLE_CLASSIC,
    "low": PAYTABLE_LOW,
    "medium": PAYTABLE_MEDIUM,
    "high": PAYTABLE_HIGH
}

for mode_name, table in tables.items():
    print(f"--- MODE: {mode_name.upper()} ---")
    rtps = []
    max_multi = 0
    max_multi_prob = 0
    for picks in range(1, 11):
        if picks not in table:
            continue
        pick_rtp = 0
        hit_prob = 0
        for hits, multi in table[picks].items():
            # Correct Keno Hypergeometric formula
            # C(DRAWN_BALLS, hits) * C(TOTAL_BALLS - DRAWN_BALLS, picks - hits) / C(TOTAL_BALLS, picks)
            prob = (nCr(DRAWN_BALLS, hits) * nCr(TOTAL_BALLS - DRAWN_BALLS, picks - hits)) / nCr(TOTAL_BALLS, picks)
            
            pick_rtp += prob * multi
            if multi > 0:
                hit_prob += prob
            
            if multi > max_multi:
                max_multi = multi
                max_multi_prob = prob
            elif multi == max_multi:
                max_multi_prob += prob # Approximate if multiple instances

        rtps.append(pick_rtp)
        hit_rate = (1 / hit_prob) if hit_prob > 0 else float('inf')
        print(f" Pick {picks}: RTP = {pick_rtp*100:.2f}%, Hit Freq = 1 in {hit_rate:.2f}")

    avg_rtp = sum(rtps) / len(rtps)
    print(f" => Avg RTP: {avg_rtp*100:.2f}%")
    print(f" => Max Multiplier: {max_multi}x")
    print(f" => Max Multi Hit Rate: 1 in {1 / max_multi_prob if max_multi_prob > 0 else 0:,.2f}")
    print()
