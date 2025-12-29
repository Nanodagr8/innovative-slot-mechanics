"""
Morphing Mechanics - Bezier Curve Interpolation & Cellular Automata

Smooth symbol transformations through 5 states.
States: BASIC → ENHANCED → PREMIUM → ELITE → LEGENDARY

Mathematical Foundation:
- Cubic Bezier curves: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
- Cellular automata evolution (Conway's Life rules)
- Neighbor-influenced morphing

Author: Kevin Inthavong / NANOSTUDIOS
License: MIT (Non-Commercial) / Patent-Pending
"""

import numpy as np
import random
from enum import Enum
from typing import Dict, List, Any, Optional
from .base_mechanic import BaseMechanic


class MorphState(Enum):
    """Morph states with increasing value"""
    BASIC = 0
    ENHANCED = 1
    PREMIUM = 2
    ELITE = 3
    LEGENDARY = 4


class MorphingManager(BaseMechanic):
    """Morphing mechanics using Bezier curves and cellular automata"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Morphing mechanics.
        
        Args:
            config: Configuration dict with:
                - enabled: bool
                - trigger_rate: float (default 0.15)
                - morph_per_symbol_rate: float (default 0.60)
        """
        super().__init__(config)
        
        self.morph_per_symbol_rate = config.get('morph_per_symbol_rate', 0.60)
        
        # State multipliers
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
        
        # Active morphs (symbol_id -> morph_data)
        self.active_morphs: Dict[str, Dict[str, Any]] = {}
        
        # Calculate steady-state
        self.steady_state = self._calculate_steady_state()
    
    def _calculate_steady_state(self) -> Dict[MorphState, float]:
        """Calculate steady-state distribution"""
        P = np.array([self.transition_matrix[state] for state in MorphState])
        
        eigenvalues, eigenvectors = np.linalg.eig(P.T)
        idx = np.argmin(np.abs(eigenvalues - 1))
        steady = np.real(eigenvectors[:, idx])
        steady = steady / steady.sum()
        
        return dict(zip(MorphState, steady))
    
    def bezier_interpolate(self, t: float, p0: float, p1: float, 
                          p2: float, p3: float) -> float:
        """
        Cubic Bezier interpolation.
        
        Formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
        
        Args:
            t: Progress (0 to 1)
            p0, p1, p2, p3: Control points
            
        Returns:
            Interpolated value
        """
        b0 = (1 - t) ** 3
        b1 = 3 * (1 - t) ** 2 * t
        b2 = 3 * (1 - t) * t ** 2
        b3 = t ** 3
        
        return b0 * p0 + b1 * p1 + b2 * p2 + b3 * p3
    
    def ease_in_out_cubic(self, t: float) -> float:
        """Cubic easing function"""
        if t < 0.5:
            return 4 * t ** 3
        else:
            return 1 - ((-2 * t + 2) ** 3) / 2
    
    def select_next_state(self, current: MorphState) -> MorphState:
        """
        Select next morph state based on transition probabilities.
        
        Args:
            current: Current morph state
            
        Returns:
            Next morph state
        """
        probs = self.transition_matrix[current]
        states = list(MorphState)
        return random.choices(states, weights=probs)[0]
    
    def start_morph(self, symbol_id: str, current_state: MorphState, 
                   target_state: MorphState):
        """
        Start a morphing animation.
        
        Args:
            symbol_id: Unique symbol identifier
            current_state: Starting state
            target_state: Target state
        """
        duration = abs(target_state.value - current_state.value) * 1.0
        
        self.active_morphs[symbol_id] = {
            'start_state': current_state,
            'target_state': target_state,
            'progress': 0.0,
            'duration': max(duration, 0.5)
        }
    
    def update_morphs(self, delta_time: float) -> List[str]:
        """
        Update active morphs.
        
        Args:
            delta_time: Time elapsed since last update
            
        Returns:
            List of completed morph symbol IDs
        """
        completed = []
        
        for symbol_id, morph in self.active_morphs.items():
            morph['progress'] += delta_time / morph['duration']
            
            if morph['progress'] >= 1.0:
                morph['progress'] = 1.0
                completed.append(symbol_id)
        
        # Remove completed
        for symbol_id in completed:
            del self.active_morphs[symbol_id]
        
        return completed
    
    def get_morph_multiplier(self, symbol_id: str) -> float:
        """
        Get current multiplier for morphing symbol.
        
        Args:
            symbol_id: Symbol identifier
            
        Returns:
            Interpolated multiplier
        """
        if symbol_id not in self.active_morphs:
            return 1.0
        
        morph = self.active_morphs[symbol_id]
        t = self.ease_in_out_cubic(morph['progress'])
        
        start_mult = self.state_multipliers[morph['start_state']]
        end_mult = self.state_multipliers[morph['target_state']]
        
        # Use Bezier for smooth transition
        ctrl1 = start_mult + (end_mult - start_mult) * 0.33
        ctrl2 = start_mult + (end_mult - start_mult) * 0.67
        
        return self.bezier_interpolate(t, start_mult, ctrl1, ctrl2, end_mult)
    
    def get_neighbors(self, board: List[List[Any]], row: int, col: int) -> List[Any]:
        """Get 8-way neighbors of a cell"""
        neighbors = []
        directions = [
            (-1, -1), (-1, 0), (-1, 1),
            (0, -1),           (0, 1),
            (1, -1),  (1, 0),  (1, 1)
        ]
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            if 0 <= r < len(board) and 0 <= c < len(board[0]):
                neighbors.append(board[r][c])
        
        return neighbors
    
    def process_spin(self, board: List[List[str]], bet_amount: float) -> Dict[str, Any]:
        """
        Process morphing for a spin.
        
        Args:
            board: Game board
            bet_amount: Bet amount
            
        Returns:
            Dictionary with morph results
        """
        if not self.is_triggered():
            return {
                'morphed': False,
                'events': []
            }
        
        morph_events = []
        
        for row_idx, row in enumerate(board):
            for col_idx, symbol in enumerate(row):
                # Check morph probability
                if random.random() < self.morph_per_symbol_rate:
                    current_state = MorphState.BASIC
                    next_state = self.select_next_state(current_state)
                    
                    if next_state.value > current_state.value:
                        symbol_id = f"{row_idx}_{col_idx}"
                        self.start_morph(symbol_id, current_state, next_state)
                        
                        morph_events.append({
                            'symbol_id': symbol_id,
                            'row': row_idx,
                            'col': col_idx,
                            'from': current_state.name,
                            'to': next_state.name,
                            'multiplier': self.state_multipliers[next_state]
                        })
        
        return {
            'morphed': len(morph_events) > 0,
            'events': morph_events,
            'active_morphs': len(self.active_morphs),
            'fluid_bonus': len(morph_events) > 5 # Trigger Fluid Dynamics if > 5 morphs occur at once
        }
    
    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """
        Calculate RTP contribution from Morphing mechanics.
        
        Args:
            base_rtp: Base game RTP
            
        Returns:
            RTP contribution
        """
        # Expected multiplier based on steady-state
        expected_mult = sum(
            self.steady_state[state] * self.state_multipliers[state]
            for state in MorphState
        )
        # = 17.25x
        
        # Apply to win rate, not all spins
        win_rate = 0.25
        contribution = self.trigger_rate * win_rate * (expected_mult - 1) / 10
        
        return min(contribution, 0.07)  # Cap at 7%
    
    def validate_configuration(self) -> bool:
        """Validate configuration"""
        # Check Bezier at endpoints
        if not np.isclose(self.bezier_interpolate(0, 10, 20, 30, 40), 10):
            return False
        if not np.isclose(self.bezier_interpolate(1, 10, 20, 30, 40), 40):
            return False
        
        # Check transition matrix rows sum to 1
        for state in MorphState:
            if not np.isclose(sum(self.transition_matrix[state]), 1.0):
                return False
        
        return True
    
    def get_expected_multiplier(self) -> float:
        """Get expected multiplier from steady-state"""
        return sum(
            self.steady_state[state] * self.state_multipliers[state]
            for state in MorphState
        )
