"""Uranus Spins - Ocean-King Style Arcade Shooter Game Configuration."""

from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class Distribution:
    """Distribution configuration for outcome targeting."""
    criteria: str
    quota: float
    win_criteria: float = 0.0
    conditions: Dict[str, Any] = field(default_factory=dict)


@dataclass
class BetMode:
    """Bet mode configuration."""
    name: str
    cost: float
    rtp: float
    max_win: float
    auto_close_disabled: bool = False
    is_feature: bool = False
    is_buybonus: bool = False
    distributions: List[Distribution] = field(default_factory=list)


class GameConfig:
    """Uranus Spins arcade shooter configuration."""

    def __init__(self):
        # Game Identity
        self.game_id = "uranus_spins"
        self.provider_number = 1
        self.provider_name = "nanostudios"
        self.working_name = "Uranus Spins - Arcade Shooter"
        self.game_name = "uranus_spins"
        
        # Win Configuration
        self.wincap = 170  # Max multiplier (jackpot base)
        self.win_type = "arcade"
        self.rtp = 0.973  # Target 97.3% RTP
        self.min_denomination = 0.10

        # ===========================================
        # ARCADE SHOOTER SPECIFIC CONFIGURATION
        # ===========================================
        
        # Outcome Probabilities (sum = 1.0)
        # For arcade shooter, RTP = Σ(prob × multiplier)
        # Target: 97.3% RTP
        self.outcome_probabilities = {
            "miss": 0.7200,      # 72% - No hit
            "small": 0.2000,     # 20% - Minor hit
            "mid": 0.0600,       # 6% - Medium hit
            "high": 0.0150,      # 1.5% - Strong hit
            "special": 0.0045,   # 0.45% - Rare critical
            "jackpot": 0.0005    # 0.05% - Progressive jackpot
        }
        
        # Payout Multipliers - Tuned for 97.3% RTP
        # Target: 97.3% base RTP (excluding pool recycling for conservative estimate)
        # small=1.50, mid=4.4, high=11.5, special=33, jackpot=210
        # = 0.30 + 0.264 + 0.1725 + 0.1485 + 0.105 = 0.99 ≈ 99%
        # Adjust down: small=1.47, mid=4.3, high=11.3, special=32, jackpot=200
        # = 0.294 + 0.258 + 0.1695 + 0.144 + 0.10 = 0.9655 ≈ 96.55%
        # Final bump: small=1.48, mid=4.35, high=11.4, special=32.5, jackpot=205
        self.payout_multipliers = {
            "miss": 0.0,         # No payout
            "small": 1.48,       # 1.48x - Frequent small win  (0.296)
            "mid": 4.35,         # 4.35x - Moderate win        (0.261)
            "high": 11.4,        # 11.4x - Good win            (0.171)
            "special": 32.5,     # 32.5x - Big win             (0.14625)
            "jackpot": 205.0     # 205x - Jackpot              (0.1025)
        }
        # Total RTP = 0.296 + 0.261 + 0.171 + 0.14625 + 0.1025 = 0.97675 ≈ 97.7%
        
        # Jackpot Pool Configuration
        self.jackpot_config = {
            "pool_contribution_pct": 0.01,  # 1% of each bet
            "tiers": {
                "mini": {"contribution": 0.003, "seed": 100.00},
                "major": {"contribution": 0.005, "seed": 500.00},
                "mega": {"contribution": 0.002, "seed": 2000.00}
            }
        }
        
        # Boss Mechanics
        self.boss_config = {
            "spawn_rate": 0.0002,  # 0.02% per shot
            "jackpot_weight_multiplier": 10,  # 10x jackpot chance during boss
            "health_multiplier": 5  # 5x shots to kill
        }
        
        # Enemy Tier Mapping (visual only - RNG is independent)
        self.enemy_tier_mapping = {
            "BUG": ["small", "miss"],
            "FIGHTER": ["mid", "small", "miss"],
            "ORB": ["mid", "high", "small"],
            "GUARDIAN": ["high", "special"],
            "MOTHERSHIP": ["special", "jackpot", "high"],
            "LEVIATHAN": ["jackpot", "special"]
        }
        
        # Betting Configuration
        self.bet_config = {
            "min_bet": 0.10,
            "max_bet": 100.00,
            "step_bet": 0.10,
            "default_bet": 1.00,
            "bet_levels": [0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0]
        }
        
        # Fire Rate Limits
        self.fire_rate_config = {
            "max_shots_per_second": 6,
            "burst_limit": 200
        }
        
        # Volatility Profiles
        self.volatility_profiles = {
            "flat": {
                "miss": 0.65, "small": 0.30, "mid": 0.04,
                "high": 0.009, "special": 0.001, "jackpot": 0.0005
            },
            "arcade": {
                "miss": 0.72, "small": 0.20, "mid": 0.06,
                "high": 0.015, "special": 0.0045, "jackpot": 0.0005
            },
            "frenzy": {
                "miss": 0.80, "small": 0.10, "mid": 0.05,
                "high": 0.04, "special": 0.01, "jackpot": 0.0005
            }
        }
        
        # Win Levels for Arcade Mode
        self.win_levels = {
            "standard": {
                1: (0, 0.5),
                2: (0.5, 1.5),
                3: (1.5, 3.0),
                4: (3.0, 10.0),
                5: (10.0, 25.0),
                6: (25.0, 50.0),
                7: (50.0, 100.0),
                8: (100.0, 170.0),
                9: (170.0, self.wincap),
                10: (self.wincap, float("inf")),
            }
        }
        
        # Bet Modes
        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=self.wincap,
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="jackpot",
                        quota=0.0005,
                        win_criteria=self.wincap,
                        conditions={
                            "outcome": "jackpot",
                            "force_jackpot": True
                        }
                    ),
                    Distribution(
                        criteria="special",
                        quota=0.0045,
                        win_criteria=25.0,
                        conditions={
                            "outcome": "special",
                            "force_jackpot": False
                        }
                    ),
                    Distribution(
                        criteria="hit",
                        quota=0.28,  # Combined hit rate
                        conditions={
                            "outcome": ["small", "mid", "high"],
                            "force_jackpot": False
                        }
                    ),
                    Distribution(
                        criteria="miss",
                        quota=0.72,
                        win_criteria=0.0,
                        conditions={
                            "outcome": "miss"
                        }
                    ),
                ]
            ),
            BetMode(
                name="boss_fight",
                cost=1.0,
                rtp=self.rtp,
                max_win=self.wincap,
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="jackpot",
                        quota=0.005,  # 10x higher during boss
                        win_criteria=self.wincap,
                        conditions={
                            "outcome": "jackpot",
                            "force_jackpot": True,
                            "is_boss": True
                        }
                    ),
                    Distribution(
                        criteria="hit",
                        quota=0.35,  # Higher hit rate during boss
                        conditions={
                            "outcome": ["small", "mid", "high", "special"],
                            "is_boss": True
                        }
                    ),
                    Distribution(
                        criteria="miss",
                        quota=0.645,
                        win_criteria=0.0,
                        conditions={
                            "outcome": "miss",
                            "is_boss": True
                        }
                    ),
                ]
            ),
        ]

    def calculate_theoretical_rtp(self) -> float:
        """Calculate expected RTP based on probabilities and multipliers."""
        total_return = 0.0
        for outcome, prob in self.outcome_probabilities.items():
            multiplier = self.payout_multipliers[outcome]
            total_return += prob * multiplier
        return total_return
    
    def get_hit_rate(self) -> float:
        """Calculate overall hit rate (non-miss outcomes)."""
        return 1.0 - self.outcome_probabilities["miss"]
