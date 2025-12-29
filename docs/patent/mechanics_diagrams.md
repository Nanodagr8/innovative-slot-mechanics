# Patent Mechanics Diagrams

**Project:** Innovative Slot Mechanics  
**Purpose:** Technical Drawings for Patent Application Claim Support  
**Date:** December 2025

---

## FIG 1. Transform Mechanic Logic Flow (Markov Chain)

```mermaid
graph TD
    A[Start Spin] --> B{Check Trigger Rate (20%)}
    B -- No --> C[Standard Payout]
    B -- Yes --> D[Initiate Transform Sequence]
    D --> E[Check Symbol State S_t]
    E --> F{Apply Transition Matrix P}
    F -- Upgrade --> G[State S_{t+1} = Higher Tier]
    F -- Sustain --> H[State S_{t+1} = Same Tier]
    F -- Absorb --> I[State S_{t+1} = SUPER]
    G --> J[Calculate New Board Value]
    H --> J
    I --> J
    J --> K[Check Steady State Equilibrium]
    K --> L[End Spin]
```

---

## FIG 2. Evolution Mechanic Logic Flow (Fibonacci Growth)

```mermaid
graph TD
    A[Start Spin] --> B[Identify Winning Clusters]
    B --> C{Check Cluster > 0?}
    C -- No --> D[Decay Non-Active Symbols]
    C -- Yes --> E[Hold Winning Symbols]
    E --> F[New Spin (Respin)]
    F --> G[Check Evolution Criteria]
    G --> H{Prob < k / Phi^2 ?}
    H -- Success --> I[Level Up (L = L+1)]
    I --> J[Apply Fibonacci Multiplier F(L)]
    H -- Fail --> K[Maintain Current Level]
    J --> L{Level >= 8?}
    L -- Yes --> M[Trigger 'Darwin's Ladder' Bonus]
    L -- No --> N[Continue Respin Loop]
    M --> N
```

---

## FIG 3. Time Travel Mechanic Logic Flow (Wave Function)

```mermaid
graph TD
    A[Start Spin] --> B[Record Spin Outcome in History H]
    B --> C{Check Past Retrieval (8%)}
    C -- Yes --> D[Select Target Past index 'k']
    D --> E[Calc Probability P = A*e^(-lambda*k)*|cos(wk)|]
    E --> F{Retrieve Success?}
    F -- Yes --> G[Fetch Past Win Amount]
    G --> H{Already Retrieved >= 2x?}
    H -- Yes --> I[Trigger 'Time Paradox' Bonus (Multiplier)]
    H -- No --> J[Add Past Win to Current Win]
    J --> K[Update History Counter]
    F -- No --> L[No Action]
     C -- No --> M{Check Future Predict (4%)}
    M -- Yes --> N[Simulate Future Spin t+k]
    N --> O[Award Anticipated Win]
```

---

## FIG 4. Morphing Mechanic Logic Flow (Cellular Automata)

```mermaid
graph TD
    A[Start Spin] --> B[Identify Morph Candidates]
    B --> C[Check Moore Neighborhood (8 cells)]
    C --> D[Sum Neighbor Values]
    D --> E{Sum > Threshold?}
    E -- Yes --> F[Trigger Morph Evolution]
    F --> G[Calculate Bezier Path B(t)]
    G --> H[Render Interpolation 0->1]
    H --> I[Update Symbol State]
    I --> J{Active Morphs > 5?}
    J -- Yes --> K[Trigger 'Fluid Dynamics' Bonus]
    J -- No --> L[Standard Payout]
    E -- No --> L
```
