"""Main file for generating results for Hexa Keno."""

from gamestate import GameState
from game_config import GameConfig
from src.state.run_sims import create_books
from src.write_data.write_configs import generate_configs

if __name__ == "__main__":

    num_threads = 4 # Multithreaded for speed
    batching_size = 50000
    compression = True
    profiling = False

    # Simulate 1,000,000 rounds for publication verification
    num_sim_args = {
        "base": int(1e6),
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
