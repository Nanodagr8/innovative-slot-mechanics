"""
Test Suite for Innovative Slot Mechanics

Comprehensive tests for all four mechanics:
- Transform (Markov chains)
- Evolution (Fibonacci)
- Time Travel (Wave functions)
- Morphing (Bezier curves)

Run: python -m pytest tests/ -v
"""

import unittest
import math
import numpy as np
import sys
import os

# Add mechanics to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from mechanics import (
    TransformManager,
    EvolutionManager,
    TimeTravelManager,
    MorphingManager
)
from mechanics.morphing_manager import MorphState


class TestTransformMechanics(unittest.TestCase):
    """Test Transform mechanics"""
    
    def setUp(self):
        self.config = {'enabled': True, 'trigger_rate': 0.20}
        self.manager = TransformManager(self.config)
    
    def test_transition_matrix_valid(self):
        """Transition matrix rows must sum to 1"""
        for row in self.manager.transition_matrix:
            self.assertAlmostEqual(row.sum(), 1.0, places=10)
    
    def test_steady_state_sums_to_one(self):
        """Steady-state distribution must sum to 1"""
        total = sum(self.manager.steady_state.values())
        self.assertAlmostEqual(total, 1.0, places=10)
    
    def test_steady_state_values(self):
        """Check expected steady-state values"""
        ss = self.manager.steady_state
        self.assertAlmostEqual(ss['LOW'], 0.0847, places=2)
        self.assertAlmostEqual(ss['SUPER'], 0.1957, places=2)
    
    def test_transform_symbol(self):
        """Transform returns valid state"""
        for _ in range(100):
            new_state = self.manager.transform_symbol('LOW')
            self.assertIn(new_state, self.manager.states)
    
    def test_validate_configuration(self):
        """Configuration should be valid"""
        self.assertTrue(self.manager.validate_configuration())
    
    def test_expected_payout(self):
        """Expected payout should be around 58.8x"""
        payout = self.manager.get_expected_payout()
        self.assertGreater(payout, 50)
        self.assertLess(payout, 70)


class TestEvolutionMechanics(unittest.TestCase):
    """Test Evolution mechanics"""
    
    def setUp(self):
        self.config = {'enabled': True, 'trigger_rate': 0.10}
        self.manager = EvolutionManager(self.config)
    
    def test_golden_ratio(self):
        """Golden ratio should be approximately 1.618"""
        self.assertAlmostEqual(
            self.manager.golden_ratio, 
            1.618033988749895, 
            places=10
        )
    
    def test_fibonacci_sequence(self):
        """Fibonacci sequence should be correct"""
        expected = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
        self.assertEqual(self.manager.fibonacci, expected)
        
        # Verify Fibonacci property
        for i in range(2, len(expected)):
            self.assertEqual(
                expected[i], 
                expected[i-1] + expected[i-2]
            )
    
    def test_evolution_probability_decay(self):
        """Probability should decay with level"""
        prev_prob = 1.0
        for level in range(11):
            prob = self.manager.evolution_probability(level)
            self.assertLess(prob, prev_prob)
            self.assertGreater(prob, 0)
            prev_prob = prob
    
    def test_add_and_get_points(self):
        """Points should accumulate"""
        self.manager.add_points('A', 10)
        self.manager.add_points('A', 5)
        self.assertEqual(self.manager.get_points('A'), 15)
    
    def test_validate_configuration(self):
        """Configuration should be valid"""
        self.assertTrue(self.manager.validate_configuration())


class TestTimeTravelMechanics(unittest.TestCase):
    """Test Time Travel mechanics"""
    
    def setUp(self):
        self.config = {'enabled': True, 'trigger_rate': 0.08}
        self.manager = TimeTravelManager(self.config)
    
    def test_past_retrieval_decay(self):
        """Probability should decrease with spins ago"""
        prob_5 = self.manager.past_retrieval_probability(5)
        prob_10 = self.manager.past_retrieval_probability(10)
        prob_20 = self.manager.past_retrieval_probability(20)
        
        self.assertGreater(prob_5, prob_10)
        self.assertGreater(prob_10, prob_20)
        
        # Check specific values
        self.assertAlmostEqual(prob_5, 0.368, places=3)
        self.assertAlmostEqual(prob_10, 0.135, places=3)
    
    def test_future_accuracy_decay(self):
        """Accuracy should decrease with spins ahead"""
        acc_1 = self.manager.future_prediction_accuracy(1)
        acc_5 = self.manager.future_prediction_accuracy(5)
        acc_10 = self.manager.future_prediction_accuracy(10)
        
        self.assertGreater(acc_1, acc_5)
        self.assertGreater(acc_5, acc_10)
    
    def test_wave_function_positive(self):
        """Wave function should always be non-negative"""
        for t in range(100):
            wave = self.manager.time_wave_function(t)
            self.assertGreaterEqual(wave, 0)
    
    def test_wave_function_decays(self):
        """Wave function should decay over time"""
        wave_0 = self.manager.time_wave_function(0)
        wave_100 = self.manager.time_wave_function(100)
        self.assertLess(wave_100, 0.001)
    
    def test_record_win(self):
        """Win history should record correctly"""
        self.manager.record_win(100)
        self.manager.record_win(200)
        self.assertEqual(len(self.manager.win_history), 2)
    
    def test_validate_configuration(self):
        """Configuration should be valid"""
        self.assertTrue(self.manager.validate_configuration())


class TestMorphingMechanics(unittest.TestCase):
    """Test Morphing mechanics"""
    
    def setUp(self):
        self.config = {'enabled': True, 'trigger_rate': 0.08}
        self.manager = MorphingManager(self.config)
    
    def test_bezier_endpoints(self):
        """Bezier curve should pass through endpoints"""
        self.assertAlmostEqual(
            self.manager.bezier_interpolate(0, 10, 20, 30, 40),
            10,
            places=10
        )
        self.assertAlmostEqual(
            self.manager.bezier_interpolate(1, 10, 20, 30, 40),
            40,
            places=10
        )
    
    def test_bezier_basis_sum(self):
        """Bezier basis functions should sum to 1"""
        for t in [0, 0.25, 0.5, 0.75, 1.0]:
            b0 = (1 - t) ** 3
            b1 = 3 * (1 - t) ** 2 * t
            b2 = 3 * (1 - t) * t ** 2
            b3 = t ** 3
            self.assertAlmostEqual(b0 + b1 + b2 + b3, 1.0, places=10)
    
    def test_transition_matrix_valid(self):
        """Transition matrix rows must sum to 1"""
        for state in MorphState:
            row_sum = sum(self.manager.transition_matrix[state])
            self.assertAlmostEqual(row_sum, 1.0, places=10)
    
    def test_steady_state_values(self):
        """Check expected steady-state values"""
        ss = self.manager.steady_state
        self.assertAlmostEqual(ss[MorphState.BASIC], 0.0625, places=2)
        self.assertAlmostEqual(ss[MorphState.LEGENDARY], 0.2188, places=2)
    
    def test_expected_multiplier(self):
        """Expected multiplier should be around 17x"""
        mult = self.manager.get_expected_multiplier()
        self.assertGreater(mult, 15)
        self.assertLess(mult, 20)
    
    def test_validate_configuration(self):
        """Configuration should be valid"""
        self.assertTrue(self.manager.validate_configuration())


class TestTotalRTPBalance(unittest.TestCase):
    """Test total RTP is balanced to 96%"""
    
    def test_combined_rtp(self):
        """Combined RTP should be approximately 96%"""
        base_rtp = 0.70
        
        transform = TransformManager({'enabled': True, 'trigger_rate': 0.20})
        evolution = EvolutionManager({'enabled': True, 'trigger_rate': 0.10})
        timetravel = TimeTravelManager({'enabled': True, 'trigger_rate': 0.08})
        morphing = MorphingManager({'enabled': True, 'trigger_rate': 0.08})
        
        total_rtp = (
            base_rtp +
            transform.calculate_rtp_contribution(base_rtp) +
            evolution.calculate_rtp_contribution(base_rtp) +
            timetravel.calculate_rtp_contribution(base_rtp) +
            morphing.calculate_rtp_contribution(base_rtp)
        )
        
        # Should be close to 96%
        self.assertGreater(total_rtp, 0.90)
        self.assertLess(total_rtp, 1.00)


if __name__ == '__main__':
    unittest.main()
