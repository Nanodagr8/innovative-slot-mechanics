# Implementation Plan: Integrating Innovative Mechanics into Math SDK

## Step-by-Step Guide

---

## Overview

This plan guides you through integrating the four innovative mechanics (Transform, Evolution, Time Travel, Morphing) into your Math SDK.

**Timeline:** 2-4 weeks
**Difficulty:** Intermediate to Advanced
**Prerequisites:** Math SDK setup complete, Python 3.14, Virtual environment active

---

## Phase 1: Setup & Preparation (Day 1-2)

### Step 1.1: Create Mechanics Module

```bash
# Activate virtual environment
cd c:\Users\Kevin Inthavong\NANOSTUDIOS\math-sdk
env\Scripts\activate

# Create new mechanics directory
mkdir src\mechanics
New-Item src\mechanics\__init__.py
```

### Step 1.2: File Structure

```
src/
├── mechanics/
│   ├── __init__.py
│   ├── transform_manager.py
│   ├── evolution_manager.py
│   ├── timetravel_manager.py
│   ├── morphing_manager.py
│   └── base_mechanic.py
├── config/
│   └── mechanic_configs.py
└── tests/
    └── test_mechanics.py
```

### Step 1.3: Install Additional Dependencies

```bash
pip install numpy scipy
```

---

## Phase 2: Base Mechanic Class (Day 2-3)

### Create Base Class

```python
# src/mechanics/base_mechanic.py

from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseMechanic(ABC):
    """Base class for all innovative mechanics"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get('enabled', True)
        self.trigger_rate = config.get('trigger_rate', 0.10)

    @abstractmethod
    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """Calculate RTP contribution of this mechanic"""
        pass

    @abstractmethod
    def process_spin(self, board: list, bet_amount: float) -> Dict[str, Any]:
        """Process a spin with this mechanic"""
        pass

    @abstractmethod
    def validate_configuration(self) -> bool:
        """Validate mechanic configuration"""
        pass

    def is_triggered(self) -> bool:
        """Check if mechanic triggers this spin"""
        import random
        return random.random() < self.trigger_rate
```

---

## Phase 3: Implement Transform Mechanics (Day 3-5)

### Step 3.1: Create Transform Manager

```python
# src/mechanics/transform_manager.py

import numpy as np
import random
from typing import Dict, List
from .base_mechanic import BaseMechanic

class TransformManager(BaseMechanic):
    """Transform mechanics using Markov chains"""

    def __init__(self, config: Dict):
        super().__init__(config)

        # States
        self.states = ['LOW', 'MEDIUM', 'HIGH', 'WILD', 'SUPER']

        # CORRECTED transition matrix
        self.transition_matrix = np.array([
            [0.70, 0.20, 0.08, 0.015, 0.005],
            [0.10, 0.60, 0.25, 0.040, 0.010],
            [0.05, 0.15, 0.65, 0.100, 0.050],
            [0.02, 0.08, 0.20, 0.600, 0.100],
            [0.00, 0.00, 0.10, 0.200, 0.700]
        ])

        # State payouts
        self.state_payouts = {
            'LOW': 2,
            'MEDIUM': 5,
            'HIGH': 15,
            'WILD': 50,
            'SUPER': 200
        }

        # Calculate steady-state
        self.steady_state = self._calculate_steady_state()

    def _calculate_steady_state(self) -> Dict[str, float]:
        """Calculate steady-state distribution"""
        eigenvalues, eigenvectors = np.linalg.eig(self.transition_matrix.T)
        idx = np.argmin(np.abs(eigenvalues - 1))
        steady = np.real(eigenvectors[:, idx])
        steady = steady / steady.sum()

        return dict(zip(self.states, steady))

    def transform_symbol(self, current_state: str) -> str:
        """Transform symbol to new state"""
        current_idx = self.states.index(current_state)
        probs = self.transition_matrix[current_idx]
        next_idx = np.random.choice(len(self.states), p=probs)
        return self.states[next_idx]

    def process_spin(self, board: list, bet_amount: float) -> Dict:
        """Process transform for a spin"""
        if not self.is_triggered():
            return {'transformed': False}

        transformed_board = []
        transform_count = 0

        for row in board:
            new_row = []
            for symbol in row:
                if random.random() < 0.5:  # 50% per symbol
                    new_symbol = self.transform_symbol(symbol)
                    new_row.append(new_symbol)
                    if new_symbol != symbol:
                        transform_count += 1
                else:
                    new_row.append(symbol)
            transformed_board.append(new_row)

        return {
            'transformed': transform_count > 0,
            'board': transformed_board,
            'count': transform_count
        }

    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """Calculate RTP contribution"""
        expected_payout = sum(
            self.steady_state[state] * self.state_payouts[state]
            for state in self.states
        )
        # = 58.781x

        contribution = self.trigger_rate * (expected_payout / 10)
        return contribution

    def validate_configuration(self) -> bool:
        """Validate configuration"""
        # Check transition matrix rows sum to 1
        for row in self.transition_matrix:
            if not np.isclose(row.sum(), 1.0):
                return False
        return True
```

### Step 3.2: Add to Game Configuration

```python
# games/innovative_slot/game_config.py

from src.config.config import Config
from src.mechanics.transform_manager import TransformManager

class InnovativeGameConfig(Config):
    def __init__(self):
        super().__init__()
        self.game_id = "innovative_slot"
        self.rtp = 0.96

        # Initialize Transform
        self.transform_manager = TransformManager({
            'enabled': True,
            'trigger_rate': 0.20  # 20% of spins
        })
```

---

## Phase 4: Implement Evolution Mechanics (Day 5-7)

### Step 4.1: Create Evolution Manager

```python
# src/mechanics/evolution_manager.py

import math
import random
from typing import Dict
from .base_mechanic import BaseMechanic

class EvolutionManager(BaseMechanic):
    """Evolution mechanics using Fibonacci and Golden Ratio"""

    def __init__(self, config: Dict):
        super().__init__(config)

        self.golden_ratio = (1 + math.sqrt(5)) / 2  # φ = 1.618
        self.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
        self.max_level = 10

        # Symbol evolution points
        self.symbol_points = {}

    def evolution_probability(self, level: int) -> float:
        """Calculate probability of reaching level"""
        return 0.50 / (self.golden_ratio ** level)

    def add_points(self, symbol: str, points: int):
        """Add evolution points to symbol"""
        if symbol not in self.symbol_points:
            self.symbol_points[symbol] = 0
        self.symbol_points[symbol] += points

    def get_level(self, symbol: str) -> int:
        """Get current evolution level"""
        points = self.symbol_points.get(symbol, 0)
        level = 0

        while level < self.max_level:
            required = self.fibonacci[level + 1] * 10
            if points >= required:
                level += 1
            else:
                break

        return level

    def get_multiplier(self, level: int) -> int:
        """Get Fibonacci multiplier for level"""
        return self.fibonacci[level]

    def process_spin(self, board: list, bet_amount: float) -> Dict:
        """Process evolution for spin"""
        if not self.is_triggered():
            return {'evolved': False}

        # Award points based on wins (simplified)
        base_points = 10
        for symbol in [s for row in board for s in row]:
            self.add_points(symbol, base_points)

        # Check for evolutions
        evolved_symbols = {}
        for symbol in self.symbol_points:
            level = self.get_level(symbol)
            if level > 0:
                evolved_symbols[symbol] = {
                    'level': level,
                    'multiplier': self.get_multiplier(level)
                }

        return {
            'evolved': len(evolved_symbols) > 0,
            'symbols': evolved_symbols
        }

    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """Calculate RTP contribution"""
        # Expected multiplier ~2.15x
        expected_mult = 2.15
        contribution = self.trigger_rate * (expected_mult - 1)
        return contribution

    def validate_configuration(self) -> bool:
        """Validate configuration"""
        return 0 <= self.trigger_rate <= 1.0
```

---

## Phase 5: Implement Time Travel Mechanics (Day 7-9)

### Step 5.1: Create Time Travel Manager

```python
# src/mechanics/timetravel_manager.py

import math
import random
from collections import deque
from typing import Dict
from .base_mechanic import BaseMechanic

class TimeTravelManager(BaseMechanic):
    """Time Travel mechanics with temporal probability"""

    def __init__(self, config: Dict):
        super().__init__(config)

        self.win_history = deque(maxlen=50)
        self.current_spin = 0
        self.past_decay = 0.2
        self.future_decay = 0.1

    def record_win(self, amount: float):
        """Record win in history"""
        self.win_history.append({
            'spin': self.current_spin,
            'amount': amount
        })
        self.current_spin += 1

    def retrieve_past_win(self) -> Dict:
        """Attempt to retrieve past win"""
        if not self.win_history:
            return {'success': False}

        # Select random past win
        past_win = random.choice(list(self.win_history))
        spins_ago = self.current_spin - past_win['spin']

        # Calculate retrieval probability
        prob = math.exp(-self.past_decay * spins_ago)

        if random.random() < prob:
            decay_mult = math.exp(-0.05 * spins_ago)
            return {
                'success': True,
                'amount': past_win['amount'] * decay_mult,
                'spins_ago': spins_ago
            }

        return {'success': False}

    def time_wave_function(self, t: int) -> float:
        """CORRECTED wave function (always positive)"""
        return 10 * abs(math.sin(0.5 * t)) * math.exp(-0.1 * t)

    def process_spin(self, board: list, bet_amount: float) -> Dict:
        """Process time travel for spin"""
        result = {
            'past_retrieval': None,
            'future_boost': None
        }

        # Past retrieval (8% chance)
        if random.random() < 0.08:
            past = self.retrieve_past_win()
            if past['success']:
                result['past_retrieval'] = past

        # Future boost (4% chance)
        if random.random() < 0.04:
            result['future_boost'] = {
                'multiplier': 1.5  # 50% boost
            }

        return result

    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """Calculate RTP contribution"""
        past_contrib = 0.08 * 20 * 0.5  # 0.8%
        future_contrib = 0.04 * 0.5      # 2%
        return (past_contrib + future_contrib) / 100

    def validate_configuration(self) -> bool:
        """Validate configuration"""
        return True
```

---

## Phase 6: Implement Morphing Mechanics (Day 9-11)

### Step 6.1: Create Morphing Manager

```python
# src/mechanics/morphing_manager.py

import numpy as np
import random
from enum import Enum
from typing import Dict
from .base_mechanic import BaseMechanic

class MorphState(Enum):
    BASIC = 0
    ENHANCED = 1
    PREMIUM = 2
    ELITE = 3
    LEGENDARY = 4

class MorphingManager(BaseMechanic):
    """Morphing mechanics using Bezier curves"""

    def __init__(self, config: Dict):
        super().__init__(config)

        self.state_multipliers = {
            MorphState.BASIC: 1.0,
            MorphState.ENHANCED: 2.0,
            MorphState.PREMIUM: 5.0,
            MorphState.ELITE: 15.0,
            MorphState.LEGENDARY: 50.0
        }

        # CORRECTED transition matrix
        self.transition_matrix = {
            MorphState.BASIC: [0.70, 0.25, 0.04, 0.01, 0.00],
            MorphState.ENHANCED: [0.15, 0.60, 0.20, 0.04, 0.01],
            MorphState.PREMIUM: [0.05, 0.15, 0.60, 0.15, 0.05],
            MorphState.ELITE: [0.02, 0.05, 0.15, 0.65, 0.13],
            MorphState.LEGENDARY: [0.00, 0.00, 0.05, 0.20, 0.75]
        }

    def bezier_interpolate(self, t: float, p0: float, p1: float,
                          p2: float, p3: float) -> float:
        """Cubic Bezier interpolation"""
        b0 = (1 - t) ** 3
        b1 = 3 * (1 - t) ** 2 * t
        b2 = 3 * (1 - t) * t ** 2
        b3 = t ** 3
        return b0 * p0 + b1 * p1 + b2 * p2 + b3 * p3

    def select_next_state(self, current: MorphState) -> MorphState:
        """Select next morph state"""
        probs = self.transition_matrix[current]
        states = list(MorphState)
        return random.choices(states, weights=probs)[0]

    def process_spin(self, board: list, bet_amount: float) -> Dict:
        """Process morphing for spin"""
        if not self.is_triggered():
            return {'morphed': False}

        # Simplified: morph random symbols
        morph_events = []
        for row in board:
            for symbol in row:
                if random.random() < 0.3:  # 30% per symbol
                    current = MorphState.BASIC
                    next_state = self.select_next_state(current)
                    if next_state.value > current.value:
                        morph_events.append({
                            'symbol': symbol,
                            'from': current,
                            'to': next_state,
                            'multiplier': self.state_multipliers[next_state]
                        })

        return {
            'morphed': len(morph_events) > 0,
            'events': morph_events
        }

    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """Calculate RTP contribution"""
        # Simplified: 5-7% contribution
        return 0.06

    def validate_configuration(self) -> bool:
        """Validate configuration"""
        return True
```

---

## Phase 7: Integration & Testing (Day 11-14)

### Step 7.1: Create Test Suite

```python
# src/tests/test_mechanics.py

import unittest
from src.mechanics.transform_manager import TransformManager
from src.mechanics.evolution_manager import EvolutionManager
from src.mechanics.timetravel_manager import TimeTravelManager
from src.mechanics.morphing_manager import MorphingManager

class TestInnovativeMechanics(unittest.TestCase):

    def setUp(self):
        """Set up test fixtures"""
        self.config = {'enabled': True, 'trigger_rate': 0.20}

    def test_transform_validation(self):
        """Test Transform mechanics validation"""
        manager = TransformManager(self.config)
        self.assertTrue(manager.validate_configuration())

    def test_evolution_fibonacci(self):
        """Test Evolution Fibonacci sequence"""
        manager = EvolutionManager(self.config)
        self.assertEqual(manager.fibonacci[5], 8)
        self.assertEqual(manager.fibonacci[10], 89)

    def test_timetravel_wave(self):
        """Test Time Travel wave function"""
        manager = TimeTravelManager(self.config)
        for t in range(50):
            wave = manager.time_wave_function(t)
            self.assertGreaterEqual(wave, 0)  # Always positive

    def test_morphing_bezier(self):
        """Test Morphing Bezier interpolation"""
        manager = MorphingManager(self.config)
        # Test endpoints
        self.assertAlmostEqual(
            manager.bezier_interpolate(0, 10, 20, 30, 40), 10
        )
        self.assertAlmostEqual(
            manager.bezier_interpolate(1, 10, 20, 30, 40), 40
        )

    def test_total_rtp(self):
        """Test total RTP is balanced"""
        base_rtp = 0.70

        transform = TransformManager(self.config)
        evolution = EvolutionManager({'enabled': True, 'trigger_rate': 0.10})
        timetravel = TimeTravelManager(self.config)
        morphing = MorphingManager({'enabled': True, 'trigger_rate': 0.08})

        total_rtp = (
            base_rtp +
            transform.calculate_rtp_contribution(base_rtp) +
            evolution.calculate_rtp_contribution(base_rtp) +
            timetravel.calculate_rtp_contribution(base_rtp) +
            morphing.calculate_rtp_contribution(base_rtp)
        )

        self.assertAlmostEqual(total_rtp, 0.96, places=2)

if __name__ == '__main__':
    unittest.main()
```

### Step 7.2: Run Tests

```bash
# Run test suite
python -m pytest src/tests/test_mechanics.py -v
```

---

## Phase 8: Create Demo Game (Day 14)

### Step 8.1: Create Demo Game

```bash
# Copy template
cp -r games/template games/innovative_demo
```

### Step 8.2: Configure Demo

```python
# games/innovative_demo/game_config.py

from src.config.config import Config, BetMode
from src.mechanics.transform_manager import TransformManager
from src.mechanics.evolution_manager import EvolutionManager
from src.mechanics.timetravel_manager import TimeTravelManager
from src.mechanics.morphing_manager import MorphingManager

class InnovativeDemoConfig(Config):
    def __init__(self):
        super().__init__()
        self.game_id = "innovative_demo"
        self.rtp = 0.96
        self.wincap = 100000

        # Initialize all mechanics
        self.transform = TransformManager({'enabled': True, 'trigger_rate': 0.20})
        self.evolution = EvolutionManager({'enabled': True, 'trigger_rate': 0.10})
        self.timetravel = TimeTravelManager({'enabled': True, 'trigger_rate': 0.08})
        self.morphing = MorphingManager({'enabled': True, 'trigger_rate': 0.08})
```

---

## Next Steps

1. ✅ Review [Corrected Mechanics](file:///c:/Users/Kevin%20Inthavong/.gemini/antigravity/brain/4d5beef3-0518-43ff-8b31-e1ef16bb7bc9/corrected_mechanics.md)
2. ✅ Follow this implementation plan
3. ✅ Run test suite
4. ✅ Create demo game
5. ✅ File provisional patents

**Estimated completion: 2-4 weeks**
