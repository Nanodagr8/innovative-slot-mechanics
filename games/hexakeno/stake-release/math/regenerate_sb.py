"""
Regenerate SUPERBALL_DATA from the updated (redistributed) STAKE_DATA.
"""
from math import comb

TOTAL = 40
DRAW = 10
SB_COST = 2.5
SB_MULT = 7.0
TARGET_RTP = 0.97

def hp(n, k):
    if k > min(n, DRAW) or k < max(0, n + DRAW - TOTAL):
        return 0.0
    return comb(n, k) * comb(TOTAL - n, DRAW - k) / comb(TOTAL, DRAW)

# Updated STAKE_DATA (post-redistribution)
STAKE_DATA = {
    "classic": {
        1: [0, 3.80], 2: [0, 1.82, 4.32], 3: [0, 0.96, 2.98, 9.98],
        4: [0, 0.77, 1.73, 4.80, 21.60], 5: [0, 0.24, 1.34, 3.94, 15.84, 34.56],
        6: [0, 0, 0.96, 3.53, 6.72, 15.84, 38.40],
        7: [0, 0, 0.45, 2.88, 4.32, 13.44, 29.76, 57.60],
        8: [0, 0, 0, 2.11, 3.84, 12.48, 21.12, 52.80, 67.20],
        9: [0, 0, 0, 1.49, 2.88, 7.68, 14.40, 42.24, 57.95, 34.56],
        10: [0, 0, 0, 1.34, 2.16, 4.32, 7.68, 16.32, 48.59, 38.40, 24.00]
    },
    "low": {
        1: [0.67, 1.78], 2: [0, 1.92, 3.65], 3: [0, 1.06, 1.32, 24.96],
        4: [0, 0, 2.11, 7.58, 86.40], 5: [0, 0, 1.44, 4.03, 12.48, 288.00],
        6: [0, 0, 1.06, 1.92, 5.95, 96.00, 672.00],
        7: [0, 0, 1.06, 1.54, 3.36, 14.40, 216.00, 672.00],
        8: [0, 0, 1.06, 1.44, 1.92, 5.28, 37.44, 96.00, 768.00],
        9: [0, 0, 1.06, 1.25, 1.63, 2.40, 7.20, 48.00, 246.04, 144.00],
        10: [0, 0, 1.06, 1.15, 1.25, 1.73, 3.36, 12.48, 51.14, 38.40, 24.00]
    },
    "medium": {
        1: [0.38, 2.64], 2: [0, 1.73, 4.90], 3: [0, 0, 2.69, 48.00],
        4: [0, 0, 1.63, 9.60, 96.00], 5: [0, 0, 1.34, 3.84, 13.44, 374.40],
        6: [0, 0, 0, 2.88, 8.64, 172.80, 681.60],
        7: [0, 0, 0, 1.92, 6.72, 28.80, 384.00, 768.00],
        8: [0, 0, 0, 1.92, 3.84, 10.56, 64.32, 384.00, 864.00],
        9: [0, 0, 0, 1.92, 2.40, 4.80, 14.40, 96.00, 484.98, 288.00],
        10: [0, 0, 0, 1.54, 1.92, 3.84, 6.72, 24.96, 102.23, 76.80, 48.00]
    },
    "high": {
        1: [0, 3.80], 2: [0, 0, 16.42], 3: [0, 0, 2.50, 50.09],
        4: [0, 0, 1.50, 19.67, 196.66], 5: [0, 0, 0, 4.32, 46.08, 432.00],
        6: [0, 0, 0, 1.20, 10.56, 258.67, 681.60],
        7: [0, 0, 0, 0, 6.72, 86.40, 384.00, 768.00],
        8: [0, 0, 0, 0, 4.80, 19.20, 259.20, 576.00, 864.00],
        9: [0, 0, 0, 0, 3.84, 10.56, 53.76, 480.00, 771.70, 460.80],
        10: [0, 0, 0, 0, 3.36, 7.68, 12.48, 60.48, 485.92, 384.00, 240.00]
    }
}

def compute_superball_data():
    sb_data = {}
    for risk_name, risk_table in STAKE_DATA.items():
        sb_risk = {}
        for n_picks, base_arr in risk_table.items():
            current_sb_return = 0.0
            for k in range(len(base_arr)):
                prob = hp(n_picks, k)
                m = base_arr[k]
                if m > 0 and k > 0:
                    p_last = k / DRAW
                    avg = m * (p_last * SB_MULT + (1 - p_last))
                    current_sb_return += prob * avg
            target_return = TARGET_RTP * SB_COST
            scale = target_return / current_sb_return if current_sb_return > 0 else 1.0
            sb_arr = [round(m * scale, 2) for m in base_arr]
            sb_risk[n_picks] = sb_arr
        sb_data[risk_name] = sb_risk
    return sb_data

def verify_sb(sb_data):
    print("=== SUPERBALL RTP VERIFICATION ===\n")
    for risk in ['classic', 'low', 'medium', 'high']:
        print(f"--- {risk.upper()} ---")
        for n in range(1, 11):
            arr = sb_data[risk][n]
            er = 0.0
            for k in range(len(arr)):
                prob = hp(n, k)
                if arr[k] > 0 and k > 0:
                    p_last = k / DRAW
                    avg = arr[k] * (p_last * SB_MULT + (1 - p_last))
                    er += prob * avg
            rtp_pct = (er / SB_COST) * 100
            mx = max(arr)
            mk = arr.index(mx)
            mf = int(1/hp(n,mk)) if hp(n,mk) > 0 else 0
            ok = "ok" if 96.5 <= rtp_pct <= 97.5 and mf <= 20_000_000 else "FAIL"
            print(f"  {n:>2}-pick: RTP={rtp_pct:.4f}% max={mx:.2f}x@{mk}h freq=1/{mf:,} [{ok}]")

    print("\n\n// === JAVASCRIPT SUPERBALL_DATA ===")
    print("const SUPERBALL_DATA = {")
    for risk in ['classic', 'low', 'medium', 'high']:
        print(f"    {risk}: {{")
        for n in range(1, 11):
            vals = ", ".join(f"{v:.2f}" for v in sb_data[risk][n])
            print(f"        {n}: [{vals}],")
        print("    },")
    print("};")

if __name__ == "__main__":
    sb = compute_superball_data()
    verify_sb(sb)
