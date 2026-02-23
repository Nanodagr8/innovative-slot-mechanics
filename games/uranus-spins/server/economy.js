import { pool } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const jackpotPoolPct = parseFloat(process.env.JACKPOT_POOL_PCT || "0.005");

// reserve funds (simple)
export async function reserveFunds(client, playerId, amount) {
    const { rows } = await client.query(
        "SELECT balance FROM players WHERE id=$1 FOR UPDATE",
        [playerId]
    );
    if (!rows.length) throw new Error("player-not-found");
    const balance = parseFloat(rows[0].balance);
    if (balance < amount) throw new Error("insufficient-funds");
    const newBal = (balance - amount).toFixed(2);
    await client.query("UPDATE players SET balance=$1 WHERE id=$2", [newBal, playerId]);
    return newBal;
}

export async function creditPlayer(client, playerId, amount) {
    await client.query("UPDATE players SET balance = balance + $1 WHERE id = $2", [amount, playerId]);
}

// jackpot pool manipulation (single-row table)
export async function contributeJackpot(client, bet) {
    const contribution = bet * jackpotPoolPct;
    await client.query("UPDATE jackpots SET pool = pool + $1, updated_at = now() WHERE id = 1", [contribution]);
}

export async function resolveJackpot(client) {
    const { rows } = await client.query("SELECT pool FROM jackpots WHERE id=1 FOR UPDATE");
    const poolVal = parseFloat(rows[0].pool);
    await client.query("UPDATE jackpots SET pool=0, updated_at=now() WHERE id=1");
    return poolVal;
}

export async function getJackpotPool(client) {
    const { rows } = await client.query("SELECT pool FROM jackpots WHERE id=1");
    return parseFloat(rows[0].pool || 0);
}
