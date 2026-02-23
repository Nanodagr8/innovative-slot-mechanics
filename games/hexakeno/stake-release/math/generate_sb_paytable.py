"""
Superball Paytable Generator
Computes new base multipliers for Superball mode such that RTP = 97%
after accounting for 2.5x cost and conditional 7x on last-ball hits.

Strategy: Scale all existing base multipliers by a uniform factor per (risk, n_picks)
to achieve target RTP while preserving relative payout proportions.
"""
from math import comb
import json
import sys
sys.path.insert(0, '.')
from keno_config import RISK_PAYTABLES

TOTAL = 40
DRAW = 10
SB_COST = 2.5
SB_MULT = 7.0
TARGET_RTP = 0.97

def hit_probability(n_picks, k_hits):
    if k_hits > min(n_picks, DRAW) or k_hits < max(0, n_picks + DRAW - TOTAL):
        return 0.0
    return comb(n_picks, k_hits) * comb(TOTAL - n_picks, DRAW - k_hits) / comb(TOTAL, DRAW)

def compute_sb_paytable(base_paytable, risk_name):
    """Compute Superball paytable for a given risk level."""
    sb_paytable = {}
    
    for n_picks in range(1, 11):
        if n_picks not in base_paytable:
            continue
        
        # Current Superball expected return using base multipliers (per 1 unit of base bet)
        current_sb_return = 0.0
        for k_hits in range(0, n_picks + 1):
            prob = hit_probability(n_picks, k_hits)
            base_mult = base_paytable[n_picks].get(k_hits, 0.0)
            if base_mult > 0 and k_hits > 0:
                p_last_hit = k_hits / DRAW
                avg_payout = base_mult * (p_last_hit * SB_MULT + (1 - p_last_hit) * 1.0)
                current_sb_return += prob * avg_payout
        
        # Target: scale_factor * current_sb_return / SB_COST = TARGET_RTP
        # scale_factor = TARGET_RTP * SB_COST / current_sb_return
        target_return = TARGET_RTP * SB_COST  # = 2.425
        
        if current_sb_return > 0:
            scale_factor = target_return / current_sb_return
        else:
            scale_factor = 1.0
        
        # Apply scale to each multiplier
        sb_paytable[n_picks] = {}
        for k_hits, mult in base_paytable[n_picks].items():
            # Round to 2 decimal places for clean paytable
            sb_paytable[n_picks][k_hits] = round(mult * scale_factor, 2)
    
    return sb_paytable

def verify_sb_rtp(sb_paytable, risk_name):
    """Verify the Superball paytable produces correct RTP."""
    print(f"\n--- {risk_name.upper()} SUPERBALL PAYTABLE ---")
    print(f"{'Picks':>6} | {'RTP':>10} | Multipliers")
    
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
        status = "PASS" if 96.5 <= rtp_pct <= 97.5 else "FAIL"
        rtps.append(rtp_pct)
        
        mults_str = ", ".join(f"{k}h={v}x" for k, v in sorted(sb_paytable[n_picks].items()))
        print(f"{n_picks:>6} | {rtp_pct:>9.4f}% | {mults_str}")
    
    avg = sum(rtps) / len(rtps)
    mn = min(rtps)
    mx = max(rtps)
    print(f"  AVG: {avg:.4f}%  MIN: {mn:.4f}%  MAX: {mx:.4f}%")
    return rtps, avg

def format_python_paytable(paytable, var_name):
    """Format paytable as Python dict for keno_config.py."""
    lines = [f"{var_name} = {{"]
    for n_picks in sorted(paytable.keys()):
        entries = paytable[n_picks]
        inner = ", ".join(f"{k}: {v}" for k, v in sorted(entries.items()))
        lines.append(f"    {n_picks}: {{{inner}}},")
    lines.append("}")
    return "\n".join(lines)

if __name__ == "__main__":
    all_sb = {}
    for risk_name in ['classic', 'low', 'medium', 'high']:
        base_pt = RISK_PAYTABLES[risk_name]
        sb_pt = compute_sb_paytable(base_pt, risk_name)
        all_sb[risk_name] = sb_pt
        verify_sb_rtp(sb_pt, risk_name)
    
    print("\n\n" + "="*70)
    print("  PYTHON CODE FOR keno_config.py")
    print("="*70)
    
    for risk_name in ['classic', 'low', 'medium', 'high']:
        var_name = f"SUPERBALL_PAYTABLE_{risk_name.upper()}"
        print(f"\n{format_python_paytable(all_sb[risk_name], var_name)}")
    
    print(f'\nSUPERBALL_PAYTABLES = {{')
    for risk_name in ['classic', 'low', 'medium', 'high']:
        print(f'    "{risk_name}": SUPERBALL_PAYTABLE_{risk_name.upper()},')
    print("}")
