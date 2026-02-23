"""
Hexakeno Game Engine
--------------------
Core game logic for the Hexakeno keno game.
Handles number generation, hit detection, and payout calculation.
"""

import random
from typing import List, Tuple, Set, Optional
from dataclasses import dataclass
from keno_config import (
    TOTAL_NUMBERS, DRAW_COUNT, RISK_PAYTABLES, PAYTABLE_CLASSIC,
    SUPERBALL_CONFIG, SUPERBALL_ENABLED,
    HexakenoConfig
)


@dataclass
class GameResult:
    """Result of a single Hexakeno round."""
    player_picks: List[int]          # Numbers player selected
    drawn_numbers: List[int]         # All 20 numbers drawn (in order)
    hits: List[int]                  # Which player picks were hit
    hit_count: int                   # Total hits
    last_ball: int                   # The 20th (last) ball drawn
    is_superball_hit: bool           # True if last ball is a hit
    base_payout: float               # Payout before Superball
    final_payout: float              # Final payout (with Superball if applicable)
    superball_multiplier: int        # Multiplier applied (1 or 4)


class HexakenoEngine:
    """
    Core engine for Hexakeno game.
    
    Handles all game logic including:
    - Random number generation
    - Hit detection
    - Superball mechanics
    - Payout calculation
    """
    
    def __init__(self, config: Optional[HexakenoConfig] = None):
        self.config = config or HexakenoConfig()
        self._rng = random.Random()
    
    def set_seed(self, seed: int) -> None:
        """Set RNG seed for reproducible results."""
        self._rng.seed(seed)
    
    def validate_picks(self, picks: List[int]) -> Tuple[bool, str]:
        """
        Validate player's number selections.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check count
        if len(picks) < self.config.min_picks:
            return False, f"Must pick at least {self.config.min_picks} numbers"
        if len(picks) > self.config.max_picks:
            return False, f"Cannot pick more than {self.config.max_picks} numbers"
        
        # Check for duplicates
        if len(picks) != len(set(picks)):
            return False, "Duplicate numbers not allowed"
        
        # Check range
        for num in picks:
            if num < 1 or num > self.config.total_numbers:
                return False, f"Numbers must be between 1 and {self.config.total_numbers}"
        
        return True, ""
    
    def draw_numbers(self) -> List[int]:
        """
        Draw 20 unique random numbers from 1-80.
        Order matters - the last number is the Superball.
        
        Returns:
            List of 20 numbers in draw order
        """
        numbers = list(range(1, self.config.total_numbers + 1))
        self._rng.shuffle(numbers)
        return numbers[:self.config.draw_count]
    
    def calculate_hits(self, player_picks: List[int], drawn: List[int]) -> List[int]:
        """
        Calculate which player picks were hit.
        
        Returns:
            List of hit numbers (subset of player_picks that appear in drawn)
        """
        drawn_set = set(drawn)
        return [num for num in player_picks if num in drawn_set]
    
    def get_base_payout(self, picks_count: int, hit_count: int, risk: str = "classic") -> float:
        """
        Get base payout multiplier from paytable based on risk level.
        
        Args:
            picks_count: How many numbers player selected
            hit_count: How many matches
            risk: Risk level ('classic', 'low', 'medium', 'high')
        
        Returns:
            Payout multiplier (0 for no win)
        """
        paytables = RISK_PAYTABLES.get(risk.lower(), PAYTABLE_CLASSIC)
        if picks_count not in paytables:
            return 0.0
        return paytables[picks_count].get(hit_count, 0.0)

    def get_min_paying_hits(self, picks_count: int, risk: str = "classic") -> int:
        """Get the minimum number of hits required for a payout."""
        paytables = RISK_PAYTABLES.get(risk.lower(), PAYTABLE_CLASSIC)
        if picks_count not in paytables:
            return 999
        # Find min hits with payout > 0
        paying_hits = [h for h, p in paytables[picks_count].items() if p > 0]
        return min(paying_hits) if paying_hits else 999
    
    def play_round(self, player_picks: List[int], bet_amount: float = 1.0, risk: str = "classic", use_superball: bool = False) -> GameResult:
        """
        Play a single round of Hexakeno.
        """
        # Validate picks
        is_valid, error = self.validate_picks(player_picks)
        if not is_valid:
            raise ValueError(error)
        
        # Draw numbers
        drawn_numbers = self.draw_numbers()
        last_ball = drawn_numbers[-1]  # The 20th ball
        
        # Calculate hits
        hits = self.calculate_hits(player_picks, drawn_numbers)
        hit_count = len(hits)
        
        # Superball Rules Check
        # Rule 1: Min Hits increases by 1 if Superball is active
        min_hits_required = self.get_min_paying_hits(len(player_picks), risk)
        
        if use_superball and self.config.superball_enabled:
            # User Rule: "increase risk of not landing the minimum by +1"
            # So if base game needs 3, Superball needs 4.
            # But we must clamp to max picks (e.g. 1-spot needs 1+1=2 -> Impossible. Clamp to 1).
            raw_req = min_hits_required + self.config.superball_config['hit_offset']
            effective_min_hits = min(raw_req, len(player_picks))
        else:
            effective_min_hits = min_hits_required

        # Calculate Payouts
        base_payout = self.get_base_payout(len(player_picks), hit_count, risk=risk)
        
        # logic: If we don't meet the new effective requirement, Payout is 0.
        if hit_count < effective_min_hits:
            base_payout = 0.0

        # Check Superball Hit
        # Rule 2: If last ball hits, apply multiplier (4x)
        is_superball_hit = last_ball in player_picks and self.config.superball_enabled and use_superball
        
        multiplier = 1.0
        if is_superball_hit and base_payout > 0:
             # Use Variable Multiplier based on Risk Level and Picks Count
             sb_config = self.config.superball_config
             mode_mults = sb_config.get('multipliers', {}).get(risk.lower(), {})
             
             if isinstance(mode_mults, dict):
                 multiplier = mode_mults.get(len(player_picks), 4.0)
             else:
                 multiplier = mode_mults # Fallback for old flat structure
        
        final_payout = base_payout * multiplier
        
        # Max Win Cap (10,000x as per user request)
        if final_payout > 10000.0:
            final_payout = 10000.0
            
        return GameResult(
            player_picks=player_picks,
            drawn_numbers=drawn_numbers,
            hits=hits,
            hit_count=hit_count,
            last_ball=last_ball,
            is_superball_hit=is_superball_hit,
            base_payout=base_payout * bet_amount,
            final_payout=final_payout * bet_amount,
            superball_multiplier=int(multiplier)
        )
    
    def quick_pick(self, count: int) -> List[int]:
        """
        Generate random quick pick numbers.
        
        Args:
            count: How many numbers to pick (1-10)
        
        Returns:
            List of randomly selected numbers
        """
        if count < self.config.min_picks or count > self.config.max_picks:
            raise ValueError(f"Count must be between {self.config.min_picks} and {self.config.max_picks}")
        
        numbers = list(range(1, self.config.total_numbers + 1))
        self._rng.shuffle(numbers)
        return sorted(numbers[:count])


def demo_round():
    """Demonstrate a single game round."""
    engine = HexakenoEngine()
    
    # Player picks 10 numbers
    picks = engine.quick_pick(10)
    print(f"\n🎯 Player Picks: {picks}")
    
    # Play round
    result = engine.play_round(picks)
    
    print(f"\n🎱 Drawn Numbers: {result.drawn_numbers}")
    print(f"⭐ Last Ball (Superball): {result.last_ball}")
    print(f"\n✨ Hits: {result.hits} ({result.hit_count}/{len(picks)})")
    
    if result.is_superball_hit:
        print(f"🌟 SUPERBALL HIT! {result.superball_multiplier}x MULTIPLIER!")
    
    print(f"\n💰 Base Payout: {result.base_payout}x")
    print(f"💎 Final Payout: {result.final_payout}x")


if __name__ == "__main__":
    demo_round()
