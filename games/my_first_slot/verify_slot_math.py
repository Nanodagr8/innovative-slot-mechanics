import sys
import os
import time

# Add root directory to path to allow importing 'src'
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
sys.path.insert(0, root_dir)

# Also add the game directory itself to allow local imports like 'game_override'
sys.path.insert(0, current_dir)

from game_config import GameConfig
from gamestate import GameState

class MockSim:
    """Mock simulation object required by gamestate.run_spin"""
    def __init__(self):
        pass

def verify_slot_math(num_spins=1_000_000):
    print(f"--- Verifying My First Slot (Spins: {num_spins}) ---")
    
    # Initialize
    config = GameConfig()
    gamestate = GameState(config)
    
    # Tracking
    total_bet = 0.0
    total_win = 0.0
    hits = 0
    max_win_observed = 0
    
    start_time = time.time()
    
    # Simulation Loop
    # We use a mock sim object because GameState.run_spin might expect it for seeding, 
    # but based on the code read, it just calls self.reset_seed(sim).
    mock_sim = MockSim()
    
    for i in range(num_spins):
        # Bet is fixed at 1.0 for simplicity in this config
        bet = 1.0
        total_bet += bet
        
        # Reset book for new round
        gamestate.book.events = []
        gamestate.win_manager.spin_win = 0
        gamestate.win_manager.total_win = 0 # Safety clear if exists
        
        # Run Spin
        gamestate.run_spin(i)
        
        # Extract Win
        # GameState updates win_manager.spin_win
        round_win = gamestate.win_manager.spin_win
        
        total_win += round_win
        if round_win > 0:
            hits += 1
            if round_win > max_win_observed:
                max_win_observed = round_win
                
        if (i + 1) % 100_000 == 0:
            print(f"Progress: {i + 1}/{num_spins}...")

    end_time = time.time()
    duration = end_time - start_time
    
    # Analysis
    rtp = (total_win / total_bet) * 100
    hit_freq = (hits / num_spins) * 100
    
    print("\n=== RESULTS ===")
    print(f"Total Spins: {num_spins}")
    print(f"Total Bet: {total_bet}")
    print(f"Total Win: {total_win}")
    print(f"RTP: {rtp:.2f}% (Target: {config.rtp * 100}%)")
    print(f"Hit Frequency: {hit_freq:.2f}%")
    print(f"Max Win Observed: {max_win_observed}")
    print(f"Time: {duration:.2f}s")
    
    return rtp

if __name__ == "__main__":
    verify_slot_math()
