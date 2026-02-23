import { LIVE_CONFIG } from "./config.js";
import { sampleOutcome } from "./jackpots.js";
import crypto from "crypto";

export async function runAudit(shotCount = 10000000) {
    console.log(`[Audit] Starting 10M shot simulation for RTP verification...`);
    let totalBet = 0;
    let totalWin = 0;
    const bet = 1.0;

    const startTime = Date.now();
    for (let i = 0; i < shotCount; i++) {
        totalBet += bet;
        const outcome = sampleOutcome(false); // Base game sampling
        totalWin += bet * LIVE_CONFIG.multipliers[outcome];

        // Simulate jackpot contribution
        if (outcome !== "jackpot") {
            // Pool accumulation not counted as instant win in basic RTP audit
        }
    }

    const rtp = (totalWin / totalBet) * 100;
    const duration = (Date.now() - startTime) / 1000;
    const report = {
        timestamp: new Date().toISOString(),
        shots: shotCount,
        rtp: rtp.toFixed(2) + "%",
        configHash: crypto.createHash('md5').update(JSON.stringify(LIVE_CONFIG)).digest('hex'),
        durationSeconds: duration
    };

    console.log(`[Audit] Simulation Complete:`, report);
    return report;
}
