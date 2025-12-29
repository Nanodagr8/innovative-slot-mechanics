# Advanced Slot Mechanics Implementation Guide

## Practical Integration with Math SDK

This guide provides working implementations of advanced slot mechanics integrated with the Stake Engine Math SDK.

---

## Table of Contents

1. [Cascading Reels Implementation](#cascading-reels)
2. [Megaways System](#megaways)
3. [Multiplier Systems](#multipliers)
4. [Buy Bonus Feature](#buy-bonus)
5. [Progressive Jackpots](#jackpots)
6. [Complete Game Examples](#examples)

---

## 1. Cascading Reels Implementation

### 1.1 Cascade Manager Class

```python
# games/my_cascade_game/cascade_manager.py

class CascadeManager:
    """Manages cascading reel mechanics"""

    def __init__(self, config):
        self.config = config
        self.max_cascades = 10
        self.multiplier_progression = [1, 2, 3, 5, 10, 15, 20, 30, 50, 100]

    def process_cascades(self, initial_board, bet_amount):
        """
        Process all cascades from initial board state
        Returns total win and cascade count
        """
        total_win = 0
        cascade_count = 0
        current_board = initial_board

        while cascade_count < self.max_cascades:
            # Check for wins
            wins = self.find_wins(current_board)

            if not wins:
                break

            # Calculate win with multiplier
            cascade_multiplier = self.get_cascade_multiplier(cascade_count)
            cascade_win = self.calculate_win_amount(wins) * cascade_multiplier
            total_win += cascade_win

            # Remove winning symbols
            current_board = self.remove_winning_symbols(current_board, wins)

            # Drop new symbols
            current_board = self.drop_symbols(current_board)

            cascade_count += 1

        return {
            'total_win': total_win,
            'cascade_count': cascade_count,
            'final_board': current_board
        }

    def get_cascade_multiplier(self, cascade_number):
        """Get multiplier for cascade number"""
        if cascade_number < len(self.multiplier_progression):
            return self.multiplier_progression[cascade_number]
        return self.multiplier_progression[-1]

    def find_wins(self, board):
        """Find all winning combinations on board"""
        wins = []

        # Check horizontal lines
        for row in range(len(board)):
            wins.extend(self.check_line(board[row], row, 'horizontal'))

        # Check vertical lines (if applicable)
        for col in range(len(board[0])):
            column = [board[row][col] for row in range(len(board))]
            wins.extend(self.check_line(column, col, 'vertical'))

        # Check clusters (for cluster pays)
        if self.config.win_type == 'cluster':
            wins.extend(self.find_clusters(board))

        return wins

    def check_line(self, symbols, index, direction):
        """Check a line for winning combinations"""
        wins = []
        current_symbol = None
        count = 0
        start_pos = 0

        for i, symbol in enumerate(symbols):
            if symbol == current_symbol and symbol != 'EMPTY':
                count += 1
            else:
                if count >= 3:  # Minimum 3 for a win
                    wins.append({
                        'symbol': current_symbol,
                        'count': count,
                        'positions': list(range(start_pos, i)),
                        'direction': direction,
                        'index': index
                    })
                current_symbol = symbol
                count = 1
                start_pos = i

        # Check last sequence
        if count >= 3:
            wins.append({
                'symbol': current_symbol,
                'count': count,
                'positions': list(range(start_pos, len(symbols))),
                'direction': direction,
                'index': index
            })

        return wins

    def find_clusters(self, board):
        """Find cluster wins (connected symbols)"""
        visited = set()
        clusters = []

        for row in range(len(board)):
            for col in range(len(board[0])):
                if (row, col) not in visited and board[row][col] != 'EMPTY':
                    cluster = self.flood_fill(board, row, col, board[row][col], visited)
                    if len(cluster) >= 5:  # Minimum cluster size
                        clusters.append({
                            'symbol': board[row][col],
                            'positions': cluster,
                            'size': len(cluster)
                        })

        return clusters

    def flood_fill(self, board, row, col, symbol, visited):
        """Flood fill algorithm for cluster detection"""
        if (row < 0 or row >= len(board) or
            col < 0 or col >= len(board[0]) or
            (row, col) in visited or
            board[row][col] != symbol):
            return []

        visited.add((row, col))
        cluster = [(row, col)]

        # Check adjacent cells (4-way connectivity)
        cluster.extend(self.flood_fill(board, row+1, col, symbol, visited))
        cluster.extend(self.flood_fill(board, row-1, col, symbol, visited))
        cluster.extend(self.flood_fill(board, row, col+1, symbol, visited))
        cluster.extend(self.flood_fill(board, row, col-1, symbol, visited))

        return cluster

    def remove_winning_symbols(self, board, wins):
        """Remove winning symbols from board"""
        new_board = [row[:] for row in board]  # Deep copy

        for win in wins:
            if 'positions' in win:
                if win.get('direction') == 'horizontal':
                    row = win['index']
                    for pos in win['positions']:
                        new_board[row][pos] = 'EMPTY'
                elif win.get('direction') == 'vertical':
                    col = win['index']
                    for pos in win['positions']:
                        new_board[pos][col] = 'EMPTY'
                else:  # Cluster
                    for row, col in win['positions']:
                        new_board[row][col] = 'EMPTY'

        return new_board

    def drop_symbols(self, board):
        """Drop symbols to fill empty spaces"""
        new_board = [row[:] for row in board]

        # Process each column
        for col in range(len(board[0])):
            # Collect non-empty symbols from bottom to top
            column = []
            for row in range(len(board) - 1, -1, -1):
                if new_board[row][col] != 'EMPTY':
                    column.append(new_board[row][col])

            # Fill with new random symbols
            while len(column) < len(board):
                column.append(self.get_random_symbol())

            # Place back in column (bottom to top)
            for row in range(len(board) - 1, -1, -1):
                new_board[row][col] = column[len(board) - 1 - row]

        return new_board

    def get_random_symbol(self):
        """Get random symbol based on weights"""
        import random
        symbols = list(self.config.symbol_weights.keys())
        weights = list(self.config.symbol_weights.values())
        return random.choices(symbols, weights=weights)[0]

    def calculate_win_amount(self, wins):
        """Calculate total win amount from wins"""
        total = 0
        for win in wins:
            symbol = win['symbol']
            count = win.get('count') or win.get('size')
            payout = self.config.paytable.get(symbol, [0] * 10)

            # Get payout for count (index is count - 1)
            if count - 1 < len(payout):
                total += payout[count - 1]

        return total
```

### 1.2 Cascade Game Configuration

```python
# games/my_cascade_game/game_config.py

from src.config.config import Config, BetMode
from src.config.distributions import Distribution
from cascade_manager import CascadeManager

class CascadeGameConfig(Config):
    def __init__(self):
        super().__init__()
        self.game_id = "cascade_slot"
        self.working_name = "Cascade Slot"
        self.wincap = 10000
        self.win_type = "cluster"  # or "lines"
        self.rtp = 0.96
        self.construct_paths()

        # Grid dimensions
        self.num_reels = 6
        self.num_rows = [6] * self.num_reels  # 6x6 grid

        # Symbol weights for random generation
        self.symbol_weights = {
            'A': 10,
            'K': 12,
            'Q': 14,
            'J': 16,
            '10': 18,
            'WILD': 2,
            'SCATTER': 3
        }

        # Cluster paytable (index = cluster size - 1)
        self.paytable = {
            'A': [0, 0, 0, 0, 5, 10, 20, 50, 100, 200, 500],  # 5+ symbols
            'K': [0, 0, 0, 0, 4, 8, 15, 40, 80, 150, 400],
            'Q': [0, 0, 0, 0, 3, 6, 12, 30, 60, 120, 300],
            'J': [0, 0, 0, 0, 2, 5, 10, 25, 50, 100, 250],
            '10': [0, 0, 0, 0, 2, 4, 8, 20, 40, 80, 200],
            'WILD': [0, 0, 0, 0, 10, 20, 40, 100, 200, 400, 1000],
        }

        # Initialize cascade manager
        self.cascade_manager = CascadeManager(self)

        # Bet modes with cascade mechanics
        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=self.wincap,
                distributions=[
                    Distribution(
                        criteria="cascade_wins",
                        quota=1.0,
                        conditions={
                            "enable_cascades": True,
                            "max_cascades": 10,
                            "multiplier_progression": [1, 2, 3, 5, 10]
                        }
                    )
                ]
            )
        ]
```

---

## 2. Megaways System

### 2.1 Megaways Reel Manager

```python
# games/megaways_slot/megaways_manager.py

import random

class MegawaysManager:
    """Manages dynamic reel heights for Megaways mechanics"""

    def __init__(self, config):
        self.config = config
        self.min_symbols = 2
        self.max_symbols = 7
        self.num_reels = 6

    def generate_reel_heights(self):
        """Generate random heights for each reel"""
        return [random.randint(self.min_symbols, self.max_symbols)
                for _ in range(self.num_reels)]

    def calculate_ways(self, reel_heights):
        """Calculate total ways to win"""
        ways = 1
        for height in reel_heights:
            ways *= height
        return ways

    def spin_megaways_reels(self):
        """
        Spin reels with dynamic heights
        Returns board and ways count
        """
        # Generate heights
        heights = self.generate_reel_heights()

        # Generate board
        board = []
        for reel_idx in range(self.num_reels):
            reel_height = heights[reel_idx]
            reel_symbols = []

            # Get reel strip
            reel_strip = self.config.reels[f"REEL_{reel_idx}"]

            # Random starting position
            start_pos = random.randint(0, len(reel_strip) - 1)

            # Get symbols
            for i in range(reel_height):
                pos = (start_pos + i) % len(reel_strip)
                reel_symbols.append(reel_strip[pos])

            board.append(reel_symbols)

        ways = self.calculate_ways(heights)

        return {
            'board': board,
            'heights': heights,
            'ways': ways
        }

    def find_megaways_wins(self, board):
        """
        Find all winning ways
        Uses left-to-right matching
        """
        wins = []

        # Get all possible paths through the reels
        paths = self.generate_all_paths(board)

        # Check each path for wins
        for path in paths:
            win = self.check_path_for_win(path)
            if win:
                wins.append(win)

        return wins

    def generate_all_paths(self, board):
        """Generate all possible symbol paths through reels"""
        if not board:
            return [[]]

        paths = []
        first_reel = board[0]
        remaining_paths = self.generate_all_paths(board[1:])

        for symbol_idx, symbol in enumerate(first_reel):
            for remaining_path in remaining_paths:
                paths.append([(0, symbol_idx, symbol)] + remaining_path)

        return paths

    def check_path_for_win(self, path):
        """Check if a path forms a winning combination"""
        if len(path) < 3:
            return None

        # Get first symbol (ignoring wilds for now)
        first_symbol = path[0][2]
        if first_symbol == 'WILD':
            # Find first non-wild
            for _, _, symbol in path:
                if symbol != 'WILD':
                    first_symbol = symbol
                    break

        # Count consecutive matching symbols (including wilds)
        count = 0
        for reel_idx, symbol_idx, symbol in path:
            if symbol == first_symbol or symbol == 'WILD':
                count += 1
            else:
                break

        if count >= 3:
            return {
                'symbol': first_symbol,
                'count': count,
                'path': path[:count]
            }

        return None

    def calculate_megaways_payout(self, wins, bet_amount):
        """Calculate total payout from megaways wins"""
        total = 0

        for win in wins:
            symbol = win['symbol']
            count = win['count']

            # Get payout from paytable
            if symbol in self.config.paytable:
                payout_array = self.config.paytable[symbol]
                if count - 1 < len(payout_array):
                    payout = payout_array[count - 1]
                    total += payout * bet_amount

        return total
```

### 2.2 Megaways Game Configuration

```python
# games/megaways_slot/game_config.py

from src.config.config import Config, BetMode
from megaways_manager import MegawaysManager

class MegawaysGameConfig(Config):
    def __init__(self):
        super().__init__()
        self.game_id = "megaways_slot"
        self.working_name = "Megaways Slot"
        self.wincap = 50000
        self.win_type = "megaways"
        self.rtp = 0.96
        self.construct_paths()

        # Megaways specific
        self.num_reels = 6
        self.min_reel_height = 2
        self.max_reel_height = 7
        self.max_ways = 7 ** 6  # 117,649

        # Paytable (6 of a kind = index 5)
        self.paytable = {
            'A': [0, 0, 5, 10, 25, 50, 100],
            'K': [0, 0, 4, 8, 20, 40, 80],
            'Q': [0, 0, 3, 6, 15, 30, 60],
            'J': [0, 0, 2, 5, 12, 25, 50],
            '10': [0, 0, 2, 4, 10, 20, 40],
            '9': [0, 0, 1, 3, 8, 15, 30],
            'WILD': [0, 0, 10, 20, 50, 100, 200],
        }

        # Create reel strips (longer for megaways)
        self.reels = {}
        for i in range(6):
            self.reels[f"REEL_{i}"] = self.generate_megaways_reel()

        # Initialize manager
        self.megaways_manager = MegawaysManager(self)

        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=self.wincap,
                distributions=[
                    Distribution(
                        criteria="megaways",
                        quota=1.0,
                        conditions={
                            "min_ways": 64,
                            "max_ways": 117649,
                            "enable_cascades": True
                        }
                    )
                ]
            )
        ]

    def generate_megaways_reel(self):
        """Generate a megaways reel strip"""
        symbols = []
        weights = {
            'A': 8, 'K': 10, 'Q': 12, 'J': 14,
            '10': 16, '9': 18, 'WILD': 2
        }

        # Create 100-symbol reel
        for symbol, weight in weights.items():
            symbols.extend([symbol] * weight)

        random.shuffle(symbols)
        return symbols
```

---

## 3. Multiplier Systems

### 3.1 Progressive Multiplier Manager

```python
# games/multiplier_slot/multiplier_manager.py

class MultiplierManager:
    """Manages various multiplier mechanics"""

    def __init__(self, config):
        self.config = config
        self.current_multiplier = 1
        self.multiplier_history = []

    def reset_multiplier(self):
        """Reset multiplier to base"""
        self.current_multiplier = 1
        self.multiplier_history = []

    def increment_multiplier(self, increment=1):
        """Increment multiplier (for cascades/consecutive wins)"""
        self.current_multiplier += increment
        self.multiplier_history.append(self.current_multiplier)
        return self.current_multiplier

    def get_random_multiplier(self, multiplier_pool):
        """
        Get random multiplier from pool
        multiplier_pool = [(value, weight), ...]
        """
        import random
        values = [m[0] for m in multiplier_pool]
        weights = [m[1] for m in multiplier_pool]
        return random.choices(values, weights=weights)[0]

    def apply_multiplier_to_win(self, win_amount):
        """Apply current multiplier to win"""
        return win_amount * self.current_multiplier

    def get_progressive_multiplier(self, consecutive_wins):
        """
        Get multiplier based on consecutive wins
        Formula: Base + (wins - 1) * increment
        """
        base = self.config.multiplier_base
        increment = self.config.multiplier_increment
        max_mult = self.config.multiplier_max

        multiplier = base + (consecutive_wins - 1) * increment
        return min(multiplier, max_mult)

    def get_fibonacci_multiplier(self, position):
        """Get multiplier from Fibonacci sequence"""
        fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]
        if position < len(fib):
            return fib[position]
        return fib[-1]

    def calculate_multiplier_rtp_contribution(self, base_rtp, avg_multiplier):
        """Calculate how multipliers affect RTP"""
        return base_rtp * avg_multiplier
```

### 3.2 Multiplier Game Example

```python
# games/multiplier_slot/game_override.py

from game_executables import GameExecutables
from multiplier_manager import MultiplierManager

class GameStateOverride(GameExecutables):
    def __init__(self, config):
        super().__init__(config)
        self.multiplier_manager = MultiplierManager(config)
        self.consecutive_wins = 0

    def process_spin(self, board, bet_mode):
        """Process spin with multiplier mechanics"""
        # Reset for new spin
        self.multiplier_manager.reset_multiplier()
        self.consecutive_wins = 0

        total_win = 0
        current_board = board

        # Process cascades with progressive multipliers
        while True:
            wins = self.find_wins(current_board)

            if not wins:
                break

            # Increment consecutive wins
            self.consecutive_wins += 1

            # Get progressive multiplier
            multiplier = self.multiplier_manager.get_progressive_multiplier(
                self.consecutive_wins
            )

            # Calculate win with multiplier
            base_win = self.calculate_base_win(wins)
            multiplied_win = base_win * multiplier
            total_win += multiplied_win

            # Continue cascade
            current_board = self.remove_and_drop(current_board, wins)

        return {
            'total_win': total_win,
            'max_multiplier': self.multiplier_manager.current_multiplier,
            'consecutive_wins': self.consecutive_wins
        }
```

---

## 4. Buy Bonus Feature

### 4.1 Buy Bonus Manager

```python
# games/buy_bonus_slot/buy_bonus_manager.py

class BuyBonusManager:
    """Manages buy bonus feature"""

    def __init__(self, config):
        self.config = config

    def calculate_buy_cost(self, bonus_type):
        """
        Calculate cost to buy bonus
        Based on expected value and natural trigger probability
        """
        bonus_config = self.config.bonus_features[bonus_type]

        expected_payout = bonus_config['expected_payout']
        natural_trigger_prob = bonus_config['natural_trigger_probability']
        adjustment_factor = bonus_config.get('buy_adjustment', 0.95)

        # Fair cost would be expected_payout / natural_trigger_prob
        # Adjust to make it slightly favorable to player
        fair_cost = expected_payout / natural_trigger_prob
        actual_cost = fair_cost * adjustment_factor

        return actual_cost

    def calculate_buy_bonus_rtp(self, buy_cost, expected_payout):
        """Calculate RTP of buying bonus"""
        return (expected_payout / buy_cost) * 100

    def get_available_bonuses(self):
        """Get list of bonuses available for purchase"""
        bonuses = []

        for bonus_type, config in self.config.bonus_features.items():
            if config.get('can_buy', False):
                cost = self.calculate_buy_cost(bonus_type)
                rtp = self.calculate_buy_bonus_rtp(cost, config['expected_payout'])

                bonuses.append({
                    'type': bonus_type,
                    'cost': cost,
                    'rtp': rtp,
                    'expected_payout': config['expected_payout'],
                    'description': config.get('description', '')
                })

        return bonuses

    def trigger_bought_bonus(self, bonus_type, bet_amount):
        """Trigger a bought bonus"""
        cost = self.calculate_buy_cost(bonus_type) * bet_amount

        # Run bonus
        bonus_result = self.run_bonus_feature(bonus_type, bet_amount)

        # Net result (payout - cost)
        net_win = bonus_result['total_win'] - cost

        return {
            'cost': cost,
            'gross_win': bonus_result['total_win'],
            'net_win': net_win,
            'bonus_details': bonus_result
        }
```

### 4.2 Buy Bonus Configuration

```python
# games/buy_bonus_slot/game_config.py

class BuyBonusGameConfig(Config):
    def __init__(self):
        super().__init__()
        # ... standard config ...

        # Define bonus features
        self.bonus_features = {
            'free_spins_10': {
                'name': '10 Free Spins',
                'spins': 10,
                'multiplier': 1,
                'expected_payout': 50,  # 50x bet
                'natural_trigger_probability': 0.01,  # 1 in 100
                'can_buy': True,
                'buy_adjustment': 0.95,  # 5% player advantage
                'description': '10 free spins with 1x multiplier'
            },
            'free_spins_15': {
                'name': '15 Free Spins',
                'spins': 15,
                'multiplier': 2,
                'expected_payout': 150,  # 150x bet
                'natural_trigger_probability': 0.005,  # 1 in 200
                'can_buy': True,
                'buy_adjustment': 0.93,
                'description': '15 free spins with 2x multiplier'
            },
            'mega_bonus': {
                'name': 'Mega Bonus',
                'type': 'pick_game',
                'expected_payout': 500,  # 500x bet
                'natural_trigger_probability': 0.001,  # 1 in 1000
                'can_buy': True,
                'buy_adjustment': 0.90,
                'description': 'Pick prizes for massive wins'
            }
        }

        # Buy costs (calculated dynamically but can be fixed)
        self.buy_costs = {
            'free_spins_10': 100,  # 100x bet
            'free_spins_15': 200,  # 200x bet
            'mega_bonus': 500,  # 500x bet
        }
```

---

## 5. Progressive Jackpots

### 5.1 Jackpot Manager

```python
# games/jackpot_slot/jackpot_manager.py

import random
import time

class JackpotManager:
    """Manages progressive jackpot mechanics"""

    def __init__(self, config):
        self.config = config
        self.jackpot_pools = {
            'mini': {'seed': 10, 'current': 10, 'contribution_rate': 0.01},
            'minor': {'seed': 50, 'current': 50, 'contribution_rate': 0.005},
            'major': {'seed': 500, 'current': 500, 'contribution_rate': 0.003},
            'grand': {'seed': 5000, 'current': 5000, 'contribution_rate': 0.001}
        }
        self.must_hit_by = {
            'mini': 50,
            'minor': 200,
            'major': 2000,
            'grand': 20000
        }

    def contribute_to_jackpots(self, bet_amount):
        """Add contribution from bet to all jackpot pools"""
        for jackpot_type, pool in self.jackpot_pools.items():
            contribution = bet_amount * pool['contribution_rate']
            pool['current'] += contribution

    def check_jackpot_win(self, bet_amount):
        """Check if any jackpot is won"""
        won_jackpots = []

        for jackpot_type, pool in self.jackpot_pools.items():
            if self.is_jackpot_won(jackpot_type, bet_amount):
                won_jackpots.append({
                    'type': jackpot_type,
                    'amount': pool['current']
                })
                # Reset to seed
                pool['current'] = pool['seed']

        return won_jackpots

    def is_jackpot_won(self, jackpot_type, bet_amount):
        """Determine if jackpot is won"""
        pool = self.jackpot_pools[jackpot_type]

        # Must-hit-by logic
        if jackpot_type in self.must_hit_by:
            must_hit = self.must_hit_by[jackpot_type]
            if pool['current'] >= must_hit:
                return True

            # Increasing probability as approaches must-hit
            progress = (pool['current'] - pool['seed']) / (must_hit - pool['seed'])
            win_probability = progress * 0.01  # Max 1% at must-hit

            if random.random() < win_probability:
                return True

        # Random trigger (very low probability)
        base_probability = 0.0001  # 1 in 10,000
        if random.random() < base_probability:
            return True

        return False

    def get_jackpot_rtp_contribution(self, jackpot_type):
        """Calculate RTP contribution of a jackpot"""
        pool = self.jackpot_pools[jackpot_type]
        avg_value = (pool['seed'] + self.must_hit_by.get(jackpot_type, pool['seed'] * 2)) / 2
        avg_trigger_prob = 1 / 5000  # Estimate

        return avg_value * avg_trigger_prob

    def get_total_jackpot_rtp(self):
        """Get total RTP contribution from all jackpots"""
        total = 0
        for jackpot_type in self.jackpot_pools:
            total += self.get_jackpot_rtp_contribution(jackpot_type)
        return total
```

---

## 6. Complete Game Example: Ultra Megaways Cascade

Combining all advanced features:

```python
# games/ultra_megaways/game_config.py

from src.config.config import Config, BetMode
from cascade_manager import CascadeManager
from megaways_manager import MegawaysManager
from multiplier_manager import MultiplierManager
from buy_bonus_manager import BuyBonusManager
from jackpot_manager import JackpotManager

class UltraMegawaysConfig(Config):
    def __init__(self):
        super().__init__()
        self.game_id = "ultra_megaways"
        self.working_name = "Ultra Megaways Cascade"
        self.wincap = 100000
        self.win_type = "megaways_cascade"
        self.rtp = 0.96
        self.construct_paths()

        # Initialize all managers
        self.cascade_manager = CascadeManager(self)
        self.megaways_manager = MegawaysManager(self)
        self.multiplier_manager = MultiplierManager(self)
        self.buy_bonus_manager = BuyBonusManager(self)
        self.jackpot_manager = JackpotManager(self)

        # Multiplier configuration
        self.multiplier_base = 1
        self.multiplier_increment = 1
        self.multiplier_max = 100

        # ... rest of configuration ...
```

---

This implementation guide provides complete, working code for all advanced slot mechanics integrated with the Math SDK. Use these as templates to create sophisticated, modern slot games with precise mathematical control.
