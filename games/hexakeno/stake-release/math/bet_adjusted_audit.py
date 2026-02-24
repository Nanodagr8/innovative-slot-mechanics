"""
Bet-Adjusted Max-Win Achievability Audit
The advertised max-win depends on bet amount:
  effective_max_mult = min(paytable_max, dollar_cap / bet)
At higher bets, the effective max multiplier is LOWER = more frequent = easier to achieve.
"""
from math import comb
import sys
sys.path.insert(0, '.')

TOTAL = 40
DRAW = 10

# Bet levels from game.js
BET_LEVELS = [
    0.10, 0.20, 0.40, 0.60, 0.80,
    1.00, 1.20, 1.40, 1.60, 1.80,
    2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00,
    10.00, 12.00, 14.00, 16.00, 18.00,
    20.00, 30.00, 40.00, 50.00, 75.00,
    100.00, 150.00, 200.00, 250.00, 300.00,
    350.00, 400.00, 450.00, 500.00, 750.00, 1000.00
]

# Dollar-based max win cap (common for Stake-style platforms)
DOLLAR_CAPS = [100_000, 250_000, 500_000]  # Test multiple scenarios

STAKE_DATA = {
    "classic": {
        1: [0, 3.80], 2: [0, 1.82, 4.32], 3: [0, 0.96, 2.98, 9.98],
        4: [0, 0.77, 1.73, 4.80, 21.60], 5: [0, 0.24, 1.34, 3.94, 15.84, 34.56],
        6: [0, 0, 0.96, 3.53, 6.72, 15.84, 38.40],
        7: [0, 0, 0.45, 2.88, 4.32, 13.44, 29.76, 57.60],
        8: [0, 0, 0, 2.11, 3.84, 12.48, 21.12, 52.80, 67.20],
        9: [0, 0, 0, 1.49, 2.88, 7.68, 14.40, 42.24, 57.60, 81.60],
        10: [0, 0, 0, 1.34, 2.16, 4.32, 7.68, 16.32, 48.00, 76.80, 96.00]
    },
    "low": {
        1: [0.67, 1.78], 2: [0, 1.92, 3.65], 3: [0, 1.06, 1.32, 24.96],
        4: [0, 0, 2.11, 7.58, 86.40], 5: [0, 0, 1.44, 4.03, 12.48, 288.00],
        6: [0, 0, 1.06, 1.92, 5.95, 96.00, 672.00],
        7: [0, 0, 1.06, 1.54, 3.36, 14.40, 216.00, 672.00],
        8: [0, 0, 1.06, 1.44, 1.92, 5.28, 37.44, 96.00, 768.00],
        9: [0, 0, 1.06, 1.25, 1.63, 2.40, 7.20, 48.00, 240.00, 960.00],
        10: [0, 0, 1.06, 1.15, 1.25, 1.73, 3.36, 12.48, 48.00, 240.00, 960.00]
    },
    "medium": {
        1: [0.38, 2.64], 2: [0, 1.73, 4.90], 3: [0, 0, 2.69, 48.00],
        4: [0, 0, 1.63, 9.60, 96.00], 5: [0, 0, 1.34, 3.84, 13.44, 374.40],
        6: [0, 0, 0, 2.88, 8.64, 172.80, 681.60],
        7: [0, 0, 0, 1.92, 6.72, 28.80, 384.00, 768.00],
        8: [0, 0, 0, 1.92, 3.84, 10.56, 64.32, 384.00, 864.00],
        9: [0, 0, 0, 1.92, 2.40, 4.80, 14.40, 96.00, 480.00, 960.00],
        10: [0, 0, 0, 1.54, 1.92, 3.84, 6.72, 24.96, 96.00, 480.00, 960.00]
    },
    "high": {
        1: [0, 3.80], 2: [0, 0, 16.42], 3: [0, 0, 0, 78.24],
        4: [0, 0, 9.60, 248.64], 5: [0, 0, 0, 4.32, 46.08, 432.00],
        6: [0, 0, 0, 0, 10.56, 336.00, 681.60],
        7: [0, 0, 0, 0, 6.72, 86.40, 384.00, 768.00],
        8: [0, 0, 0, 0, 4.80, 19.20, 259.20, 576.00, 864.00],
        9: [0, 0, 0, 0, 3.84, 10.56, 53.76, 480.00, 768.00, 960.00],
        10: [0, 0, 0, 0, 3.36, 7.68, 12.48, 60.48, 480.00, 768.00, 1000.00]
    }
}

def hit_probability(n_picks, k_hits):
    if k_hits > min(n_picks, DRAW) or k_hits < max(0, n_picks + DRAW - TOTAL):
        return 0.0
    return comb(n_picks, k_hits) * comb(TOTAL - n_picks, DRAW - k_hits) / comb(TOTAL, DRAW)

def find_achievable_max(paytable_arr, n_picks, max_mult_cap):
    """Find the highest paytable entry <= max_mult_cap and its probability."""
    best_mult = 0
    best_k = 0
    for k in range(len(paytable_arr)):
        m = paytable_arr[k]
        if m > 0 and m <= max_mult_cap and m > best_mult:
            best_mult = m
            best_k = k
    if best_mult == 0:
        return 0, 0, 0
    p = hit_probability(n_picks, best_k)
    return best_mult, best_k, p

if __name__ == "__main__":
    print("=" * 100)
    print("  BET-ADJUSTED MAX-WIN ACHIEVABILITY AUDIT")
    print("  Rule: Advertised max-win must be achievable at >= 1-in-20,000,000")
    print("=" * 100)
    
    for dollar_cap in DOLLAR_CAPS:
        print(f"\n\n### DOLLAR CAP: ${dollar_cap:,} ###")
        print("-" * 100)
        
        worst_cases = []
        
        for risk in ['classic', 'low', 'medium', 'high']:
            print(f"\n  --- {risk.upper()} ---")
            
            for n_picks in [9, 10]:  # Only show the problematic ones
                arr = STAKE_DATA[risk][n_picks]
                raw_max = max(arr)
                raw_k = arr.index(raw_max)
                raw_p = hit_probability(n_picks, raw_k)
                raw_freq = int(1/raw_p) if raw_p > 0 else float('inf')
                
                print(f"  {n_picks}-pick (raw max: {raw_max:.2f}x at {raw_k} hits, freq=1-in-{raw_freq:,}):")
                
                # Check at key bet levels
                for bet in [0.10, 1.00, 10.00, 100.00, 500.00, 1000.00]:
                    effective_cap = dollar_cap / bet
                    eff_mult, eff_k, eff_p = find_achievable_max(arr, n_picks, effective_cap)
                    eff_freq = int(1/eff_p) if eff_p > 0 else float('inf')
                    
                    dollar_win = eff_mult * bet
                    status = "ok" if eff_freq <= 20_000_000 else "FAIL"
                    
                    print(f"    bet=${bet:>8.2f} -> cap={effective_cap:>10.0f}x -> max={eff_mult:>8.2f}x ({eff_k}h) -> ${dollar_win:>12,.2f} freq=1-in-{eff_freq:>12,} [{status}]")
                    
                    if eff_freq > 20_000_000:
                        worst_cases.append((risk, n_picks, bet, eff_mult, eff_freq, dollar_cap))
        
        if worst_cases:
            print(f"\n  FAILURES at ${dollar_cap:,} cap: {len(worst_cases)}")
            for risk, picks, bet, mult, freq, cap in worst_cases:
                print(f"    {risk} {picks}-pick at ${bet:.2f}: {mult:.2f}x, 1-in-{freq:,}")
        else:
            print(f"\n  ALL PASS at ${dollar_cap:,} cap")
    
    # Also show the uncapped scenario
    print(f"\n\n### NO DOLLAR CAP (current config: wincap=1,000,000x) ###")
    print("-" * 100)
    print("In this scenario, the max-win is always the full paytable max regardless of bet.")
    print("This is the raw probability scenario from the previous audit.")
    print("9-pick and 10-pick FAIL at 1-in-27M and 1-in-848M respectively.")
    print("\nRECOMMENDATION: Set a reasonable dollar cap (e.g., $100,000-$500,000)")
    print("to make the 'advertised max win' achievable at all bet levels.")
    
    # What dollar cap is needed?
    print(f"\n\n### MINIMUM DOLLAR CAP ANALYSIS ###")
    print("What max dollar cap makes 9-pick and 10-pick achievable (1-in-20M)?")
    print("-" * 100)
    
    for risk in ['classic', 'low', 'medium', 'high']:
        for n_picks in [9, 10]:
            arr = STAKE_DATA[risk][n_picks]
            # Find the highest multiplier with freq <= 20M
            best_mult = 0
            best_k = 0
            for k in range(len(arr)):
                if arr[k] > 0:
                    p = hit_probability(n_picks, k)
                    freq = int(1/p)
                    if freq <= 20_000_000 and arr[k] > best_mult:
                        best_mult = arr[k]
                        best_k = k
            if best_mult > 0:
                # The dollar cap that makes this the effective max at the LOWEST bet ($0.10)
                min_cap = best_mult * 0.10
                max_cap = best_mult * 1000.00
                print(f"  {risk} {n_picks}-pick: achievable max = {best_mult:.2f}x ({best_k} hits)")
                print(f"    At $0.10 bet: max win = ${best_mult * 0.10:,.2f}")
                print(f"    At $1000 bet: max win = ${best_mult * 1000:,.2f}")
