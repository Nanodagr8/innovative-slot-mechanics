#!/bin/bash

# Uranus Spins - Spine Export Automation Script
# Use this script to batch export all .spine projects via Spine CLI.

SPINE_EXE="C:/Program Files/Spine/Spine.com" # Adjust path for your system
SOURCE_DIR="./docs/production/spines"
EXPORT_DIR="./frontend/assets/spine"

pack_spine() {
    local name=$1
    echo "Exporting $name..."
    "$SPINE_EXE" -i "$SOURCE_DIR/$name.spine" -o "$EXPORT_DIR" -e "$SOURCE_DIR/export_settings.json"
}

# Ensure export directory exists
mkdir -p "$EXPORT_DIR"

# Core Actors
pack_spine "player"
pack_spine "enemy_small"
pack_spine "enemy_medium"
pack_spine "boss"

# VFX & UI
pack_spine "fx_hit"
pack_spine "fx_explosion"
pack_spine "fx_win"
pack_spine "ui_multiplier"

echo "Spine Export Complete. Production JSON/Atlas bundles are in $EXPORT_DIR"
