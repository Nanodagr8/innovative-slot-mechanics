
import math
import sys

# Current Paytables (from keno_config.py)
PAYTABLE_CLASSIC = {
    1: {1: 3.80},
    2: {1: 1.82, 2: 4.32},
    3: {1: 0.96, 2: 2.98, 3: 9.98},
    4: {1: 0.77, 2: 1.73, 3: 4.80, 4: 21.60},
    5: {1: 0.24, 2: 1.34, 3: 3.94, 4: 15.84, 5: 34.56},
    6: {2: 0.96, 3: 3.53, 4: 6.72, 5: 15.84, 6: 38.40},
    7: {2: 0.45, 3: 2.88, 4: 4.32, 5: 13.44, 6: 29.76, 7: 57.60},
    8: {3: 2.11, 4: 3.84, 5: 12.48, 6: 21.12, 7: 52.80, 8: 67.20},
    9: {3: 1.49, 4: 2.88, 5: 7.68, 6: 14.40, 7: 42.24, 8: 57.60, 9: 81.60},
    10: {3: 1.34, 4: 2.16, 5: 4.32, 6: 7.68, 7: 16.32, 8: 48.00, 9: 76.80, 10: 96.00}
}
PAYTABLE_LOW = {
    1: {0: 0.67, 1: 1.78},
    2: {1: 1.92, 2: 3.65},
    3: {1: 1.06, 2: 1.32, 3: 24.96},
    4: {2: 2.11, 3: 7.58, 4: 86.40},
    5: {2: 1.44, 3: 4.03, 4: 12.48, 5: 288.00},
    6: {2: 1.06, 3: 1.92, 4: 5.95, 5: 96.00, 6: 672.00},
    7: {2: 1.06, 3: 1.54, 4: 3.36, 5: 14.40, 6: 216.00, 7: 672.00},
    8: {2: 1.06, 3: 1.44, 4: 1.92, 5: 5.28, 6: 37.44, 7: 96.00, 8: 768.00},
    9: {2: 1.06, 3: 1.25, 4: 1.63, 5: 2.40, 6: 7.20, 7: 48.00, 8: 240.00, 9: 960.00},
    10: {2: 1.06, 3: 1.15, 4: 1.25, 5: 1.73, 6: 3.36, 7: 12.48, 8: 48.00, 9: 240.00, 10: 960.00}
}
PAYTABLE_MEDIUM = {
    1: {0: 0.38, 1: 2.64},
    2: {1: 1.73, 2: 4.90},
    3: {2: 2.69, 3: 48.00},
    4: {2: 1.63, 3: 9.60, 4: 96.00},
    5: {2: 1.34, 3: 3.84, 4: 13.44, 5: 374.40},
    6: {3: 2.88, 4: 8.64, 5: 172.80, 6: 681.60},
    7: {3: 1.92, 4: 6.72, 5: 28.80, 6: 384.00, 7: 768.00},
    8: {3: 1.92, 4: 3.84, 5: 10.56, 6: 64.32, 7: 384.00, 8: 864.00},
    9: {3: 1.92, 4: 2.40, 5: 4.80, 6: 14.40, 7: 96.00, 8: 480.00, 9: 960.00},
    10: {3: 1.54, 4: 1.92, 5: 3.84, 6: 6.72, 7: 24.96, 8: 96.00, 9: 480.00, 10: 960.00}
}
PAYTABLE_HIGH = {
    1: {1: 3.80},
    2: {2: 16.42},
    3: {3: 78.24},
    4: {3: 9.60, 4: 248.64},
    5: {3: 4.32, 4: 46.08, 5: 432.00},
    6: {4: 10.56, 5: 336.00, 6: 681.60},
    7: {4: 6.72, 5: 86.40, 6: 384.00, 7: 768.00},
    8: {4: 4.80, 5: 19.20, 6: 259.20, 7: 576.00, 8: 864.00},
    9: {4: 3.84, 5: 10.56, 6: 53.76, 7: 480.00, 8: 768.00, 9: 960.00},
    10: {4: 3.36, 5: 7.68, 6: 12.48, 7: 60.48, 8: 480.00, 9: 768.00, 10: 960.00}
}

configs = {
    "classic": PAYTABLE_CLASSIC,
    "low": PAYTABLE_LOW,
    "medium": PAYTABLE_MEDIUM,
    "high": PAYTABLE_HIGH
}

def nCr(n, r):
    if r < 0 or r > n: return 0
    f = math.factorial
    return f(n) // f(r) // f(n - r)

def calculate_rtp(table):
    rtp_vals = []
    for picks in range(1, 11):
        if picks not in table:
            continue
        pick_rtp = 0
        for hits, multiplier in table[picks].items():
            prob = (nCr(10, hits) * nCr(30, picks - hits)) / nCr(40, picks)
            pick_rtp += prob * multiplier
        rtp_vals.append(pick_rtp)
    return sum(rtp_vals) / len(rtp_vals), rtp_vals

def scale_paytable(table, target_rtp=0.97):
    # Simply scale ALL values by target_rtp / current_rtp
    current_rtp, _ = calculate_rtp(table)
    ratio = target_rtp / current_rtp
    ratio = max(ratio, 1.0) # Only increase
    
    new_table = {}
    for picks, payouts in table.items():
        new_table[picks] = {}
        for hits, payout in payouts.items():
            new_val = round(payout * ratio, 2)
            new_table[picks][hits] = new_val
    return new_table

def optimize_paytable(table, target_rtp=0.97):
    new_table = scale_paytable(table, target_rtp)
    
    # Fine tune
    for picks in range(1, 11):
        if picks not in new_table: continue
        
        payouts = new_table[picks]
        hit_probs = []
        for hits in payouts.keys():
            prob = (nCr(10, hits) * nCr(30, picks - hits)) / nCr(40, picks)
            hit_probs.append((hits, prob))
        hit_probs.sort(key=lambda x: x[1], reverse=True)
        
        # Calculate current RTP for this pick
        def get_pick_rtp(p_map):
            r = 0
            for h, m in p_map.items():
                pr = (nCr(10, h) * nCr(30, picks - h)) / nCr(40, picks)
                r += pr * m
            return r

        current_pick_rtp = get_pick_rtp(payouts)
        
        # Adjust primary hit to fix RTP
        primary_hit = hit_probs[0][0] # Most frequent hit
        
        r_other = 0
        for h, m in payouts.items():
            if h == primary_hit: continue
            pr = (nCr(10, h) * nCr(30, picks - h)) / nCr(40, picks)
            r_other += pr * m
            
        prob_primary = (nCr(10, primary_hit) * nCr(30, picks - primary_hit)) / nCr(40, picks)
        
        ideal_val = (target_rtp - r_other) / prob_primary
        ideal_val_rounded = round(ideal_val, 2)
        
        if ideal_val_rounded > 0:
            new_table[picks][primary_hit] = ideal_val_rounded
            
    return new_table

def main():
    final_tables = {}
    for mode in ["classic", "low", "medium", "high"]:
        table = configs[mode]
        optimized = optimize_paytable(table, 0.97)
        final_tables[mode] = optimized
        
    print("\nCOPY THIS CONTENT KENO_CONFIG.PY:\n")
    for mode in ["classic", "low", "medium", "high"]:
        print(f"PAYTABLE_{mode.upper()} = {{")
        t = final_tables[mode]
        for p in range(1, 11):
            if p not in t: continue
            line_items = [f"{h}: {m:.2f}" for h, m in sorted(t[p].items())]
            print(f"    {p}: {{{', '.join(line_items)}}},")
        print("}\n")
        
    print("\nVERIFICATION:")
    for mode, table in final_tables.items():
        avg, _ = calculate_rtp(table)
        print(f"{mode}: {avg*100:.4f}%")

if __name__ == "__main__":
    main()
