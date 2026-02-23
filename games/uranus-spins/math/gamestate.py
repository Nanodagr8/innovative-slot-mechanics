"""Uranus Spins - Arcade Shooter Game State Handler."""

import random
import time
from game_config import GameConfig


class GameState:
    """Handle game logic and outcome generation for arcade shooter."""

    def __init__(self, config: GameConfig):
        self.config = config
        self.current_mode = "base"
        self.is_boss_active = False
        self.jackpot_pool = {
            "mini": config.jackpot_config["tiers"]["mini"]["seed"],
            "major": config.jackpot_config["tiers"]["major"]["seed"],
            "mega": config.jackpot_config["tiers"]["mega"]["seed"]
        }
        
        # Simulation tracking
        self.total_wagered = 0.0
        self.total_won = 0.0
        self.outcome_counts = {k: 0 for k in config.outcome_probabilities.keys()}

    def resolve_shot(self, bet_amount: float, is_boss: bool = False) -> dict:
        """
        Resolve a single shot outcome.
        
        Args:
            bet_amount: The wager amount for this shot
            is_boss: Whether this shot is during a boss fight
            
        Returns:
            dict with outcome details
        """
        self.total_wagered += bet_amount
        
        # Contribute to jackpot
        self._contribute_jackpot(bet_amount)
        
        # Get probabilities (modified for boss if applicable)
        probs = self._get_current_probabilities(is_boss)
        
        # Sample outcome
        outcome = self._weighted_sample(probs)
        multiplier = self.config.payout_multipliers[outcome]
        
        # Calculate payout
        payout = bet_amount * multiplier
        
        # Handle jackpot
        is_jackpot = False
        jackpot_amount = 0.0
        if outcome == "jackpot":
            is_jackpot = True
            # For RTP simulation, jackpot value is in multiplier
            # In production, pool would be added here
            # jackpot_amount = self._resolve_jackpot()
            # payout += jackpot_amount
        
        self.total_won += payout
        self.outcome_counts[outcome] += 1
        
        return {
            "outcome": outcome,
            "multiplier": multiplier,
            "payout": round(payout, 2),
            "is_kill": outcome != "miss",
            "is_jackpot": is_jackpot,
            "jackpot_amount": jackpot_amount,
            "bet": bet_amount,
            "timestamp": int(time.time() * 1000)
        }

    def resolve_burst(self, bet_per_shot: float, shot_count: int, 
                      is_boss: bool = False) -> dict:
        """
        Resolve a burst of multiple shots.
        
        Args:
            bet_per_shot: Wager per shot
            shot_count: Number of shots in burst
            is_boss: Whether during boss fight
            
        Returns:
            dict with all outcomes and summary
        """
        outcomes = []
        total_payout = 0.0
        kill_count = 0
        
        for i in range(shot_count):
            result = self.resolve_shot(bet_per_shot, is_boss)
            result["shot_index"] = i + 1
            outcomes.append(result)
            total_payout += result["payout"]
            if result["is_kill"]:
                kill_count += 1
        
        return {
            "ticket_id": f"T-{int(time.time())}-{random.randint(1000, 9999)}",
            "bet_per_shot": bet_per_shot,
            "shot_count": shot_count,
            "total_wagered": round(bet_per_shot * shot_count, 2),
            "total_payout": round(total_payout, 2),
            "kill_count": kill_count,
            "hit_rate": kill_count / shot_count if shot_count > 0 else 0,
            "outcomes": outcomes
        }

    def _get_current_probabilities(self, is_boss: bool = False) -> dict:
        """Get outcome probabilities, modified for boss if active."""
        probs = dict(self.config.outcome_probabilities)
        
        if is_boss:
            # Boss fights have 10x jackpot probability
            jackpot_boost = self.config.boss_config["jackpot_weight_multiplier"]
            probs["jackpot"] *= jackpot_boost
            # Normalize (reduce miss probability to compensate)
            excess = (jackpot_boost - 1) * self.config.outcome_probabilities["jackpot"]
            probs["miss"] -= excess
        
        return probs

    def _weighted_sample(self, probabilities: dict) -> str:
        """Sample from weighted probability distribution."""
        r = random.random()
        cumulative = 0.0
        
        for outcome, prob in probabilities.items():
            cumulative += prob
            if r <= cumulative:
                return outcome
        
        return "miss"  # Fallback

    def _contribute_jackpot(self, bet_amount: float) -> None:
        """Add contribution to jackpot pools."""
        tiers = self.config.jackpot_config["tiers"]
        for tier, config in tiers.items():
            contribution = bet_amount * config["contribution"]
            self.jackpot_pool[tier] += contribution

    def _resolve_jackpot(self) -> float:
        """
        Resolve jackpot win. Currently awards full mega pool.
        Returns the pool value and resets it.
        """
        pool_value = self.jackpot_pool["mega"]
        # Reset to seed value
        self.jackpot_pool["mega"] = self.config.jackpot_config["tiers"]["mega"]["seed"]
        return pool_value

    def check_boss_spawn(self) -> bool:
        """Check if a boss should spawn on this shot."""
        return random.random() < self.config.boss_config["spawn_rate"]

    def get_rtp(self) -> float:
        """Calculate actual RTP from simulation data."""
        if self.total_wagered == 0:
            return 0.0
        return self.total_won / self.total_wagered

    def reset_stats(self) -> None:
        """Reset simulation statistics."""
        self.total_wagered = 0.0
        self.total_won = 0.0
        self.outcome_counts = {k: 0 for k in self.config.outcome_probabilities.keys()}


def run_simulation(iterations: int = 1_000_000, bet: float = 1.0) -> dict:
    """
    Run RTP simulation.
    
    Args:
        iterations: Number of shots to simulate
        bet: Bet amount per shot
        
    Returns:
        Simulation results
    """
    config = GameConfig()
    state = GameState(config)
    
    print(f"Running {iterations:,} shot simulation...")
    
    for i in range(iterations):
        state.resolve_shot(bet)
        if (i + 1) % 100000 == 0:
            print(f"  Progress: {i+1:,} / {iterations:,}")
    
    actual_rtp = state.get_rtp()
    target_rtp = config.rtp
    
    return {
        "iterations": iterations,
        "total_wagered": state.total_wagered,
        "total_won": state.total_won,
        "actual_rtp": round(actual_rtp, 5),
        "target_rtp": target_rtp,
        "rtp_delta": round(actual_rtp - target_rtp, 5),
        "hit_rate": round(1.0 - (state.outcome_counts["miss"] / iterations), 4),
        "outcome_distribution": state.outcome_counts
    }


if __name__ == "__main__":
    results = run_simulation(1_000_000)
    print("\n=== SIMULATION RESULTS ===")
    print(f"Iterations:    {results['iterations']:,}")
    print(f"Total Wagered: ${results['total_wagered']:,.2f}")
    print(f"Total Won:     ${results['total_won']:,.2f}")
    print(f"Actual RTP:    {results['actual_rtp'] * 100:.3f}%")
    print(f"Target RTP:    {results['target_rtp'] * 100:.3f}%")
    print(f"RTP Delta:     {results['rtp_delta'] * 100:+.3f}%")
    print(f"Hit Rate:      {results['hit_rate'] * 100:.2f}%")
    print("\nOutcome Distribution:")
    for outcome, count in results['outcome_distribution'].items():
        pct = count / results['iterations'] * 100
        print(f"  {outcome:10}: {count:>10,} ({pct:6.3f}%)")
