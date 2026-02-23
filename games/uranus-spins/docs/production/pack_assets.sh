#!/bin/bash
# Uranus Spins - Asset Packing CLI
# Requirements: TexturePacker installed and in PATH

ASSETS_DIR="../../frontend/assets"
OUTPUT_DIR="../../frontend/atlases"

mkdir -p $OUTPUT_DIR

pack_group() {
    local group=$1
    echo "Packing $group..."
    TexturePacker \
        --format spine \
        --data "$OUTPUT_DIR/$group.atlas" \
        --sheet "$OUTPUT_DIR/$group.png" \
        --max-width 2048 \
        --max-height 2048 \
        --trim-mode Trim \
        --trim-threshold 1 \
        --trim 2 \
        --border-padding 2 \
        --shape-padding 2 \
        --disable-rotation \
        --allow-free-size \
        --pma false \
        "$ASSETS_DIR/$group/"*.png
}

# Core Game Symbols & Actors
pack_group "player"
pack_group "enemyA"
pack_group "enemyB"
pack_group "enemyC"
pack_group "boss"

# VFX Systems
pack_group "fx"

# UI & Support Systems
pack_group "ui_base"
pack_group "ui_feedback"
pack_group "ui_bonus"
pack_group "ui_backgrounds"
pack_group "ui_teasers"
pack_group "ui_info"

echo "Packing Complete. All 12 production atlases are ready."
