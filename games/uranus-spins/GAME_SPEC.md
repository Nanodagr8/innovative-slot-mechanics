# 🪐 URANUS SPINS

## Arcade Shooter Gambling System (Full Mechanics & Payout Logic)

### I. CORE PHILOSOPHY

**Visual skill ≠ monetary outcome.** The client is a visual puppet; the server is the sovereign math engine.

### II. PLAYER INPUT → WAGER LOOP

- **One Shot = One Bet Unit.**
- **Auto-fire** is server-rate limited.
- **Balance** decrements instantly on fire.

### III. ENEMY SYSTEM (No HP, No Truth)

Enemies die **ONLY** when the server resolves a "Kill" outcome.

- **Drone**: Low RTP filler.
- **Elite**: Tanky, medium variance.
- **Boss**: Screen anchor, jackpot gate.

### IV. SERVER RNG MODEL (Ocean King)

| Outcome      | Probability | Multiplier         |
| ------------ | ----------- | ------------------ |
| Miss         | 72.0%       | 0x                 |
| Small Hit    | 20.0%       | 1.2x               |
| Medium Hit   | 6.0%        | 3x                 |
| Large Hit    | 1.5%        | 10x                |
| Special      | 0.45%       | 25x                |
| Jackpot Seed | 0.05%       | Accumulator / Pool |

### V. ENEMY DEATH LOGIC

Lasers that hit before the "Kill" resolution are visual-only. The **Kill Flag** determines the explosion and payout reveal.

### VI. JACKPOT MECHANIC

- **Global Progressive Pool**: Funded by % of every wager.
- **Jackpot Seeds**: Resolve when threshold is met AND context is valid (Boss/UFO).

### VII. PAYOUT FLOW

1. **Fire** -> Deduct.
2. **RNG** -> Store.
3. **Animate** -> Theater.
4. **Death** -> Impact.
5. **Claim** -> Reconcile.

### VIII. PRODUCTION RTP MATH (Target: 96.2%)

| Outcome      | Probability | Multiplier  | EV Contribution |
| ------------ | ----------- | ----------- | --------------- |
| Miss         | 0.7200      | 0x          | 0               |
| Small        | 0.2000      | 1.2x        | 0.24b           |
| Medium       | 0.0600      | 3.0x        | 0.18b           |
| Large        | 0.0150      | 10x         | 0.15b           |
| Special      | 0.0045      | 25x         | 0.1125b         |
| Jackpot Seed | 0.0005      | Progressive | ~0.28b          |

### IX. TIERED JACKPOT ENGINE

- **Mini**: 0.3% contribution.
- **Major**: 0.5% contribution.
- **Mega**: 0.2% contribution.
- **Total**: 1.0% siphoned from RTP.

### X. REGULATORY SAFEGUARDS (Do's & Don'ts)

- ❌ **No HP bars.**
- ❌ **No hit counters.**
- ❌ **No "almost dead" visuals.**
- ✅ **Dramatic explosions.**
- ✅ **Screen shake.**
- ✅ **Theater of Truth claim flow.**

### XI. ANTI-BOT & COMPLIANCE

- **Session Heatmaps**: Tracking fire cadence entropy on the server.
- **Rate Limiting**: Hard 8 shots/sec cap with burst decay.

### XII. LIVE OPS & SESSION RHYTHM

- **Context Over Math**: Change tempo and visual meaning (Meteor weeks, UFO seasons) without altering RNG weights.
- **Rhythm Pacing**: Session phases (Entry -> Flow -> Saturation) are respected, not pushed against, to ensure long-term retention.

### XIII. PLAYER HEALTH & ETHICAL FAIL-SAFES

- **No Manipulation**: No near-miss visuals, no loss-chasing prompts, and zero skill-to-payout leakage.
- **Hard Controls**: Server-side spend reminders, session timers, and one-click cool-offs.

### XIV. META-LAYER OPERATIONS

- **Live Telemetry**: Server-side observation of shot velocity, jackpot evolution, and entropy fingerprints.
- **Adaptive Variance**: Visual intensity (spawn density, laser cadance) shifts based on session length without touching math.
- **Scalability**: Stateless client architecture, Redis-ready session locks, and Postgres-ready audit trails.

### XV. FINAL SYSTEM IDENTITY

Uranus Spins is an arcade-gambling hybrid that is **predictable** in input, **sovereign** in math, and **coherent** in its theater. It reuses the Galaga mental model to deliver a compliant and engaging experience.

### XVI. CLIENT ARCHITECTURE (High Performance)

To support the arcade-style frame rate (60FPS locked) in a browser environment, the client utilizes a **Zero-Allocation** strategy:

- **Object Pooling**: Main entities (Bullets, Enemies) are pre-allocated at initialization. The runtime uses `get`/`release` instead of `new`/`delete` to prevent Garbage Collection (GC) pauses.
- **Particle Batching**: VFX (Explosions, Sparks) use a dedicated `ParticleSystem` sharing a single Sprite container to minimize draw calls.
- **Pooled UI**: Floating Text (Damage numbers, Payouts) is managed by a `TextEffectSystem`, ensuring the UI layer remains fluid even during high-frequency jackpot events.

---

**URANUS SPINS: FULLY SPECIFIED & PRODUCTION READY**
