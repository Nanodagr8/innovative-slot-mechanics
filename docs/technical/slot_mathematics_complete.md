# Complete Slot Machine Mathematics Reference

## Comprehensive Guide to All Equations, Algorithms, and Mechanics

---

## Table of Contents

1. [Core Probability Theory](#core-probability-theory)
2. [RTP Calculations](#rtp-calculations)
3. [Variance and Volatility](#variance-and-volatility)
4. [Hit Frequency](#hit-frequency)
5. [Paytable Optimization](#paytable-optimization)
6. [Reel Strip Mathematics](#reel-strip-mathematics)
7. [Advanced Mechanics](#advanced-mechanics)
8. [Implementation Algorithms](#implementation-algorithms)

---

## 1. Core Probability Theory

### 1.1 Basic Probability Formula

```
P(Event) = Number of Favorable Outcomes / Total Possible Outcomes
```

### 1.2 Independent Events (Reel Spins)

For independent reels, the probability of a specific combination:

```
P(Combination) = P(Reel₁) × P(Reel₂) × P(Reel₃) × ... × P(ReelN)
```

**Example:** 3-reel slot with 20 symbols per reel

```
Total Combinations = 20 × 20 × 20 = 8,000
P(Specific Combination) = 1/20 × 1/20 × 1/20 = 1/8,000 = 0.000125
```

### 1.3 Symbol Weighting

Each symbol has a weight (frequency) on the reel:

```
P(Symbol on Reel) = Weight of Symbol / Total Weight of Reel
```

**Example:**

```
Reel Strip: [A, A, A, K, K, Q, J, 10, 10, 10]
Total Symbols = 10

P(A) = 3/10 = 0.30
P(K) = 2/10 = 0.20
P(Q) = 1/10 = 0.10
P(J) = 1/10 = 0.10
P(10) = 3/10 = 0.30
```

### 1.4 Expected Value (EV)

The fundamental equation for slot mathematics:

```
EV = Σ [P(Outcome_i) × Payout(Outcome_i)]
```

Where:

- EV = Expected Value per spin
- P(Outcome_i) = Probability of outcome i
- Payout(Outcome_i) = Payout for outcome i

**Example:**

```
Outcome 1: P = 0.001, Payout = 1000x → Contribution = 0.001 × 1000 = 1.0
Outcome 2: P = 0.01, Payout = 50x → Contribution = 0.01 × 50 = 0.5
Outcome 3: P = 0.05, Payout = 10x → Contribution = 0.05 × 10 = 0.5
...
Total EV = Σ All Contributions
```

---

## 2. RTP Calculations

### 2.1 Basic RTP Formula

```
RTP = (Total Money Returned / Total Money Wagered) × 100%
```

### 2.2 Theoretical RTP (Design)

```
RTP = Σ [P(Win_i) × Payout(Win_i)] / Bet Amount × 100%
```

### 2.3 RTP by Game Component

```
Total RTP = RTP_BaseGame + RTP_BonusFeatures + RTP_FreeSpins + RTP_Jackpots
```

**Example Breakdown:**

```
Base Game RTP:     85.0%
Free Spins RTP:    10.0%
Bonus Game RTP:     3.0%
Jackpot RTP:        2.0%
─────────────────────────
Total RTP:         100.0% (but typically 94-98% for player)
```

### 2.4 RTP Calculation for Lines-Based Slots

```
RTP = Σ(all symbols) Σ(all line patterns) [
    P(Symbol Combination) × Payout(Symbol Combination) × Number of Lines
] / (Bet Per Line × Number of Lines)
```

### 2.5 RTP for Cluster Pays

```
RTP = Σ(cluster sizes) [
    P(Cluster of Size N) × Payout(Cluster of Size N)
] / Bet Amount
```

### 2.6 Contribution to RTP Formula

For any feature:

```
Feature RTP Contribution = (Average Feature Payout × Feature Trigger Probability) / Bet Amount
```

**Example:**

```
Free Spins:
- Trigger Probability: 1/100 = 0.01
- Average Payout: 50x bet
- RTP Contribution = (50 × 0.01) / 1 = 0.50 = 50% (but this is per trigger)
- Actual RTP = 0.01 × 50 = 0.5 = 0.5% of total RTP
```

---

## 3. Variance and Volatility

### 3.1 Variance Formula

```
σ² = Σ [P(Outcome_i) × (Payout(Outcome_i) - EV)²]
```

Where:

- σ² = Variance
- EV = Expected Value (mean)

### 3.2 Standard Deviation

```
σ = √(Variance) = √(σ²)
```

### 3.3 Coefficient of Variation (Volatility Index)

```
CV = σ / EV = Standard Deviation / Expected Value
```

**Volatility Classification:**

```
Low Volatility:    CV < 3
Medium Volatility: 3 ≤ CV ≤ 6
High Volatility:   CV > 6
```

### 3.4 Practical Variance Calculation

```python
def calculate_variance(outcomes):
    """
    outcomes = [(probability, payout), ...]
    """
    ev = sum(p * payout for p, payout in outcomes)
    variance = sum(p * (payout - ev)**2 for p, payout in outcomes)
    std_dev = variance ** 0.5
    cv = std_dev / ev if ev > 0 else 0
    return {
        'ev': ev,
        'variance': variance,
        'std_dev': std_dev,
        'cv': cv
    }
```

### 3.5 Volatility Impact on Bankroll

```
Required Bankroll ≈ EV × √(Number of Spins) × σ × Safety Factor
```

**Example:**

```
For 1000 spins with σ = 10, EV = 0.96:
Required Bankroll ≈ 0.96 × √1000 × 10 × 3 = 910 units
```

---

## 4. Hit Frequency

### 4.1 Basic Hit Frequency Formula

```
Hit Frequency = (Number of Winning Combinations / Total Possible Combinations) × 100%
```

### 4.2 Hit Frequency for Multi-Reel Slots

```
Total Combinations = Symbols_Reel₁ × Symbols_Reel₂ × ... × Symbols_ReelN

Winning Combinations = Σ(all win patterns) Count(Pattern Matches)

Hit Frequency = (Winning Combinations / Total Combinations) × 100%
```

**Example:**

```
3-reel slot, 20 symbols per reel:
Total = 20 × 20 × 20 = 8,000

Winning combinations = 1,200
Hit Frequency = (1,200 / 8,000) × 100% = 15%
```

### 4.3 Hit Frequency vs RTP Relationship

```
Average Win Size = RTP / Hit Frequency
```

**Example:**

```
RTP = 96%
Hit Frequency = 24%
Average Win = 96% / 24% = 4x bet
```

### 4.4 Weighted Hit Frequency

For games with different bet levels:

```
Weighted Hit Frequency = Σ [P(Bet Level) × Hit Frequency(Bet Level)]
```

---

## 5. Paytable Optimization

### 5.1 Paytable Balance Equation

```
Σ(all symbols) [Frequency(Symbol) × Payout(Symbol)] = Target RTP × Total Spins
```

### 5.2 Symbol Value Optimization

```
Symbol Value = Payout × Probability of Appearance

Optimal Distribution: Maximize Player Engagement while maintaining Target RTP
```

### 5.3 Genetic Algorithm for Paytable Optimization

```python
def fitness_function(paytable, target_rtp):
    """
    Evaluate how close a paytable configuration is to target RTP
    """
    simulated_rtp = monte_carlo_simulation(paytable, iterations=1000000)
    fitness = 1 / (abs(simulated_rtp - target_rtp) + 0.0001)
    return fitness

def optimize_paytable(target_rtp, generations=100):
    population = initialize_population(size=50)

    for generation in range(generations):
        # Evaluate fitness
        fitness_scores = [fitness_function(p, target_rtp) for p in population]

        # Selection
        parents = select_parents(population, fitness_scores)

        # Crossover
        offspring = crossover(parents)

        # Mutation
        offspring = mutate(offspring, mutation_rate=0.1)

        # New generation
        population = offspring

    return best_individual(population, fitness_scores)
```

### 5.4 Prize Equalization

```
Prize Distribution Entropy = -Σ [P(Prize_i) × log₂(P(Prize_i))]

Higher entropy = More balanced prize distribution
```

---

## 6. Reel Strip Mathematics

### 6.1 Reel Strip Design

```
Reel Strip = [Symbol₁, Symbol₂, ..., SymbolN]

Virtual Reel Mapping:
Physical Stop → Virtual Stop (can be 1:many)
```

### 6.2 Symbol Distribution Formula

```
For Target RTP and Symbol Payout:

Required Symbol Frequency = (Target RTP × Total Spins) / (Symbol Payout × Number of Reels)
```

**Example:**

```
Target RTP contribution from Jackpot symbol: 1%
Jackpot Payout: 5000x
Number of Reels: 5

Required Frequency per Reel = 0.01 / (5000 × 5) = 0.000002 = 1 in 500,000
```

### 6.3 Near-Miss Configuration

```
Near-Miss Probability = P(Symbol on Reel N-1) × P(Not Symbol on Reel N)

Optimal Near-Miss Rate: 5-10% for engagement without frustration
```

### 6.4 Reel Strip Balance

```
Balance Score = Σ(all positions) |EV(Position_i) - Average EV|

Lower score = More balanced reel strip
```

---

## 7. Advanced Mechanics

### 7.1 Cascading/Avalanche Reels

#### 7.1.1 Cascade Probability

```
P(N Cascades) = P(Initial Win) × [P(Cascade₁) × P(Cascade₂) × ... × P(CascadeN)]
```

#### 7.1.2 Expected Cascades

```
E(Cascades) = Σ(n=1 to ∞) [n × P(Exactly n Cascades)]

Simplified for geometric distribution:
E(Cascades) = 1 / (1 - P(Cascade))
```

**Example:**

```
P(Cascade after win) = 0.30

E(Cascades) = 1 / (1 - 0.30) = 1.43 cascades per winning spin
```

#### 7.1.3 Cascade Multiplier RTP

```
RTP_Cascades = Base RTP × Σ(n=1 to max) [P(n Cascades) × Multiplier(n)]
```

**Example with progressive multipliers:**

```
Cascade 1: 1x multiplier
Cascade 2: 2x multiplier
Cascade 3: 3x multiplier

RTP_Cascades = Base RTP × [P(1) × 1 + P(2) × 2 + P(3) × 3 + ...]
```

### 7.2 Megaways Mathematics

#### 7.2.1 Ways Calculation

```
Total Ways = Symbols_Reel₁ × Symbols_Reel₂ × ... × Symbols_ReelN

For 6 reels with 2-7 symbols each:
Min Ways = 2⁶ = 64
Max Ways = 7⁶ = 117,649
```

#### 7.2.2 Expected Ways per Spin

```
E(Ways) = E(Symbols_Reel₁) × E(Symbols_Reel₂) × ... × E(Symbols_ReelN)

If symbols uniformly distributed 2-7:
E(Symbols per Reel) = (2 + 3 + 4 + 5 + 6 + 7) / 6 = 4.5

E(Ways) = 4.5⁶ ≈ 8,303 ways
```

#### 7.2.3 Megaways RTP Calculation

```
RTP = Σ(all possible reel configurations) [
    P(Configuration) × Σ(all winning combinations in configuration) [
        P(Win | Configuration) × Payout(Win)
    ]
]
```

### 7.3 Multiplier Systems

#### 7.3.1 Fixed Multiplier

```
Payout_with_Multiplier = Base Payout × Multiplier

RTP_Multiplier = Base RTP × Average Multiplier Value
```

#### 7.3.2 Progressive Multiplier

```
Multiplier(n) = Base Multiplier + (n - 1) × Increment

RTP = Σ(n=1 to max) [P(n consecutive wins) × Payout × Multiplier(n)]
```

**Example:**

```
Base = 1x, Increment = 1x
Win 1: 1x
Win 2: 2x
Win 3: 3x

If P(consecutive win) = 0.3:
E(Multiplier) = 1×0.7 + 2×(0.3×0.7) + 3×(0.3²×0.7) + ...
              = 1×0.7 + 2×0.21 + 3×0.063 + ...
              ≈ 1.43x average
```

#### 7.3.3 Random Multiplier

```
E(Multiplier) = Σ(all multiplier values) [P(Multiplier_i) × Multiplier_i]

RTP_Random_Multiplier = Base RTP × E(Multiplier)
```

### 7.4 Free Spins Mathematics

#### 7.4.1 Free Spins Trigger Probability

```
P(Trigger) = P(Scatter₁) × P(Scatter₂) × ... × P(ScatterN)

For "3 or more scatters":
P(Trigger) = P(Exactly 3) + P(Exactly 4) + P(Exactly 5) + ...
```

#### 7.4.2 Free Spins RTP Contribution

```
RTP_FreeSpins = P(Trigger) × E(Free Spins Payout)

Where:
E(Free Spins Payout) = Number of Spins × Average Win per Spin × Multipliers
```

**Example:**

```
P(Trigger) = 0.01 (1 in 100)
Free Spins Awarded = 10
Average Win per Free Spin = 5x
Multiplier = 3x

E(Payout) = 10 × 5 × 3 = 150x
RTP Contribution = 0.01 × 150 = 1.5 = 150% (but only 1.5% of total RTP)
```

#### 7.4.3 Retrigger Probability

```
E(Total Free Spins) = Initial Spins × [1 + P(Retrigger) + P(Retrigger)² + ...]
                    = Initial Spins / (1 - P(Retrigger))
```

**Example:**

```
Initial = 10 spins
P(Retrigger) = 0.10

E(Total) = 10 / (1 - 0.10) = 11.11 spins
```

### 7.5 Buy Bonus Mathematics

#### 7.5.1 Buy Bonus Cost

```
Buy Cost = (Expected Bonus Payout / P(Natural Trigger)) × Adjustment Factor

Adjustment Factor typically 0.9-1.0 to make it slightly favorable
```

**Example:**

```
E(Bonus Payout) = 50x
P(Natural Trigger) = 0.01

Fair Cost = 50 / 0.01 = 5000x (but this would be break-even)
Actual Cost = 5000 × 0.95 = 4750x (5% player advantage) → typically 100x bet
```

#### 7.5.2 Buy Bonus RTP

```
RTP_BuyBonus = E(Bonus Payout) / Buy Cost

Should be slightly > 100% to incentivize purchase
```

### 7.6 Progressive Jackpots

#### 7.6.1 Jackpot Contribution

```
Jackpot Pool Growth = Bet Amount × Contribution Rate

Contribution Rate typically 1-5% of each bet
```

#### 7.6.2 Jackpot RTP

```
RTP_Jackpot = (Average Jackpot Size × P(Win Jackpot)) / Bet Amount

For progressive:
RTP_Jackpot = (Seed + Average Contribution × Average Spins to Win) × P(Win) / Bet
```

#### 7.6.3 Must-Hit-By Jackpot

```
P(Hit at Amount X) increases as X approaches Must-Hit value

P(Hit | Current Amount) = (Current - Seed) / (Must-Hit - Seed)
```

---

## 8. Implementation Algorithms

### 8.1 Monte Carlo Simulation

```python
def monte_carlo_rtp_simulation(game_config, iterations=1000000):
    """
    Simulate game to calculate actual RTP
    """
    total_wagered = 0
    total_returned = 0

    for _ in range(iterations):
        # Spin reels
        result = spin_reels(game_config)

        # Calculate win
        win_amount = calculate_win(result, game_config)

        # Track
        total_wagered += game_config.bet_amount
        total_returned += win_amount

    rtp = (total_returned / total_wagered) * 100
    return rtp

def spin_reels(config):
    """Generate random reel outcome"""
    result = []
    for reel in config.reels:
        position = random.randint(0, len(reel) - 1)
        symbols = [
            reel[position],
            reel[(position + 1) % len(reel)],
            reel[(position + 2) % len(reel)]
        ]
        result.append(symbols)
    return result
```

### 8.2 Exact RTP Calculation

```python
def calculate_exact_rtp(game_config):
    """
    Calculate RTP by enumerating all possible outcomes
    """
    total_ev = 0
    total_combinations = 1

    # Calculate total combinations
    for reel in game_config.reels:
        total_combinations *= len(reel)

    # Enumerate all combinations
    for combination in generate_all_combinations(game_config.reels):
        win = calculate_win(combination, game_config)
        probability = calculate_probability(combination, game_config)
        total_ev += win * probability

    rtp = (total_ev / game_config.bet_amount) * 100
    return rtp

def calculate_probability(combination, config):
    """Calculate probability of specific combination"""
    prob = 1.0
    for reel_idx, symbols in enumerate(combination):
        reel = config.reels[reel_idx]
        symbol_count = reel.count(symbols[0])  # Count of symbol at position
        prob *= symbol_count / len(reel)
    return prob
```

### 8.3 Variance Calculation

```python
def calculate_game_variance(game_config, iterations=1000000):
    """
    Calculate variance through simulation
    """
    payouts = []

    for _ in range(iterations):
        result = spin_reels(game_config)
        win = calculate_win(result, game_config)
        payouts.append(win / game_config.bet_amount)  # Normalize to bet

    mean = sum(payouts) / len(payouts)
    variance = sum((x - mean)**2 for x in payouts) / len(payouts)
    std_dev = variance ** 0.5
    cv = std_dev / mean if mean > 0 else 0

    return {
        'mean': mean,
        'variance': variance,
        'std_dev': std_dev,
        'cv': cv,
        'volatility': 'Low' if cv < 3 else 'Medium' if cv < 6 else 'High'
    }
```

### 8.4 Hit Frequency Calculation

```python
def calculate_hit_frequency(game_config, iterations=1000000):
    """
    Calculate hit frequency through simulation
    """
    wins = 0

    for _ in range(iterations):
        result = spin_reels(game_config)
        win = calculate_win(result, game_config)
        if win > 0:
            wins += 1

    hit_frequency = (wins / iterations) * 100
    return hit_frequency
```

### 8.5 Distribution Optimization

```python
def optimize_distributions(target_rtp, quotas, max_iterations=1000):
    """
    Optimize win distributions to hit target RTP
    Uses iterative adjustment
    """
    distributions = initialize_distributions(quotas)

    for iteration in range(max_iterations):
        # Simulate current configuration
        current_rtp = monte_carlo_rtp_simulation(distributions)

        # Calculate error
        error = target_rtp - current_rtp

        # Adjust distributions
        if abs(error) < 0.01:  # Within 0.01% of target
            break

        # Adjust payouts proportionally
        adjustment_factor = target_rtp / current_rtp
        for dist in distributions:
            dist.payout *= adjustment_factor

    return distributions
```

### 8.6 Reel Strip Generator

```python
def generate_reel_strip(symbol_frequencies, target_length):
    """
    Generate balanced reel strip from symbol frequencies
    """
    reel = []

    # Calculate how many of each symbol
    for symbol, frequency in symbol_frequencies.items():
        count = int(target_length * frequency)
        reel.extend([symbol] * count)

    # Fill remaining positions
    while len(reel) < target_length:
        reel.append(random.choice(list(symbol_frequencies.keys())))

    # Shuffle to distribute symbols
    random.shuffle(reel)

    # Optimize for balance
    reel = optimize_reel_balance(reel)

    return reel

def optimize_reel_balance(reel):
    """
    Ensure symbols are well-distributed (no clusters)
    """
    for _ in range(1000):  # Optimization iterations
        # Find clustered symbols
        for i in range(len(reel) - 2):
            if reel[i] == reel[i+1] == reel[i+2]:
                # Swap middle symbol with random position
                swap_pos = random.randint(0, len(reel) - 1)
                reel[i+1], reel[swap_pos] = reel[swap_pos], reel[i+1]

    return reel
```

---

## 9. Statistical Testing

### 9.1 Chi-Square Test for RNG

```python
def chi_square_test(observed, expected):
    """
    Test if observed distribution matches expected
    """
    chi_square = sum((obs - exp)**2 / exp
                     for obs, exp in zip(observed, expected))

    # Compare to critical value (degrees of freedom = n - 1)
    df = len(observed) - 1
    critical_value = chi_square_critical(df, alpha=0.05)

    return {
        'chi_square': chi_square,
        'critical_value': critical_value,
        'passes': chi_square < critical_value
    }
```

### 9.2 Confidence Intervals

```python
def calculate_confidence_interval(data, confidence=0.95):
    """
    Calculate confidence interval for RTP
    """
    import scipy.stats as stats

    mean = sum(data) / len(data)
    std_error = (sum((x - mean)**2 for x in data) / len(data)) ** 0.5 / (len(data) ** 0.5)

    z_score = stats.norm.ppf((1 + confidence) / 2)
    margin = z_score * std_error

    return {
        'mean': mean,
        'lower': mean - margin,
        'upper': mean + margin,
        'confidence': confidence
    }
```

---

## 10. Practical Examples

### Example 1: Simple 3-Reel Slot

```python
# Configuration
reels = [
    ['7', '7', 'BAR', 'BAR', 'BAR', 'CHERRY', 'CHERRY', 'CHERRY', 'CHERRY', 'BLANK'],
    ['7', 'BAR', 'BAR', 'BAR', 'CHERRY', 'CHERRY', 'CHERRY', 'BLANK', 'BLANK', 'BLANK'],
    ['7', 'BAR', 'BAR', 'CHERRY', 'CHERRY', 'CHERRY', 'CHERRY', 'BLANK', 'BLANK', 'BLANK']
]

paytable = {
    ('7', '7', '7'): 100,
    ('BAR', 'BAR', 'BAR'): 20,
    ('CHERRY', 'CHERRY', 'CHERRY'): 10,
    ('CHERRY', 'CHERRY', 'ANY'): 5,
    ('CHERRY', 'ANY', 'ANY'): 2
}

# Calculate RTP
total_combinations = 10 * 10 * 10 = 1000
ev = 0

# 7-7-7
p_777 = (2/10) * (1/10) * (1/10) = 0.002
ev += p_777 * 100  # = 0.2

# BAR-BAR-BAR
p_bar = (3/10) * (3/10) * (2/10) = 0.018
ev += p_bar * 20  # = 0.36

# CHERRY-CHERRY-CHERRY
p_ccc = (4/10) * (3/10) * (4/10) = 0.048
ev += p_ccc * 10  # = 0.48

# ... (continue for all combinations)

RTP = (ev / 1) * 100  # Assuming 1 unit bet
```

### Example 2: 5-Reel Video Slot with Free Spins

```python
# Base game RTP calculation
base_rtp = calculate_base_game_rtp(config)  # = 85%

# Free spins contribution
scatter_trigger_prob = 0.01  # 1%
free_spins_count = 10
avg_win_per_free_spin = 5  # 5x bet
free_spin_multiplier = 3

free_spins_ev = free_spins_count * avg_win_per_free_spin * free_spin_multiplier
# = 10 * 5 * 3 = 150x

free_spins_rtp = scatter_trigger_prob * free_spins_ev
# = 0.01 * 150 = 1.5 = 1.5% of total RTP

# Total RTP
total_rtp = base_rtp + free_spins_rtp
# = 85% + 1.5% = 86.5%

# Need to add more features or adjust base game to reach 96% target
```

---

## Summary of Key Formulas

| Metric                        | Formula                                               |
| ----------------------------- | ----------------------------------------------------- |
| **RTP**                       | `(Total Returned / Total Wagered) × 100%`             |
| **Expected Value**            | `Σ [P(Outcome) × Payout(Outcome)]`                    |
| **Variance**                  | `Σ [P(Outcome) × (Payout - EV)²]`                     |
| **Standard Deviation**        | `√Variance`                                           |
| **Hit Frequency**             | `(Winning Combinations / Total Combinations) × 100%`  |
| **Volatility Index**          | `Standard Deviation / Expected Value`                 |
| **Ways (Megaways)**           | `Symbols_Reel₁ × Symbols_Reel₂ × ... × Symbols_ReelN` |
| **Expected Cascades**         | `1 / (1 - P(Cascade))`                                |
| **Free Spins with Retrigger** | `Initial Spins / (1 - P(Retrigger))`                  |

---

This comprehensive guide covers all major mathematical concepts and algorithms used in modern slot machine design. Use these formulas and implementations to create balanced, engaging games with precise RTP control.
