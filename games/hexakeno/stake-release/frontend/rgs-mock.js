/**
 * Mock RGS Client for Local Development
 * Defines the global RGSClient object that StakeEngineAdapter expects.
 */

// Paytables (Synced with keno_config.py)
const CONFIG_PAYTABLES_DISPLAY = {
    "classic": {
        1: {
            1: 3.88
        },
        2: {
            1: 1.74,
            2: 5.22
        },
        3: {
            2: 4.91,
            3: 24.57
        },
        4: {
            2: 2.73,
            3: 8.19,
            4: 27.3
        },
        5: {
            2: 1.97,
            3: 3.94,
            4: 9.86,
            5: 39.44
        },
        6: {
            3: 5.17,
            4: 10.33,
            5: 31.0,
            6: 129.19
        },
        7: {
            3: 3.28,
            4: 6.56,
            5: 13.12,
            6: 39.37,
            7: 131.22
        },
        8: {
            3: 2.23,
            4: 4.45,
            5: 8.9,
            6: 17.81,
            7: 44.52,
            8: 133.57
        },
        9: {
            4: 5.56,
            5: 11.12,
            6: 22.24,
            7: 55.59,
            8: 166.77,
            9: 444.73
        },
        10: {
            4: 3.77,
            5: 7.54,
            6: 11.31,
            7: 30.16,
            8: 75.4,
            9: 226.21,
            10: 377.02
        }
    },
    "low": {
        1: {
            1: 3.88
        },
        2: {
            1: 1.94,
            2: 3.88
        },
        3: {
            2: 5.6,
            3: 16.81
        },
        4: {
            2: 3.21,
            3: 6.42,
            4: 12.84
        },
        5: {
            2: 2.27,
            3: 3.4,
            4: 6.8,
            5: 13.61
        },
        6: {
            3: 5.74,
            4: 8.61,
            5: 17.22,
            6: 43.06
        },
        7: {
            3: 3.71,
            4: 5.56,
            5: 9.27,
            6: 18.55,
            7: 46.37
        },
        8: {
            3: 2.6,
            4: 3.9,
            5: 6.5,
            6: 10.4,
            7: 19.5,
            8: 52.01
        },
        9: {
            4: 5.69,
            5: 11.38,
            6: 17.07,
            7: 34.13,
            8: 71.11,
            9: 170.66
        },
        10: {
            4: 4.2,
            5: 6.31,
            6: 10.51,
            7: 21.02,
            8: 42.04,
            9: 84.08,
            10: 168.16
        }
    },
    "medium": {
        1: {
            1: 3.88
        },
        2: {
            1: 1.44,
            2: 7.21
        },
        3: {
            2: 4.15,
            3: 33.19
        },
        4: {
            2: 2.39,
            3: 9.55,
            4: 35.82
        },
        5: {
            2: 1.61,
            3: 4.82,
            4: 12.85,
            5: 48.2
        },
        6: {
            3: 4.39,
            4: 13.18,
            5: 43.94,
            6: 219.7
        },
        7: {
            3: 3.01,
            4: 6.02,
            5: 24.08,
            6: 60.19,
            7: 300.96
        },
        8: {
            3: 2.06,
            4: 4.11,
            5: 12.34,
            6: 30.85,
            7: 82.26,
            8: 411.31
        },
        9: {
            4: 4.53,
            5: 13.58,
            6: 36.21,
            7: 90.54,
            8: 271.61,
            9: 1000.0
        },
        10: {
            4: 3.52,
            5: 7.04,
            6: 17.61,
            7: 52.84,
            8: 140.9,
            9: 528.36,
            10: 1000.0
        }
    },
    "high": {
        1: {
            1: 3.88
        },
        2: {
            1: 0.63,
            2: 12.61
        },
        3: {
            2: 1.56,
            3: 62.33
        },
        4: {
            2: 1.22,
            3: 12.25,
            4: 97.99
        },
        5: {
            2: 0.76,
            3: 6.08,
            4: 22.8,
            5: 152.02
        },
        6: {
            3: 2.22,
            4: 17.73,
            5: 110.81,
            6: 886.48
        },
        7: {
            3: 1.46,
            4: 8.74,
            5: 43.69,
            6: 145.62,
            7: 1000.0
        },
        8: {
            3: 1.03,
            4: 5.14,
            5: 20.55,
            6: 61.64,
            7: 205.47,
            8: 1000.0
        },
        9: {
            4: 2.3,
            5: 18.39,
            6: 68.98,
            7: 183.95,
            8: 689.8,
            9: 1000.0
        },
        10: {
            4: 1.68,
            5: 10.09,
            6: 33.63,
            7: 100.88,
            8: 336.28,
            9: 1000.0,
            10: 1000.0
        }
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
