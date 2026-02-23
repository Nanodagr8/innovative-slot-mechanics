"""Template game configuration file, detailing required user-specified inputs."""

from src.config.config import Config
from src.config.distributions import Distribution
from src.config.config import BetMode


class GameConfig(Config):
    """3x3 Reel Slot configuration."""

    def __init__(self):
        super().__init__()
        self.game_id = "my_first_slot"
        self.provider_numer = 0
        self.working_name = "classic_3x3"
        self.wincap = 500
        self.win_type = "lines"
        self.rtp = 0.96
        self.construct_paths()

        # Game Dimensions
        self.num_reels = 3
        self.num_rows = [3, 3, 3]
        
        # Payouts: 0-Cherry, 1-Lemon, 2-Orange, 3-Plum, 4-Bell, 5-Seven
        # Target RTP ~97% (Total payout value ~70 / 216 per line * 3 lines)
        self.paytable = {
            (3, "0"): 1,
            (3, "1"): 2,
            (3, "2"): 4,
            (3, "3"): 8,
            (3, "4"): 15,
            (3, "5"): 40
        }
        
        self.include_padding = True
        self.special_symbols = {"wild": [], "scatter": [], "multiplier": []}

        self.freespin_triggers = {self.basegame_type: {}, self.freegame_type: {}}
        self.anticipation_triggers = {self.basegame_type: 0, self.freegame_type: 0}

        # Reels
        reels = {"BR0": "BR0.csv"}
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(str.join("/", [self.reels_path, f]))

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
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
        ]
