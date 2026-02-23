# Uranus Spins — Advanced Asset Pipeline

## Core Commands

### 1. Slice Grid Sheet

`pwsh scripts/slice.ps1 -Sheet <path> -W 256 -H 256 -Out <out_dir>`

### 2. Pack Spine Atlas

`pwsh scripts/pack.ps1 -Input <dir> -Name <atlas_name>`

### 3. Generate Event Mapping

`python tools/event_to_engine_mapper.py --spine-dir build/spine_export --out build/engine_import/event_mapping.json`

### 4. Validate Animations

`python scripts/animation_validator.py --spine-dir build/spine_export --rules rules/animation_rules.json`

## CI Pipeline

Run `pwsh ci/ci_check.ps1` to verify all assets before release.
