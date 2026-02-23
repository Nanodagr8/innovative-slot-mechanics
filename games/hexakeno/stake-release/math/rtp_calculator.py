"""
Exact RTP Calculator for Hexa Keno Superball
Includes both Base Game and Superball mode RTPs.
Uses hypergeometric probability for precise theoretical RTP.
Game: 40 numbers, 10 drawn, player picks 1-10.
"""
from math import comb
import sys
sys.path.insert(0, '.')
from keno_config import RISK_PAYTABLES

TOTAL = 40
DRAW = 10
SUPERBALL_COST = 2.5   # Superball costs 2.5x the base bet
SUPERBALL_MULT = 7.0   # 7x multiplier when last ball is a hit

def hit_probability(n_picks, k_hits):
    if k_hits > min(n_picks, DRAW) or k_hits < max(0, n_picks + DRAW - TOTAL):
        return 0.0
    return comb(n_picks, k_hits) * comb(TOTAL - n_picks, DRAW - k_hits) / comb(TOTAL, DRAW)

def compute_base_rtp(paytable, label=""):
    print(f"\n--- {label} (BASE GAME) ---")
    print(f"{'Picks':>6} | {'RTP':>10} | {'Status':>6}")
    rtps = []
    for n_picks in range(1, 11):
        if n_picks not in paytable:
            continue
        rtp = 0.0
        for k_hits in range(0, n_picks + 1):
            prob = hit_probability(n_picks, k_hits)
            mult = paytable[n_picks].get(k_hits, 0.0)
            rtp += prob * mult
        rtp_pct = rtp * 100
        status = "PASS" if 96.5 <= rtp_pct <= 97.5 else "FAIL"
        rtps.append(rtp_pct)
        print(f"{n_picks:>6} | {rtp_pct:>9.4f}% | {status:>6}")
    avg_rtp = sum(rtps) / len(rtps) if rtps else 0
    mn = min(rtps) if rtps else 0
    mx = max(rtps) if rtps else 0
    print(f"  AVG: {avg_rtp:.4f}%  MIN: {mn:.4f}%  MAX: {mx:.4f}%")
    return rtps, avg_rtp

def compute_superball_rtp(paytable, label=""):
    """
    Superball RTP calculation:
    - Cost = 2.5x base bet
    - If the last (10th) drawn ball matches a player pick AND base_payout > 0: payout *= 7
    - P(last ball is a hit | k total hits in 10 draws) = k / 10
    
    Expected return per unit base bet =
      sum over k: P(k hits) * base_mult(k) * [(k/10)*7 + ((10-k)/10)*1]  if base_mult > 0
      
    RTP = Expected return / 2.5
    """
    print(f"\n--- {label} (SUPERBALL MODE, cost=2.5x) ---")
    print(f"{'Picks':>6} | {'RTP':>10} | {'Status':>6} | {'vs Base':>8}")
    rtps = []
    base_rtps = []
    
    for n_picks in range(1, 11):
        if n_picks not in paytable:
            continue
        
        # Base game RTP (for comparison)
        base_rtp = 0.0
        for k_hits in range(0, n_picks + 1):
            prob = hit_probability(n_picks, k_hits)
            mult = paytable[n_picks].get(k_hits, 0.0)
            base_rtp += prob * mult
        base_rtps.append(base_rtp * 100)
        
        # Superball expected return per 1 unit of BASE bet
        expected_return = 0.0
        for k_hits in range(0, n_picks + 1):
            prob = hit_probability(n_picks, k_hits)
            base_mult = paytable[n_picks].get(k_hits, 0.0)
            
            if base_mult > 0 and k_hits > 0:
                # P(last ball is a hit | k hits) = k/10
                # If last ball hit: payout = base_mult * 7
                # If last ball miss: payout = base_mult * 1
                p_last_hit = k_hits / DRAW
                avg_payout = base_mult * (p_last_hit * SUPERBALL_MULT + (1 - p_last_hit) * 1.0)
                expected_return += prob * avg_payout
            # If base_mult == 0, superball doesn't help
        
        # RTP = expected return / cost multiplier
        sb_rtp_pct = (expected_return / SUPERBALL_COST) * 100
        status = "PASS" if 96.5 <= sb_rtp_pct <= 97.5 else "FAIL"
        diff = sb_rtp_pct - base_rtp * 100
        rtps.append(sb_rtp_pct)
        print(f"{n_picks:>6} | {sb_rtp_pct:>9.4f}% | {status:>6} | {diff:>+7.3f}%")
    
    avg_rtp = sum(rtps) / len(rtps) if rtps else 0
    mn = min(rtps) if rtps else 0
    mx = max(rtps) if rtps else 0
    print(f"  AVG: {avg_rtp:.4f}%  MIN: {mn:.4f}%  MAX: {mx:.4f}%")
    return rtps, avg_rtp

if __name__ == "__main__":
    base_results = {}
    sb_results = {}
    
    for risk_name in ['classic', 'low', 'medium', 'high']:
        paytable = RISK_PAYTABLES[risk_name]
        b_rtps, b_avg = compute_base_rtp(paytable, risk_name.upper())
        base_results[risk_name] = (b_rtps, b_avg)
        
        s_rtps, s_avg = compute_superball_rtp(paytable, risk_name.upper())
        sb_results[risk_name] = (s_rtps, s_avg)
    
    print(f"\n{'='*70}")
    print(f"  CROSS-MODE SUMMARY")
    print(f"{'='*70}")
    print(f"{'Mode':>10} | {'Base AVG':>10} | {'SB AVG':>10} | {'Base':>6} | {'SB':>6}")
    print(f"{'-'*10}-+-{'-'*10}-+-{'-'*10}-+-{'-'*6}-+-{'-'*6}")
    
    b_avgs = []
    s_avgs = []
    all_base_pass = True
    all_sb_pass = True
    
    for risk_name in ['classic', 'low', 'medium', 'high']:
        b_rtps, b_avg = base_results[risk_name]
        s_rtps, s_avg = sb_results[risk_name]
        b_ok = all(96.5 <= r <= 97.5 for r in b_rtps)
        s_ok = all(96.5 <= r <= 97.5 for r in s_rtps)
        if not b_ok: all_base_pass = False
        if not s_ok: all_sb_pass = False
        b_avgs.append(b_avg)
        s_avgs.append(s_avg)
        b_st = "PASS" if b_ok else "FAIL"
        s_st = "PASS" if s_ok else "FAIL"
        print(f"{risk_name:>10} | {b_avg:>9.4f}% | {s_avg:>9.4f}% | {b_st:>6} | {s_st:>6}")
    
    b_spread = max(b_avgs) - min(b_avgs)
    s_spread = max(s_avgs) - min(s_avgs)
    print(f"\nBase mode spread: {b_spread:.4f}% (target: <= 0.5%)")
    print(f"Superball mode spread: {s_spread:.4f}% (target: <= 0.5%)")
    print(f"\nBase game: {'ALL PASS' if all_base_pass else 'HAS FAILURES'}")
    print(f"Superball: {'ALL PASS' if all_sb_pass else 'HAS FAILURES -- tuning needed'}")
