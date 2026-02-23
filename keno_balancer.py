from math import comb
from typing import Dict

TOTAL_NUMBERS = 80
DRAW_COUNT = 20
TARGET_RTP = 0.96
MAX_WIN = 10000.0

def prob(picks, hits):
    if hits > picks or hits > DRAW_COUNT or (picks - hits) > (TOTAL_NUMBERS - DRAW_COUNT):
        return 0.0
    return (comb(picks, hits) * comb(TOTAL_NUMBERS - picks, DRAW_COUNT - hits)) / comb(TOTAL_NUMBERS, DRAW_COUNT)

def calculate_rtp(picks, paytable):
    return sum(prob(picks, h) * v for h, v in paytable.items())

def find_superball_multiplier(picks, paytable):
    # Target total RTP (including Superball) is 0.96 * 1.5 = 1.44
    target_total = 1.44
    base_rtp = calculate_rtp(picks, paytable)
    needed_bonus = target_total - base_rtp
    
    # bonus_rtp = sum(prob(picks, h) * (h/20) * payout_h * (M - 1))
    # M - 1 = needed_bonus / sum(prob(picks, h) * (h/20) * payout_h)
    
    denom = sum(prob(picks, h) * (h/20) * v for h, v in paytable.items())
    if denom == 0: return 4.0
    
    return 1 + (needed_bonus / denom)

# Reference Stake High Risk (approximate)
# Reference Stake High Risk (approximate) - Added Hit 4 to Pick 10 for stability
HIGH_RISK_TEMPLATES = {
    1: {1: 3.84},
    2: {2: 15.3},
    3: {3: 65.0},
    4: {3: 6.0, 4: 250.0},
    5: {3: 2.0, 4: 30.0, 5: 500.0},
    6: {4: 10.0, 5: 150.0, 6: 1500.0},
    7: {4: 5.0, 5: 45.0, 6: 300.0, 7: 5000.0},
    8: {4: 2.0, 5: 15.0, 6: 150.0, 7: 800.0, 8: 7500.0},
    9: {4: 1.0, 5: 5.0, 6: 50.0, 7: 150.0, 8: 1500.0, 9: 10000.0},
    10: {4: 1.0, 5: 4.0, 6: 15.0, 7: 50.0, 8: 200.0, 9: 1500.0, 10: 10000.0}
}

print("CALIBRATED HIGH RISK PAYTABLE (96% RTP):")
print("PAYTABLE_HIGH = {")
sb_multipliers = {}
for picks, table in HIGH_RISK_TEMPLATES.items():
    # Adjust to exactly 0.96 RTP
    current = calculate_rtp(picks, table)
    factor = 0.96 / current
    adjusted = {h: round(v * factor, 2) for h, v in table.items()}
    
    # Cap 
    for h in adjusted:
        if adjusted[h] > MAX_WIN: adjusted[h] = MAX_WIN
    
    # Re-calc factor if capped
    current = calculate_rtp(picks, adjusted)
    # Simple iterative fit
    for _ in range(5):
        if 0.959 <= current <= 0.961: break
        if current == 0: break
        factor = 0.96 / current
        # Only scale non-maxed items
        adjusted = {h: (round(v * factor, 2) if v < MAX_WIN else v) for h, v in adjusted.items()}
        current = calculate_rtp(picks, adjusted)

    print(f"    {picks}: {adjusted}, # RTP: {current:.4f}")
    sb_multipliers[picks] = round(find_superball_multiplier(picks, adjusted), 2)

print("}")
print("\nSUPERBALL MULTIPLIERS (HIGH RISK):")
print(sb_multipliers)
