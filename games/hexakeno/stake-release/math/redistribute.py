"""
Option C v2: Fixed redistribution — handles High risk special cases properly.
1. 9-pick/10-pick all modes: Move max payout to 8-hit (1-in-1.7M)
2. High 3-pick: Add 2-hit payout for win frequency
3. High 6-pick: Add 3-hit payout — adjust 5-hit (not 6-hit to avoid negative)
4. High 4-pick: Fix pre-existing 1185% RTP bug (9.60 at 2-hit is wrong)
All changes preserve ~95% RTP.
"""
from math import comb
import copy, json

TOTAL = 40
DRAW = 10

def hp(n, k):
    if k > min(n, DRAW) or k < max(0, n + DRAW - TOTAL):
        return 0.0
    return comb(n, k) * comb(TOTAL - n, DRAW - k) / comb(TOTAL, DRAW)

def rtp(arr, n):
    return sum(hp(n, k) * arr[k] for k in range(len(arr)))

def win_rate(arr, n):
    p = sum(hp(n, k) for k in range(len(arr)) if arr[k] > 0)
    return 1/p if p > 0 else float('inf')

def max_info(arr, n):
    m = max(arr)
    k = arr.index(m)
    p = hp(n, k)
    return m, k, int(1/p) if p > 0 else float('inf')

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
        4: [0, 0, 9.60, 248.64],  # BUG: 9.60 at 2-hits -> 1185% RTP
        5: [0, 0, 0, 4.32, 46.08, 432.00],
        6: [0, 0, 0, 0, 10.56, 336.00, 681.60],
        7: [0, 0, 0, 0, 6.72, 86.40, 384.00, 768.00],
        8: [0, 0, 0, 0, 4.80, 19.20, 259.20, 576.00, 864.00],
        9: [0, 0, 0, 0, 3.84, 10.56, 53.76, 480.00, 768.00, 960.00],
        10: [0, 0, 0, 0, 3.36, 7.68, 12.48, 60.48, 480.00, 768.00, 1000.00]
    }
}

def build_new_data():
    NEW = copy.deepcopy(STAKE_DATA)
    TARGET_RTP = 0.95  # Frontend paytable targets ~95%
    
    # === FIX 1: High 4-pick (9.60 at 2-hits is wrong) ===
    # High risk pattern: 0 for low hits, big payouts for high hits
    # Looking at High 5-pick: [0, 0, 0, 4.32, 46.08, 432.00] — 2-hits = 0
    # So High 4-pick 2-hits should be 0 too. Re-tune from scratch.
    # Target: ~95% RTP, high-risk (big top payout, zeros for low hits)
    # P(2h/4p) = 0.2531, P(3h/4p) = 0.0230, P(4h/4p) = 0.0006
    n = 4
    # Set 2-hit = 0, solve for 3-hit and 4-hit with high volatility
    # Keep ratio similar to original: 3-hit ~ 4-hit/10
    p3, p4 = hp(n, 3), hp(n, 4)
    # 0.95 = p3 * m3 + p4 * m4, with m3 = m4/10
    # 0.95 = p3 * m4/10 + p4 * m4 = m4 * (p3/10 + p4)
    m4 = TARGET_RTP / (p3/10 + p4)
    m3 = m4 / 10
    NEW['high'][4] = [0, 0, 0, round(m3, 2), round(m4, 2)]
    
    # === FIX 2: High 3-pick (add 2-hit payout for win frequency) ===
    n = 3
    # Currently [0, 0, 0, 78.24] -> win freq = 1-in-82 (FAIL)
    # P(2h/3p) = 0.1366, P(3h/3p) = 0.0121
    # Add 2-hit payout, re-solve for 3-hit to keep ~95% RTP
    new_2hit = 2.50
    p2, p3 = hp(n, 2), hp(n, 3)
    m3_new = (TARGET_RTP - p2 * new_2hit) / p3
    NEW['high'][3] = [0, 0, round(new_2hit, 2), round(m3_new, 2)]
    
    # === FIX 3: High 6-pick (add 3-hit payout for win frequency) ===
    n = 6
    # Currently [0, 0, 0, 0, 10.56, 336.00, 681.60] -> win freq = 1-in-39 (FAIL)
    # P(3h/6p) = 0.1223, P(4h/6p) = 0.0193, P(5h/6p) = 0.0015, P(6h/6p) = 0.00005
    # Add 3-hit payout, reduce 5-hit to compensate (5-hit has enough prob mass)
    new_3hit = 1.20
    p3, p5 = hp(n, 3), hp(n, 5)
    old_rtp = rtp(STAKE_DATA['high'][6], n)
    rtp_other = sum(hp(n, k) * NEW['high'][6][k] for k in [0,1,2,4,6])
    # old_rtp = rtp_other + p3*new_3hit + p5*new_5hit
    new_5hit = (old_rtp - rtp_other - p3 * new_3hit) / p5
    NEW['high'][6] = [0, 0, 0, round(new_3hit, 2), 10.56, round(new_5hit, 2), 681.60]
    
    # === FIX 4: All modes 9-pick — move max from 9-hit to 8-hit ===
    for risk in ['classic', 'low', 'medium', 'high']:
        n = 9
        arr = NEW[risk][9]
        old_r = rtp(arr, n)
        new_arr = arr.copy()
        # Make 9-hit = 60% of current 8-hit, solve for new 8-hit
        new_arr[9] = round(arr[8] * 0.6, 2)
        rtp_rest = sum(hp(n, k) * new_arr[k] for k in range(len(new_arr)) if k != 8)
        new_arr[8] = round((old_r - rtp_rest) / hp(n, 8), 2)
        NEW[risk][9] = new_arr
    
    # === FIX 5: All modes 10-pick — move max from 10-hit to 8-hit ===
    for risk in ['classic', 'low', 'medium', 'high']:
        n = 10
        arr = NEW[risk][10]
        old_r = rtp(arr, n)
        new_arr = arr.copy()
        # Make 9-hit = 80% of current 8-hit, 10-hit = 50% of current 8-hit
        new_arr[9] = round(arr[8] * 0.8, 2)
        new_arr[10] = round(arr[8] * 0.5, 2)
        rtp_rest = sum(hp(n, k) * new_arr[k] for k in range(len(new_arr)) if k != 8)
        new_arr[8] = round((old_r - rtp_rest) / hp(n, 8), 2)
        NEW[risk][10] = new_arr
    
    return NEW

if __name__ == "__main__":
    NEW = build_new_data()
    
    print("=" * 100)
    print("  OPTION C v2: REDISTRIBUTED PAYTABLES (ALL FIXES)")
    print("=" * 100)
    
    all_pass = True
    for risk in ['classic', 'low', 'medium', 'high']:
        print(f"\n--- {risk.upper()} ---")
        for n in range(1, 11):
            arr = NEW[risk][n]
            r = rtp(arr, n) * 100
            wr = win_rate(arr, n)
            mx, mk, mf = max_info(arr, n)
            
            changed = arr != STAKE_DATA[risk][n]
            
            r_ok = 94.0 <= r <= 97.5
            w_ok = wr <= 20
            m_ok = mf <= 20_000_000
            
            neg = any(v < 0 for v in arr)
            
            if not (r_ok and w_ok and m_ok) or neg:
                all_pass = False
            
            flags = []
            if not r_ok: flags.append(f"RTP={r:.1f}%")
            if not w_ok: flags.append(f"win=1/{wr:.0f}")
            if not m_ok: flags.append(f"freq=1/{mf:,}")
            if neg: flags.append("NEGATIVE!")
            
            status = " FAIL:" + ",".join(flags) if flags else " ok"
            tag = " [CHANGED]" if changed else ""
            
            print(f"  {n:>2}-pick: RTP={r:.4f}% max={mx:.2f}x@{mk}h f=1/{mf:<12,} win=1/{wr:.1f}{status}{tag}")
            if changed:
                print(f"         OLD: {[round(x,2) for x in STAKE_DATA[risk][n]]}")
                print(f"         NEW: {[round(x,2) for x in arr]}")
    
    if all_pass:
        print(f"\n{'='*100}")
        print("  ALL CHECKS PASS")
        print(f"{'='*100}")
    else:
        print(f"\n{'='*100}")
        print("  SOME CHECKS FAILED — review above")
        print(f"{'='*100}")
    
    # Print JS
    print(f"\n\n// === JAVASCRIPT STAKE_DATA (copy to game.js) ===")
    print("const STAKE_DATA = {")
    for risk in ['classic', 'low', 'medium', 'high']:
        print(f"    {risk}: {{")
        for n in range(1, 11):
            vals = ", ".join(f"{v:.2f}" for v in NEW[risk][n])
            print(f"        {n}: [{vals}],")
        print("    },")
    print("};")
