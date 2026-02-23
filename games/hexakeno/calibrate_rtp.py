"""
RTP Calibration Script for Hexa Keno
Reads current paytables from keno_config.py, computes exact mathematical RTP,
and generates new paytables scaled to target RTP (97.0%).
"""

import math
from keno_config import (
    PAYTABLE_CLASSIC, PAYTABLE_LOW, PAYTABLE_MEDIUM, PAYTABLE_HIGH
)

TARGET_RTP = 0.97  # Center of 96.5%-97.5% band
TOTAL = 40
DRAWN = 10

def nCr(n, r):
    if r < 0 or r > n:
        return 0
    return math.factorial(n) // math.factorial(r) // math.factorial(n - r)

def hit_probability(hits, picks, drawn=DRAWN, total=TOTAL):
    """Probability of exactly 'hits' matches given 'picks' selected."""
    return (nCr(drawn, hits) * nCr(total - drawn, picks - hits)) / nCr(total, picks)

def compute_pick_rtp(paytable_row, picks):
    """Compute RTP for a single pick count."""
    rtp = 0.0
    for hits, multiplier in paytable_row.items():
        prob = hit_probability(hits, picks)
        rtp += prob * multiplier
    return rtp

def compute_mode_rtp(paytable):
    """Compute average RTP across all pick counts for a mode."""
    rtps = []
    for picks in range(1, 11):
        if picks in paytable:
            rtp = compute_pick_rtp(paytable[picks], picks)
            rtps.append((picks, rtp))
    avg_rtp = sum(r for _, r in rtps) / len(rtps)
    return avg_rtp, rtps

def scale_paytable(paytable, target=TARGET_RTP):
    """Scale all multipliers uniformly so average RTP = target."""
    current_avg, _ = compute_mode_rtp(paytable)
    ratio = target / current_avg
    
    new_table = {}
    for picks, payouts in paytable.items():
        new_table[picks] = {}
        for hits, mult in payouts.items():
            new_table[picks][hits] = round(mult * ratio, 2)
    return new_table

def fine_tune_paytable(paytable, target=TARGET_RTP):
    """After uniform scaling, fine-tune each pick row to nail exact target RTP."""
    new_table = scale_paytable(paytable, target)
    
    for picks in range(1, 11):
        if picks not in new_table:
            continue
        
        payouts = new_table[picks]
        current_rtp = compute_pick_rtp(payouts, picks)
        
        if abs(current_rtp - target) < 0.0001:
            continue
        
        # Find the hit level with the highest probability (most leverage)
        best_hit = None
        best_prob = 0
        for hits in payouts:
            prob = hit_probability(hits, picks)
            if prob > best_prob:
                best_prob = prob
                best_hit = hits
        
        if best_hit is None or best_prob == 0:
            continue
        
        # Calculate contribution of all OTHER hit levels
        other_rtp = 0.0
        for hits, mult in payouts.items():
            if hits == best_hit:
                continue
            other_rtp += hit_probability(hits, picks) * mult
        
        # Solve: target = other_rtp + prob_best * new_mult
        ideal_mult = (target - other_rtp) / best_prob
        if ideal_mult > 0:
            new_table[picks][best_hit] = round(ideal_mult, 2)
    
    return new_table


def print_paytable(name, table):
    """Print paytable in Python dict format for keno_config.py."""
    print(f"PAYTABLE_{name.upper()} = {{")
    for picks in range(1, 11):
        if picks not in table:
            continue
        items = [f"{h}: {m:.2f}" for h, m in sorted(table[picks].items())]
        print(f"    {picks}: {{{', '.join(items)}}},")
    print("}")


def main():
    modes = {
        "classic": PAYTABLE_CLASSIC,
        "low": PAYTABLE_LOW,
        "medium": PAYTABLE_MEDIUM,
        "high": PAYTABLE_HIGH,
    }
    
    print("=" * 70)
    print("CURRENT RTP ANALYSIS (from keno_config.py)")
    print("=" * 70)
    
    for mode, table in modes.items():
        avg, per_pick = compute_mode_rtp(table)
        print(f"\n--- {mode.upper()} (avg RTP: {avg*100:.4f}%) ---")
        for picks, rtp in per_pick:
            status = "✓" if 0.965 <= rtp <= 0.975 else "✗"
            print(f"  Picks {picks:2d}: RTP = {rtp*100:.4f}%  {status}")
    
    print("\n" + "=" * 70)
    print(f"RECALIBRATED PAYTABLES (target: {TARGET_RTP*100:.1f}%)")
    print("=" * 70)
    
    new_tables = {}
    for mode, table in modes.items():
        new_table = fine_tune_paytable(table, TARGET_RTP)
        new_tables[mode] = new_table
        
        avg, per_pick = compute_mode_rtp(new_table)
        print(f"\n--- {mode.upper()} (new avg RTP: {avg*100:.4f}%) ---")
        for picks, rtp in per_pick:
            status = "✓" if 0.965 <= rtp <= 0.975 else "✗"
            print(f"  Picks {picks:2d}: RTP = {rtp*100:.4f}%  {status}")
    
    print("\n" + "=" * 70)
    print("COPY-PASTE FOR keno_config.py:")
    print("=" * 70 + "\n")
    
    for mode in ["classic", "low", "medium", "high"]:
        print_paytable(mode, new_tables[mode])
        print()


if __name__ == "__main__":
    main()
