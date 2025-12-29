/**
 * Time Travel Mechanic (Wave Functions) for Web Demo
 */

class TimeTravelMechanic {
    constructor() {
        this.triggerRate = 0.08;
        this.pastTriggerRate = 0.08;
        this.futureTriggerRate = 0.04;

        this.winHistory = []; // Array of {spin: #, amount: $$}
        this.currentSpin = 0;
        this.maxHistory = 50;
    }

    recordWin(amount) {
        if (amount <= 0) return;

        this.winHistory.push({
            spin: this.currentSpin,
            amount: amount,
            timestamp: new Date().toLocaleTimeString()
        });

        if (this.winHistory.length > this.maxHistory) {
            this.winHistory.shift();
        }
    }

    processSpin(board, bet) {
        this.currentSpin++;

        // 1. Calculate Wave Function Value (for visualization)
        const t = this.currentSpin;
        const waveVal = 10 * Math.abs(Math.sin(0.5 * t)) * Math.exp(-0.1 * (t % 20)); // Cyclic decay for visualization

        let result = {
            triggered: false,
            bonusWin: 0,
            multiplier: 1.0,
            logMessage: '',
            visualization: ''
        };

        // 2. Past Retrieval (8% chance)
        if (Math.random() < this.pastTriggerRate && this.winHistory.length > 0) {
            const pastWin = this.retrievePastWin();
            if (pastWin) {
                result.triggered = true;
                result.bonusWin += pastWin.retrievedAmount;
                result.logMessage += `RETRIEVED: $${pastWin.retrievedAmount.toFixed(2)} from Spin #${pastWin.spin} (${pastWin.spinsAgo} ago). `;
            }
        }

        // 3. Future Boost (4% chance)
        if (Math.random() < this.futureTriggerRate) {
            result.triggered = true;
            result.multiplier = 1.5;
            result.logMessage += `FUTURE DEJA VU: 1.5x Multiplier applied! `;
        }

        result.visualization = this.createVisualization(waveVal);
        return result;
    }

    retrievePastWin() {
        // Pick specific historical point based on Wave Function probability
        // |Ψ(t)|^2 = A * e^(-λt) * cos^2(ωt)

        for (const pastWin of this.winHistory) {
            const t = this.currentSpin - pastWin.spin;
            if (t <= 0) continue;

            const lambda = 0.05; // Decay
            const omega = 0.5;   // Frequency (echoes every ~6 spins)

            // Calculate probability density
            const prob = 1.0 * Math.exp(-lambda * t) * Math.pow(Math.cos(omega * t), 2);

            // Normalize primarily by a base factor for game balance
            if (Math.random() < (prob * 0.5)) {
                // Check for Paradox (Double Retrieval)
                const isParadox = pastWin.retrievedCount > 0;
                if (isParadox) pastWin.retrievedCount++;
                else pastWin.retrievedCount = 1;

                // Decay amount slightly on retrieval to simulate entropy
                const entropy = 0.9;
                return {
                    amount: pastWin.amount,
                    retrievedAmount: pastWin.amount * entropy,
                    spin: pastWin.spin,
                    spinsAgo: t,
                    isParadox: isParadox
                };
            }
        }
        return null;
    }

    createVisualization(waveVal) {
        let html = '<div class="mech-log">';

        // Wave Function Display
        const height = Math.min(100, waveVal * 10);
        html += `<div style="display:flex; align-items:flex-end; height:30px; border-bottom:1px solid #555; margin-bottom:10px;">
            <span style="font-size:0.7em; margin-right:5px;">Temporal Wave:</span>
            <div style="width:10px; height:${height}%; background:#00CED1; transition: height 0.5s;"></div>
            <div style="font-size:0.7em; margin-left:5px;">${waveVal.toFixed(2)}</div>
        </div>`;

        // History Log
        html += '<p><strong>Win History (Past 5):</strong></p>';
        html += '<ul style="font-size:0.8em; color:#aaa;">';

        const recentHistory = [...this.winHistory].reverse().slice(0, 5);
        if (recentHistory.length === 0) {
            html += '<li>No wins recorded yet...</li>';
        } else {
            recentHistory.forEach(w => {
                const ago = this.currentSpin - w.spin;
                const prob = (Math.exp(-0.2 * ago) * 100).toFixed(1);
                html += `<li>Spin #${w.spin} ($${w.amount.toFixed(2)}) - Retrieve Prob: ${prob}%</li>`;
            });
        }

        html += '</ul></div>';
        return html;
    }
}
