# Mechanics Module

This directory contains the implementation of all four innovative slot mechanics.

## Structure

```
mechanics/
├── __init__.py           # Package initialization
├── base_mechanic.py      # Base class for all mechanics
├── transform_manager.py  # Transform mechanics (Markov chains)
├── evolution_manager.py  # Evolution mechanics (Fibonacci)
├── timetravel_manager.py # Time Travel mechanics (Wave functions)
└── morphing_manager.py   # Morphing mechanics (Bezier curves)
```

## Usage

```python
from mechanics import TransformManager, EvolutionManager

# Initialize a mechanic
transform = TransformManager({'enabled': True, 'trigger_rate': 0.20})

# Process a spin
result = transform.process_spin(board, bet_amount)

# Calculate RTP
rtp = transform.calculate_rtp_contribution(base_rtp=0.70)
```

## See Also

- [Implementation Guide](../docs/implementation_plan.md)
- [Corrected Mechanics](../docs/corrected_mechanics.md)
