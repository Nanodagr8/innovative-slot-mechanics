# Uranus Spins - Engine Integration Checklist

This checklist is for the development team to ensure seamless integration of the exported Spine assets and visual systems into the core game engine.

---

## 1. Asset Loading & Aliasing

Load all final exported bundles in `init()` using the following mandatory aliases:

- [ ] `player_spine`: Path to `player.json` (Includes: Muzzle/Thruster bones)
- [ ] `enemies_base`: Path to `enemies_base.json` (Includes: Small/Medium/Bug skins)
- [ ] `boss_spine`: Path to `boss.json` (Includes: Multiphase rigs)
- [ ] `fx_hit`: Path to `fx_hit.json` (Includes: Energy ring/Sparks)
- [ ] `fx_explosion`: Path to `fx_explosion.json` (Includes: Shards/Smoke)
- [ ] `ui_multiplier`: Path to `ui_multiplier.json` (Includes: Orb/Ring pulse)
- [ ] `bg_far`: `far_stars.png` (ScrollSpeed: 0.5)
- [ ] `bg_mid`: `mid_nebula.png` (ScrollSpeed: 1.2)
- [ ] `bg_fore`: `foreground_particles.png` (ScrollSpeed: 2.5)

---

## 2. System Initialization (Z-Order Priority)

Ensure the following systems are initialized in `game.js` according to the definitive Z-order:

1. [ ] **BackgroundSystem**: Anchor at Z:0. Add 3 layers with appropriate speeds.
2. [ ] **ReelSystem**: Anchor at Z:1. Initialize with `createFrame(800, window.innerHeight)`.
3. [ ] **ObjectPools**: Update `enemyPool` to support `PIXI.spine.Spine` actors.
4. [ ] **SpineEventManager**: Attach to every Spine instance via `.attach(spineObj)`.
5. [ ] **CelebrationManager**: Initialize for "Big Win" ticker handling.
6. [ ] **MicroUISystem**: Add to the top-most HUD layer for interaction rings.

---

## 3. Math-to-Visual Mappings

Verify that RGS outcomes correctly trigger the following visual states:

- [ ] **Small Win (< 5x)**: Trigger `hit` animation + procedural sparks.
- [ ] **Medium Win (5-15x)**: Swap skin to `rage` (if applicable) + `hit` animation.
- [ ] **Big Win (> 15x)**: Trigger `celebrations.triggerBigWin(amount)` + Time Dilation.
- [ ] **Kill Outcome**: Trigger `death` animation. Wait 450ms before releasing to pool.
- [ ] **Jackpot Outcome**: Trigger `boss_death` (if Boss) + "Mega" UI banner.

---

## 4. Spine Event Hook Verification

Check for the following events in the browser console during gameplay:

- [ ] `on_fire`: Triggered @ muzzle bone?
- [ ] `shake_small`: Triggered on standard hits?
- [ ] `shake_big`: Triggered on Boss fire or Big Win?
- [ ] `spawn_fx`: Correctly positioning Hit FX Spine at impact bone?

---

## 5. Final Performance Sanity Check

- [ ] **Draw Calls**: Verified < 50 on mobile Chrome/Safari?
- [ ] **Texture Memory**: Total VRAM usage < 256MB?
- [ ] **Frame Rate**: Locked 60 FPS during Big Win coin shower?
- [ ] **Glassmorphism**: Backdrop blur performance verified (disable for ultra-low-end)?

---

## 🛠️ Integration Support

Refer to [engine_integration.md](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/engine_integration.md) for pseudocode implementations.
