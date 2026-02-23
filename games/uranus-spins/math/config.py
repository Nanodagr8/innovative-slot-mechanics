# Ocean-King Style Config for Uranus Spins
# Target RTP: 97.3%

BASE_RTP = 0.973
JACKPOT_POOL_PCT = 0.005  # 0.5% contribution

# Outcome Probabilities (sum = 1.0)
OUTCOME_PROBS = {
    "MISS": 0.700,
    "SMALL": 0.200,
    "MID": 0.070,
    "HIGH": 0.025,
    "SPECIAL": 0.004,
    "JACKPOT": 0.001
}

# Payout Multipliers (Average per tier)
PAYOUT_MULTIPLIERS = {
    "MISS": 0.0,
    "SMALL": 0.62,
    "MID": 3.2,
    "HIGH": 11.0,
    "SPECIAL": 45.0,
    "JACKPOT": 170.0  # Seed value, pool adds to this
}

# Enemy mapping to tiers (for visual resolution)
# Note: Any shot can resolve to any tier, but visuals favor these mappings
ENEMY_TIER_MAPPING = {
    "BUG": ["SMALL", "MISS"],
    "FIGHTER": ["MID", "SMALL", "MISS"],
    "ORB": ["MID", "HIGH", "SMALL"],
    "GUARDIAN": ["HIGH", "SPECIAL"],
    "MOTHERSHIP": ["SPECIAL", "JACKPOT", "HIGH"],
    "LEVIATHAN": ["JACKPOT", "SPECIAL"]
}

# Fire rate caps
MAX_SHOTS_PER_SEC = 6
SHOT_PRECISION = 1_000_000
