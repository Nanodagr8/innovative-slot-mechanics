# Uranus Spins - Final Production Package (Handoff Manifest)

This document is the "Master Key" for the Uranus Spins visual and technical pipeline. It contains all the tools and documentation required to deliver the Gold Master version of the game.

---

## 🛠️ Automation Tools (Run via Shell)

Use these scripts to generate production assets from source folders.

- [x] **[pack_assets.sh](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/pack_assets.sh)**: Packs all 12+ atlases (Enemies, Player, FX, UI, Bg).
- [x] **[export_spine.sh](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/export_spine.sh)**: Batch exports Spine projects into the frontend asset directory.

---

## 📚 Technical Specifications (Gold Master Truth)

The definitive reference for animation, rendering, and performance.

- [x] **[Master Pipeline Doc](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/Uranus_Spins_Animation_Pipeline.md)**: Consolidated timings, Z-order, and rendering rules.
- [x] **[Animation Timings](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/animation_timing.md)**: ms-perfect durations and easing curves.
- [x] **[Z-Order Table](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/zorder_table.md)**: 11-layer rendering hierarchy.
- [x] **[Performance Budget](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/performance_budget.md)**: Draw call and VRAM limits for mobile.
- [x] **[UI/UX Specification](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/ui_spec.md)**: Glassmorphism and Neon styling rules.

---

## 🎨 Asset Templates & Mappings

Pre-rigged structures and event triggers.

- [x] **[Spine Event Map](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/spine_event_map.json)**: Deterministic event-to-engine hooks.
- [x] **[Skeleton Templates](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/skeletons/)**: JSON rigs for Player, EnemyA, FX_Hit, and UI.

---

## 🚀 Integration & Handoff

Immediate steps for the development team.

- [x] **[Integration Checklist](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/engine_integration_checklist.md)**: A step-by-step assembly guide.
- [x] **[Deliverables Checklist](file:///c:/Users/Kevin%20Inthavong/NANOSTUDIOS/math-sdk/games/uranus-spins/docs/production/deliverables_checklist.md)**: Final verification of files.

---

## 📦 Source Code Status (game.js)

The core engine has been refactored to support the above pipeline. Key modules now active:

- `SpineEventManager` (Native Spine Hooking)
- `BackgroundSystem` (3-Layer Parallax)
- `CelebrationManager` (Big Win Logic)
- `ReelSystem` (Structural Framing)
- `MicroUISystem` (Tactical Feedback)

**Handoff Complete.** All systems are green.
