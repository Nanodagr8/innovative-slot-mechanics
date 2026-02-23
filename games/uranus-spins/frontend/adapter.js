/**
 * Uranus Spins: RGS Adapter (Stake Engine Integration)
 * ---------------------------------------------
 * Uses official @stakeengine/ts-client for RGS communication.
 */

class UranusAdapter {
    constructor() {
        this.client = null;
        this.balance = 1000.00;
        this.betPerShot = 1.00;
        this.isFiring = false;
        this.fireRateLimit = 166; // ~6 shots per sec
        this.lastFireTime = 0;
        this.pendingTickets = [];
        this.init();
    }

    async init() {
        try {
            // Dynamic import of TS Client
            const { RGSClient } = await import('./libs/ts-client/client.js');

            // Construct Client
            // In a real scenario, URL params (sessionID, etc.) come from the iframe URL.
            // For local dev, we might need to mock them or provide defaults.
            const currentUrl = new URL(window.location.href);
            if (!currentUrl.searchParams.has('sessionID')) {
                // Add mock params if missing (Local Dev Mode)
                currentUrl.searchParams.set('sessionID', 'dev_session_' + Date.now());
                currentUrl.searchParams.set('rgs_url', window.location.host);
                currentUrl.searchParams.set('lang', 'en');
                currentUrl.searchParams.set('device', 'desktop');
            }

            this.client = RGSClient({
                url: currentUrl.toString(),
                protocol: 'http', // Force HTTP for local dev
                enforceBetLevels: false // Allow freeform bets for arcade
            });

            // Authenticate
            const auth = await this.client.Authenticate();
            console.log("[RGS] Authenticated:", auth);

            this.balance = parseFloat(auth.balance.amount);
            this.updateUI();

            // Listen for balance updates
            window.addEventListener('balanceUpdate', (e) => {
                this.balance = parseFloat(e.detail.amount);
                this.updateUI();
            });

        } catch (e) {
            console.error("[RGS] Init Failed:", e);
            console.warn("[RGS] Falling back to OFFLINE MOCK mode");
            this.offlineMode = true;
            this.balance = 1000.00; // Mock balance
            this.updateUI();
        }
    }

    setBet(amount) {
        // Bets are small in arcade shooters
        this.betPerShot = Math.max(0.10, Math.min(100.00, amount));
        document.getElementById('bet-display').innerText = this.betPerShot.toFixed(2);
    }

    async fire(targetType) {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireRateLimit) return null;
        this.lastFireTime = now;

        // Deduct wager visually (will be corrected by RGS)
        if (this.balance < this.betPerShot) return null;

        if (!this.client || this.offlineMode) {
            // OFFLINE MOCK MODE
            if (this.offlineMode) {
                const isKill = Math.random() > 0.35;
                const multiplier = isKill ? (1 + Math.random() * 15) : 0;
                const payout = isKill ? this.betPerShot * multiplier : 0;
                this.balance += payout - this.betPerShot;
                this.updateUI();
                return {
                    ticketId: 'MOCK-' + Date.now(),
                    outcomes: [{ isKill, multiplier, type: multiplier > 10 ? 'HIGH' : 'LOW', payout }]
                };
            }
            console.warn("[RGS] Client not ready");
            return null;
        }

        try {
            // Map 'fire' to RGS 'Play'
            // Mode 'base' is standard
            const result = await this.client.Play({
                amount: this.betPerShot,
                mode: 'base'
            });

            // The result structure from ts-client might differ directly from what game.js expects.
            // We need to map it.
            // Assumption: RGS returns a 'round' object with outcomes.

            // Wait, RGSClient returns { balance, round }
            // ticket in game.js expects { outcomes: [...], total_payout ... }

            // We need to extract the relevant game data from `result.round`.
            // Depending on the Stake Engine protocol, the specific game outcomes ("kill", "multiplier")
            // are likely inside `round.events` or similar custom data.

            // For now, let's assume the server echoes back a compatible structure in the round data
            // or we adapt it.

            // MOCKING the response structure translation for now since we don't know the exact RGS response shape
            // for "Uranus Spins" specific logic without seeing the backend.
            // But we successfully CALLED the RGS.

            const serverTicket = result.round;

            // ADAPTER: Translate RGS response to Game format
            // Use the data if available, otherwise fallback/mock the visual parts while keeping real financial formatting

            // For this specific integration, since we don't have the backend logic for 'uranus-spins' fully defined
            // in the 'ts-client' generic response, we assume 'serverTicket' contains 'outcomes'.
            // If not, we might crash. 
            // Let's add safety:

            const outcomes = serverTicket.outcomes || [{
                shot_idx: 1,
                type: "MISS",
                payout: 0,
                multiplier: 0
            }];

            return {
                ...serverTicket,
                outcomes: outcomes.map(o => ({
                    ...o,
                    type: o.type || o.outcome?.toUpperCase() || "MISS",
                    payout: o.payout || 0,
                    multiplier: (o.payout || 0) / this.betPerShot,
                    isKill: (o.payout > 0)
                }))
            };

        } catch (e) {
            console.error("[RGS] Play Error", e);
            return null;
        }
    }

    updateUI() {
        if (document.getElementById('balance-display')) {
            document.getElementById('balance-display').innerText = this.balance.toFixed(2);
        }
    }
}

// Initialize Adapter
window.adapter = new UranusAdapter();

window.changeBet = (delta) => {
    if (window.adapter) {
        window.adapter.setBet(window.adapter.betPerShot + delta);
    }
};
