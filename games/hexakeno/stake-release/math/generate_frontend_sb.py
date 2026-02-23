"""
Generate SUPERBALL_DATA for game.js based on the frontend STAKE_DATA values.
The frontend uses array-indexed format where index = hit count.
"""
from math import comb

TOTAL = 40
DRAW = 10
SB_COST = 2.5
SB_MULT = 7.0
TARGET_RTP = 0.97

def hit_probability(n_picks, k_hits):
    if k_hits > min(n_picks, DRAW) or k_hits < max(0, n_picks + DRAW - TOTAL):
        return 0.0
    return comb(n_picks, k_hits) * comb(TOTAL - n_picks, DRAW - k_hits) / comb(TOTAL, DRAW)

# STAKE_DATA from game.js (frontend paytable) — exact copy
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

def compute_superball_data():
    """Generate SUPERBALL_DATA with the same array-indexed format as STAKE_DATA."""
    sb_data = {}
    
    for risk_name, risk_table in STAKE_DATA.items():
        sb_risk = {}
        
        for n_picks, base_arr in risk_table.items():
            # Current Superball expected return using base multipliers
            current_sb_return = 0.0
            for k_hits in range(len(base_arr)):
                prob = hit_probability(n_picks, k_hits)
                base_mult = base_arr[k_hits]
                if base_mult > 0 and k_hits > 0:
                    p_last_hit = k_hits / DRAW
                    avg_payout = base_mult * (p_last_hit * SB_MULT + (1 - p_last_hit) * 1.0)
                    current_sb_return += prob * avg_payout
            
            # Scale factor
            target_return = TARGET_RTP * SB_COST
            scale = target_return / current_sb_return if current_sb_return > 0 else 1.0
            
            # Apply scale and round to 2dp
            sb_arr = [round(m * scale, 2) for m in base_arr]
            sb_risk[n_picks] = sb_arr
        
        sb_data[risk_name] = sb_risk
    
    return sb_data

def verify_and_print(sb_data):
    print("=== BASE GAME RTP (STAKE_DATA) ===")
    for risk_name in ['classic', 'low', 'medium', 'high']:
        print(f"\n--- {risk_name.upper()} ---")
        for n_picks in range(1, 11):
            arr = STAKE_DATA[risk_name][n_picks]
            rtp = sum(hit_probability(n_picks, k) * arr[k] for k in range(len(arr)))
            print(f"  {n_picks}-pick: {rtp*100:.4f}%")
    
    print("\n\n=== SUPERBALL RTP (SUPERBALL_DATA) ===")
    for risk_name in ['classic', 'low', 'medium', 'high']:
        print(f"\n--- {risk_name.upper()} ---")
        for n_picks in range(1, 11):
            arr = sb_data[risk_name][n_picks]
            expected_return = 0.0
            for k in range(len(arr)):
                prob = hit_probability(n_picks, k)
                if arr[k] > 0 and k > 0:
                    p_last = k / DRAW
                    avg_pay = arr[k] * (p_last * SB_MULT + (1 - p_last))
                    expected_return += prob * avg_pay
            rtp = (expected_return / SB_COST) * 100
            print(f"  {n_picks}-pick: {rtp:.4f}%")
    
    # Max-win check
    print("\n\n=== MAX WIN ACHIEVABILITY ===")
    print("(Must be >= 1 in 20,000,000)")
    for risk_name in ['classic', 'low', 'medium', 'high']:
        for n_picks in range(1, 11):
            base_arr = STAKE_DATA[risk_name][n_picks]
            sb_arr = sb_data[risk_name][n_picks]
            
            # Base game max
            max_base = max(base_arr)
            max_base_hits = base_arr.index(max_base)
            if max_base > 0:
                p = hit_probability(n_picks, max_base_hits)
                freq = int(1/p) if p > 0 else float('inf')
            
            # Superball max = sb_arr[max_hits] * 7 (when last ball hits)
            max_sb = max(sb_arr) * SB_MULT
            max_sb_hits = sb_arr.index(max(sb_arr))
            if max(sb_arr) > 0:
                p_hits = hit_probability(n_picks, max_sb_hits)
                p_last = max_sb_hits / DRAW
                p_total = p_hits * p_last
                freq_sb = int(1/p_total) if p_total > 0 else float('inf')
                
                if max_sb > max_base:
                    status = "OK" if freq_sb <= 20_000_000 else "TOO RARE"
                    print(f"  {risk_name} {n_picks}-pick: SB max={max_sb:.2f}x freq=1/{freq_sb} [{status}]")

    # Print JS code
    print("\n\n=== JAVASCRIPT CODE ===")
    print("const SUPERBALL_DATA = {")
    for risk_name in ['classic', 'low', 'medium', 'high']:
        print(f"    {risk_name}: {{")
        for n_picks in range(1, 11):
            arr = sb_data[risk_name][n_picks]
            vals = ", ".join(f"{v:.2f}" for v in arr)
            print(f"        {n_picks}: [{vals}],")
        print("    },")
    print("};")

if __name__ == "__main__":
    sb_data = compute_superball_data()
    verify_and_print(sb_data)
