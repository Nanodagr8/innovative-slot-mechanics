# Uranus Spins - Performance Budget & Targets

## 1. Global Performance Targets

- **Platform**: Mobile (iOS/Android/Web)
- **Target FPS**: 30 (Deterministic)
- **Draw Calls**: ≤ 50 per frame (Goal: < 30)
- **Memory (VRAM)**: ≤ 256 MB (Mobile/Low-end), 1-2 GB (Desktop)

## 2. Skeleton & Atlas limits

- **Max Unique Skeletons**: ≤ 12 active at once.
- **Max Bones / Skeleton**: ≤ 20.
- **Max Mesh Vertices**: ≤ 500 per skeleton.
- **Active Atlases**: 3–5 unique atlases per scene.

## 3. Sprite Atlas Plan (2048 x 2048)

To minimize state changes, assets are grouped by usage frequency.

| Atlas Name             | Frequency | Contents                                   |
| :--------------------- | :-------- | :----------------------------------------- |
| **ui_base.atlas**      | Always    | Buttons, frames, icons, jackpot labels     |
| **enemies_base.atlas** | Static    | Symbols A, B, C base textures + skeletons  |
| **fx_common.atlas**    | High      | Bullets, small explosions, hit sparks      |
| **player.atlas**       | Always    | Player ship body, wings, engine glows      |
| **boss.atlas**         | Low       | Boss parts (loaded only during Boss Phase) |
| **backgrounds.atlas**  | Always    | Stars, nebula layers, particles            |

## 3. Skeleton Limits

- **Max Unique Skeletons**: 12 active per scene.
- **Max Bones / Skeleton**: 20 (Average).
- **Max Mesh Vertices**: 500 per skeleton.

## 4. Packing (TexturePacker CLI)

Always use these flags for consistent output:

- `format`: spine
- `trim-mode`: Trim (2px padding)
- `disable-rotation`: ON (Spine UV compatibility)
- `allow-free-size`: ON
- `pma`: OFF (Straight Alpha)
