
import math

# From keno_config.py
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
    10: {4: 3.36, 5: 7.68, 6: 12.48, 7: 60.48, 8: 480.00, 9: 768.00, 10: 2500.00}
}

modes = {
    "classic": PAYTABLE_CLASSIC,
    "low": PAYTABLE_LOW,
    "medium": PAYTABLE_MEDIUM,
    "high": PAYTABLE_HIGH
}

def nCr(n, r):
    if r < 0 or r > n:
        return 0
    f = math.factorial
    return f(n) // f(r) // f(n - r)

def calculate_probability(hits, picks, drawn=10, total=40):
    if hits > picks or hits > drawn:
        return 0
    numerator = nCr(drawn, hits) * nCr(total - drawn, picks - hits)
    denominator = nCr(total, picks)
    return numerator / denominator


def analyze():
    with open("rtp_analysis.txt", "w") as f:
        f.write(f"{'Mode':<10} {'Picks':<6} {'Base RTP':<10} {'Superball RTP':<15} {'Max Win':<10}\n")
        f.write("-" * 65 + "\n")
        
        averages = {"base": {}, "superball": {}}

        for mode, table_name in [("classic", PAYTABLE_CLASSIC), ("low", PAYTABLE_LOW), ("medium", PAYTABLE_MEDIUM), ("high", PAYTABLE_HIGH)]:
            total_mode_rtp = 0
            total_superball_rtp = 0
            count = 0
            f.write(f"\n--- {mode.upper()} ---\n")
            for picks in range(1, 11):
                if picks not in table_name:
                    continue
                
                rtp = 0
                superball_rtp = 0
                max_win = 0
                
                # Calculate contribution for each hit count
                for hits, multiplier in table_name[picks].items():
                    numerator = nCr(10, hits) * nCr(30, picks - hits)
                    denominator = nCr(40, picks)
                    
                    if denominator == 0:
                        prob = 0
                    else:
                        prob = numerator / denominator
                        
                    rtp += prob * multiplier
                    
                    # Superball Logic:
                    # Cost: 1.5
                    # Win Multiplier boost: If last ball hits.
                    # Prob last ball hits given 'hits' total hits = hits / 10
                    # Expected Multiplier = multiplier * (1 - hits/10) + (multiplier * 7) * (hits/10)
                    #                     = multiplier * (1 + 6 * hits / 10)
                    
                    expected_payout = multiplier * (1 + 0.6 * hits)
                    superball_rtp += prob * expected_payout
                
                rtp_percent = rtp * 100
                sb_rtp_percent = (superball_rtp / 2.5) * 100
                
                if multiplier > max_win:
                    max_win = multiplier

                f.write(f"{mode:<10} {picks:<6} {rtp_percent:.4f}% {sb_rtp_percent:.4f}%        {max_win:<10}\n")
                
                total_mode_rtp += rtp_percent
                total_superball_rtp += sb_rtp_percent
                count += 1
            
            if count > 0:
                averages["base"][mode] = total_mode_rtp / count
                averages["superball"][mode] = total_superball_rtp / count
                f.write(f"AVG BASE: {averages['base'][mode]:.4f}% | AVG SUPER: {averages['superball'][mode]:.4f}%\n")

if __name__ == "__main__":
    analyze()
