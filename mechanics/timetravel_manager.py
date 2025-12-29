"""
Time Travel Mechanics - Temporal Probability Manipulation

Features:
- Past Win Retrieval with exponential decay
- Future Win Prediction with accuracy scaling
- Time Wave Function for probability modulation

Mathematical Foundation:
- Past Retrieval: P = e^(-0.2 × Δt)
- Future Accuracy: A = e^(-0.1 × t)
- Wave: ψ(t) = 10|sin(0.5t)|e^(-0.1t)

Author: Kevin Inthavong / NANOSTUDIOS
License: MIT (Non-Commercial) / Patent-Pending
"""

import math
import random
from collections import deque
from typing import Dict, List, Any, Optional
from .base_mechanic import BaseMechanic


class TimeTravelManager(BaseMechanic):
    """Time Travel mechanics with temporal probability manipulation"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Time Travel mechanics.
        
        Args:
            config: Configuration dict with:
                - enabled: bool
                - trigger_rate: float (default 0.08)
                - past_trigger_rate: float (default 0.10)
                - future_trigger_rate: float (default 0.05)
                - history_size: int (default 50)
        """
        super().__init__(config)
        
        self.past_trigger_rate = config.get('past_trigger_rate', 0.10)
        self.future_trigger_rate = config.get('future_trigger_rate', 0.05)
        self.history_size = config.get('history_size', 50)
        
        # Decay constants
        self.past_decay = 0.2   # k in e^(-k×t)
        self.future_decay = 0.1  # α in e^(-α×t)
        self.wave_amplitude = 10
        self.wave_frequency = 0.5
        self.wave_decay = 0.1
        
        # Win history
        self.win_history: deque = deque(maxlen=self.history_size)
        self.current_spin = 0
        
        # Future predictions
        self.predictions: List[Dict[str, Any]] = []
    
    def record_win(self, amount: float, details: Optional[Dict] = None):
        """
        Record a win in history.
        
        Args:
            amount: Win amount
            details: Optional additional details
        """
        self.win_history.append({
            'spin': self.current_spin,
            'amount': amount,
            'details': details or {}
        })
        self.current_spin += 1
    
    def past_retrieval_probability(self, spins_ago: int) -> float:
        """
        Calculate probability of retrieving a past win.
        
        Formula: P = e^(-0.2 × spins_ago)
        
        Args:
            spins_ago: Number of spins in the past
            
        Returns:
            Retrieval probability (0-1)
        """
        return math.exp(-self.past_decay * spins_ago)
    
    def future_prediction_accuracy(self, spins_ahead: int) -> float:
        """
        Calculate accuracy of future prediction.
        
        CORRECTED: Accuracy DECREASES with distance
        Formula: A = e^(-0.1 × spins_ahead)
        
        Args:
            spins_ahead: Number of spins in future
            
        Returns:
            Accuracy (0-1)
        """
        return math.exp(-self.future_decay * spins_ahead)
    
    def time_wave_function(self, t: float) -> float:
        """
        Calculate temporal wave function value.
        
        CORRECTED: Always positive using absolute value
        Formula: ψ(t) = 10|sin(0.5t)|e^(-0.1t)
        
        Args:
            t: Time parameter
            
        Returns:
            Wave function value (always ≥ 0)
        """
        return (self.wave_amplitude * 
                abs(math.sin(self.wave_frequency * t)) * 
                math.exp(-self.wave_decay * t))
    
    def retrieve_past_win(self) -> Dict[str, Any]:
        """
        Attempt to retrieve a past win.
        
        Returns:
            Dictionary with retrieval result
        """
        if not self.win_history:
            return {'success': False, 'reason': 'No history'}
        
        # Select random past win
        past_win = random.choice(list(self.win_history))
        spins_ago = self.current_spin - past_win['spin']
        
        # Calculate retrieval probability
        prob = self.past_retrieval_probability(spins_ago)
        
        if random.random() < prob:
            # Apply decay to retrieved amount
            decay_mult = math.exp(-0.05 * spins_ago)
            retrieved_amount = past_win['amount'] * decay_mult
            
            return {
                'success': True,
                'original_amount': past_win['amount'],
                'retrieved_amount': retrieved_amount,
                'spins_ago': spins_ago,
                'decay_multiplier': decay_mult
            }
        
        return {'success': False, 'reason': 'Retrieval failed'}
    
    def make_prediction(self, spins_ahead: int, predicted_win: float) -> Dict[str, Any]:
        """
        Make a prediction about future win.
        
        Args:
            spins_ahead: How many spins ahead to predict
            predicted_win: Predicted win amount
            
        Returns:
            Prediction record
        """
        accuracy = self.future_prediction_accuracy(spins_ahead)
        
        prediction = {
            'target_spin': self.current_spin + spins_ahead,
            'predicted_win': predicted_win,
            'accuracy': accuracy,
            'made_at_spin': self.current_spin
        }
        
        self.predictions.append(prediction)
        return prediction
    
    def check_predictions(self, actual_win: float) -> List[Dict[str, Any]]:
        """
        Check predictions against actual win.
        
        Args:
            actual_win: Actual win amount
            
        Returns:
            List of matched predictions with bonuses
        """
        matched = []
        remaining = []
        
        for pred in self.predictions:
            if pred['target_spin'] == self.current_spin:
                # Check if prediction was correct (within 20%)
                error = abs(pred['predicted_win'] - actual_win) / max(actual_win, 1)
                is_correct = error < 0.20
                
                if is_correct:
                    # Award bonus multiplier based on accuracy
                    bonus_mult = 1.0 + (pred['accuracy'] * 0.5)
                    matched.append({
                        'prediction': pred,
                        'actual': actual_win,
                        'bonus_multiplier': bonus_mult,
                        'correct': True
                    })
            elif pred['target_spin'] > self.current_spin:
                remaining.append(pred)
        
        self.predictions = remaining
        return matched
    
    def process_spin(self, board: List[List[str]], bet_amount: float) -> Dict[str, Any]:
        """
        Process time travel mechanics for a spin.
        
        Args:
            board: Game board
            bet_amount: Bet amount
            
        Returns:
            Dictionary with time travel results
        """
        result = {
            'past_retrieval': None,
            'future_boost': None,
            'wave_value': self.time_wave_function(self.current_spin),
            'paradox_bonus': False
        }
        
        # Past retrieval (8% chance)
        if random.random() < self.past_trigger_rate:
            retrieval = self.retrieve_past_win()
            if retrieval['success']:
                result['past_retrieval'] = retrieval
                
                # Update history to mark as retrieved (for Paradox Check)
                for entry in self.win_history:
                    if entry['spin'] == self.current_spin - retrieval['spins_ago']:
                        entry['retrieved_count'] = entry.get('retrieved_count', 0) + 1
                        if entry['retrieved_count'] >= 2:
                            result['paradox_bonus'] = True
                            # Cap paradox at 1.5x instead of 2.0x to prevent exponential explosion
                            retrieval['retrieved_amount'] *= 1.2 
                        break
        
        # Future boost (4% chance)
        if random.random() < self.future_trigger_rate:
            result['future_boost'] = {
                'multiplier': 1.5,  # 50% boost
                'duration': 1  # Applies to next win
            }
        
        return result
    
    def calculate_rtp_contribution(self, base_rtp: float) -> float:
        """
        Calculate RTP contribution from Time Travel mechanics.
        
        CORRECTED: Additive contribution, not multiplicative
        
        Args:
            base_rtp: Base game RTP
            
        Returns:
            RTP contribution
        """
        # Past retrieval contribution
        avg_past_win = 20  # Assumed average
        avg_decay = 0.5
        past_contrib = self.past_trigger_rate * avg_past_win * avg_decay / 100
        
        # Future boost contribution
        future_contrib = self.future_trigger_rate * 0.5  # 50% boost
        
        total = past_contrib + future_contrib
        
        return min(total, 0.03)  # Cap at 3%
    
    def validate_configuration(self) -> bool:
        """Validate configuration"""
        # Check wave function is always non-negative
        for t in range(100):
            if self.time_wave_function(t) < 0:
                return False
        
        # Check decay constants are positive
        if self.past_decay <= 0 or self.future_decay <= 0:
            return False
        
        return True
    
    def reset(self):
        """Reset time travel state"""
        self.win_history.clear()
        self.predictions.clear()
        self.current_spin = 0
