"""Hexa Keno game configuration."""

from src.config.config import Config
from src.config.distributions import Distribution
from src.config.config import BetMode


class GameConfig(Config):
    """Hexa Keno configuration class."""

    def __init__(self):
        super().__init__()
        self.game_id = "hexakeno"
        self.provider_number = 0
        self.working_name = "hexakeno"
        self.wincap = 1000000 # Max Multiplier
        self.win_type = "other"
        self.rtp = 0.97
        
        import os
        _game_dir = os.path.dirname(os.path.abspath(__file__))
        self.reels_path = os.path.join(_game_dir, "reels")
        self.library_path = os.path.join(_game_dir, "library")
        self.publish_path = _game_dir

        # Game Dimensions (Keno has no reels)
        self.num_reels = 0
        self.num_rows = [0] * self.num_reels
        self.paytable = {}
        self.include_padding = False
        self.special_symbols = {"wild": [], "scatter": [], "multiplier": []}

        self.freespin_triggers = {self.basegame_type: {}, self.freegame_type: {}}
        self.anticipation_triggers = {self.basegame_type: 0, self.freegame_type: 0}

        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=self.wincap,
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="basegame",
                        quota=1.0,
                        conditions={
                            "reel_weights": {},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
        ]
