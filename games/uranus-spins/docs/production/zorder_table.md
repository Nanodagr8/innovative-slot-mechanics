# Uranus Spins - Z-Order (Layering) Truth Table

Definitive draw order from **Top (closest to camera) to Bottom (background)**.

| Order | Layer Name        | System          | Description                                      |
| :---- | :---------------- | :-------------- | :----------------------------------------------- |
| 1     | **UI_OVERLAY**    | CSS/Pixi        | Modals, Big Win Screens, "Uranus Spins" Logo     |
| 2     | **COIN_PARTY**    | ParticleSystem  | Floating coins, popup particles (UI-layered)     |
| 3     | **GLOW_OVERLAY**  | Spine Attach    | Symbol top overlays (win highlights, symbol pop) |
| 4     | **SYMBOLS**       | Spine Actors    | Reel symbols (Spine skeletons)                   |
| 5     | **REEL_FRAME**    | Sprite/Static   | Reel separators / frame (metallic reels UI)      |
| 6     | **REEL_SHADOW**   | Sprite/Gradient | Reel shadow overlay (drop shadow)                |
| 7     | **BG_FOREGROUND** | ParticleSystem  | Background particles (foreground layer)          |
| 8     | **BG_MID**        | Sprite          | Mid background (nebula, energy streams)          |
| 9     | **BG_FAR**        | Sprite (Tiled)  | Far background (parallax starfield)              |
| 10    | **BACKDROP**      | Static          | Global base backdrop color/gradient              |
| 11    | **LOADING**       | Sprite          | Loading / page chrome (drawn last as needed)     |
|  |

## Implementation Notes:

- **Z-depth** should be handled via explicit `parent.addChildAt()` or `container.zIndex` in PixiJS.
- **Spine Skeletons** should use internal draw order for part-level layering but occupy a single Z-layer in the engine context (Layer 4).
