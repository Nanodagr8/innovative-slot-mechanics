"""Main file for generating results for Hexa Keno."""

from gamestate import GameState
from game_config import GameConfig
from src.state.run_sims import create_books
from src.write_data.write_configs import generate_configs

if __name__ == "__main__":

    num_threads = 1 # Single-threaded for reliable book generation
    batching_size = 100000
    compression = True
    profiling = False

    # Simulate 1,000,000 rounds PER RISK LEVEL for stable RTP convergence
    num_sim_args = {
        "high": int(1000000),
    }

    run_conditions = {"run_sims": True}

    config = GameConfig()
    gamestate = GameState(config)

    if run_conditions["run_sims"]:
        create_books(
            gamestate,
            config,
            num_sim_args,
            batching_size,
            num_threads,
            compression,
            profiling,
        )
    generate_configs(gamestate)
