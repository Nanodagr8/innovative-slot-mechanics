-- Uranus Spins: Production Database Schema (PostgreSQL)

-- 1. Players & Wallets
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    username VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(18, 2) DEFAULT 0.00,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 2. Jackpots (Global Tiered Pools)
CREATE TABLE jackpot_pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE, -- 'MINI', 'MAJOR', 'MEGA'
    current_value DECIMAL(18, 8) DEFAULT 0.00,
    updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 3. Game Tickets (The Audit Log)
-- Every shot fired is a record here.
CREATE TABLE game_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    player_id UUID REFERENCES players (id),
    bet_amount DECIMAL(18, 2) NOT NULL,
    payout_amount DECIMAL(18, 2) DEFAULT 0.00,
    outcome_tier VARCHAR(20) NOT NULL,
    signature TEXT NOT NULL,
    is_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- 4. Audit Trail for Jackpots
CREATE TABLE jackpot_wins (
    id SERIAL PRIMARY KEY,
    ticket_id UUID REFERENCES game_tickets (id),
    player_id UUID REFERENCES players (id),
    amount DECIMAL(18, 2) NOT NULL,
    won_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO
    jackpot_pools (name, current_value)
VALUES ('MINI', 100.00),
    ('MAJOR', 500.00),
    ('MEGA', 2000.00);

-- Indexes for performance
CREATE INDEX idx_tickets_player ON game_tickets (player_id);

CREATE INDEX idx_tickets_signature ON game_tickets (signature);