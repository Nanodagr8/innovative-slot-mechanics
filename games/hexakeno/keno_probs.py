import math

TOTAL_BALLS = 40
DRAWN_BALLS = 10

def nCr(n, r):
    if r < 0 or r > n: return 0
    f = math.factorial
    return f(n) // f(r) // f(n - r)

print("--- 40/10 KENO CUMULATIVE HIT FREQUENCIES ---")
for picks in range(1, 11):
    print(f"\\nPick {picks}:")
    for min_hits in range(0, picks + 1):
        prob_sum = 0
        for hits in range(min_hits, picks + 1):
            prob = (nCr(DRAWN_BALLS, hits) * nCr(TOTAL_BALLS - DRAWN_BALLS, picks - hits)) / nCr(TOTAL_BALLS, picks)
            prob_sum += prob
        
        hit_rate = (1 / prob_sum) if prob_sum > 0 else float('inf')
        print(f"  Pays on >= {min_hits} hits: 1 in {hit_rate:.2f}")

