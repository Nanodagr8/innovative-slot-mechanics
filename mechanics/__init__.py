"""
Innovative Slot Mechanics Package

Four mathematically-sound, patentable slot game mechanics:
1. Transform - Markov Chain state transitions
2. Evolution - Fibonacci sequence progression  
3. Time Travel - Wave function temporal probability
4. Morphing - Bezier curve interpolation

Author: Kevin Inthavong / NANOSTUDIOS
License: MIT (code) / Patent-pending (mechanics)
"""

__version__ = '1.0.0'
__author__ = 'Kevin Inthavong'

from .base_mechanic import BaseMechanic
from .transform_manager import TransformManager
from .evolution_manager import EvolutionManager
from .timetravel_manager import TimeTravelManager
from .morphing_manager import MorphingManager

__all__ = [
    'BaseMechanic',
    'TransformManager',
    'EvolutionManager',
    'TimeTravelManager',
    'MorphingManager',
]
