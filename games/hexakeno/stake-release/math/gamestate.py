"""Handles the state and output for a single simulation round"""

from game_override import GameStateOverride
from src.events.events import *
from keno_engine import HexakenoEngine
import random

class GameState(GameStateOverride):
    """Handle all game-logic and event updates for a given simulation number."""
    
    def __init__(self, config):
        super().__init__(config)
        self.engine = HexakenoEngine()

    def run_spin(self, sim, simulation_seed=None):
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            self.reset_book()

            # Randomize Inputs for Simulation to cover all cases
            risk = random.choice(['classic', 'low', 'medium', 'high'])
            pick_count = random.randint(1, 10)
            player_picks = random.sample(range(1, 41), pick_count)
            
            # Use Superball roughly 10% of time for coverage (or random boolean)
            use_super = random.random() < 0.1
            
            result = self.engine.play_round(player_picks, 1.0, risk, use_super)
            win_amount = result.final_payout

            self.win_manager.update_spinwin(win_amount)
            self.win_manager.update_gametype_wins(self.gametype)

            game_event = {
                "index": len(self.book.events),
                "type": EventConstants.WIN_DATA.value,
                "numberRolled": int(sim + 1),
                "totalWin": int(round(win_amount * 100, 0)),
                "custom_data": {
                    "risk": risk,
                    "picks": player_picks,
                    "draw": result.drawn_numbers,
                    "hits": result.hits,
                    "super": use_super
                }
            }
            self.book.add_event(game_event)

            self.evaluate_finalwin()

        self.imprint_wins()

    def run_freespin(self):
        pass
