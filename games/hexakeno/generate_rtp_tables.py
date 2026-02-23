import math
import json

TOTAL_BALLS = 40
DRAWN_BALLS = 10
TARGET_RTP = 0.97

def nCr(n, r):
    if r < 0 or r > n: return 0
    f = math.factorial
    return f(n) // f(r) // f(n - r)

TOTAL_COMBS = nCr(TOTAL_BALLS, DRAWN_BALLS)

def get_prob(picks, hits):
    return (nCr(DRAWN_BALLS, hits) * nCr(TOTAL_BALLS - DRAWN_BALLS, picks - hits)) / nCr(TOTAL_BALLS, picks)

# Base shapes (relative weights). We will scale them.
# The keys are (picks). The value is a dict of {hits: weight}.
# 0 weight means no payout (0x).
# We MUST respect the >0 hit frequencies defined earlier:
# P1: 1+ (1 in 4)
# P2: 1+ (1 in 2.26)
# P3: 2+ (1 in 6.72)
# P4: 2+ (1 in 3.91)
# P5: 2+ (1 in 2.73)
# P6: 3+ (1 in 6.55)
# P7: 3+ (1 in 4.38)
# P8: 3+ (1 in 3.21)
# P9: 4+ (1 in 7.25)
# P10: 4+ (1 in 5.08)

# These relative weights define the curves for the 4 modes.
SHAPES = {
    "classic": {
        1: {1: 1},
        2: {1: 1, 2: 3},
        3: {2: 1, 3: 5},
        4: {2: 1, 3: 3, 4: 10},
        5: {2: 1, 3: 2, 4: 5, 5: 20},
        6: {3: 1, 4: 2, 5: 6, 6: 25},
        7: {3: 1, 4: 2, 5: 4, 6: 12, 7: 40},
        8: {3: 1, 4: 2, 5: 4, 6: 8, 7: 20, 8: 60},
        9: {4: 1, 5: 2, 6: 4, 7: 10, 8: 30, 9: 80},
        10: {4: 1, 5: 2, 6: 3, 7: 8, 8: 20, 9: 60, 10: 100}
    },
    "low": { # Lower variance. Flatter weights.
        1: {1: 1},
        2: {1: 2, 2: 4},
        3: {2: 2, 3: 6},
        4: {2: 2, 3: 4, 4: 8},
        5: {2: 2, 3: 3, 4: 6, 5: 12},
        6: {3: 2, 4: 3, 5: 6, 6: 15},
        7: {3: 2, 4: 3, 5: 5, 6: 10, 7: 25},
        8: {3: 2, 4: 3, 5: 5, 6: 8, 7: 15, 8: 40},
        9: {4: 2, 5: 4, 6: 6, 7: 12, 8: 25, 9: 60},
        10: {4: 2, 5: 3, 6: 5, 7: 10, 8: 20, 9: 40, 10: 80}
    },
    "medium": { # Medium variance
        1: {1: 1},
        2: {1: 1, 2: 5},
        3: {2: 1, 3: 8},
        4: {2: 1, 3: 4, 4: 15},
        5: {2: 1, 3: 3, 4: 8, 5: 30},
        6: {3: 1, 4: 3, 5: 10, 6: 50},
        7: {3: 1, 4: 2, 5: 8, 6: 20, 7: 100},
        8: {3: 1, 4: 2, 5: 6, 6: 15, 7: 40, 8: 200},
        9: {4: 1, 5: 3, 6: 8, 7: 20, 8: 60, 9: 250},
        10: {4: 1, 5: 2, 6: 5, 7: 15, 8: 40, 9: 150, 10: 300}
    },
    "high": { # Extreme variance - max allowed is capped at 1000x later
        1: {1: 1},
        2: {1: 0.5, 2: 10},
        3: {2: 0.5, 3: 20},
        4: {2: 0.5, 3: 5, 4: 40},
        5: {2: 0.5, 3: 4, 4: 15, 5: 100},
        6: {3: 0.5, 4: 4, 5: 25, 6: 200},
        7: {3: 0.5, 4: 3, 5: 15, 6: 50, 7: 400},
        8: {3: 0.5, 4: 2.5, 5: 10, 6: 30, 7: 100, 8: 800},
        9: {4: 0.5, 5: 4, 6: 15, 7: 40, 8: 150, 9: 1000}, # 1000x target for 9 hits
        10: {4: 0.5, 5: 3, 6: 10, 7: 30, 8: 100, 9: 1000, 10: 1000} # 1000x on 9 AND 10 hits
    }
}

OUTPUT = {}

for mode, pick_shapes in SHAPES.items():
    OUTPUT[mode] = {}
    for picks, shapes in pick_shapes.items():
        OUTPUT[mode][picks] = {}
        # Calculate unscaled RTP of the shape
        unscaled_rtp = 0
        for hits, weight in shapes.items():
            prob = get_prob(picks, hits)
            unscaled_rtp += (prob * weight)
        
        # Scale to match TARGET_RTP (0.9700)
        scale_factor = TARGET_RTP / unscaled_rtp
        
        for hits, weight in shapes.items():
            val = round(weight * scale_factor, 2)
            
            # Max win cap enforcement
            if val > 1000:
                # If it exceeds 1000x, cap it and we will redistribute the missing RTP back to lower hits.
                # However, our target is exactly 1000x. Since our shapes are arbitrary, we could just manually enforce 1000.
                pass
            
            OUTPUT[mode][picks][hits] = val
        
        # Re-verify and fine-tune exact RTP because of rounding
        current_rtp = sum([get_prob(picks, h) * v for h, v in OUTPUT[mode][picks].items()])
        diff = TARGET_RTP - current_rtp
        
        # Adjust the lowest hit tier (most frequent) to perfectly match 0.9700 RTP
        if len(OUTPUT[mode][picks]) > 0:
            lowest_hit = min(OUTPUT[mode][picks].keys())
            prob_lowest = get_prob(picks, lowest_hit)
            adjustment = diff / prob_lowest
            
            # Apply adjustment
            new_val = round(OUTPUT[mode][picks][lowest_hit] + adjustment, 2)
            # Ensure it doesn't go below 0 or negative
            if new_val < 0.1:
                # Adjust the next hit up instead
                next_hit = lowest_hit + 1
                if next_hit in OUTPUT[mode][picks]:
                    prob_next = get_prob(picks, next_hit)
                    adjustment2 = diff / prob_next
                    OUTPUT[mode][picks][next_hit] = round(OUTPUT[mode][picks][next_hit] + adjustment2, 2)
            else:
                OUTPUT[mode][picks][lowest_hit] = new_val

        # Final Cap Enforcement for 1000x max win (specifically for High mode)
        for h, v in OUTPUT[mode][picks].items():
            if v > 1000:
                OUTPUT[mode][picks][h] = 1000.00
                # Note: This slightly lowers RTP, but 1000x probabilities are so rare it usually changes RTP by < 0.0001%
                

    print(f"--- MODE: {mode.upper()} ---")
    rtps = []
    max_multi = 0
    max_multi_prob = 0
    hit_rates = []
    for picks in range(1, 11):
        pick_rtp = sum([get_prob(picks, h) * v for h, v in OUTPUT[mode][picks].items()])
        hit_prob = sum([get_prob(picks, h) for h, v in OUTPUT[mode][picks].items() if v > 0])
        hit_rate = 1 / hit_prob if hit_prob > 0 else 0
        hit_rates.append(hit_rate)
        rtps.append(pick_rtp)
        print(f" Pick {picks}: RTP = {pick_rtp*100:.4f}% | Hits: {OUTPUT[mode][picks]} | Hit freq 1 in {hit_rate:.1f}")
        
        for h, v in OUTPUT[mode][picks].items():
            if v > max_multi:
                max_multi = v
                max_multi_prob = get_prob(picks, h)
            elif v == max_multi and v > 0:
                max_multi_prob += get_prob(picks, h)

    avg_rtp = sum(rtps)/len(rtps)
    print(f" Avg RTP: {avg_rtp*100:.4f}%")
    print(f" Max Win: {max_multi}x (Achievable 1 in {1/max_multi_prob:,.1f} spins)")
    print()

with open('new_paytables.py', 'w') as f:
    f.write("PAYTABLE_CLASSIC = " + json.dumps(OUTPUT['classic'], indent=4) + "\\n\\n")
    f.write("PAYTABLE_LOW = " + json.dumps(OUTPUT['low'], indent=4) + "\\n\\n")
    f.write("PAYTABLE_MEDIUM = " + json.dumps(OUTPUT['medium'], indent=4) + "\\n\\n")
    f.write("PAYTABLE_HIGH = " + json.dumps(OUTPUT['high'], indent=4) + "\\n")
