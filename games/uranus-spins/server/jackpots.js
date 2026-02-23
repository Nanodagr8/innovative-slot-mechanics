import { LIVE_CONFIG } from "./config.js";
import { weightedSample } from "./rng.js";

export function sampleOutcome(isBoss = false) {
    if (!isBoss) return weightedSample(LIVE_CONFIG.probabilities);

    // Boss jackpot amplification
    const bossWeights = { ...LIVE_CONFIG.probabilities };
    bossWeights.jackpot *= LIVE_CONFIG.boss.jackpotWeight;

    const total = Object.values(bossWeights).reduce((a, b) => a + b, 0);
    for (const k in bossWeights) bossWeights[k] /= total;

    return weightedSample(bossWeights);
}
