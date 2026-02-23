# 🪐 Uranus Spins (Arcade Slot)

> **Gold Master Release** | **v1.0.0**

A server-authoritative arcade gambling game powered by Node.js, Postgres, Redis, and PixiJS.
Features real-time WebSocket jackpot broadcasts, HMAC ticket signing, and Galaga-style gameplay.

---

## 🚀 Quick Start (Local Dev)

Follow these steps to spin up the entire ecosystem.

### 1. Prerequisites

- **Node.js** (v18+)
- **Postgres** (or local docker container)
- **Redis** (or local docker container)

### 2. Backend Server

```bash
cd server
npm install

# Setup Env
cp .env.example .env

# Initialize DB (One-time)
# Ensure Postgres is running, then execute sql/schema.sql in your DB tool.

# Run Server
npm start
```

_Server runs on `http://localhost:3000`_

### 3. Frontend Client

The client is a static SPA. You can serve it with any HTTP server.

```bash
cd frontend

# Install a simple server if needed
npx serve .
```

_Client typically runs on `http://localhost:3000` (if proxied) or `http://localhost:5000`_

---

## 🏗️ Architecture

- **`server/`**: core Node.js backend.
  - `server.js`: Orchestration & API.
  - `economy.js`: Fund management.
  - `tickets.js`: HMAC signing.
  - `rng.js`: Weighted probability engine.
- **`frontend/`**: PixiJS game client.
  - `game.js`: Main loop & rendering.
  - `adapter.js`: RGS wagering bridge.
- **`ops/`**: Production infrastructure.
  - `helm/`: Kubernetes charts.
  - `k8s/`: Raw manifests.

## 📜 Documentation

- **[GAME_SPEC.md](./GAME_SPEC.md)**: Mathematical & Design Bible.
- **[OPS_RUNBOOK.md](./OPS_RUNBOOK.md)**: Production Operations Guide.
- **[Helm README](./ops/helm/uranus-spins/README.md)**: Cluster Deployment Guide.

---

_Powered by Nanostudios Math SDK_
