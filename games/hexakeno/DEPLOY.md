# Hexa Keno Usage & Deployment Guide

## Version 1.1.0 (Pre-Release)

### 🚨 Critical Math Updates (v1.1.0)

To ensure fair RTP and consistent gameplay, the following math adjustments have been applied:

1. **Superball Multiplier**: Increased from **4x** to **7x**.
   - _Reason_: With a **2.5x Total Cost** (Base + 1.5x Superball Cost), a 4x multiplier resulted in ~68% RTP. The 7x multiplier restores RTP to ~96% for the Superball feature.
2. **Max Win Consistency**:
   - **High Risk / 10 Hits** payout increased from **960x** to **2,500x**.
   - _Reason_: Allows the advertised **10,000x Max Win** to be mathematically achievable (2,500x Base \* 4x Superball = 10,000x).
   - _Note_: The Superball multiplier is 7x now, so actual potential Max Win is **17,500x** (2,500 \* 7), but 10,000x remains the cap (`game_config.py` `MAX_MULTIPLIER = 10000`).

---

## Deployment Steps

1. **Backend Integration**:
   - Ensure `games/hexakeno/keno_config.py` and `games/hexakeno/keno_engine.py` are deployed to the game server.
   - Verify the server is running with the updated configuration.

2. **Frontend Build**:
   - The frontend code resides in `games/hexakeno/demo/`.
   - Ensure `game.js` is updated with the new math logic (v1.1.0).
   - Deploy `index.html`, `style.css`, `game.js`, `stake-adapter.js`, and `assets/` to the web server.

3. **Asset Check**:
   - Verify `assets/spine/` contains the latest animations.
   - Verify `assets/sounds/` contains all SFX.

4. **Verification**:
   - Launch game.
   - Check "Rules" modal to confirm paytable changes.
   - Verify Superball toggle shows correct cost (2.5x Base).

## Configuration

- **Game Config**: `games/hexakeno/keno_config.py`
  - `SUPERBALL_COST`: 2.5
  - `SUPERBALL_MULTIPLIER`: 7.0
  - `PAYTABLE_HIGH`: Updated for 2500x top prize.

- **Client Logic**: `games/hexakeno/demo/game.js`
  - Mirrors server math for UI feedback.
  - `STAKE_DATA` updated.

---

## Developer Notes

- `analyze_rtp.py` in root can be used to re-verify RTP.
- `generate_paytables.py` can be used to generate new tables if target RTP changes.
