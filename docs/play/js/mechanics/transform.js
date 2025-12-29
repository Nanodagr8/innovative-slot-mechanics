/**
 * Transform Mechanic - Enhanced (Win-Based)
 * Winning symbols transform into the NEXT tier symbol for potential chain reactions.
 */

class TransformMechanic {
    constructor() {
        this.states = ['LOW', 'MEDIUM', 'HIGH', 'WILD', 'SUPER'];
        // Trigger on WINS, not random chance
    }

    /**
     * Process Logic:
     * 1. Check for Wins on current board.
     * 2. If wins exist, TRANSFORM winning symbols to next tier.
     * 3. Return new board.
     */
    processSpin(board, bet, engine) {
        // 1. Check Wins first (using Engine)
        // We use engine to check 'line' wins for Transform
        const winResult = engine.calculateWin(board, bet, 'line');
        const winningLines = winResult.winningLines;

        if (winningLines.length === 0) {
            return { triggered: false };
        }

        const newBoard = board.map(row => [...row]); // Deep copy
        const events = [];
        let transformCount = 0;

        // 2. Transform Winning Symbols
        winningLines.forEach(line => {
            const coords = line.coords || []; // Support new coord system

            coords.forEach(coord => {
                const { r, c } = coord;
                const symbol = newBoard[r][c];

                // Transform logic: Upgrade symbol
                const newState = this.getNextState(symbol);

                if (newState !== symbol) {
                    newBoard[r][c] = newState;
                    transformCount++;
                    events.push({ r, c, from: symbol, to: newState });
                }
            });
        });

        // Dynamic Matrix Adjustment (Volatility Dampening)
        // Adjusts probabilities slightly based on transform count to prevent runaway feedback loops
        const dampeningFactor = transformCount > 5 ? 0.9 : 1.0;

        // Singularity Bonus Check
        // Trigger: 3+ SUPER symbols created in one spin
        const superCount = events.filter(e => e.to === 'SUPER').length;
        let singularityTriggered = false;

        if (superCount >= 3) {
            singularityTriggered = true;
            // Force convert remaining LOWs to HIGHs
            newBoard.forEach((row, r) => {
                row.forEach((sym, c) => {
                    if (sym === 'LOW') {
                        newBoard[r][c] = 'HIGH';
                        events.push({ r, c, from: 'LOW', to: 'HIGH (Singularity)' });
                    }
                });
            });
        }

        if (transformCount === 0) return { triggered: false };

        return {
            triggered: true,
            board: newBoard,
            multiplier: dampeningFactor,
            logMessage: `TRANSFORM: ${transformCount} symbols upgraded! ${singularityTriggered ? '🌌 SINGULARITY BONUS TRIGGERED!' : ''}`,
            visualization: this.createVisualization(events),
            animation: {
                type: 'transform',
                subtype: singularityTriggered ? 'singularity' : 'normal',
                coords: events.map(e => ({ r: e.r, c: e.c }))
            }
        };
    }

    getNextState(symbol) {
        const stateIdx = this.states.indexOf(symbol);
        if (stateIdx === -1 || stateIdx === this.states.length - 1) return symbol;
        return this.states[stateIdx + 1];
    }

    createVisualization(events) {
        let html = '<div class="mech-log">';
        html += '<p><strong>Winning Symbols Transformed:</strong></p>';
        html += '<ul>';
        events.slice(0, 5).forEach(e => {
            html += `<li>[${e.r},${e.c}] ${e.from} ➔ <strong>${e.to}</strong></li>`;
        });
        html += '</ul></div>';
        return html;
    }
}
