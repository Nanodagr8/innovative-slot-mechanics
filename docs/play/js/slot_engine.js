/**
 * Base Slot Engine
 * Handles core slot machine logic: spinning, board generation, and basic win calculation.
 */

class SlotEngine {
    constructor(numReels = 5, numRows = 3) {
        this.numReels = numReels;
        this.numRows = numRows;
        this.symbols = ['LOW', 'MEDIUM', 'HIGH', 'WILD', 'SUPER', 'SCATTER'];
        this.board = [];
    }

    /**
     * Initialize/Reset the board
     * @returns {Array<Array<string>>} Initial 5x3 board
     */
    initBoard() {
        this.board = Array(this.numRows).fill(null).map(() =>
            Array(this.numReels).fill('LOW')
        );
        return this.board;
    }

    /**
     * Generate a new random board
     * @returns {Array<Array<string>>} New board state
     */
    spin() {
        this.board = [];
        for (let r = 0; r < this.numRows; r++) {
            const row = [];
            for (let c = 0; c < this.numReels; c++) {
                row.push(this.getRandomSymbol());
            }
            this.board.push(row);
        }
        return this.board;
    }

    /**
     * Get a random symbol based on weights
     * @returns {string} Symbol name
     */
    getRandomSymbol() {
        const rand = Math.random();
        // Simple weights for demo purposes
        if (rand < 0.40) return 'LOW';
        if (rand < 0.70) return 'MEDIUM';
        if (rand < 0.85) return 'HIGH';
        if (rand < 0.95) return 'WILD';
        if (rand < 0.98) return 'SUPER';
        return 'SCATTER';
    }

    /**
     * Calculate basic wins (3+ matching symbols on a row)
     * Simplified evaluation for the demo
     * @param {Array<Array<string>>} board 
     * @param {number} bet Amount wagered
     * @returns {Object} Win result { totalWin, winningLines }
     */
    calculateWin(board, bet) {
        let totalWin = 0;
        const winningLines = [];
        const payouts = {
            'LOW': 0.5, 'MEDIUM': 2, 'HIGH': 5,
            'WILD': 10, 'SUPER': 50, 'SCATTER': 100
        };

        // Check horizontal lines (simplified paylines)
        for (let r = 0; r < this.numRows; r++) {
            const row = board[r];
            let matchCount = 1;
            let currentSymbol = row[0];
            let hasWild = currentSymbol === 'WILD';

            for (let c = 1; c < this.numReels; c++) {
                const sym = row[c];
                if (sym === currentSymbol || sym === 'WILD' || currentSymbol === 'WILD') {
                    matchCount++;
                    if (currentSymbol === 'WILD' && sym !== 'WILD') {
                        currentSymbol = sym; // Resolve wild to specific symbol
                    }
                } else {
                    break;
                }
            }

            if (matchCount >= 3) {
                // Determine payout symbol (if first is wild, use next non-wild or just wild)
                let payoutSymbol = row[0];
                if (payoutSymbol === 'WILD') {
                    // Find first non-wild
                    const nonWild = row.slice(0, matchCount).find(s => s !== 'WILD');
                    payoutSymbol = nonWild || 'WILD';
                }

                const multiplier = payouts[payoutSymbol] * (matchCount - 2); // Simple scaling
                const winAmount = bet * multiplier;
                totalWin += winAmount;

                if (winAmount > 0) {
                    winningLines.push({
                        row: r,
                        count: matchCount,
                        amount: winAmount,
                        symbol: payoutSymbol
                    });
                }
            }
        }

        return { totalWin, winningLines };
    }
}
