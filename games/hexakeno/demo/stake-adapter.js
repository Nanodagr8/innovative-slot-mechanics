/**
 * Stake Engine Adapter
 * ---------------------
 * Wrapper for integrating with Stake Engine RGS Client.
 * Provides compatibility layer between Hexakeno and stake-engine npm package.
 * 
 * Usage:
 * 1. Install: npm install stake-engine
 * 2. Import and initialize: const adapter = new StakeEngineAdapter();
 * 3. Replace mock balance calls with adapter methods
 */

const API_MULTIPLIER = 1000000;

class StakeEngineAdapter {
    constructor() {
        this.rgsClient = null;
        this.balance = { amount: 1000 * API_MULTIPLIER, currency: 'USD' }; // Default mock balance
        this.rgsConfig = {
            minBet: 0.10,
            maxBet: 10000.00,
            defaultBet: 1.00,
            // Exact RGS-allowed bet levels (in dollars = micro-units / 1,000,000)
            betLevels: [
                0.10, 0.20, 0.40, 0.60, 0.80,
                1.00, 1.20, 1.40, 1.60, 1.80,
                2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00,
                10.00, 12.00, 14.00, 16.00, 18.00,
                20.00, 30.00, 40.00, 50.00, 75.00,
                100.00, 150.00, 200.00, 250.00, 300.00,
                350.00, 400.00, 450.00, 500.00, 750.00, 1000.00
            ]
        };
        this.isAuthenticated = false;
        this.roundActive = false;

        this._initEventListeners();
    }

    /**
     * Initialize RGS Client from stake-engine package
     * Call this after page load
     */
    async init() {
        console.log('[StakeAdapter] Initializing Stake Engine Adapter...');
        try {
            const urlParams = new URLSearchParams(window.location.search);
            this.lang = urlParams.get('lang') || 'en';
            this.targetCurrency = urlParams.get('currency') || 'USD';

            console.log(`[StakeAdapter] URL Parameters - Lang: ${this.lang}, Currency: ${this.targetCurrency}`);

            // Check for RGSClient in global scope
            if (typeof RGSClient !== 'undefined') {
                // Extract rgs_url from query parameters (required by Stake Engine)
                const rgsUrl = urlParams.get('rgs_url') || window.location.hostname;
                const fullUrl = rgsUrl.startsWith('http') ? rgsUrl : `https://${rgsUrl}`;

                console.log('[StakeAdapter] RGSClient detected. Initializing with RGS URL:', fullUrl);
                this.rgsClient = RGSClient({
                    url: window.location.href,
                    rgsUrl: fullUrl
                });
                this.isAuthenticated = false;
                console.log('[StakeAdapter] RGSClient initialized successfully.');
            } else {
                console.warn('[StakeAdapter] RGSClient not detected. Falling back to MOCK MODE for local development.');
                this.balance.currency = this.targetCurrency; // Sync mock currency
            }
        } catch (e) {
            console.error('[StakeAdapter] FATAL: Failed to init RGS Client:', e);
        }
    }

    /**
     * Set up window event listeners for balance and round state
     */
    _initEventListeners() {
        // Balance update events from Stake Engine
        window.addEventListener('balanceUpdate', (event) => {
            const customEvent = event;
            this.balance = customEvent.detail;
            console.log('[StakeAdapter] Balance updated:', this.balance);

            // Dispatch to game (Convert to Float for Game Logic)
            if (window.onBalanceUpdate) {
                window.onBalanceUpdate(this.balance.amount / API_MULTIPLIER);
            }
        });

        // Round active state events
        window.addEventListener('roundActive', (event) => {
            const customEvent = event;
            this.roundActive = customEvent.detail.active;
            console.log('[StakeAdapter] Round active:', this.roundActive);

            // Dispatch to game
            if (window.onRoundStateChange) {
                window.onRoundStateChange(this.roundActive);
            }
        });
    }

    /**
     * Authenticate with Stake Engine
     * @returns {Promise<Object>} Authentication response
     */
    async authenticate() {
        if (!this.rgsClient) {
            console.warn('[StakeAdapter] No RGS client, using mock auth');
            this.isAuthenticated = true;
            return { success: true, mock: true };
        }

        try {
            const response = await this.rgsClient.Authenticate();
            this.isAuthenticated = true;

            // Capture RGS configuration from ts-client response (config)
            const config = response.config || response.configuration || response;

            if (config) {
                this.rgsConfig.minBet = config.minBet ?? config.min_bet ?? this.rgsConfig.minBet;
                this.rgsConfig.maxBet = config.maxBet ?? config.max_bet ?? this.rgsConfig.maxBet;
                this.rgsConfig.defaultBet = config.defaultBet ?? config.default_bet ?? this.rgsConfig.defaultBet;

                // Sensitivity: some RGS versions use defaultBetLevel as an index or a value
                if (config.defaultBetLevel !== undefined && typeof config.defaultBetLevel === 'number' && config.betLevels) {
                    this.rgsConfig.defaultBet = config.betLevels[config.defaultBetLevel] || config.defaultBetLevel;
                }

                // betLevels from RGS are in micro-units — convert to dollars for snapToBetLevel
                const rawLevels = config.betLevels || config.available_bet_levels || null;
                if (rawLevels && rawLevels.length > 0) {
                    // If values look like micro-units (> 1000), convert to dollars
                    this.rgsConfig.betLevels = rawLevels[0] > 1000
                        ? rawLevels.map(v => v / API_MULTIPLIER)
                        : rawLevels;
                }
            }

            console.log('[StakeAdapter] Authenticated. RGS Config:', this.rgsConfig);

            // Close any stale round from a previous session
            if (response.round && response.round.active) {
                console.log('[StakeAdapter] Found active round from previous session, closing it...');
                try {
                    // FIX: Must pass round_id to EndRound
                    await this.rgsClient.EndRound({ round_id: response.round.id });
                    console.log('[StakeAdapter] Stale round closed successfully.');
                } catch (err) {
                    console.warn('[StakeAdapter] Failed to close stale round:', err);
                }
            }

            return response;
        } catch (e) {
            console.error('[StakeAdapter] Auth failed:', e);
            throw e;
        }
    }


    /**
     * Snap a bet amount to the nearest valid RGS bet level.
     * The RGS enforces strict bet levels — any other value will be rejected.
     */
    snapToBetLevel(amount) {
        const levels = this.rgsConfig.betLevels;
        let closest = levels[0];
        let minDiff = Math.abs(amount - levels[0]);
        for (const level of levels) {
            const diff = Math.abs(amount - level);
            if (diff < minDiff) {
                minDiff = diff;
                closest = level;
            }
        }
        if (closest !== amount) {
            console.warn(`[StakeAdapter] Bet $${amount} snapped to nearest valid level $${closest}`);
        }
        return closest;
    }

    /**
     * Play a round
     * @param {number} amount - Bet amount (will be multiplied by API_MULTIPLIER)
     * @param {string} risk - Game mode (e.g., 'medium', 'high', etc.)
     * @param {Object} metadata - Extra data (picks, superball, etc.)
     * @returns {Promise<Object>} Play response with result data
     */
    async play(amount, risk, nonce, metadata = {}) {
        if (!this.rgsClient) {
            // FALLBACK: HTTPS Fetch to Local Server (server.py)
            if (this.serverAvailable === false) {
                return { success: true, mock: true };
            }
            try {
                // 1. Deduct Bet (Client-side wallet simulation)
                const betInt = Math.round(amount * API_MULTIPLIER);
                this.balance.amount -= betInt;

                // 2. Call Server
                const response = await fetch('/play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        picks: metadata.picks,
                        bet: amount,
                        risk: risk,
                        use_superball: metadata.superball,
                        nonce: nonce
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }

                const result = await response.json();

                // 3. Handle Win
                const winAmount = result.final_payout || 0;
                if (winAmount > 0) {
                    this.balance.amount += Math.round(winAmount * API_MULTIPLIER);
                }

                // 4. Notify Frontend
                if (window.onBalanceUpdate) {
                    window.onBalanceUpdate(this.balance.amount / API_MULTIPLIER);
                }

                // 5. Return Outcome
                return {
                    outcome: result,
                    balance: this.balance
                };

            } catch (err) {
                console.warn('[StakeAdapter] Local server connection failed:', err);
                console.warn('[StakeAdapter] Falling back to pure local MOCK generation.');
                this.serverAvailable = false;
                return { success: true, mock: true };
            }
        }

        if (!this.isAuthenticated) {
            await this.authenticate();
        }

        try {
            // Snap to nearest valid RGS bet level before sending
            const snappedAmount = this.snapToBetLevel(amount);
            // Stake Engine Standard Request Schema
            const response = await this.rgsClient.Play({
                amount: Math.round(snappedAmount * API_MULTIPLIER),
                mode: risk
            });

            // Verify connection and response
            console.log('[StakeAdapter] Play Response:', response);

            // Capture round_id
            if (response.round_id) {
                this.currentRoundId = response.round_id;
            } else if (response.round && response.round.id) {
                this.currentRoundId = response.round.id;
            } else if (response.round && response.round.betID) {
                this.currentRoundId = response.round.betID;
            } else {
                console.warn('[StakeAdapter] Play response missing round_id! EndRound may fail.', response);
            }

            return response;
        } catch (e) {
            // AUTO-RECOVERY for "Round already active"
            const errStr = (e.message || e.code || e).toString();

            if (errStr.includes('active') || errStr.includes('EndRound') || errStr === 'ERR_RA') {
                console.warn('[StakeAdapter] Round state mismatch detected. Attempting auto-recovery...');
                try {
                    // Re-authenticate (this closes stale rounds now!)
                    await this.authenticate();

                    console.log('[StakeAdapter] Recovery successful. Retrying Play...');
                    // Retry Play ONCE
                    const retryResponse = await this.rgsClient.Play({
                        amount: Math.round(this.snapToBetLevel(amount) * API_MULTIPLIER),
                        mode: risk
                    });

                    if (retryResponse.round_id) {
                        this.currentRoundId = retryResponse.round_id;
                    }
                    return retryResponse;
                } catch (retryErr) {
                    console.error('[StakeAdapter] Auto-recovery failed:', retryErr);
                    this._handleRgsError(retryErr);
                    throw retryErr;
                }
            }
            // Only log actual unhandled errors
            this._handleRgsError(e);
            throw e;
        }
    }

    /**
     * End the current round
     * @returns {Promise<Object>} EndRound response
     */
    async endRound() {
        if (!this.rgsClient || !this.currentRoundId) {
            return { success: true, mock: true };
        }

        try {
            const response = await this.rgsClient.EndRound({
                round_id: this.currentRoundId
            });
            this.currentRoundId = null;
            return response;
        } catch (e) {
            this._handleRgsError(e);
            throw e;
        }
    }

    _handleRgsError(e) {
        const code = e.code || e.message;
        const errorMap = {
            'ERR_IPB': 'Insufficient Player Balance',
            'ERR_IS': 'Session Expired. Please refresh.',
            'ERR_VAL': 'Invalid Bet Parameters',
            'ERR_GLE': 'Gambling Limits Exceeded',
            'ERR_MAINTENANCE': 'System Maintenance in progress'
        };

        const msg = errorMap[code] || `RGS Error: ${code}`;
        console.error('[StakeAdapter] Request Failed:', msg);

        // Notify UI via alert or custom event if needed
        if (code === 'ERR_IS') {
            alert("Session Expired - Re-authenticating...");
            window.location.reload();
        }
    }

    /**
     * Formats a number with its currency symbol, respecting default decimals and symbol placement.
     * The function is intended to be used for displaying balances.
     */
    displayBalance(balance, options = {}) {
        // Source: Stake SDK Documentation
        const CurrencyMeta = {
            USD: { symbol: '$', decimals: 2 },
            CAD: { symbol: 'CA$', decimals: 2 },
            JPY: { symbol: '¥', decimals: 0 },
            EUR: { symbol: '€', decimals: 2 },
            RUB: { symbol: '₽', decimals: 2 },
            CNY: { symbol: 'CN¥', decimals: 2 },
            PHP: { symbol: '₱', decimals: 2 },
            INR: { symbol: '₹', decimals: 2 },
            IDR: { symbol: 'Rp', decimals: 0 },
            KRW: { symbol: '₩', decimals: 0 },
            BRL: { symbol: 'R$', decimals: 2 },
            MXN: { symbol: 'MX$', decimals: 2 },
            DKK: { symbol: 'KR', decimals: 2, symbolAfter: true },
            PLN: { symbol: 'zł', decimals: 2, symbolAfter: true },
            VND: { symbol: '₫', decimals: 0, symbolAfter: true },
            TRY: { symbol: '₺', decimals: 2 },
            CLP: { symbol: 'CLP', decimals: 0, symbolAfter: true },
            ARS: { symbol: 'ARS', decimals: 2, symbolAfter: true },
            PEN: { symbol: 'S/', decimals: 2, symbolAfter: true },
            XGC: { symbol: 'GC', decimals: 2 },
            XSC: { symbol: 'SC', decimals: 2 },
        };

        const meta = CurrencyMeta[balance.currency] ?? {
            symbol: balance.currency,
            decimals: 2,
            symbolAfter: true,
        };

        // Convert integer amount to float for display
        const val = (balance.amount || 0) / API_MULTIPLIER;
        const formattedAmount = val.toFixed(meta.decimals);

        if (meta.symbolAfter) {
            return `${formattedAmount} ${meta.symbol}`;
        } else {
            return `${meta.symbol}${formattedAmount}`;
        }
    }

    /**
     * Get current balance
     * @returns {Object} Current balance
     */
    getBalance() {
        // Return raw balance object (Integer)
        // Or if game expects float, helper helper? 
        // Best to return the object as 'ts-client' does, game handles it via displayBalance or / multiplier
        // But for consistency with onBalanceUpdate, let's keep this raw but be aware.
        return this.balance;
    }

    getFloatBalance() {
        return (this.balance.amount || 0) / API_MULTIPLIER;
    }

    /**
     * Check if currently in an active round
     * @returns {boolean} Round active state
     */
    isRoundActive() {
        return this.roundActive;
    }

    /**
     * Helper for demo/testing: Reload mock funds
     * @param {number} amount - Float amount to add
     */
    reloadMockFunds(amount = 1000) {
        if (this.rgsClient) return; // Only for mock
        this.balance.amount += amount * API_MULTIPLIER;
        console.log('[StakeAdapter] Mock funds reloaded:', this.balance);
        if (window.onBalanceUpdate) {
            window.onBalanceUpdate(this.balance.amount / API_MULTIPLIER);
        }
    }
}

// Export for use in game.js
window.StakeEngineAdapter = StakeEngineAdapter;
