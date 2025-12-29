"""
Demo Game - Showcasing All Four Innovative Mechanics

This example demonstrates how to use all four mechanics together:
1. Transform (Markov chains)
2. Evolution (Fibonacci)
3. Time Travel (Wave functions)
4. Morphing (Bezier curves)

Run: python examples/demo_game.py
"""

import sys
import os
import random

# Add mechanics to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from mechanics import (
    TransformManager,
    EvolutionManager,
    TimeTravelManager,
    MorphingManager
)


class InnovativeSlotGame:
    """Demo slot game using all four innovative mechanics"""
    
    def __init__(self):
        # Game configuration
        self.num_reels = 5
        self.num_rows = 3
        self.symbols = ['A', 'K', 'Q', 'J', '10', 'WILD', 'SCATTER']
        
        # Initialize all mechanics
        self.transform = TransformManager({
            'enabled': True,
            'trigger_rate': 0.20
        })
        
        self.evolution = EvolutionManager({
            'enabled': True,
            'trigger_rate': 0.10
        })
        
        self.timetravel = TimeTravelManager({
            'enabled': True,
            'trigger_rate': 0.08
        })
        
        self.morphing = MorphingManager({
            'enabled': True,
            'trigger_rate': 0.08
        })
        
        # Game state
        self.balance = 1000
        self.bet = 1
        self.total_spins = 0
        self.total_wagered = 0
        self.total_won = 0
    
    def generate_board(self):
        """Generate random game board"""
        return [
            [random.choice(self.symbols) for _ in range(self.num_reels)]
            for _ in range(self.num_rows)
        ]
    
    def calculate_base_win(self, board):
        """Calculate base win (simplified)"""
        # Check for matching symbols on each row
        win = 0
        for row in board:
            if row[0] == row[1] == row[2]:  # 3 of a kind
                win += self.bet * 5
            elif row[0] == row[1] == row[2] == row[3]:  # 4 of a kind
                win += self.bet * 20
            elif row[0] == row[1] == row[2] == row[3] == row[4]:  # 5 of a kind
                win += self.bet * 100
        return win
    
    def spin(self):
        """Perform a spin with all mechanics"""
        self.total_spins += 1
        self.total_wagered += self.bet
        self.balance -= self.bet
        
        # Generate initial board
        board = self.generate_board()
        
        print(f"\n{'='*50}")
        print(f"SPIN #{self.total_spins} | Bet: ${self.bet}")
        print(f"{'='*50}")
        print("\nInitial Board:")
        self.print_board(board)
        
        # Apply mechanics
        total_win = 0
        mechanics_applied = []
        
        # 1. Transform Mechanics
        transform_result = self.transform.process_spin(board, self.bet)
        if transform_result['transformed']:
            board = transform_result['board']
            mechanics_applied.append(f"⚡ TRANSFORM: {transform_result['count']} symbols changed!")
            print("\nAfter Transform:")
            self.print_board(board)
        
        # 2. Calculate base win
        base_win = self.calculate_base_win(board)
        total_win = base_win
        
        # 3. Evolution Mechanics
        evolution_result = self.evolution.process_spin(board, self.bet)
        if evolution_result['evolved']:
            for event in evolution_result['events']:
                mult = event['multiplier']
                total_win *= mult
                mechanics_applied.append(
                    f"🧬 EVOLUTION: {event['symbol']} → Level {event['to_level']} ({mult}x)!"
                )
        
        # 4. Time Travel Mechanics
        timetravel_result = self.timetravel.process_spin(board, self.bet)
        if timetravel_result['past_retrieval']:
            past = timetravel_result['past_retrieval']
            total_win += past['retrieved_amount']
            mechanics_applied.append(
                f"⏰ TIME TRAVEL: Retrieved ${past['retrieved_amount']:.2f} from {past['spins_ago']} spins ago!"
            )
        if timetravel_result['future_boost']:
            total_win *= timetravel_result['future_boost']['multiplier']
            mechanics_applied.append(
                f"⏰ FUTURE BOOST: {timetravel_result['future_boost']['multiplier']}x multiplier!"
            )
        
        # 5. Morphing Mechanics
        morphing_result = self.morphing.process_spin(board, self.bet)
        if morphing_result['morphed']:
            for event in morphing_result['events']:
                total_win *= event['multiplier']
                mechanics_applied.append(
                    f"🔄 MORPH: {event['from']} → {event['to']} ({event['multiplier']}x)!"
                )
        
        # Record win for time travel history
        if total_win > 0:
            self.timetravel.record_win(total_win)
        
        # Update stats
        self.balance += total_win
        self.total_won += total_win
        
        # Print results
        if mechanics_applied:
            print("\n✨ Mechanics Applied:")
            for m in mechanics_applied:
                print(f"  {m}")
        
        print(f"\n💰 Base Win: ${base_win:.2f}")
        print(f"🎰 Total Win: ${total_win:.2f}")
        print(f"💵 Balance: ${self.balance:.2f}")
        
        return total_win
    
    def print_board(self, board):
        """Print game board"""
        for row in board:
            print("  | " + " | ".join(f"{s:^7}" for s in row) + " |")
    
    def get_stats(self):
        """Get game statistics"""
        rtp = (self.total_won / self.total_wagered * 100) if self.total_wagered > 0 else 0
        return {
            'total_spins': self.total_spins,
            'total_wagered': self.total_wagered,
            'total_won': self.total_won,
            'balance': self.balance,
            'rtp': rtp
        }
    
    def print_stats(self):
        """Print game statistics"""
        stats = self.get_stats()
        print(f"\n{'='*50}")
        print("📊 GAME STATISTICS")
        print(f"{'='*50}")
        print(f"Total Spins:   {stats['total_spins']}")
        print(f"Total Wagered: ${stats['total_wagered']:.2f}")
        print(f"Total Won:     ${stats['total_won']:.2f}")
        print(f"Balance:       ${stats['balance']:.2f}")
        print(f"RTP:           {stats['rtp']:.2f}%")


def main():
    """Run demo game"""
    print("🎰 INNOVATIVE SLOT MECHANICS DEMO 🎰")
    print("=" * 50)
    print("\nFeatures:")
    print("  ⚡ Transform - Markov Chain state transitions")
    print("  🧬 Evolution - Fibonacci multipliers")
    print("  ⏰ Time Travel - Past win retrieval & future boost")
    print("  🔄 Morphing - Bezier curve transformations")
    print("\n" + "=" * 50)
    
    game = InnovativeSlotGame()
    
    # Run demo spins
    num_spins = 10
    print(f"\nRunning {num_spins} demo spins...")
    
    for _ in range(num_spins):
        game.spin()
        input("\nPress Enter for next spin...")
    
    # Print final stats
    game.print_stats()
    
    print("\n✅ Demo complete!")
    print("\nFor commercial licensing, contact: kevin@nanostudios.com")
    print("Support: https://buymeacoffee.com/nanostudios")


if __name__ == '__main__':
    main()
