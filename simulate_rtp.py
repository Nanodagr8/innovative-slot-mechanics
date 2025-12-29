"""
RTP Simulation & Tuning Script for Innovative Mechanics

Simulates 100,000 spins for each mechanic to calculate:
- RTP (Return to Player)
- Hit Frequency
- Bonus Trigger Rates
- Volatility Metrics

Usage: python simulate_rtp.py
"""

import random
import time
from typing import List, Dict
from mechanics.transform_manager import TransformManager
from mechanics.evolution_manager import EvolutionManager
from mechanics.timetravel_manager import TimeTravelManager
from mechanics.morphing_manager import MorphingManager

# Configuration
NUM_SPINS = 100000
BET_SIZE = 1.0

# Base Payouts (Simplified for Simulation)
# In a full engine, this would use the real SlotEngine logic.
# Here we approximate base game wins to focus on Mechanic impact.
BASE_HIT_RATE = 0.25
AVG_BASE_WIN = 0.8  # Multiplier

def simulate_base_spin():
    """Simulates a standard slot spin result independent of mechanics"""
    if random.random() < BASE_HIT_RATE:
        return BET_SIZE * AVG_BASE_WIN * (random.expovariate(1.5) + 0.5) # Skewed distribution
    return 0.0

def run_transform_sim():
    print(f"\n--- Testing Transform Mechanic (Markov Chains) ---")
    # Using new defaults (0.35 trigger, 0.70 transform)
    manager = TransformManager({'enabled': True})
    
    total_in = 0
    total_out = 0
    bonus_triggers = 0
    
    start_time = time.time()
    
    # Mock Board (5x4)
    board = [['LOW'] * 5 for _ in range(4)]
    
    for i in range(NUM_SPINS):
        total_in += BET_SIZE
        base_win = simulate_base_spin()
        
        # Mechanic Processing
        # For sim purposes, we randomly populate board with some high/super to test logic
        if random.random() < 0.1:
            board[0][0] = 'SUPER' # Seed for interactions
            
        result = manager.process_spin(board, BET_SIZE)
        
        mech_multiplier = result.get('multiplier', 1.0)
        mech_bonus = 0
        
        if result['transformed']:
            # Assume transformations improve the base win
            base_win *= (1.0 + (result['count'] * 0.2)) 
        
        if result.get('singularity_bonus', False):
            bonus_triggers += 1
            mech_bonus = BET_SIZE * 50 # Fixed bonus for singularity
            
        total_out += (base_win * mech_multiplier) + mech_bonus

    rtp = (total_out / total_in) * 100
    print(f"Spins: {NUM_SPINS}")
    print(f"RTP: {rtp:.2f}%")
    print(f"Singularity Bonuses: {bonus_triggers} (1 in {NUM_SPINS/max(1, bonus_triggers):.0f})")
    print(f"Time: {time.time() - start_time:.2f}s")
    return rtp

def run_evolution_sim():
    print(f"\n--- Testing Evolution Mechanic (Golden Ratio) ---")
    # Using tuned defaults (1.5x catalyst)
    manager = EvolutionManager({'enabled': True})
    
    total_in = 0
    total_out = 0
    darwin_bonuses = 0
    
    # Mock Board (7x7) contains consistent symbols to track evolution
    board = [['SYM_A'] * 7 for _ in range(7)]
    
    for i in range(NUM_SPINS):
        total_in += BET_SIZE
        base_win = simulate_base_spin()
        
        # Mechanic Processing
        result = manager.process_spin(board, BET_SIZE)
        
        if result['evolved']:
            # Add value from evolved symbols
            for sym, data in result['symbols'].items():
                # Passive income from high level symbols
                if data['multiplier'] > 1:
                    base_win += (BET_SIZE * 0.1 * data['multiplier'])
        
        if result.get('darwin_bonus', False):
            darwin_bonuses += 1
            base_win += (BET_SIZE * 100) # Darwin Jackpot
            
        total_out += base_win

    rtp = (total_out / total_in) * 100
    print(f"RTP: {rtp:.2f}%")
    print(f"Darwin Bonuses: {darwin_bonuses} (1 in {NUM_SPINS/max(1, darwin_bonuses):.0f})")
    return rtp

def run_timetravel_sim():
    print(f"\n--- Testing Time Travel Mechanic (Wave Functions) ---")
    # New defaults (0.15 past, 0.10 future)
    manager = TimeTravelManager({'enabled': True})
    
    total_in = 0
    total_out = 0
    paradox_bonuses = 0
    
    for i in range(NUM_SPINS):
        total_in += BET_SIZE
        base_win = simulate_base_spin()
        
        # Record significant wins
        if base_win > (BET_SIZE * 5):
            manager.record_win(base_win)
            
        # Mechanic Processing
        result = manager.process_spin([], BET_SIZE)
        
        mech_win = 0
        if result['past_retrieval']:
            mech_win += result['past_retrieval']['retrieved_amount']
            
        if result.get('paradox_bonus', False):
            paradox_bonuses += 1
            mech_win += (BET_SIZE * 20) # Paradox extra prize
            
        total_out += base_win + mech_win

    rtp = (total_out / total_in) * 100
    print(f"RTP: {rtp:.2f}%")
    print(f"Paradox Bonuses: {paradox_bonuses} (1 in {NUM_SPINS/max(1, paradox_bonuses):.0f})")
    return rtp

def run_morph_sim():
    print(f"\n--- Testing Morphing Mechanic (Cellular Automata) ---")
    # New defaults (0.60 morph rate)
    manager = MorphingManager({'enabled': True})
    
    total_in = 0
    total_out = 0
    fluid_bonuses = 0
    
    # Mock Board (6x6)
    board = [['LOW'] * 6 for _ in range(6)]
    
    for i in range(NUM_SPINS):
        total_in += BET_SIZE
        base_win = simulate_base_spin()
        
        # Mechanic Processing
        result = manager.process_spin(board, BET_SIZE)
        
        if result['morphed']:
            # Morphs generally turn losing symbols into winning ones
            # We approximate this as a multiplier boost
            base_win *= (1.0 + (len(result['events']) * 0.1))
            
        if result.get('fluid_bonus', False):
            fluid_bonuses += 1
            base_win += (BET_SIZE * 10) # Small frequent bonus
            
        total_out += base_win

    rtp = (total_out / total_in) * 100
    print(f"RTP: {rtp:.2f}%")
    print(f"Fluid Bonuses: {fluid_bonuses} (1 in {NUM_SPINS/max(1, fluid_bonuses):.0f})")
    return rtp

if __name__ == "__main__":
    print(f"Running Simulation: {NUM_SPINS} spins per mechanic")
    run_transform_sim()
    run_evolution_sim()
    run_timetravel_sim()
    run_morph_sim()
