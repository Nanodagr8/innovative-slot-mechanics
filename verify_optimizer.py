import sys
import os

# Ensure current dir is in path to pick up mock streamlit
sys.path.insert(0, os.getcwd())

import streamlit as st
print(f"Loaded streamlit from: {st}")

try:
    from src.computation.optimizer import solve_optimizer
    from src.class_setup.state import AppState, CriteraParams, ConvexOptSetup
    import numpy as np

    print("Success: Imported optimizer logic")

    # Setup basic test state
    state = AppState()
    state.cost = 100.0
    
    # Create a dummy criteria
    c = CriteraParams(
        name="TestCriteria",
        hr=10.0,
        rtp=0.95,
        xact=[10.0, 50.0, 100.0], # Payouts
        yact=[0.5, 0.3, 0.2]      # Initial weights (dummy)
    )
    c.num_dists = 1
    state.criteria_list.append(c)
    
    # Optimizer settings
    opt = ConvexOptSetup(kl_divergence=1.0, smoothness=1.0, payouts=[], init_weights=[])
    state.opt_settings.append(opt)

    print("Running solve_optimizer...")
    solve_optimizer(state)
    
    if state.optimization_success:
        print("Success: Optimizer ran and produced a solution")
        print(f"Solved Metrics: {c.solution_metrics}")
    else:
        print("Failure: Optimizer did not report success")

except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"RuntimeError: {e}")
    sys.exit(1)
