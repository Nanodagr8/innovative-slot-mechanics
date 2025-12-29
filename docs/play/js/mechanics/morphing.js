/**
 * Morphing Mechanic - Enhanced (Neighbor Influence)
 * Winning lines cause NEIGHBORS to morph into matching symbols, creating larger wins.
 */

class MorphingMechanic {
    constructor() {
        this.states = ['BASIC', 'ENHANCED', 'PREMIUM', 'ELITE', 'LEGENDARY'];
        this.triggerRate = 0.30;
        // Assuming board dimensions are consistent, these can be set dynamically or passed
        this.numRows = 5; // Example value, adjust as needed
        this.numReels = 3; // Example value, adjust as needed
    }

    processSpin(board, bet, engine) {
        // Line wins trigger morphing of neighbors
        const winResult = engine.calculateWin(board, bet, 'line');
        const wins = winResult.winningLines;

        if (wins.length === 0) {
            return { triggered: false };
        }

        const winningSymbols = [];
        wins.forEach(win => {
            win.coords.forEach(c => winningSymbols.push({ r: c.r, c: c.c, symbol: win.symbol }));
        });

        const newBoard = board.map(row => [...row]);        // Initialize new board
        const events = [];
        let morphCount = 0;
        let bonusTriggered = false;

        // Cellular Automata Rule Application
        // Iterate through every cell (except borders for simplicity in demo)
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[0].length; c++) {
                const currentSym = board[r][c];
                const neighbors = this.getNeighbors(r, c, board);
                const winningNeighbors = neighbors.filter(n =>
                    winningSymbols.some(ws => ws.r === n.r && ws.c === n.c)
                );

                // Rule 1 (Growth): 3+ Winning Neighbors -> Morph to Winner
                // Rule 2 (Stability): 2 Winning Neighbors -> Unchanged (omitted as it's default)
                // Rule 3 (Fluid Dynamics Interaction): 4 identical neighbors in loop (Bonus)

                if (winningNeighbors.length >= 2) { // Relaxed to 2 for demo playability
                    // Find dominant neighbor symbol
                    // For simplicity, taking the symbol of the first winning neighbor found
                    const targetSymbol = winningNeighbors[0].symbol;

                    if (currentSym !== targetSymbol && currentSym !== 'SCATTER') { // Don't morph scatters
                        newBoard[r][c] = targetSymbol;
                        morphCount++;
                        events.push({ r, c, from: currentSym, to: targetSymbol });
                    }
                }
            }
        }

        // Bonus Check: Fluid Dynamics
        // If 4 identical symbols form a 2x2 square anywhere
        if (morphCount > 5) { // Example condition for bonus trigger
            bonusTriggered = true;
        }

        if (morphCount === 0) return { triggered: false };

        return {
            triggered: true,
            board: newBoard,
            multiplier: 1.0,
            logMessage: `MORPH: ${morphCount} neighbors morphed! ${bonusTriggered ? '💧 FLUID DYNAMICS BONUS!' : ''}`,
            visualization: this.createVisualization(events),
            animation: {
                type: 'morph',
                subtype: bonusTriggered ? 'singularity' : 'normal', // Reuse singularity anim for now or create distinct one
                coords: events.map(e => ({ r: e.r, c: e.c }))
            }
        };
    }

    getNeighbors(r, c, board) {
        const maxR = board.length;
        const maxC = board[0].length;
        const dirs = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        const neighbors = [];
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < maxR && nc >= 0 && nc < maxC) {
                neighbors.push({ r: nr, c: nc });
            }
        }
        return neighbors;
    }

    createVisualization(events) {
        let html = '<div class="mech-log">';
        html += '<p><strong>Neighbor Morphing:</strong></p>';
        html += `<div>${events.length} symbols morphed to extend lines!</div>`;
        html += '</div>';
        return html;
    }
}
