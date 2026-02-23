# Uranus Spins - UI/UX & Visual Support Specification

## 1. Background System (Multi-Layered)

Backgrounds must be implemented as separate parallax layers to allow for dynamic motion and mode transitions.

| Layer Name     | Asset                      | Animation Rule               |
| :------------- | :------------------------- | :--------------------------- |
| **FAR**        | `far_stars.png`            | Static / very slow parallax  |
| **MID**        | `mid_nebula.png`           | Slow rotation or hue pulse   |
| **FOREGROUND** | `foreground_particles.png` | Fast drift / depth particles |

### Mode Tints

- **Base**: Low contrast, neutral space.
- **Free Spins**: Blue/Cyan high saturation, energetic.
- **Super Bonus**: Red/Gold neon intensity.

## 2. Reel & Frame Overlays

Framing logic to anchor the "Reel" space in the center.

- `reel_frame_top.png` / `reel_frame_bottom.png`: Metallic finish with subtle neon trim.
- `reel_separator_vertical.png`: Divides symbols if using a grid layout.
- `reel_shadow_overlay.png`: Inward gradient to give depth to symbols.

## 3. Micro-UI & Feedback

Responsive feedback for tactile feel.

- **Tap Feedback**: `tap_feedback_ring.png` expands and fades on screen press.
- **Button Micro-Anim**: Scale down (93%) and flash on click.
- **Invalid Action**: Red shake overlay on illegal bets or insufficient funds.

## 4. Teasers & Anticipation

Deterministic visual escalation based on RGS state.

- **Scatter Tease**: `scatter_tease_glow.png` pulses when 2/3 scatters landed.
- **Last Reel Pulse**: Highlights the final reel during high-win-potential spins.
- **Almost Win**: Glow escalation when a jackpot symbol "near misses".

## 5. UI Atlas Organization

Atlases must be grouped by frequency to optimize draw calls.

- `ui_base.atlas`: Buttons, headers, footer.
- `ui_feedback.atlas`: Tap rings, flashes, glows.
- `ui_bonus.atlas`: Intro screens, portals, lightning.
- `ui_backgrounds.atlas`: Nebula and particle layers.
- `ui_teasers.atlas`: Anticipation rings and pulses.
- `ui_info.atlas`: Paytable, rules, static text panels.
