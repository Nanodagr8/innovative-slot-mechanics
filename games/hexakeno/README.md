# Hexakeno - Advanced Keno Game

## Overview

A modern hexagonal Keno game with Superball mechanics, balanced for 96.0% RTP.

## Game Rules

- **Number Pool**: 40 numbers (1-40) in Honeycomb grid
- **Player Picks**: 1-10 spots
- **Draw**: 10 random numbers per round
- **Superball**: 4x multiplier if the 10th (last) ball is a hit

## Target Specifications

- **RTP**: 96.0%
- **Volatility**: Medium-High
- **Platform**: Stake Engine (PixiJS/Svelte frontend)

## Project Structure

- `math-sdk/` - Core Probability Math SDK
  - `games/hexakeno/math/` - Python source files for game logic.
  - `games/hexakeno/stake-release/` - **PRODUCTION BUILD**. Contains the final `frontend` and synced `math` files ready for upload.
  - `games/hexakeno/demo/` - Development sandbox (deprecated, use `stake-release`).

## Deployment

To deploy to the Stake Engine:

1. Navigate to `games/hexakeno/stake-release`.
2. Upload the contents of this folder to the dashboard.

## Development

- **Frontend**: `stake-release/frontend/index.html` (Open directly in browser).
- **RTP Verification**:

  ```bash
  cd games/hexakeno
  python verify_rtp_stability.py
  ```

- **Math Tuning**:
  - Config: `keno_config.py`
  - Optimizer: `tools/convex-optimizer`
