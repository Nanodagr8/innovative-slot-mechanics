# Uranus Spins - Animation Pipeline (Master Document)

This document consolidates all technical and creative specs for the Uranus Spins animation and rendering systems.

---

## 1. Animation Timing Sheet (Studio Specs)

All durations in **milliseconds (ms)**.

### Symbols & Actors

| State          | Duration | Easing         | Keyframes / Notes                                  |
| :------------- | :------- | :------------- | :------------------------------------------------- |
| **idle_hover** | 1200ms   | easeInOutSine  | Y: ±4px oscillation. Eye glow pulse (900ms).       |
| **hit**        | 120ms    | linear/outQuad | White color flash. Scale X: 105%, Y: 85% recovery. |
| **death**      | 450ms    | easeOutQuad    | Shard explosion event @ 140ms. Linear fade out.    |

### Player & Boss

| State           | Duration | Easing         | Notes                                             |
| :-------------- | :------- | :------------- | :------------------------------------------------ |
| **fire_loop**   | 200ms    | easeInOutSine  | Engine flame pulse. Gun recoil. Event: `on_fire`. |
| **boss_attack** | 900ms    | easeIn/OutQuad | 300ms windup -> 320ms fire -> 900ms settle.       |

### UI & Feedback

| State            | Duration | Easing      | Description                                      |
| :--------------- | :------- | :---------- | :----------------------------------------------- |
| **big_win**      | 2200ms   | easeOutBack | Intro (600ms) -> Hold (1000ms) -> Out (600ms).   |
| **btn_click**    | 160ms    | easeOutBack | Scale down to 93% then bounce back.              |
| **teaser_pulse** | 480ms    | easeOutSine | Brightness pulse for last reel anticipation.     |
| **FS_intro**     | 1700ms   | easeOutBack | Title zoom (500ms), ring rotate, particle burst. |

---

## 2. Spine vs. Non-Spine Decisions

- **Spine (JSON)**: Symbols A/B/C, Player (with Recoil), Boss (Jaws/Cannons), Multiplier Orbs.
- **Sprite (Texture)**: Background layers, Tiled stars, UI HUD panels, Static buttons.
- **Particle (Code)**: Small hit sparks, coin popups, foreground space dust.

---

## 3. Rendering Z-Order (Draw Order)

1. **UI_OVERLAY** (Modals, Logo)
2. **COIN_PARTY** (Win particles)
3. **SYMBOLS** (Characters & Enemies)
4. **REEL_FRAME** (Frame overlays)
5. **BG_PARALLAX** (Nebula & Stars)
6. **BACKDROP** (Solid space color)

---

## 4. Performance & Export

- **Draw Call Target**: ≤ 50 (Mobile), ≤ 30 (Goal).
- **VRAM Budget**: 256MB active (Selectively load Boss/Bonus atlases).
- **Export Flags**: Spine format, Straight Alpha (No PMA), 2px padding, No Rotation.

---

## 5. Automation Strategy

Use `docs/production/pack_assets.sh` to build all 12 production-grade atlases from source folders.
