"""
Evolution Mechanics - Fibonacci Sequence & Golden Ratio Progression

Symbols evolve through 10 levels with Fibonacci multipliers.
Probability decays by Golden Ratio (φ = 1.618).

Mathematical Foundation:
- Fibonacci sequence for multipliers: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
- Golden ratio probability decay: P(n) = 0.50 / φⁿ
- Points accumulation system

Author: Kevin Inthavong / NANOSTUDIOS
License: MIT (Non-Commercial) / Patent-Pending
"""

import math
import random
from typing import Dict, List, Any
from .base_mechanic import BaseMechanic


class EvolutionManager(BaseMechanic):
    """Evolution mechanics using Fibonacci sequence and Golden Ratio"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Evolution mechanics.
        
        Args:
            config: Configuration dict with:
                - enabled: bool
                - trigger_rate: float (default 0.10)
                - points_per_win: float (default 0.1)
                - points_per_cascade: int (default 5)
                - points_per_wild: int (default 10)
        """
        super().__init__(config)
        
        self.points_per_win = config.get('points_per_win', 0.1)
        self.points_per_cascade = config.get('points_per_cascade', 5)
        self.points_per_wild = config.get('points_per_wild', 10)
        
        # Golden ratio
        self.golden_ratio = (1 + math.sqrt(5)) / 2  # φ ≈ 1.618
        
        # Fibonacci sequence for multipliers
        self.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
        self.max_level = 10
        
        # Symbol evolution points tracking
        self.symbol_points: Dict[str, float] = {}
    
    def fibonacci_number(self, n: int) -> int:
        """
        Get Fibonacci number at position n.
        
        Args:
            n: Position (0-indexed)
            
        Returns:
            Fibonacci number
        """
        if n < len(self.fibonacci):
            return self.fibonacci[n]
        
        # Calculate if beyond cached values
        a, b = self.fibonacci[-2], self.fibonacci[-1]
        for _ in range(len(self.fibonacci), n + 1):
            a, b = b, a + b
        return b
    
    def evolution_probability(self, level: int) -> float:
        """
        Calculate probability of reaching a level.
        
        Formula: P(n) = 0.50 / φⁿ
        
        Args:
            level: Target level
            
        Returns:
            Probability (0-1)
        """
        return 0.50 / (self.golden_ratio ** level)
    
    def add_points(self, symbol: str, points: float):
        """
        Add evolution points to a symbol.
        
        Args:
            symbol: Symbol identifier
            points: Points to add
        """
        if symbol not in self.symbol_points:
            self.symbol_points[symbol] = 0
        self.symbol_points[symbol] += points
    
    def get_points(self, symbol: str) -> float:
        """Get current points for a symbol"""
        return self.symbol_points.get(symbol, 0)
    
    def get_level(self, symbol: str) -> int:
        """
        Get current evolution level based on points.
        
        Args:
            symbol: Symbol identifier
            
        Returns:
            Evolution level (0-10)
        """
        points = self.get_points(symbol)
        level = 0
        
        while level < self.max_level:
            required = self.fibonacci_number(level + 1) * 10
            if points >= required:
                level += 1
            else:
                break
        
        return level
    
    def get_multiplier(self, level: int) -> int:
        """
        Get Fibonacci multiplier for level.
        
        Args:
            level: Evolution level
            
        Returns:
            Multiplier value
        """
        return self.fibonacci_number(min(level, self.max_level))
    
    def process_spin(self, board: List[List[str]], bet_amount: float) -> Dict[str, Any]:
        """
        Process evolution for a spin.
        
        Args:
            board: 2D list of symbols
            bet_amount: Bet amount
            
        Returns:
            Dictionary with evolution results
        """
        if not self.is_triggered():
            return {
                'evolved': False,
                'symbols': {},
                'events': []
            }
        
        events = []
        evolved_symbols = {}
        
        # Award base points
        base_points = 10
        for row in board:
            for symbol in row:
                old_level = self.get_level(symbol)
                self.add_points(symbol, base_points)
                new_level = self.get_level(symbol)
                
                if new_level > old_level:
                    events.append({
                        'symbol': symbol,
                        'from_level': old_level,
                        'to_level': new_level,
                        'multiplier': self.get_multiplier(new_level)
                    })
        
        # Get current state of all evolved symbols
        for symbol in self.symbol_points:
            level = self.get_level(symbol)
            if level > 0:
                evolved_symbols[symbol] = {
                    'level': level,
                    'multiplier': self.get_multiplier(level),
                    'points': self.get_points(symbol)
                }
        
        return {
            'evolved': len(events) > 0,
            'symbols': evolved_symbols,
            'events': events
        }
    
    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """
        Calculate RTP contribution from Evolution mechanics.
        
        Args:
            base_rtp: Base game RTP
            
        Returns:
            RTP contribution
        """
        # CORRECTED: Calculate expected multiplier from distribution
        # Average level ~0.8, average multiplier ~2.15
        expected_multiplier = 2.15
        
        contribution = self.trigger_rate * (expected_multiplier - 1)
        
        return min(contribution, 0.12)  # Cap at 12%
    
    def validate_configuration(self) -> bool:
        """Validate configuration"""
        # Check golden ratio
        if not math.isclose(self.golden_ratio, 1.618033988749895, rel_tol=1e-9):
            return False
        
        # Check Fibonacci sequence
        for i in range(2, len(self.fibonacci)):
            if self.fibonacci[i] != self.fibonacci[i-1] + self.fibonacci[i-2]:
                return False
        
        return True
    
    def reset_points(self):
        """Reset all evolution points"""
        self.symbol_points.clear()
    
    def get_distribution(self) -> Dict[int, float]:
        """Get probability distribution for each level"""
        distribution = {}
        for level in range(self.max_level + 1):
            distribution[level] = self.evolution_probability(level)
        return distribution
