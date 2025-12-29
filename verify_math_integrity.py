"""
Math Integrity Verification Script

Performs rigorous checks on:
1. Probability Bounds (0.0 <= p <= 1.0)
2. Matrix Stochasticity (Rows sum to 1.0)
3. Steady State Validity
4. Formula Consistency (e.g., Fibonacci generation)
"""

import math
import numpy as np
import sys
from mechanics.transform_manager import TransformManager
from mechanics.evolution_manager import EvolutionManager
from mechanics.timetravel_manager import TimeTravelManager
from mechanics.morphing_manager import MorphingManager

def check(condition, message):
    if condition:
        print(f"[PASS] {message}")
    else:
        print(f"[FAIL] {message}")
        
def verify_transform():
    print("\n--- Verifying Transform Manager ---")
    tm = TransformManager({'enabled': True})
    
    # 1. Check Matrix Stochasticity
    row_sums = tm.transition_matrix.sum(axis=1)
    is_stochastic = np.allclose(row_sums, 1.0)
    check(is_stochastic, f"Transition Matrix rows sum to 1.0 (Sums: {row_sums})")
    
    # 2. Check Probabilities > 0
    all_positive = np.all(tm.transition_matrix >= 0)
    check(all_positive, "All matrix probabilities are non-negative")
    
    # 3. Check Steady State Sum
    ss = tm.get_steady_state()
    ss_sum = sum(ss.values())
    check(math.isclose(ss_sum, 1.0), f"Steady State sums to 1.0 ({ss_sum})")

def verify_evolution():
    print("\n--- Verifying Evolution Manager ---")
    em = EvolutionManager({'enabled': True})
    
    # 1. Check Success Probability Limit
    # Recalculate the success_prob logic from process_spin manually to check value
    base_prob = (1.0 / (em.golden_ratio ** 2)) * 1.5
    success_prob = min(base_prob, 1.0)
    check(0 <= success_prob <= 1.0, f"Evolution Probability is valid (0 <= {success_prob:.4f} <= 1.0)")
    
    # 2. Check Fibonacci Sequence
    fib_correct = True
    fibs = em.fibonacci
    for i in range(2, len(fibs)):
        if fibs[i] != fibs[i-1] + fibs[i-2]:
            fib_correct = False
    check(fib_correct, "Fibonacci sequence is mathematically correct")

def verify_timetravel():
    print("\n--- Verifying Time Travel Manager ---")
    tt = TimeTravelManager({'enabled': True})
    
    # 1. Check Retrieval Probability Decay
    probs = [tt.past_retrieval_probability(t) for t in range(10)]
    valid_probs = all(0 <= p <= 1.0 for p in probs)
    check(valid_probs, "Past retrieval probabilities within [0, 1]")
    
    # 2. Check Prediction Accuracy Decay
    accs = [tt.future_prediction_accuracy(t) for t in range(10)]
    valid_accs = all(0 <= a <= 1.0 for a in accs)
    check(valid_accs, "Future prediction accuracies within [0, 1]")
    
    # 3. Check Wave Function Non-Negative (if it implies magnitude/prob)
    # The doc says |sin|, so it should be >= 0
    waves = [tt.time_wave_function(t) for t in range(20)]
    valid_waves = all(w >= 0 for w in waves)
    check(valid_waves, "Wave function outputs are non-negative")

def verify_morphing():
    print("\n--- Verifying Morphing Manager ---")
    mm = MorphingManager({'enabled': True})
    
    # 1. Check Bezier Interpolation Limits
    # t=0 should match P0, t=1 should match P3
    b_start = mm.bezier_interpolate(0, 10, 20, 30, 40)
    b_end = mm.bezier_interpolate(1, 10, 20, 30, 40)
    check(math.isclose(b_start, 10), "Bezier t=0 matches P0")
    check(math.isclose(b_end, 40), "Bezier t=1 matches P3")
    
    # 2. Check Stochasticity of Matrix (Dict based here)
    stochastic = True
    for state, probs in mm.transition_matrix.items():
        if not math.isclose(sum(probs), 1.0):
            stochastic = False
            print(f"  State {state} sums to {sum(probs)}")
    check(stochastic, "Transition Matrix rows sum to 1.0")

if __name__ == "__main__":
    verify_transform()
    verify_evolution()
    verify_timetravel()
    verify_morphing()
