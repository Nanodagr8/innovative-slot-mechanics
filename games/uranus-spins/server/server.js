import express from "express";
import http from "http";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { weightedSample } from "./rng.js";
import { createTicket, verifyTicket } from "./tickets.js";
import { reserveFunds, contributeJackpot, creditPlayer, resolveJackpot, getJackpotPool } from "./economy.js";
import { initWebsocket, broadcast } from "./ws.js";
import path from "path";
import { fileURLToPath } from "url";
import { LIVE_CONFIG } from "./config.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all for local dev
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Stake-Signature");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});
app.use(express.static(path.join(__dirname, '../frontend')));

const hmacSecret = process.env.HMAC_SECRET || "dev_secret";

// Signature Verification Middleware
const verifyStakeSignature = (req, res, next) => {
    // Bypass signature check for local development
    if (hmacSecret === "dev_secret") return next();

    const signature = req.headers['x-stake-signature'];
    if (!signature) {
        console.warn("[SECURITY] Missing X-Stake-Signature");
        return res.status(401).json({ error: "Unauthorized: Missing Signature" });
    }

    const payload = JSON.stringify(req.body);
    const expected = crypto.createHmac("sha256", hmacSecret).update(payload).digest("hex");

    if (signature !== expected) {
        console.error("[SECURITY] Signature Mismatch!");
        return res.status(403).json({ error: "Forbidden: Invalid Signature" });
    }
    next();
};

// multipliers from configuration
const MULTIPLIERS = {
    miss: 0.0,
    small: 1.2,
    mid: 3.0,
    high: 10.0,
    special: 25.0,
    jackpot: 170.0 // Base, pool added on top
};

// Health & Probes
app.get("/health", (_, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get("/ready", (_, res) => res.status(200).send("READY"));

// Jackpot Endpoint (with mock fallback for demo mode)
app.get("/api/jackpot", async (req, res) => {
    try {
        const client = await pool.connect();
        const pools = await getJackpotPool(client);
        client.release();
        res.json({ jackpotPools: { mega: pools, major: pools * 0.25, mini: pools * 0.05 } });
    } catch (e) {
        // Demo mode fallback - no DB connected
        console.warn("[DEMO] Using mock jackpot pools (no DB)");
        res.json({ jackpotPools: { mega: 2000.00, major: 500.00, mini: 100.00 } });
    }
});

// Favicon
app.get("/favicon.ico", (req, res) => res.status(204).end());

// --- STAKE ENGINE RGS PROTOCOL START ---

// Authenticate
app.post("/wallet/authenticate", verifyStakeSignature, async (req, res) => {
    try {
        const { sessionID } = req.body;
        // In a real integration, we validate sessionID with the Operator.
        // Here we just mock it or lookup local player.
        const playerId = "player1"; // Force local player

        const client = await pool.connect();
        const { rows } = await client.query("SELECT balance FROM players WHERE id=$1", [playerId]);
        client.release();

        const balance = rows.length ? parseFloat(rows[0].balance) : 1000.00;

        res.json({
            balance: { amount: balance.toFixed(2), currency: "USD" },
            config: {
                minBet: 0.10,
                maxBet: 100.00,
                stepBet: 0.10,
                defaultBetLevel: 1.00,
                betLevels: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0],
                jurisdiction: {
                    socialCasino: false,
                    displayRTP: true
                }
            },
            round: { active: false }
        });
    } catch (e) {
        console.warn("[DEMO] Auth DB failed, using mock data");
        // FALLBACK MOCK RESPONSE
        res.json({
            balance: { amount: "1000.00", currency: "USD" },
            config: {
                minBet: 0.10,
                maxBet: 100.00,
                stepBet: 0.10,
                defaultBetLevel: 1.00,
                betLevels: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0],
                jurisdiction: { socialCasino: false, displayRTP: true }
            },
            round: { active: false }
        });
    }
});

// Balance
app.post("/wallet/balance", verifyStakeSignature, async (req, res) => {
    try {
        const client = await pool.connect();
        const { rows } = await client.query("SELECT balance FROM players WHERE id=$1", ["player1"]);
        client.release();
        const balance = rows.length ? parseFloat(rows[0].balance) : 0.00;
        res.json({ balance: { amount: balance.toFixed(2), currency: "USD" } });
    } catch (e) {
        // Fallback for demo
        res.json({ balance: { amount: "1000.00", currency: "USD" } });
    }
});

// Play (Maps to Fire)
app.post("/wallet/play", verifyStakeSignature, async (req, res) => {
    const { amount, sessionID } = req.body;
    const playerId = "player1";

    // Reuse the fire logic (copy-paste adapter or refactor). 
    // To minimize risk, we call the same internal logic.
    // For now, we replicate the fire handler logic here adapted for RGS response format.

    const betPerShot = amount;
    const shots = 1;

    // ... Copy of Fire Logic ...
    const totalCost = betPerShot;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await reserveFunds(client, playerId, totalCost);

        // Logic
        await contributeJackpot(client, betPerShot);
        const isBoss = Math.random() < (LIVE_CONFIG.boss.spawnRate);
        const outcomes = [];
        let outcomeKey;

        if (!isBoss) outcomeKey = weightedSample(LIVE_CONFIG.probabilities);
        else {
            const bossWeights = { ...LIVE_CONFIG.probabilities };
            bossWeights.jackpot *= LIVE_CONFIG.boss.jackpotWeight;
            outcomeKey = weightedSample(bossWeights);
        }

        let payout = betPerShot * MULTIPLIERS[outcomeKey];
        let isJackpot = false;
        if (outcomeKey === "jackpot") {
            const poolVal = await resolveJackpot(client);
            payout += poolVal;
            isJackpot = true;
        }

        outcomes.push({
            index: 1,
            outcome: outcomeKey,
            payout: Number(payout.toFixed(4)),
            isKill: outcomeKey !== 'miss',
            isJackpot
        });

        // Ticket
        const ticketPayload = {
            playerId, betPerShot, shots, totalBet: totalCost, totalWin: payout, outcomes
        };
        const ticket = createTicket(ticketPayload);

        await client.query(
            "INSERT INTO tickets (id, player_id, bet_per_shot, shots, total_bet, total_win, outcomes, signature) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
            [ticket.id, playerId, betPerShot, shots, ticketPayload.totalBet, ticketPayload.totalWin, JSON.stringify(outcomes), ticket.signature]
        );

        await creditPlayer(client, playerId, payout); // RGS auto-credits usually? Or wait for claim?
        // Standard RGS 'Play' usually credits wins immediately unless 'EndRound' is needed.
        // Adapter.js logic had 'claim', but RGS Client standard often handles it in one go for simple games.
        // Let's auto-credit to simplify.

        await client.query("COMMIT");

        console.log(`[RGS] Transaction Success: ${ticket.id} | Player: ${playerId} | Payout: ${payout}`);

        if (payout > 0) broadcast("win_event", { playerId, amount: payout, ticketId: ticket.id });

        // Get updated balance
        const { rows } = await client.query("SELECT balance FROM players WHERE id=$1", [playerId]);
        const newBalance = parseFloat(rows[0].balance);

        res.json({
            balance: { amount: newBalance.toFixed(2), currency: "USD" },
            round: {
                active: false,
                id: ticket.id,
                outcomes: outcomes, // Custom data passed back
                totalWin: payout
            }
        });

    } catch (err) {
        if (client) await client.query("ROLLBACK");

        // MOCK FALLBACK for Play/Fire if DB fails
        if (err.code === 'ECONNREFUSED' || !client) {
            console.warn("[DEMO] Play/Fire DB failed, using mock math");
            // Just return a random outcome so the game doesn't crash
            const mockPayout = Math.random() < 0.3 ? betPerShot * 1.2 : 0;
            const mockKey = mockPayout > 0 ? "small" : "miss";

            const mockOutcomes = [{
                index: 1,
                outcome: mockKey,
                payout: Number(mockPayout.toFixed(4)),
                isKill: mockKey !== 'miss',
                isJackpot: false
            }];

            return res.json({
                balance: { amount: (1000.00 - betPerShot + mockPayout).toFixed(2), currency: "USD" },
                round: {
                    active: false,
                    id: "mock_ticket_" + Date.now(),
                    outcomes: mockOutcomes,
                    totalWin: mockPayout
                }
            });
        }

        console.error("play-error:", err);
        res.status(500).json({ error: "Play failed" });
    } finally {
        if (client) client.release();
    }
});

// --- STAKE ENGINE RGS PROTOCOL END ---

// Fire endpoint
app.post("/api/fire", async (req, res) => {
    const { playerId, betPerShot, shots } = req.body;
    if (!playerId || !betPerShot || !shots) return res.status(400).send("bad-request");
    if (shots > (parseInt(process.env.BURST_LIMIT) || 200)) return res.status(400).send("burst-limit");
    const totalCost = parseFloat((betPerShot * shots).toFixed(4));

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Reserve funds
        await reserveFunds(client, playerId, totalCost);

        const outcomes = [];
        let totalWin = 0.0;

        for (let i = 0; i < shots; i++) {
            // Jackpot contribution
            await contributeJackpot(client, betPerShot);

            // Boss check from LIVE_CONFIG
            const isBoss = Math.random() < (LIVE_CONFIG.boss.spawnRate);
            let outcomeKey;

            if (!isBoss) {
                outcomeKey = weightedSample(LIVE_CONFIG.probabilities);
            } else {
                // Amplify jackpot weighting
                const bossWeights = { ...LIVE_CONFIG.probabilities };
                bossWeights.jackpot *= LIVE_CONFIG.boss.jackpotWeight;
                outcomeKey = weightedSample(bossWeights);
            }

            let payout = betPerShot * MULTIPLIERS[outcomeKey];
            let isJackpot = false;

            if (outcomeKey === "jackpot") {
                const poolVal = await resolveJackpot(client);
                payout += poolVal;
                isJackpot = true;
            }

            totalWin += payout;
            outcomes.push({
                index: i + 1,
                outcome: outcomeKey,
                payout: Number(payout.toFixed(4)),
                isKill: outcomeKey !== 'miss',
                isJackpot
            });
        }

        // Create & Sign Ticket
        const ticketPayload = {
            playerId,
            betPerShot,
            shots,
            totalBet: totalCost,
            totalWin: Number(totalWin.toFixed(4)),
            outcomes
        };
        const ticket = createTicket(ticketPayload);

        // Persist Ticket
        await client.query(
            "INSERT INTO tickets (id, player_id, bet_per_shot, shots, total_bet, total_win, outcomes, signature) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
            [ticket.id, playerId, betPerShot, shots, ticketPayload.totalBet, ticketPayload.totalWin, JSON.stringify(outcomes), ticket.signature]
        );

        await client.query("COMMIT");

        // Real-time broadcast
        if (totalWin > 0) {
            broadcast("win_event", { playerId, amount: totalWin, ticketId: ticket.id });
        }

        // Broadcast pool sync
        const currentPool = await getJackpotPool(client);
        broadcast("jackpot_update", { mega: currentPool * 0.2, major: currentPool * 0.5, mini: currentPool * 0.3 });

        res.json(ticket);
    } catch (err) {
        if (client) await client.query("ROLLBACK");
        console.error("fire-error:", err);
        return res.status(500).send("server-error");
    } finally {
        if (client) client.release();
    }
});

// Claim endpoint
app.post("/api/claim", async (req, res) => {
    const { ticketId } = req.body;
    if (!ticketId) return res.status(400).send("bad-request");

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { rows } = await client.query("SELECT * FROM tickets WHERE id=$1 FOR UPDATE", [ticketId]);

        if (!rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).send("ticket-not-found");
        }

        const ticket = rows[0];
        if (ticket.claimed) {
            await client.query("ROLLBACK");
            return res.status(409).send("already-claimed");
        }

        // Verify Truth
        if (!verifyTicket(ticket)) {
            await client.query("ROLLBACK");
            return res.status(400).send("bad-signature");
        }

        await creditPlayer(client, ticket.player_id, ticket.total_win);
        await client.query("UPDATE tickets SET claimed=true WHERE id=$1", [ticketId]);

        const { rows: pRows } = await client.query("SELECT balance FROM players WHERE id=$1", [ticket.player_id]);

        await client.query("COMMIT");

        res.json({ status: "ok", payout: Number(ticket.total_win), balance: Number(pRows[0].balance) });
    } catch (err) {
        if (client) await client.query("ROLLBACK");
        console.error("claim-error:", err);
        return res.status(500).send("server-error");
    } finally {
        if (client) client.release();
    }
});

const httpServer = http.createServer(app);
initWebsocket(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`[URANUS] Gold Master Server Running on :${PORT}`);
});
