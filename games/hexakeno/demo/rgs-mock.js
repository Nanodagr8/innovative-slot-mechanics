/**
 * Mock RGS Client for Local Development
 * Defines the global RGSClient object that StakeEngineAdapter expects.
 */

// Paytables (Synced with keno_config.py)
const CONFIG_PAYTABLES_DISPLAY = {
    "classic": {
        1: { 1: 3.80 },
        2: { 1: 1.82, 2: 4.32 },
        3: { 1: 0.96, 2: 2.98, 3: 9.98 },
        4: { 1: 0.77, 2: 1.73, 3: 4.80, 4: 21.60 },
        5: { 1: 0.24, 2: 1.34, 3: 3.94, 4: 15.84, 5: 34.56 },
        6: { 2: 0.96, 3: 3.53, 4: 6.72, 5: 15.84, 6: 38.40 },
        7: { 2: 0.45, 3: 2.88, 4: 4.32, 5: 13.44, 6: 29.76, 7: 57.60 },
        8: { 3: 2.11, 4: 3.84, 5: 12.48, 6: 21.12, 7: 52.80, 8: 67.20 },
        9: { 3: 1.49, 4: 2.88, 5: 7.68, 6: 14.40, 7: 42.24, 8: 57.60, 9: 81.60 },
        10: { 3: 1.34, 4: 2.16, 5: 4.32, 6: 7.68, 7: 16.32, 8: 48.00, 9: 76.80, 10: 96.00 }
    },
    "low": {
        1: { 0: 0.67, 1: 1.78 },
        2: { 1: 1.92, 2: 3.65 },
        3: { 1: 1.06, 2: 1.32, 3: 24.96 },
        4: { 2: 2.11, 3: 7.58, 4: 86.40 },
        5: { 2: 1.44, 3: 4.03, 4: 12.48, 5: 288.00 },
        6: { 2: 1.06, 3: 1.92, 4: 5.95, 5: 96.00, 6: 672.00 },
        7: { 2: 1.06, 3: 1.54, 4: 3.36, 5: 14.40, 6: 216.00, 7: 672.00 },
        8: { 2: 1.06, 3: 1.44, 4: 1.92, 5: 5.28, 6: 37.44, 7: 96.00, 8: 768.00 },
        9: { 2: 1.06, 3: 1.25, 4: 1.63, 5: 2.40, 6: 7.20, 7: 48.00, 8: 240.00, 9: 960.00 },
        10: { 2: 1.06, 3: 1.15, 4: 1.25, 5: 1.73, 6: 3.36, 7: 12.48, 8: 48.00, 9: 240.00, 10: 960.00 }
    },
    "medium": {
        1: { 0: 0.38, 1: 2.64 },
        2: { 1: 1.73, 2: 4.90 },
        3: { 2: 2.69, 3: 48.00 },
        4: { 2: 1.63, 3: 9.60, 4: 96.00 },
        5: { 2: 1.34, 3: 3.84, 4: 13.44, 5: 374.40 },
        6: { 3: 2.88, 4: 8.64, 5: 172.80, 6: 681.60 },
        7: { 3: 1.92, 4: 6.72, 5: 28.80, 6: 384.00, 7: 768.00 },
        8: { 3: 1.92, 4: 3.84, 5: 10.56, 6: 64.32, 7: 384.00, 8: 864.00 },
        9: { 3: 1.92, 4: 2.40, 5: 4.80, 6: 14.40, 7: 96.00, 8: 480.00, 9: 960.00 },
        10: { 3: 1.54, 4: 1.92, 5: 3.84, 6: 6.72, 7: 24.96, 8: 96.00, 9: 480.00, 10: 960.00 }
    },
    "high": {
        1: { 1: 3.88 },
        2: { 2: 16.81 },
        3: { 3: 79.86 },
        4: { 3: 9.81, 4: 254.01 },
        5: { 3: 4.41, 4: 47.08, 5: 441.40 },
        6: { 4: 10.78, 5: 342.93, 6: 695.67 },
        7: { 4: 6.86, 5: 88.22, 6: 392.07, 7: 784.14 },
        8: { 4: 4.90, 5: 19.60, 6: 264.66, 7: 588.13, 8: 882.20 },
        9: { 4: 3.92, 5: 10.78, 6: 54.89, 7: 490.07, 8: 784.12, 9: 980.15 },
        10: { 4: 3.43, 5: 7.84, 6: 12.74, 7: 61.72, 8: 489.86, 9: 783.77, 10: 1020.54 }
    }
};

if (typeof window.RGSClient === 'undefined') {
    window.RGSClient = function (config) {
        console.log('[MockRGS] Initialized with config:', config);

        return {
            Authenticate: async function () {
                console.log('[MockRGS] Authenticate called');
                return {
                    success: true,
                    balance: { amount: 1000.00, currency: 'USD' },
                    config: {
                        minBet: 0.10,
                        maxBet: 500.00,
                        defaultBet: 1.00,
                        betLevels: [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 25.00, 50.00, 100.00]
                    }
                };
            },
            Play: async function (req) {
                console.log('[MockRGS] Play called:', req);

                // Generate 10 random unique drawn numbers from 1-40
                const drawn = [];
                while (drawn.length < 10) {
                    const num = Math.floor(Math.random() * 40) + 1;
                    if (!drawn.includes(num)) drawn.push(num);
                }

                // Calculate hits based on player picks
                const picks = req.picks || [];
                const hits = picks.filter(p => drawn.includes(p));
                const hitCount = hits.length;
                const lastBall = drawn[9];
                const isSuperballHit = req.use_superball && picks.includes(lastBall);

                const currentRisk = req.risk || 'medium';
                const riskTable = CONFIG_PAYTABLES_DISPLAY[currentRisk] || CONFIG_PAYTABLES_DISPLAY['classic'];
                const paytable = riskTable[picks.length] || {};
                let multiplier = paytable[hitCount] || 0;

                // Superball bonus (7x multiplier)
                if (isSuperballHit && multiplier > 0) {
                    multiplier *= 7.0;
                }

                const betAmount = req.amount || 1;
                const finalPayout = multiplier * betAmount;

                return {
                    success: true,
                    balance: { amount: 1000 - betAmount + finalPayout, currency: 'USD' },
                    round: {
                        id: 'mock-round-' + Date.now(),
                        state: {
                            drawn_numbers: drawn,
                            last_ball: lastBall,
                            hits: hits,
                            hit_count: hitCount,
                            is_superball_hit: isSuperballHit,
                            multiplier: multiplier,
                            final_payout: finalPayout
                        }
                    }
                };
            },
            EndRound: async function () {
                console.log('[MockRGS] EndRound called');
                return {
                    success: true,
                    balance: { amount: 1005.00, currency: 'USD' }
                };
            }
        };
    };
    console.log('[MockRGS] Global RGSClient defined.');
}
