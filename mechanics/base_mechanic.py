"""
Base Mechanic Class

Abstract base class for all innovative slot mechanics.
Provides common interface and utility methods.

Author: Kevin Inthavong / NANOSTUDIOS
License: MIT (Non-Commercial) / Patent-Pending
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
import random


class BaseMechanic(ABC):
    """Base class for all innovative slot mechanics"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize mechanic with configuration.
        
        Args:
            config: Dictionary containing:
                - enabled: bool - Whether mechanic is active
                - trigger_rate: float - Probability of triggering (0-1)
        """
        self.config = config
        self.enabled = config.get('enabled', True)
        self.trigger_rate = config.get('trigger_rate', 0.10)
        self._validate_config()
    
    def _validate_config(self):
        """Validate configuration parameters"""
        if not 0 <= self.trigger_rate <= 1:
            raise ValueError(f"trigger_rate must be between 0 and 1, got {self.trigger_rate}")
    
    @abstractmethod
    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """
        Calculate RTP contribution of this mechanic.
        
        Args:
            base_rtp: Base game RTP (e.g., 0.70 for 70%)
            
        Returns:
            RTP contribution as decimal (e.g., 0.10 for 10%)
        """
        pass
    
    @abstractmethod
    def process_spin(self, board: List[List[str]], bet_amount: float) -> Dict[str, Any]:
        """
        Process a spin with this mechanic.
        
        Args:
            board: 2D list of symbol strings
            bet_amount: Bet amount for this spin
            
        Returns:
            Dictionary containing mechanic results
        """
        pass
    
    @abstractmethod
    def validate_configuration(self) -> bool:
        """
        Validate mechanic configuration.
        
        Returns:
            True if configuration is valid
        """
        pass
    
    def is_triggered(self) -> bool:
        """
        Check if mechanic triggers this spin.
        
        Returns:
            True if mechanic should trigger
        """
        if not self.enabled:
            return False
        return random.random() < self.trigger_rate
    
    def get_name(self) -> str:
        """Get mechanic name"""
        return self.__class__.__name__
    
    def get_stats(self) -> Dict[str, Any]:
        """Get mechanic statistics"""
        return {
            'name': self.get_name(),
            'enabled': self.enabled,
            'trigger_rate': self.trigger_rate,
            'rtp_contribution': self.calculate_rtp_contribution(0.70)
        }
