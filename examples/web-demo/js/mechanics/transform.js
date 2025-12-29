/**
 * Transform Mechanic (Markov Chains) for Web Demo
 */

class TransformMechanic {
    constructor() {
        this.states = ['LOW', 'MEDIUM', 'HIGH', 'WILD', 'SUPER'];

        // Transition Matrix (same as Python)
        this.transitionMatrix = [
            [0.70, 0.20, 0.08, 0.015, 0.005],  // LOW
            [0.10, 0.60, 0.25, 0.040, 0.010],  // MEDIUM
            [0.05, 0.15, 0.65, 0.100, 0.050],  // HIGH
            [0.02, 0.08, 0.20, 0.600, 0.100],  // WILD
            [0.00, 0.00, 0.10, 0.200, 0.700]   // SUPER
        ];

        this.transformRate = 0.50; // Chance per symbol
        this.triggerRate = 0.20; // Chance to trigger mechanic
    }

    processSpin(board, bet) {
        // Trigger check
        if (Math.random() > this.triggerRate) {
            return { triggered: false };
        }

        const newBoard = board.map(row => [...row]); // Deep copy
        const events = [];
        let transformCount = 0;

        newBoard.forEach((row, rIdx) => {
            row.forEach((symbol, cIdx) => {
                if (Math.random() < this.transformRate && symbol !== 'SCATTER') {
                    const newState = this.transformSymbol(symbol);
                    if (newState !== symbol) {
                        newBoard[rIdx][cIdx] = newState;
                        transformCount++;
                        events.push({ r: rIdx, c: cIdx, from: symbol, to: newState });
                    }
                }
            });
        });

        if (transformCount === 0) return { triggered: false };

        return {
            triggered: true,
            board: newBoard, // Return transformed board
            logMessage: `Transform Matrix Active! ${transformCount} symbols changed states.`,
            visualization: this.createVisualization(events)
        };
    }

    transformSymbol(currentSymbol) {
        const stateIdx = this.states.indexOf(currentSymbol);
        if (stateIdx === -1) return currentSymbol;

        const probs = this.transitionMatrix[stateIdx];
        const rand = Math.random();
        let cumulative = 0;

        for (let i = 0; i < probs.length; i++) {
            cumulative += probs[i];
            if (rand < cumulative) {
                return this.states[i];
            }
        }
        return this.states[this.states.length - 1];
    }

    createVisualization(events) {
        let html = '<div class="mech-log">';
        html += '<p><strong>Markov Chain Transitions:</strong></p>';
        html += '<ul>';
        events.slice(0, 5).forEach(e => {
            html += `<li>[${e.r},${e.c}] ${e.from} ➔ <strong>${e.to}</strong></li>`;
        });
        if (events.length > 5) html += `<li>...and ${events.length - 5} more</li>`;
        html += '</ul></div>';

        // Add Matrix Visualization
        html += '<div style="margin-top:10px; font-size: 0.8em; opacity: 0.8;">';
        html += 'Transition Probabilities (Active):';
        html += '<div class="matrix-grid" style="margin-top:5px;">';
        // Header
        this.states.forEach(s => html += `<div class="matrix-cell matrix-header">${s.charAt(0)}</div>`);
        // Rows (simplified visualization)
        this.transitionMatrix.forEach((row, idx) => {
            row.forEach(prob => {
                const intense = Math.floor(prob * 255);
                const color = `rgba(0, 255, 0, ${prob})`;
                html += `<div class="matrix-cell" style="background:${color}; color:${prob > 0.5 ? 'black' : 'white'}">${prob.toFixed(2)}</div>`;
            });
        });
        html += '</div></div>';

        return html;
    }
}
