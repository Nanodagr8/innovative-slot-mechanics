export const CONFIG = {
    fireRateCap: 6,
    burstLimit: 200,

    jackpotPoolPct: 0.01, // Total 1.0%
    jackpotTiers: {
        mini: 0.003,
        major: 0.005,
        mega: 0.002
    },

    probabilities: {
        miss: 0.7200,
        small: 0.2000,
        mid: 0.0600,
        high: 0.0150,
        special: 0.0045,
        jackpot: 0.0005
    },

    multipliers: {
        miss: 0.0,
        small: 1.2,
        mid: 3.0,
        high: 10.0,
        special: 25.0,
        jackpot: 170.0
    },

    boss: {
        spawnRate: 0.0002,
        jackpotWeight: 10
    },

    hmacSecret: "CHANGE_ME_IN_PROD",

    // Volatility Profiles (Distribution Shaping)
    profiles: {
        flat: { miss: 0.65, small: 0.30, mid: 0.04, high: 0.009, special: 0.001 },
        arcade: { miss: 0.72, small: 0.20, mid: 0.06, high: 0.015, special: 0.0045 },
        frenzy: { miss: 0.80, small: 0.10, mid: 0.05, high: 0.04, special: 0.01 }
    }
};

// Mutable state for the Operator Layer
export let LIVE_CONFIG = { ...CONFIG };

export function updateLiveConfig(newParams) {
    LIVE_CONFIG = { ...LIVE_CONFIG, ...newParams };
}
