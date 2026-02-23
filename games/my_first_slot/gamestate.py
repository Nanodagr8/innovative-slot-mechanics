"""Handles the state and output for a single simulation round"""

from game_override import GameStateOverride
from src.events.events import *


class GameState(GameStateOverride):
    """Handle 3x3 slot logic and win evaluation."""

    def run_spin(self, sim, simulation_seed=None):
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            self.reset_book()

            # 1. Spin Reels (3 reels, 3 rows each)
            stops = []
            board = []
            import random
            for r in range(self.config.num_reels):
                reel_strip = self.config.reels["BR0"][r]
                stop = random.randrange(len(reel_strip))
                stops.append(stop)
                
                # Get 3 symbols for the column (row 0, 1, 2)
                column = []
                for row in range(3):
                    symbol = reel_strip[(stop + row) % len(reel_strip)]
                    column.append(str(symbol))
                board.append(column)

            # 2. Evaluate Wins (3 horizontal paylines)
            total_win = 0
            hits = []
            
            for row in range(3):
                s0, s1, s2 = board[0][row], board[1][row], board[2][row]
                if s0 == s1 == s2:
                    payout = self.config.paytable.get((3, s0), 0)
                    if payout > 0:
                        total_win += payout
                        hits.append({"row": row, "symbol": s0, "payout": payout})

            self.win_manager.update_spinwin(total_win)
            self.win_manager.update_gametype_wins(self.gametype)

            # 3. Log Event
            game_event = {
                "index": len(self.book.events),
                "type": EventConstants.WIN_DATA.value,
                "stops": stops,
                "board": board,
                "hits": hits,
                "totalWin": int(round(total_win * 100, 0)),
            }
            self.book.add_event(game_event)

            self.evaluate_finalwin()

        self.imprint_wins()

    def run_freespin(self):
        pass
