# Appendix A: Mathematical Proofs of Algorithm Stability

**REFERENCE:** Patent Application Docket # [TO BE ASSIGNED]
**SUBJECT:** SYSTEM AND METHOD FOR STOCHASTIC AND TEMPORAL SYMBOL TRANSFORMATION

---

## 1. Proof of Transform System Stability (Markov Chain Convergence)

**Proposition:**
The symbol state transition system defined by matrix $P$ converges to a unique steady-state distribution $\pi$, ensuring a calculable and finite Return to Player (RTP).

**Proof:**
Let $S = \{S_1, S_2, ..., S_n\}$ be the finite set of symbol states.
Let $P$ be the $n \times n$ transition matrix where $P_{ij} = Pr(X_{t+1} = S_j | X_t = S_i)$.

1.  **Irreducibility:** The matrix $P$ allows transition from any state $S_i$ to the "reset" state (usually $S_1$ via a spin reset or loss) and from $S_1$ to any other state $S_j$ over $k$ steps. Thus, the chain is irreducible.
2.  **Aperiodicity:** Since $P_{ii} > 0$ for at least one state (symbols can remain unchanged), the chain is aperiodic.
3.  **Regularity:** A finite markov chain that is irreducible and aperiodic is **regular**.

**Theorem (Fundamental Theorem of Markov Chains):**
If $P$ is regular, then there exists a unique probability vector $\pi$ such that:
$$ \lim\_{k \to \infty} P^k = \mathbf{1}\pi $$
and
$$ \pi P = \pi $$

**Conclusion:**
The logic produces a strictly deterministic long-term average frequency for each symbol state, allowing precise RTP calculation:
$$ RTP = \sum\_{i=1}^{n} (\pi_i \times Payout(S_i)) $$

---

## 2. Proof of Evolution System Convergence (Fibonacci Decay)

**Proposition:**
The "Evolution" mechanic, which increases multipliers according to the Fibonacci sequence $F_n$, has a finite Expected Value (EV) because the probability of survival decays faster than the value growth.

**Proof:**
Let $V_n = F_n$ (Value at level $n$).
Approximation for large $n$: $F_n \approx \frac{\phi^n}{\sqrt{5}}$.

Let $P_n$ be the probability of reaching level $n$ given level $n-1$.
Disclosed Formula: $P_{survive} = \frac{k}{\phi^2}$.
Thus, the cumulative probability of reaching level $n$ is:
$$ P(Level=n) \approx ( \frac{1}{\phi^2} )^n = \frac{1}{\phi^{2n}} $$

**Expected Value Summation:**
$$ EV = \sum*{n=1}^{\infty} (Value_n \times Probability_n) $$
$$ EV \approx \sum*{n=1}^{\infty} ( \phi^n \times \frac{1}{\phi^{2n}} ) $$
$$ EV \approx \sum\_{n=1}^{\infty} \frac{1}{\phi^n} $$

**Geometric Series Convergence:**
This is a geometric series with ratio $r = \frac{1}{\phi} \approx 0.618$.
Since $|r| < 1$, the series converges to a finite sum:
$$ Sum = \frac{a}{1-r} $$

**Conclusion:**
Because $1/\phi < 1$, the payout multipliers (growing at $\phi$) are outpaced by the decay probability (decaying at $\phi^2$), ensuring the total RTP is finite and mathematically bounded. The game cannot "explode" into infinite payouts.

---

## 3. Proof of Time Travel Wave Boundedness

**Proposition:**
The retrieval probability function $P(k)$ yields strictly valid probabilities $0 \le P(k) \le 1$ for all historical steps $k \ge 0$.

**Formula:**
$$ P(k) = 1.0 \cdot e^{-\lambda k} \cdot |\cos(\omega k)| $$

**Proof:**

1.  **Non-Negativity:**

    - The exponential term $e^{-\lambda k}$ is strictly positive for all real $\lambda, k$.
    - The absolute value $|\cos(\omega k)|$ is $\ge 0$.
    - Therefore, $P(k) \ge 0$.

2.  **Upper Bound:**
    - The maximum value of $|\cos(x)|$ is 1.
    - The maximum value of $e^{-\lambda k}$ for $k \ge 0$ (assuming $\lambda > 0$) occurs at $k=0$, where $e^0 = 1$.
    - At $k=0$: $P(0) = 1 \cdot 1 \cdot 1 = 1$.
    - For $k > 0$: $e^{-\lambda k} < 1$.
    - Therefore, $P(k) \le 1$.

**Conclusion:**
The function strictly maps to the domain $[0, 1]$, making it a valid probability measure for any spin history index.
