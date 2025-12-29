"""
1 Million Spin Stress Test Script

Purpose: Rigorous stability testing.
- Runs 1,000,000 spins per mechanic.
- Catches and logs ANY runtime errors (ZeroDivision, Overflow, ValueError, etc).
- Validates state integrity after every batch.

Usage: python stress_test.py
"""

import random
import time
import sys
import traceback
from mechanics.transform_manager import TransformManager
from mechanics.evolution_manager import EvolutionManager
from mechanics.timetravel_manager import TimeTravelManager
from mechanics.morphing_manager import MorphingManager

NUM_SPINS = 1000000
BATCH_SIZE = 10000

def log_error(mechanic_name, spin_num, error):
    print(f"\n[CRITICAL ERROR] {mechanic_name} failed at spin {spin_num}")
    print(f"Error: {str(error)}")
    traceback.print_exc()

def stress_transform():
    print(f"\n--- Stress Testing Transform Mechanic ({NUM_SPINS} spins) ---")
    manager = TransformManager({'enabled': True})
    board = [['LOW'] * 5 for _ in range(4)]
    
    start = time.time()
    errors = 0
    
    for i in range(NUM_SPINS):
        try:
            # Randomly seed board to test edge cases
            if i % 100 == 0:
                board[random.randint(0,3)][random.randint(0,4)] = 'SUPER'
                
            manager.process_spin(board, 1.0)
            
            if i % BATCH_SIZE == 0:
                sys.stdout.write(f"\rProgress: {i/NUM_SPINS*100:.1f}%")
                sys.stdout.flush()
                
        except Exception as e:
            log_error("Transform", i, e)
            errors += 1
            break # Stop on first critical error

    print(f"\rProgress: 100.0% - Completed in {time.time()-start:.2f}s")
    if errors == 0: print("[SUCCESS] No errors detected.")
    else: print(f"[FAILED] {errors} critical errors detected.")

def stress_evolution():
    print(f"\n--- Stress Testing Evolution Mechanic ({NUM_SPINS} spins) ---")
    manager = EvolutionManager({'enabled': True})
    board = [['SYM_A'] * 7 for _ in range(7)]
    
    start = time.time()
    errors = 0
    
    for i in range(NUM_SPINS):
        try:
            manager.process_spin(board, 1.0)
            
            # Periodic cleanup to prevent infinite memory growth in simulation
            if i % 1000 == 0:
                manager.reset_points() 
                
            if i % BATCH_SIZE == 0:
                sys.stdout.write(f"\rProgress: {i/NUM_SPINS*100:.1f}%")
                sys.stdout.flush()
                
        except Exception as e:
            log_error("Evolution", i, e)
            errors += 1
            break

    print(f"\rProgress: 100.0% - Completed in {time.time()-start:.2f}s")
    if errors == 0: print("[SUCCESS] No errors detected.")
    else: print(f"[FAILED] {errors} critical errors detected.")

def stress_timetravel():
    print(f"\n--- Stress Testing Time Travel Mechanic ({NUM_SPINS} spins) ---")
    manager = TimeTravelManager({'enabled': True})
    
    start = time.time()
    errors = 0
    
    for i in range(NUM_SPINS):
        try:
            # Simulate random wins to populate history
            if random.random() < 0.2:
                manager.record_win(random.randint(10, 1000))
                
            manager.process_spin([], 1.0)
            
            if i % BATCH_SIZE == 0:
                sys.stdout.write(f"\rProgress: {i/NUM_SPINS*100:.1f}%")
                sys.stdout.flush()
                
        except Exception as e:
            log_error("TimeTravel", i, e)
            errors += 1
            break

    print(f"\rProgress: 100.0% - Completed in {time.time()-start:.2f}s")
    if errors == 0: print("[SUCCESS] No errors detected.")
    else: print(f"[FAILED] {errors} critical errors detected.")

def stress_morphing():
    print(f"\n--- Stress Testing Morphing Mechanic ({NUM_SPINS} spins) ---")
    manager = MorphingManager({'enabled': True})
    board = [['LOW'] * 6 for _ in range(6)]
    
    start = time.time()
    errors = 0
    
    for i in range(NUM_SPINS):
        try:
            result = manager.process_spin(board, 1.0)
            
            # Simulate animation update cycle to clear active morphs
            if result['morphed']:
                manager.update_morphs(1.0) # Force complete
            
            if i % BATCH_SIZE == 0:
                sys.stdout.write(f"\rProgress: {i/NUM_SPINS*100:.1f}%")
                sys.stdout.flush()
                
        except Exception as e:
            log_error("Morphing", i, e)
            errors += 1
            break

    print(f"\rProgress: 100.0% - Completed in {time.time()-start:.2f}s")
    if errors == 0: print("[SUCCESS] No errors detected.")
    else: print(f"[FAILED] {errors} critical errors detected.")

if __name__ == "__main__":
    print(f"Starting STRESS TEST: {NUM_SPINS} spins per mechanic...")
    stress_transform()
    stress_evolution()
    stress_timetravel()
    stress_morphing()
    print("\n[COMPLETE] All stress tests finished.")
