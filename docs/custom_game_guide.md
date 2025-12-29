# Creating Custom Games with Math SDK

## Quick Start

1. **Copy the template**:

   ```powershell
   cp -r games/template games/my_game
   cd games/my_game
   ```

2. **Configure your game** in `game_config.py`

3. **Run simulation**:
   ```powershell
   $env:PYTHONPATH="c:\Users\Kevin Inthavong\NANOSTUDIOS\math-sdk"
   python run.py
   ```

## Template Structure

```
games/my_game/
├── run.py                    # Main entry point
├── game_config.py            # Game configuration ⭐
├── game_optimization.py      # Optimization setup (optional)
├── gamestate.py              # Game state logic
├── game_calculations.py      # Custom win calculations
├── game_executables.py       # Game execution logic
├── game_events.py            # Event handlers
├── game_override.py          # State overrides
└── library/                  # Generated output (auto-created)
```

## Step 1: Configure Game Basics

Edit `game_config.py`:

```python
class GameConfig(Config):
    def __init__(self):
        super().__init__()

        # Basic Info
        self.game_id = "my_slot_game"          # Unique identifier
        self.working_name = "My Slot Game"     # Display name
        self.provider_numer = 0                # Provider ID
        self.wincap = 5000                     # Max win multiplier
        self.win_type = "lines"                # "lines", "ways", "cluster", "scatter"
        self.rtp = 0.96                        # Return to player (96%)

        self.construct_paths()  # Initialize file paths
```

## Step 2: Define Game Dimensions

```python
        # Reels and Rows
        self.num_reels = 5
        self.num_rows = [3, 3, 3, 3, 3]  # 5x3 grid

        # Paytable (symbol: [5-of-a-kind, 4-of-a-kind, 3-of-a-kind])
        self.paytable = {
            "A": [100, 50, 20],
            "K": [80, 40, 15],
            "Q": [60, 30, 10],
            "J": [40, 20, 8],
            "10": [20, 10, 5],
        }

        # Special Symbols
        self.special_symbols = {
            "wild": ["W"],
            "scatter": ["S"],
            "multiplier": []
        }
```

## Step 3: Configure Distributions

Distributions define how wins are allocated:

```python
        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=self.wincap,
                distributions=[
                    # Wincap hits (0.1% of spins)
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=self.wincap,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1}
                            },
                            "force_wincap": True,
                        }
                    ),

                    # Free spins trigger (10% of spins)
                    Distribution(
                        criteria="freegame",
                        quota=0.10,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1}
                            },
                            "scatter_triggers": {3: 10, 4: 15, 5: 20},
                            "force_freegame": True,
                        }
                    ),

                    # No win (40% of spins)
                    Distribution(
                        criteria="0",
                        quota=0.40,
                        win_criteria=0.0,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                        }
                    ),

                    # Regular wins (49.9% of spins)
                    Distribution(
                        criteria="basegame",
                        quota=0.499,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                        }
                    ),
                ],
            ),
        ]
```

### Distribution Parameters

- **criteria**: Unique identifier for this distribution
- **quota**: Percentage of spins (must sum to 1.0)
- **win_criteria**: Target win amount (optional)
- **reel_weights**: Which reel sets to use
- **force_wincap**: Force maximum win
- **force_freegame**: Force free spin trigger
- **scatter_triggers**: {count: free_spins}

## Step 4: Create Reel Strips

Create CSV files in `games/my_game/reels/`:

**BR0.csv** (Base Reels):

```csv
reel_0,reel_1,reel_2,reel_3,reel_4
A,K,Q,J,10
K,Q,J,10,A
Q,J,10,A,K
...
```

Load in `game_config.py`:

```python
        reels = {"BR0": "BR0.csv", "FR0": "FR0.csv"}
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(
                str.join("/", [self.reels_path, f])
            )
```

## Step 5: Customize Game Logic (Optional)

### Override Win Calculation

Edit `game_override.py`:

```python
class GameStateOverride(GameExecutables):
    def calculate_win(self, board, bet_mode):
        # Custom win logic here
        win_amount = 0

        # Example: Check for special patterns
        if self.has_special_pattern(board):
            win_amount += 100

        # Call parent for standard wins
        win_amount += super().calculate_win(board, bet_mode)

        return win_amount
```

## Step 6: Run Simulation

Edit `run.py` settings:

```python
    num_threads = 10              # CPU threads
    batching_size = 50000         # Batch size
    compression = True            # Compress output

    num_sim_args = {
        "base": int(1e6),         # 1 million spins
    }

    run_conditions = {
        "run_sims": True,         # Run simulation
        "run_optimization": False, # Requires Rust
        "run_analysis": False,
        "upload_data": False,
    }
```

Run:

```powershell
$env:PYTHONPATH="c:\Users\Kevin Inthavong\NANOSTUDIOS\math-sdk"
python run.py
```

## Step 7: Optimization Setup (Optional, Requires Rust)

Edit `game_optimization.py`:

```python
class OptimizationSetup:
    def __init__(self, game_config):
        self.game_config = game_config
        self.game_config.opt_params = {
            "base": {
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.01,
                        av_win=5000,
                        search_conditions=5000
                    ).return_dict(),

                    "basegame": ConstructConditions(
                        hr=3.5,  # Hit rate (1 in 3.5 spins)
                        rtp=0.85
                    ).return_dict(),
                },

                "parameters": ConstructParameters(
                    num_show=5000,
                    num_per_fence=10000,
                    min_m2m=4,
                    max_m2m=8,
                    sim_trials=5000,
                    test_spins=[50, 100, 200],
                    test_weights=[0.3, 0.4, 0.3],
                ).return_dict(),
            }
        }
```

Enable in `run.py`:

```python
    run_conditions = {
        "run_optimization": True,  # Enable optimization
    }
```

## Output Files

After running, check `games/my_game/library/`:

- **books/**: Simulation results
- **configs/**: Game configuration JSONs
- **lookup_tables/**: LUTs for RGS
- **publish_files/**: Files to upload to Stake Engine

## Testing Your Game

1. **Check RTP**:

   ```python
   # View in configs/math_config.json
   ```

2. **Verify distributions**:

   ```python
   # Check books/ for actual vs target quotas
   ```

3. **Test edge cases**:
   - Maximum win
   - Free spin triggers
   - No-win scenarios

## Common Patterns

### Cluster Pays

```python
self.win_type = "cluster"
# Implement cluster detection in game_override.py
```

### Ways Pays

```python
self.win_type = "ways"
self.num_ways = 243  # 3^5 for 5x3 grid
```

### Buy Bonus

```python
BetMode(
    name="buybonus",
    cost=100.0,  # 100x bet
    is_buybonus=True,
    # ... distributions for bonus game
)
```

## Tips

1. **Start simple**: Begin with basic distributions, add complexity later
2. **Verify quotas**: Ensure distribution quotas sum to 1.0
3. **Test incrementally**: Run small simulations (1e4) first
4. **Use compression**: Reduces file sizes significantly
5. **Check RTP**: Verify actual RTP matches target in output

## Resources

- [SDK Guide](file:///c:/Users/Kevin%20Inthavong/.gemini/antigravity/brain/4d5beef3-0518-43ff-8b31-e1ef16bb7bc9/sdk_guide.md)
- [Official Docs](https://stakeengine.github.io/math-sdk/)
- Example games in `games/0_0_*`
