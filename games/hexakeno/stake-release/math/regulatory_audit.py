"""
Regulatory Audit: Max-Win Achievability & Win Hit-Rate
1. Max-win must be achievable at >= 1 in 20,000,000 frequency
2. >0-win hit-rate should be around 1-in-3 to 1-in-8 (not worse than 1-in-20 for base)
"""
from math import comb
import sys
sys.path.insert(0, '.')

TOTAL = 40
DRAW = 10
SB_COST = 2.5
SB_MULT = 7.0

# Frontend paytables (the actual player-facing values)
STAKE_DATA = {
    "classic": {
        1: [0, 3.80],
        2: [0, 1.82, 4.32],
        3: [0, 0.96, 2.98, 9.98],
        4: [0, 0.77, 1.73, 4.80, 21.60],
        5: [0, 0.24, 1.34, 3.94, 15.84, 34.56],
        6: [0, 0, 0.96, 3.53, 6.72, 15.84, 38.40],
        7: [0, 0, 0.45, 2.88, 4.32, 13.44, 29.76, 57.60],
        8: [0, 0, 0, 2.11, 3.84, 12.48, 21.12, 52.80, 67.20],
        9: [0, 0, 0, 1.49, 2.88, 7.68, 14.40, 42.24, 57.60, 81.60],
        10: [0, 0, 0, 1.34, 2.16, 4.32, 7.68, 16.32, 48.00, 76.80, 96.00]
    },
    "low": {
        1: [0.67, 1.78],
        2: [0, 1.92, 3.65],
        3: [0, 1.06, 1.32, 24.96],
        4: [0, 0, 2.11, 7.58, 86.40],
        5: [0, 0, 1.44, 4.03, 12.48, 288.00],
        6: [0, 0, 1.06, 1.92, 5.95, 96.00, 672.00],
        7: [0, 0, 1.06, 1.54, 3.36, 14.40, 216.00, 672.00],
        8: [0, 0, 1.06, 1.44, 1.92, 5.28, 37.44, 96.00, 768.00],
        9: [0, 0, 1.06, 1.25, 1.63, 2.40, 7.20, 48.00, 240.00, 960.00],
        10: [0, 0, 1.06, 1.15, 1.25, 1.73, 3.36, 12.48, 48.00, 240.00, 960.00]
    },
    "medium": {
        1: [0.38, 2.64],
        2: [0, 1.73, 4.90],
        3: [0, 0, 2.69, 48.00],
        4: [0, 0, 1.63, 9.60, 96.00],
        5: [0, 0, 1.34, 3.84, 13.44, 374.40],
        6: [0, 0, 0, 2.88, 8.64, 172.80, 681.60],
        7: [0, 0, 0, 1.92, 6.72, 28.80, 384.00, 768.00],
        8: [0, 0, 0, 1.92, 3.84, 10.56, 64.32, 384.00, 864.00],
        9: [0, 0, 0, 1.92, 2.40, 4.80, 14.40, 96.00, 480.00, 960.00],
        10: [0, 0, 0, 1.54, 1.92, 3.84, 6.72, 24.96, 96.00, 480.00, 960.00]
    },
    "high": {
        1: [0, 3.80],
        2: [0, 0, 16.42],
        3: [0, 0, 0, 78.24],
        4: [0, 0, 9.60, 248.64],
        5: [0, 0, 0, 4.32, 46.08, 432.00],
        6: [0, 0, 0, 0, 10.56, 336.00, 681.60],
        7: [0, 0, 0, 0, 6.72, 86.40, 384.00, 768.00],
        8: [0, 0, 0, 0, 4.80, 19.20, 259.20, 576.00, 864.00],
        9: [0, 0, 0, 0, 3.84, 10.56, 53.76, 480.00, 768.00, 960.00],
        10: [0, 0, 0, 0, 3.36, 7.68, 12.48, 60.48, 480.00, 768.00, 1000.00]
    }
}

SUPERBALL_DATA = {
    "classic": {
        1: [0.00, 6.06],
        2: [0.00, 2.65, 6.28],
        3: [0.00, 1.22, 3.78, 12.66],
        4: [0.00, 0.91, 2.04, 5.65, 25.42],
        5: [0.00, 0.24, 1.34, 3.94, 15.86, 34.60],
        6: [0.00, 0.00, 0.89, 3.28, 6.24, 14.71, 35.66],
        7: [0.00, 0.00, 0.39, 2.50, 3.74, 11.64, 25.78, 49.90],
        8: [0.00, 0.00, 0.00, 1.66, 3.02, 9.82, 16.61, 41.53, 52.85],
        9: [0.00, 0.00, 0.00, 1.13, 2.19, 5.85, 10.96, 32.16, 43.86, 62.13],
        10: [0.00, 0.00, 0.00, 1.02, 1.64, 3.29, 5.84, 12.41, 36.50, 58.40, 73.00]
    },
    "low": {
        1: [2.28, 6.06],
        2: [0.00, 2.83, 5.38],
        3: [0.00, 1.29, 1.61, 30.38],
        4: [0.00, 0.00, 2.04, 7.34, 83.63],
        5: [0.00, 0.00, 1.33, 3.73, 11.54, 266.34],
        6: [0.00, 0.00, 0.91, 1.64, 5.08, 82.01, 574.10],
        7: [0.00, 0.00, 0.92, 1.34, 2.93, 12.55, 188.28, 585.74],
        8: [0.00, 0.00, 0.95, 1.29, 1.72, 4.73, 33.54, 86.00, 688.04],
        9: [0.00, 0.00, 0.95, 1.12, 1.46, 2.16, 6.47, 43.11, 215.53, 862.11],
        10: [0.00, 0.00, 0.94, 1.03, 1.11, 1.54, 3.00, 11.13, 42.79, 213.96, 855.83]
    },
    "medium": {
        1: [0.87, 6.06],
        2: [0.00, 2.49, 7.05],
        3: [0.00, 0.00, 2.67, 47.68],
        4: [0.00, 0.00, 1.53, 9.03, 90.34],
        5: [0.00, 0.00, 1.21, 3.47, 12.15, 338.46],
        6: [0.00, 0.00, 0.00, 2.15, 6.44, 128.71, 507.71],
        7: [0.00, 0.00, 0.00, 1.41, 4.95, 21.21, 282.77, 565.54],
        8: [0.00, 0.00, 0.00, 1.46, 2.93, 8.05, 49.01, 292.62, 658.40],
        9: [0.00, 0.00, 0.00, 1.50, 1.88, 3.76, 11.28, 75.23, 376.13, 752.26],
        10: [0.00, 0.00, 0.00, 1.18, 1.48, 2.95, 5.17, 19.20, 73.85, 369.27, 738.54]
    },
    "high": {
        1: [0.00, 6.06],
        2: [0.00, 0.00, 19.11],
        3: [0.00, 0.00, 0.00, 71.31],
        4: [0.00, 0.00, 0.73, 18.87],
        5: [0.00, 0.00, 0.00, 3.36, 35.80, 335.62],
        6: [0.00, 0.00, 0.00, 0.00, 6.97, 221.83, 449.99],
        7: [0.00, 0.00, 0.00, 0.00, 4.40, 56.63, 251.71, 503.42],
        8: [0.00, 0.00, 0.00, 0.00, 3.06, 12.24, 165.30, 367.34, 551.02],
        9: [0.00, 0.00, 0.00, 0.00, 2.47, 6.80, 34.62, 309.12, 494.59, 618.24],
        10: [0.00, 0.00, 0.00, 0.00, 2.25, 5.15, 8.36, 40.53, 321.68, 514.69, 670.16]
    }
}

def hit_probability(n_picks, k_hits):
    if k_hits > min(n_picks, DRAW) or k_hits < max(0, n_picks + DRAW - TOTAL):
        return 0.0
    return comb(n_picks, k_hits) * comb(TOTAL - n_picks, DRAW - k_hits) / comb(TOTAL, DRAW)

if __name__ == "__main__":
    print("=" * 90)
    print("  REGULATORY AUDIT: MAX-WIN ACHIEVABILITY & WIN HIT-RATE")
    print("=" * 90)
    
    # ===== AUDIT 1: >0-WIN HIT-RATE (BASE GAME) =====
    print("\n[AUDIT 1] BASE GAME >0-WIN HIT-RATE")
    print("Requirement: Player should win something roughly 1-in-3 to 1-in-8 rounds (not worse than 1-in-20)")
    print("-" * 90)
    print(f"{'Mode':>10} {'Picks':>6} | {'P(any win)':>12} {'1-in-N':>10} | {'Status':>8}")
    print("-" * 90)
    
    hitrate_issues = []
    for risk in ['classic', 'low', 'medium', 'high']:
        for n_picks in range(1, 11):
            arr = STAKE_DATA[risk][n_picks]
            # P(payout > 0) = sum of P(k hits) for k where arr[k] > 0
            p_win = sum(hit_probability(n_picks, k) for k in range(len(arr)) if arr[k] > 0)
            one_in_n = 1.0 / p_win if p_win > 0 else float('inf')
            
            if one_in_n > 20:
                status = "FAIL"
                hitrate_issues.append((risk, n_picks, one_in_n))
            elif one_in_n > 8:
                status = "WARN"
            else:
                status = "ok"
            
            print(f"{risk:>10} {n_picks:>6} | {p_win*100:>11.4f}% {one_in_n:>9.1f} | {status:>8}")
    
    # ===== AUDIT 2: MAX-WIN ACHIEVABILITY (BASE GAME) =====
    print(f"\n\n[AUDIT 2] BASE GAME MAX-WIN ACHIEVABILITY")
    print("Requirement: Max payout must occur at frequency >= 1 in 20,000,000")
    print("-" * 90)
    print(f"{'Mode':>10} {'Picks':>6} | {'Max Mult':>10} {'P(max)':>14} {'1-in-N':>14} | {'Status':>8}")
    print("-" * 90)
    
    maxwin_issues_base = []
    for risk in ['classic', 'low', 'medium', 'high']:
        for n_picks in range(1, 11):
            arr = STAKE_DATA[risk][n_picks]
            max_mult = max(arr)
            max_k = arr.index(max_mult)
            p_max = hit_probability(n_picks, max_k) if max_mult > 0 else 0
            one_in_n = int(1/p_max) if p_max > 0 else float('inf')
            
            if one_in_n > 20_000_000:
                status = "FAIL"
                maxwin_issues_base.append((risk, n_picks, max_mult, one_in_n))
            else:
                status = "ok"
            
            print(f"{risk:>10} {n_picks:>6} | {max_mult:>9.2f}x {p_max:>13.10f} {one_in_n:>13,} | {status:>8}")
    
    # ===== AUDIT 3: MAX-WIN ACHIEVABILITY (SUPERBALL) =====
    print(f"\n\n[AUDIT 3] SUPERBALL MAX-WIN ACHIEVABILITY")
    print("Max SB win = sb_mult[max_k] * 7 (when last ball is a hit)")
    print("P(max SB win) = P(max_k hits) * P(last ball is hit | max_k hits) = P(max_k) * max_k/10")
    print("Requirement: >= 1 in 20,000,000")
    print("-" * 90)
    print(f"{'Mode':>10} {'Picks':>6} | {'SB Max':>10} {'P(SB max)':>14} {'1-in-N':>14} | {'Status':>8}")
    print("-" * 90)
    
    maxwin_issues_sb = []
    for risk in ['classic', 'low', 'medium', 'high']:
        for n_picks in range(1, 11):
            arr = SUPERBALL_DATA[risk][n_picks]
            max_mult = max(arr)
            max_k = arr.index(max_mult)
            sb_max = max_mult * SB_MULT  # Superball 7x on top
            
            if max_mult > 0 and max_k > 0:
                p_hits = hit_probability(n_picks, max_k)
                p_last_hit = max_k / DRAW
                p_sb_max = p_hits * p_last_hit
                one_in_n = int(1/p_sb_max) if p_sb_max > 0 else float('inf')
            else:
                p_sb_max = 0
                one_in_n = float('inf')
            
            if one_in_n > 20_000_000:
                status = "FAIL"
                maxwin_issues_sb.append((risk, n_picks, sb_max, one_in_n))
            else:
                status = "ok"
            
            print(f"{risk:>10} {n_picks:>6} | {sb_max:>9.2f}x {p_sb_max:>13.10f} {one_in_n:>13,} | {status:>8}")
    
    # ===== SUMMARY =====
    print(f"\n\n{'='*90}")
    print("  SUMMARY")
    print(f"{'='*90}")
    
    if hitrate_issues:
        print(f"\n  [AUDIT 1] FAIL - {len(hitrate_issues)} pick configurations have >0-win rate worse than 1-in-20:")
        for risk, picks, rate in hitrate_issues:
            print(f"    {risk} {picks}-pick: 1-in-{rate:.1f}")
    else:
        print(f"\n  [AUDIT 1] PASS - All base game >0-win hit-rates are better than 1-in-20")
    
    if maxwin_issues_base:
        print(f"\n  [AUDIT 2] FAIL - {len(maxwin_issues_base)} base game max-wins are rarer than 1-in-20M:")
        for risk, picks, mult, freq in maxwin_issues_base:
            print(f"    {risk} {picks}-pick: {mult:.2f}x at 1-in-{freq:,}")
    else:
        print(f"\n  [AUDIT 2] PASS - All base game max-wins are achievable (>= 1-in-20M)")
    
    if maxwin_issues_sb:
        print(f"\n  [AUDIT 3] FAIL - {len(maxwin_issues_sb)} Superball max-wins are rarer than 1-in-20M:")
        for risk, picks, mult, freq in maxwin_issues_sb:
            print(f"    {risk} {picks}-pick: {mult:.2f}x at 1-in-{freq:,}")
    else:
        print(f"\n  [AUDIT 3] PASS - All Superball max-wins are achievable (>= 1-in-20M)")
