/**
 * Morphing Mechanic (Bezier Curves) for Web Demo
 */

class MorphingMechanic {
    constructor() {
        this.states = ['BASIC', 'ENHANCED', 'PREMIUM', 'ELITE', 'LEGENDARY'];
        this.stateMultipliers = {
            'BASIC': 1.0,
            'ENHANCED': 2.0,
            'PREMIUM': 5.0,
            'ELITE': 15.0,
            'LEGENDARY': 50.0
        };

        this.triggerRate = 0.08;
        this.morphPerSymbolRate = 0.30;
    }

    processSpin(board, bet) {
        // Trigger check
        if (Math.random() > this.triggerRate) {
            return { triggered: false };
        }

        const events = [];
        let totalMultiplier = 1.0;

        board.forEach((row, rIdx) => {
            row.forEach((symbol, cIdx) => {
                // Only morph non-scatter symbols
                if (symbol !== 'SCATTER' && Math.random() < this.morphPerSymbolRate) {
                    const currentState = 'BASIC'; // Assume start at basic for non-tracked symbols
                    const nextState = this.selectNextState(currentState);

                    if (nextState !== currentState) {
                        const mult = this.stateMultipliers[nextState];
                        totalMultiplier *= (1 + (mult * 0.05)); // Demo balance tweak

                        events.push({
                            r: rIdx, c: cIdx,
                            symbol: symbol,
                            from: currentState,
                            to: nextState,
                            mult: mult
                        });
                    }
                }
            });
        });

        if (events.length === 0) return { triggered: false };

        return {
            triggered: true,
            multiplier: Math.max(1, totalMultiplier),
            logMessage: `Morphing Active! ${events.length} symbols transformed.`,
            visualization: this.createVisualization(events)
        };
    }

    selectNextState(current) {
        const idx = this.states.indexOf(current);
        // Simple forward progression probability for demo
        const rand = Math.random();
        if (rand < 0.60) return this.states[Math.min(idx + 1, 4)];
        if (rand < 0.85) return this.states[Math.min(idx + 2, 4)];
        return current;
    }

    createVisualization(events) {
        let html = '<div class="mech-log">';
        html += '<p><strong>Active Morphs:</strong></p>';
        html += '<div style="display:flex; flex-wrap:wrap; gap:5px;">';

        events.forEach(e => {
            const progressColor = this.getStateColor(e.to);
            html += `<div style="background:#222; padding:5px; border-radius:4px; border:1px solid ${progressColor}; width:45%;">
                <div style="font-size:0.75em; text-align:center;">${e.symbol} @ [${e.r},${e.c}]</div>
                <div style="font-size:0.7em; color:#aaa; display:flex; justify-content:space-between;">
                   <span>${e.from}</span> ➔ <span style="color:${progressColor}">${e.to}</span>
                </div>
                <div style="margin-top:2px; height:3px; background:#444;">
                    <div style="width:100%; height:100%; background:${progressColor}; box-shadow:0 0 5px ${progressColor};"></div>
                </div>
            </div>`;
        });

        html += '</div></div>';
        return html;
    }

    getStateColor(state) {
        const colors = {
            'BASIC': '#ccc',
            'ENHANCED': '#4CAF50',
            'PREMIUM': '#2196F3',
            'ELITE': '#9C27B0',
            'LEGENDARY': '#FFD700'
        };
        return colors[state] || '#fff';
    }
}
