# Hexa Keno Super Ball - Stake Engine Integration Package

## Overview

This package contains the complete source code, math specifications, and outcome validation data for **Hexa Keno Super Ball**, a hexagonal Keno variant designed for the Stake.com platform.

## Features

### Core Features

- **Hexagonal Grid**: 80-number pool displayed in a hex grid layout
- **Risk Profiles**: Classic, Low, Medium, High, Expert, Master options
- **Super Ball**: +50% bet cost, dynamic pick-count based multipliers
- **Auto Play**: Configurable bet count and stop-on-profit
- **Hard Cap**: 10,000x Maximum Win strictly enforced

### Stake Requirements

- **Bet Replay** ✅: Full implementation per Stake specs
- **ts-client Integration** ✅: `stake-adapter.js` wrapper included
- **SDK Compliant** ✅: Pre-generated `lookUpTable_*.csv` and `books_*.jsonl.zst`

## Contents

### 1. Math & Probability (`/`)

- `keno_engine.py`: Core RNG and Game Logic engine (Python)
- `game_config.py`: Precision calibrated Paytables and Superball multipliers
- `outcomes_new.csv`: 600k round simulation for certification (96% RTP)

### 2. Frontend (`/stake-release/frontend`)

- `index.html`: Main game client
- `game.js`: Game controller with certified paytable logic
- `styles.css`: Stake Original dark theme

### 3. Math Bundles (`/stake-release/math`)

- `lookUpTable_*.csv`: Lookup tables for event-to-round mapping
- `books_*.jsonl.zst`: Compressed event logs for certification validation

## Risk Profiles

| Risk    | Hit Frequency | Max Payout (Capped) |
| ------- | ------------- | ------------------- |
| Low     | High          | 450x                |
| Classic | Balanced      | 7,200x              |
| Medium  | Medium        | 7,200x              |
| High    | Low           | 10,000x             |
| Expert  | Very Low      | 10,000x             |
| Master  | Extreme       | 10,000x             |

## Certification

RTP Target: **96.0%** (Ultra-precise calibration for all modes and pick counts)
Max Win Cap: **10,000x**
