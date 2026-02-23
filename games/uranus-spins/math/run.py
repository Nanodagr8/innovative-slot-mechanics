"""Uranus Spins - Main execution file for math engine."""

from gamestate import GameState, run_simulation
from game_config import GameConfig
import json
import os

if __name__ == "__main__":
    
    # Configuration
    num_simulations = 1_000_000  # 1M shots for RTP verification
    bet_amount = 1.00
    output_results = True
    
    print("=" * 60)
    print("  URANUS SPINS - MATH ENGINE")
    print("  Ocean-King Style Arcade Shooter")
    print("=" * 60)
    
    # Load configuration
    config = GameConfig()
    
    print(f"\nGame ID:     {config.game_id}")
    print(f"Target RTP:  {config.rtp * 100:.2f}%")
    print(f"Win Cap:     {config.wincap}x")
    print(f"Hit Rate:    {config.get_hit_rate() * 100:.1f}%")
    print(f"Theo. RTP:   {config.calculate_theoretical_rtp() * 100:.4f}%")
    
    print("\n--- Outcome Probabilities ---")
    for outcome, prob in config.outcome_probabilities.items():
        mult = config.payout_multipliers[outcome]
        print(f"  {outcome:10}: {prob*100:6.3f}% -> {mult:>6.1f}x")
    
    print("\n--- Running Simulation ---")
    results = run_simulation(num_simulations, bet_amount)
    
    print("\n" + "=" * 60)
    print("  SIMULATION RESULTS")
    print("=" * 60)
    print(f"Iterations:      {results['iterations']:,}")
    print(f"Total Wagered:   ${results['total_wagered']:,.2f}")
    print(f"Total Won:       ${results['total_won']:,.2f}")
    print(f"")
    print(f"Actual RTP:      {results['actual_rtp'] * 100:.4f}%")
    print(f"Target RTP:      {results['target_rtp'] * 100:.4f}%")
    print(f"RTP Variance:    {results['rtp_delta'] * 100:+.4f}%")
    print(f"Hit Rate:        {results['hit_rate'] * 100:.2f}%")
    
    print("\n--- Outcome Distribution ---")
    for outcome, count in results['outcome_distribution'].items():
        expected = config.outcome_probabilities[outcome] * 100
        actual = count / results['iterations'] * 100
        delta = actual - expected
        print(f"  {outcome:10}: {count:>10,} ({actual:6.3f}%) [expected: {expected:6.3f}%, Δ: {delta:+.3f}%]")
    
    # Verify RTP is within tolerance
    rtp_tolerance = 0.01  # 1%
    rtp_pass = abs(results['rtp_delta']) <= rtp_tolerance
    
    print("\n" + "=" * 60)
    print(f"  RTP VERIFICATION: {'✓ PASS' if rtp_pass else '✗ FAIL'}")
    print("=" * 60)
    
    if output_results:
        # Write results to library folder
        library_path = os.path.join(os.path.dirname(__file__), "..", "library")
        os.makedirs(library_path, exist_ok=True)
        
        output_file = os.path.join(library_path, "simulation_results.json")
        with open(output_file, "w") as f:
            json.dump({
                "game_id": config.game_id,
                "simulation": results,
                "config": {
                    "rtp": config.rtp,
                    "wincap": config.wincap,
                    "probabilities": config.outcome_probabilities,
                    "multipliers": config.payout_multipliers,
                    "jackpot": config.jackpot_config,
                    "boss": config.boss_config
                }
            }, f, indent=2)
        
        print(f"\nResults written to: {output_file}")
    
    print("\nDone.")
