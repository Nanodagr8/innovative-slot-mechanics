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
     * Calculate Cluster Wins (Adjacent matching symbols)
     * @param {Array<Array<string>>} board 
     * @param {number} bet 
     * @returns {Object} { totalWin, winningClusters: [{symbol, count, coords: [{r,c}]}] }
     */
    calculateClusterWins(board, bet) {
        const rows = this.numRows;
        const cols = this.numReels;
        const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
        const clusters = [];
        let totalWin = 0;

        const payouts = {
            'LOW': 0.2, 'MEDIUM': 0.5, 'HIGH': 1.5,
            'WILD': 5.0, 'SUPER': 10.0, 'SCATTER': 50.0
        };

        // Helper to find connected component
        const getCluster = (r, c, symbol) => {
            const queue = [{ r, c }];
            const coords = [];
            visited[r][c] = true;

            while (queue.length > 0) {
                const curr = queue.pop();
                coords.push(curr);

                // Check 4 directions
                const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                for (const [dr, dc] of dirs) {
                    const nr = curr.r + dr;
                    const nc = curr.c + dc;

                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
                        const neighborSym = board[nr][nc];
                        // Match specific symbol or if current is WILD (taking neighbor identity) or neighbor is WILD
                        // For simplicity in demo: Wild matches everything, but lets prioritize exact matches
                        if (neighborSym === symbol || neighborSym === 'WILD' || symbol === 'WILD') {
                            // Complexity: If starting symbol was WILD, it adopts the first non-wild neighbor
                            // Simplified: Just stricter matching
                            if (neighborSym === symbol || symbol === 'WILD' && neighborSym !== 'SCATTER') {
                                visited[nr][nc] = true;
                                queue.push({ r: nr, c: nc });
                            }
                        }
                    }
                }
            }
            return coords;
        };

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!visited[r][c]) {
                    const symbol = board[r][c];
                    // Don't start clusters on Wilds for simplicity, let them be picked up
                    // actually, a cluster of Wilds is valid.

                    const clusterCoords = getCluster(r, c, symbol);

                    if (clusterCoords.length >= 4) { // Min 4 for cluster
                        const multiplier = (payouts[symbol] || 0.1) * (clusterCoords.length - 3);
                        const win = bet * multiplier;
                        totalWin += win;

                        clusters.push({
                            symbol: symbol,
                            count: clusterCoords.length,
                            amount: win,
                            coords: clusterCoords
                        });
                    }
                }
            }
        }

        return { totalWin, winningLines: clusters, type: 'cluster' };
    }

    /**
     * Calculate Line Wins with precise coordinates
     */
    calculateLineWins(board, bet) {
        let totalWin = 0;
        const winningLines = [];
        const payouts = {
            'LOW': 0.5, 'MEDIUM': 2, 'HIGH': 5,
            'WILD': 10, 'SUPER': 50, 'SCATTER': 100
        };

        for (let r = 0; r < this.numRows; r++) {
            const row = board[r];
            let matchCount = 1;
            let currentSymbol = row[0];
            const coords = [{ r: r, c: 0 }];

            for (let c = 1; c < this.numReels; c++) {
                const sym = row[c];
                if (sym === currentSymbol || sym === 'WILD' || currentSymbol === 'WILD') {
                    matchCount++;
                    coords.push({ r: r, c: c });
                    if (currentSymbol === 'WILD' && sym !== 'WILD') {
                        currentSymbol = sym;
                    }
                } else {
                    break;
                }
            }

            if (matchCount >= 3) {
                let payoutSymbol = row[0] === 'WILD' ?
                    (row.find(s => s !== 'WILD') || 'WILD') : row[0];

                const multiplier = payouts[payoutSymbol] * (matchCount - 2);
                const winAmount = bet * multiplier;
                totalWin += winAmount;

                if (winAmount > 0) {
                    winningLines.push({
                        row: r, // Legacy support
                        coords: coords, // New precise support
                        count: matchCount,
                        amount: winAmount,
                        symbol: payoutSymbol
                    });
                }
            }
        }
        return { totalWin, winningLines, type: 'line' };
    }

    /**
     * Calculate 243 Ways to Win (Any adjacent symbol from Left to Right)
     */
    calculateWaysWins(board, bet) {
        let totalWin = 0;
        const winningLines = [];
        const payouts = {
            'LOW': 0.1, 'MEDIUM': 0.3, 'HIGH': 1.0,
            'WILD': 2.0, 'SUPER': 5.0, 'SCATTER': 0
        };

        // Determine matching columns for each symbol starting from Reel 1
        const symbolsToCheck = [...new Set(board.map(row => row[0]))]; // Unique start symbols

        symbolsToCheck.forEach(symbol => {
            if (symbol === 'SCATTER') return; // Handled separately

            // Ways logic: count symbols per reel
            let counts = [];
            let coords = [];

            for (let c = 0; c < this.numReels; c++) {
                let count = 0;
                let reelCoords = [];
                for (let r = 0; r < this.numRows; r++) {
                    const cellSym = board[r][c];
                    if (cellSym === symbol || cellSym === 'WILD') {
                        count++;
                        reelCoords.push({ r, c });
                    }
                }
                if (count > 0) {
                    counts.push(count);
                    coords = coords.concat(reelCoords);
                } else {
                    break; // Connection broken
                }
            }

            if (counts.length >= 3) {
                const ways = counts.reduce((a, b) => a * b, 1);
                const multiplier = payouts[symbol] || 0.1;
                const winAmount = bet * multiplier * ways * (counts.length - 2); // Simple Ways formula
                totalWin += winAmount;

                winningLines.push({
                    symbol: symbol,
                    count: counts.length, // Number of reels connected
                    ways: ways,
                    amount: winAmount,
                    coords: coords
                });
            }
        });

        return { totalWin, winningLines, type: 'ways' };
    }

    calculateScatterWins(board, bet) {
        let count = 0;
        let coords = [];

        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numReels; c++) {
                if (board[r][c] === 'SCATTER') {
                    count++;
                    coords.push({ r, c });
                }
            }
        }

        let win = 0;
        if (count >= 3) win = bet * Math.pow(2, count - 1); // 3->4x, 4->8x, 5->16x

        return {
            totalWin: win,
            winningLines: win > 0 ? [{ symbol: 'SCATTER', count, amount: win, coords }] : [],
            type: 'scatter'
        };
    }

    calculateWin(board, bet, type = 'line') {
        if (type === 'cluster') return this.calculateClusterWins(board, bet);
        if (type === 'ways') return this.calculateWaysWins(board, bet);

        // Default to lines, but check scatters too usually
        // For this demo, let's keep them separate calls or merged if needed.
        // Returning just the requested type for now.
        return this.calculateLineWins(board, bet);
    }
}
