/**
 * Evolution Mechanic - Enhanced (Cluster-Based)
 * Winning CLUSTERS evolve their symbols to higher Fibonacci levels.
 */

class EvolutionMechanic {
    constructor() {
        this.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        this.symbolLevels = {}; // Persistent level tracking
    }

    processSpin(board, bet, engine) {
        // Use CLUSTER evaluation for Evolution
        const winResult = engine.calculateWin(board, bet, 'cluster');
        const clusters = winResult.winningLines;

        if (clusters.length === 0) {
            return { triggered: false };
        }

        const events = [];
        let totalMultiplier = 1.0;

        clusters.forEach(cluster => {
            cluster.coords.forEach(coord => {
                const { r, c } = coord;
                const sym = board[r][c];

                if (sym === 'SCATTER') return;

                if (!this.symbolLevels[sym]) this.symbolLevels[sym] = 0;

                // Golden Ratio Probability Calculation
                // P(Evolve) = 1 / (phi^2) approx 0.381, decayed by level
                const phi = 1.61803398875;
                const baseProb = 1 / (phi * phi);

                // Bonus Check: Level 8 (21x) implies "Darwin's Ladder" potential
                const isBonusLevel = this.symbolLevels[sym] >= 7; // Level 7 -> 8

                if (Math.random() < (baseProb / (this.symbolLevels[sym] || 1))) {
                    if (this.symbolLevels[sym] < 10) {
                        this.symbolLevels[sym]++;
                        const level = this.symbolLevels[sym];

                        // Golden Ratio Multiplier: Round(phi^n)
                        const rawMult = Math.pow(phi, level);
                        const mult = Math.round(rawMult); // 2, 3, 4, 7, 11... approx

                        events.push({ symbol: sym, level: level, mult: mult, r: r, c: c, isBonus: isBonusLevel });
                        totalMultiplier += (mult * 0.05);
                    }
                }
            });
        });

        if (events.length === 0) return { triggered: false };

        const darwinBonus = events.some(e => e.isBonus);
        const uniqueEvents = [...new Map(events.map(item => [item.symbol, item])).values()];

        return {
            triggered: true,
            multiplier: Math.max(1, totalMultiplier),
            logMessage: `EVOLUTION: Winning clusters evolved! ${darwinBonus ? '🧬 DARWIN BONUS UNLOCKED!' : ''}`,
            visualization: this.createVisualization(uniqueEvents),
            animation: {
                type: 'evolution',
                subtype: darwinBonus ? 'darwin' : 'normal',
                coords: events.map(e => ({ r: e.r, c: e.c }))
            }
        };
    }

    createVisualization(events) {
        let html = '<div class="mech-log">';
        html += '<p><strong>Cluster Evolution:</strong></p>';
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
