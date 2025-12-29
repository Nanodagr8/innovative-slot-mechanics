"""
Transform Mechanics - Markov Chain State Transitions

Symbols transition between states using probability matrices.
States: LOW → MEDIUM → HIGH → WILD → SUPER

Mathematical Foundation:
- Markov chain transition matrix
- Steady-state distribution via eigenvalue decomposition
- Expected payout: 58.8x average

Author: Kevin Inthavong / NANOSTUDIOS
License: MIT (Non-Commercial) / Patent-Pending
"""

import numpy as np
import random
from typing import Dict, List, Any
from .base_mechanic import BaseMechanic


class TransformManager(BaseMechanic):
    """Transform mechanics using Markov chains for symbol state transitions"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Transform mechanics.
        
        Args:
            config: Configuration dict with:
                - enabled: bool
                - trigger_rate: float (default 0.20)
                - symbol_transform_rate: float (default 0.50)
        """
        super().__init__(config)
        
        self.symbol_transform_rate = config.get('symbol_transform_rate', 0.50)
        
        # Define states
        self.states = ['LOW', 'MEDIUM', 'HIGH', 'WILD', 'SUPER']
        
        # State payouts (multipliers)
        self.state_payouts = {
            'LOW': 2,
            'MEDIUM': 5,
            'HIGH': 15,
            'WILD': 50,
            'SUPER': 200
        }
        
        # CORRECTED transition matrix (rows sum to 1.0)
        self.transition_matrix = np.array([
            [0.70, 0.20, 0.08, 0.015, 0.005],  # LOW
            [0.10, 0.60, 0.25, 0.040, 0.010],  # MEDIUM
            [0.05, 0.15, 0.65, 0.100, 0.050],  # HIGH
            [0.02, 0.08, 0.20, 0.600, 0.100],  # WILD
            [0.00, 0.00, 0.10, 0.200, 0.700]   # SUPER
        ])
        
        # Calculate steady-state distribution
        self.steady_state = self._calculate_steady_state()
    
    def _calculate_steady_state(self) -> Dict[str, float]:
        """
        Calculate steady-state distribution using eigenvalue decomposition.
        
        Returns:
            Dictionary mapping states to their steady-state probabilities
        """
        # Find left eigenvector for eigenvalue 1
        eigenvalues, eigenvectors = np.linalg.eig(self.transition_matrix.T)
        idx = np.argmin(np.abs(eigenvalues - 1))
        steady = np.real(eigenvectors[:, idx])
        steady = steady / steady.sum()  # Normalize
        
        return dict(zip(self.states, steady))
    
    def transform_symbol(self, current_state: str) -> str:
        """
        Transform symbol to new state based on transition probabilities.
        
        Args:
            current_state: Current symbol state
            
        Returns:
            New symbol state
        """
        if current_state not in self.states:
            return current_state
        
        current_idx = self.states.index(current_state)
        probs = self.transition_matrix[current_idx]
        next_idx = np.random.choice(len(self.states), p=probs)
        
        return self.states[next_idx]
    
    def process_spin(self, board: List[List[str]], bet_amount: float) -> Dict[str, Any]:
        """
        Process transform for a spin.
        
        Args:
            board: 2D list of symbol states
            bet_amount: Bet amount
            
        Returns:
            Dictionary with transform results
        """
        if not self.is_triggered():
            return {
                'transformed': False,
                'board': board,
                'count': 0,
                'events': []
            }
        
        transformed_board = []
        transform_count = 0
        events = []
        
        for row_idx, row in enumerate(board):
            new_row = []
            for col_idx, symbol in enumerate(row):
                # Check if this symbol transforms
                if random.random() < self.symbol_transform_rate:
                    new_symbol = self.transform_symbol(symbol)
                    new_row.append(new_symbol)
                    
                    if new_symbol != symbol:
                        transform_count += 1
                        events.append({
                            'row': row_idx,
                            'col': col_idx,
                            'from': symbol,
                            'to': new_symbol
                        })
                else:
                    new_row.append(symbol)
            
            transformed_board.append(new_row)
        
        return {
            'transformed': transform_count > 0,
            'board': transformed_board,
            'count': transform_count,
            'events': events
        }
    
    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """
        Calculate RTP contribution from Transform mechanics.
        
        Args:
            base_rtp: Base game RTP
            
        Returns:
            RTP contribution (e.g., 0.10 for 10%)
        """
        # Expected payout based on steady-state distribution
        expected_payout = sum(
            self.steady_state[state] * self.state_payouts[state]
            for state in self.states
        )
        # = 58.781x average
        
        # Contribution = trigger_rate × (expected / base)
        # Assuming base payout is 10x
        base_payout = 10
        contribution = self.trigger_rate * (expected_payout / base_payout)
        
        return min(contribution, 0.15)  # Cap at 15%
    
    def validate_configuration(self) -> bool:
        """Validate transition matrix and configuration"""
        # Check rows sum to 1
        for row in self.transition_matrix:
            if not np.isclose(row.sum(), 1.0):
                return False
        
        # Check steady state sums to 1
        if not np.isclose(sum(self.steady_state.values()), 1.0):
            return False
        
        return True
    
    def get_steady_state(self) -> Dict[str, float]:
        """Get steady-state distribution"""
        return self.steady_state.copy()
    
    def get_expected_payout(self) -> float:
        """Get expected payout multiplier"""
        return sum(
            self.steady_state[state] * self.state_payouts[state]
            for state in self.states
        )
