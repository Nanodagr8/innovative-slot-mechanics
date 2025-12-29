# Stake Engine Math SDK Guide

## Overview

The Math SDK is a Python-based engine for defining game rules, simulating outcomes, and optimizing win distributions. It generates backend configuration files, lookup tables, and simulation results.

## Package Structure

The SDK uses a `src/` directory layout with the following modules:

```
src/
├── calculations/    # Statistical calculations and RNG
├── config/          # Game configuration and distributions
├── events/          # Event handling system
├── executables/     # Core game execution logic
├── state/           # Game state management and simulation
├── wins/            # Win calculation logic
└── write_data/      # Output file generation
```

### Key Modules

#### `src.config`

- **Config**: Base configuration class for games
- **BetMode**: Defines bet modes (base game, buy bonus, etc.)
- **Distribution**: Defines payout distributions and criteria

#### `src.state`

- **run_sims**: Main simulation engine (`create_books()`)
- Handles multi-threaded simulations
- Generates lookup tables (LUTs)

#### `src.write_data`

- **write_configs**: Generates configuration files (`generate_configs()`)
- Outputs to `games/{game_id}/library/` directory

#### `src.calculations`

- Statistical utilities
- Random outcome generation
- Win calculations

## Game Structure

Each game in `games/` follows this pattern:

```
games/{game_id}/
├── run.py                 # Main entry point
├── game_config.py         # Game configuration
├── gamestate.py           # Game state logic
├── game_calculations.py   # Custom calculations
├── game_executables.py    # Game-specific executables
├── game_events.py         # Event handlers
├── game_override.py       # State overrides
└── library/               # Generated output (created by SDK)
```

## Running Games

### Method 1: Set PYTHONPATH (Recommended)

```powershell
$env:PYTHONPATH="c:\Users\Kevin Inthavong\NANOSTUDIOS\math-sdk"
python games\{game_id}\run.py
```

### Method 2: From Project Root

```powershell
python -m games.{game_id}.run
```

## Available Games

1. **fifty_fifty** - Simple 50/50 example for RGS integration
2. **0_0_cluster** - Cluster-based slot game
3. **0_0_scatter** - Scatter symbol game
4. **0_0_lines** - Line-based slot game
5. **0_0_ways** - Ways-based slot game
6. **0_0_expwilds** - Expanding wilds game
7. **0_0_lines_feature_match** - Line game with feature matching
8. **template** - Template for creating new games

## Typical Workflow

### 1. Define Game Configuration

```python
from src.config.config import Config, BetMode
from src.config.distributions import Distribution

class GameConfig(Config):
    def __init__(self):
        super().__init__()
        self.game_id = "my_game"
        self.rtp = 0.96
        # ... configure game parameters
```

### 2. Run Simulations

```python
from src.state.run_sims import create_books

create_books(
    gamestate,
    config,
    num_sim_args={"base": int(1e6)},
    batching_size=50000,
    num_threads=4,
    compression=True,
    profiling=False
)
```

### 3. Generate Configuration Files

```python
from src.write_data.write_configs import generate_configs

generate_configs(gamestate)
```

### 4. Output Files

Generated files appear in `games/{game_id}/library/`:

- Configuration JSONs
- Lookup tables (LUTs)
- Simulation results

## Optimization (Requires Rust/Cargo)

The SDK includes a Rust-based optimization algorithm for finding optimal win distributions.

### Setup

1. Install Rust: https://www.rust-lang.org/tools/install
2. Install Visual Studio C++ Build Tools
3. Configure optimization in `game_config.py`

### Running Optimization

```python
from optimization_program.run_script import OptimizationExecution

OptimizationExecution.run_opt_single_mode(
    game_config,
    mode="base",
    threads=4
)
```

## Import Patterns

All SDK modules are imported from `src`:

```python
from src.config.config import Config
from src.state.run_sims import create_books
from src.write_data.write_configs import generate_configs
from src.calculations.statistics import get_random_outcome
```

## Common Parameters

### Simulation Parameters

- `num_sim_args`: Number of simulations per bet mode
- `batching_size`: Batch size for parallel processing
- `num_threads`: Number of CPU threads to use
- `compression`: Enable/disable output compression
- `profiling`: Enable performance profiling

### Game Configuration

- `game_id`: Unique identifier
- `rtp`: Return to player percentage
- `wincap`: Maximum win multiplier
- `bet_modes`: List of BetMode objects

## Tips

1. **Start with fifty_fifty**: Simplest example to understand SDK flow
2. **Use PYTHONPATH**: Ensures imports work from any directory
3. **Check library/ output**: Verify generated files after simulation
4. **Use compression**: Reduces file sizes significantly
5. **Adjust threads**: Match your CPU core count for best performance

## Documentation

- Full docs: https://stakeengine.github.io/math-sdk/
- Simple example: https://stakeengine.github.io/math-sdk/simple_example/simple_example/
