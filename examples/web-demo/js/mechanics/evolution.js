/**
 * Evolution Mechanic (Fibonacci) for Web Demo
 */

class EvolutionMechanic {
    constructor() {
        this.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        this.triggerRate = 0.10;
        // In this demo, we'll simulate persistent levels for a session
        this.symbolLevels = {}; // symbol -> level
    }

    processSpin(board, bet) {
        // Trigger check
        if (Math.random() > this.triggerRate) {
            return { triggered: false };
        }

        const events = [];
        let totalMultiplier = 1.0;

        // Evolve random symbols present on board
        const uniqueSymbols = [...new Set(board.flat())].filter(s => s !== 'SCATTER');

        uniqueSymbols.forEach(sym => {
            if (!this.symbolLevels[sym]) this.symbolLevels[sym] = 0;

            // Evolution chance based on Golden Ratio decay
            const currentLevel = this.symbolLevels[sym];
            const prob = 0.50 / Math.pow(1.618, currentLevel);

            if (Math.random() < prob && currentLevel < 10) {
                this.symbolLevels[sym]++;
                const newLevel = this.symbolLevels[sym];
                const multiplier = this.fibonacci[newLevel];

                events.push({ symbol: sym, level: newLevel, mult: multiplier });
                totalMultiplier += (multiplier * 0.1); // Additive bonus for demo balance
            }
        });

        if (events.length === 0) return { triggered: false };

        return {
            triggered: true,
            multiplier: Math.max(1, totalMultiplier),
            logMessage: `Evolution! ${events.length} symbols evolved to higher Fibonacci levels.`,
            visualization: this.createVisualization(events)
        };
    }

    createVisualization(events) {
        let html = '<div class="mech-log">';
        html += '<p><strong>Evolution Progress:</strong></p>';

        events.forEach(e => {
            const width = (e.level / 10) * 100;
            html += `<div style="margin-bottom: 5px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8em;">
                    <span>${e.symbol} (Lvl ${e.level})</span>
                    <span style="color:#FFD700">${e.mult}x</span>
                </div>
                <div style="background:#333; height:4px; border-radius:2px;">
                    <div style="background:#4CAF50; width:${width}%; height:100%;"></div>
                </div>
            </div>`;
        });

        html += '</div>';
        return html;
    }
}
