"""
Exact RTP Verifier for Hexa Keno Superball
Verifies BOTH the backend SUPERBALL_PAYTABLES (keno_config.py)
AND the frontend SUPERBALL_DATA (game.js) using exact hypergeometric probability.
"""
from math import comb
import sys
sys.path.insert(0, '.')
from keno_config import RISK_PAYTABLES, SUPERBALL_PAYTABLES

TOTAL = 40
DRAW = 10
SB_COST = 2.5
SB_MULT = 7.0  # Conditional 7x when last ball hits

def hit_probability(n_picks, k_hits):
    if k_hits > min(n_picks, DRAW) or k_hits < max(0, n_picks + DRAW - TOTAL):
        return 0.0
    return comb(n_picks, k_hits) * comb(TOTAL - n_picks, DRAW - k_hits) / comb(TOTAL, DRAW)

# === FRONTEND SUPERBALL_DATA (from game.js) ===
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

def compute_sb_rtp_dict(sb_paytable, risk_name):
    """Verify Superball RTP for backend dict-format paytable (keno_config.py)."""
    rtps = []
    for n_picks in range(1, 11):
        if n_picks not in sb_paytable:
            continue
        expected_return = 0.0
        for k_hits in range(0, n_picks + 1):
            prob = hit_probability(n_picks, k_hits)
            sb_mult = sb_paytable[n_picks].get(k_hits, 0.0)
            if sb_mult > 0 and k_hits > 0:
                p_last_hit = k_hits / DRAW
                avg_payout = sb_mult * (p_last_hit * SB_MULT + (1 - p_last_hit) * 1.0)
                expected_return += prob * avg_payout
        rtp_pct = (expected_return / SB_COST) * 100
        rtps.append((n_picks, rtp_pct))
    return rtps

def compute_sb_rtp_array(sb_data_arr, risk_name):
    """Verify Superball RTP for frontend array-format paytable (game.js)."""
    rtps = []
    for n_picks in range(1, 11):
        if n_picks not in sb_data_arr:
            continue
        arr = sb_data_arr[n_picks]
        expected_return = 0.0
        for k_hits in range(len(arr)):
            prob = hit_probability(n_picks, k_hits)
            if arr[k_hits] > 0 and k_hits > 0:
                p_last_hit = k_hits / DRAW
                avg_payout = arr[k_hits] * (p_last_hit * SB_MULT + (1 - p_last_hit) * 1.0)
                expected_return += prob * avg_payout
        rtp_pct = (expected_return / SB_COST) * 100
        rtps.append((n_picks, rtp_pct))
    return rtps

def compute_base_rtp(paytable, risk_name):
    """Compute base game RTP for backend dict-format paytable."""
    rtps = []
    for n_picks in range(1, 11):
        if n_picks not in paytable:
            continue
        rtp = 0.0
        for k_hits in range(0, n_picks + 1):
            prob = hit_probability(n_picks, k_hits)
            mult = paytable[n_picks].get(k_hits, 0.0)
            rtp += prob * mult
        rtps.append((n_picks, rtp * 100))
    return rtps

if __name__ == "__main__":
    all_pass = True
    
    print("=" * 80)
    print("  HEXA KENO SUPERBALL - FULL RTP VERIFICATION")
    print("=" * 80)
    
    # 1. Backend Base Game RTP
    print("\n[1] BACKEND BASE GAME (keno_config.py RISK_PAYTABLES)")
    print("-" * 60)
    for risk in ['classic', 'low', 'medium', 'high']:
        rtps = compute_base_rtp(RISK_PAYTABLES[risk], risk)
        vals = [r for _, r in rtps]
        avg = sum(vals) / len(vals)
        mn, mx = min(vals), max(vals)
        ok = all(96.5 <= r <= 97.5 for r in vals)
        if not ok: all_pass = False
        status = "PASS" if ok else "FAIL"
        print(f"  {risk:>10}: AVG={avg:.4f}% MIN={mn:.4f}% MAX={mx:.4f}% [{status}]")
        for n, r in rtps:
            s = "ok" if 96.5 <= r <= 97.5 else "FAIL"
            print(f"             {n:>2}-pick: {r:.4f}% [{s}]")
    
    # 2. Backend Superball RTP
    print("\n[2] BACKEND SUPERBALL (keno_config.py SUPERBALL_PAYTABLES)")
    print("-" * 60)
    for risk in ['classic', 'low', 'medium', 'high']:
        rtps = compute_sb_rtp_dict(SUPERBALL_PAYTABLES[risk], risk)
        vals = [r for _, r in rtps]
        avg = sum(vals) / len(vals)
        mn, mx = min(vals), max(vals)
        ok = all(96.5 <= r <= 97.5 for r in vals)
        if not ok: all_pass = False
        status = "PASS" if ok else "FAIL"
        print(f"  {risk:>10}: AVG={avg:.4f}% MIN={mn:.4f}% MAX={mx:.4f}% [{status}]")
        for n, r in rtps:
            s = "ok" if 96.5 <= r <= 97.5 else "FAIL"
            print(f"             {n:>2}-pick: {r:.4f}% [{s}]")
    
    # 3. Frontend Superball RTP
    print("\n[3] FRONTEND SUPERBALL (game.js SUPERBALL_DATA)")
    print("-" * 60)
    for risk in ['classic', 'low', 'medium', 'high']:
        rtps = compute_sb_rtp_array(SUPERBALL_DATA[risk], risk)
        vals = [r for _, r in rtps]
        avg = sum(vals) / len(vals)
        mn, mx = min(vals), max(vals)
        ok = all(96.5 <= r <= 97.5 for r in vals)
        if not ok: all_pass = False
        status = "PASS" if ok else "FAIL"
        print(f"  {risk:>10}: AVG={avg:.4f}% MIN={mn:.4f}% MAX={mx:.4f}% [{status}]")
        for n, r in rtps:
            s = "ok" if 96.5 <= r <= 97.5 else "FAIL"
            print(f"             {n:>2}-pick: {r:.4f}% [{s}]")
    
    # Summary
    print("\n" + "=" * 80)
    if all_pass:
        print("  GLOBAL VERIFICATION: ALL 120 CONFIGURATIONS PASS (96.5% - 97.5%)")
    else:
        print("  GLOBAL VERIFICATION: SOME CONFIGURATIONS FAILED")
    print("=" * 80)
