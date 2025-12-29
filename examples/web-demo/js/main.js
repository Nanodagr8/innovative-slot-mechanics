/**
 * Main Game Controller
 * Manages UI, game loop, and mechanic integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Game State
    const state = {
        balance: 1000.00,
        bet: 1.00,
        currentMechanic: 'transform',
        isSpinning: false,
        board: []
    };

    // Components
    const engine = new SlotEngine();

    // Mechanics (will be instantiated if loaded)
    const mechanics = {
        transform: typeof TransformMechanic !== 'undefined' ? new TransformMechanic() : null,
        evolution: typeof EvolutionMechanic !== 'undefined' ? new EvolutionMechanic() : null,
        timetravel: typeof TimeTravelMechanic !== 'undefined' ? new TimeTravelMechanic() : null,
        morphing: typeof MorphingMechanic !== 'undefined' ? new MorphingMechanic() : null
    };

    // DOM Elements
    const ui = {
        reels: document.getElementById('reels'),
        spinBtn: document.getElementById('spin-btn'),
        balance: document.getElementById('balance'),
        bet: document.getElementById('bet'),
        win: document.getElementById('win'),
        log: document.getElementById('game-log'),
        tabs: document.querySelectorAll('.tab-btn'),
        mechanicTitle: document.getElementById('mechanic-title'),
        mechanicVis: document.getElementById('mechanic-visualization'),
        rtpValue: document.getElementById('rtp-value'),
        triggerValue: document.getElementById('trigger-value'),
        increaseBet: document.getElementById('increase-bet'),
        decreaseBet: document.getElementById('decrease-bet')
    };

    // Initialize Game
    function init() {
        state.board = engine.initBoard();
        renderBoard(state.board);
        updateUI();
        switchMechanic('transform'); // Default
    }

    // --- UI Rendering ---

    function renderBoard(board, winningLines = []) {
        ui.reels.innerHTML = '';
        board.forEach((row, rIdx) => {
            row.forEach((symbol, cIdx) => {
                const cell = document.createElement('div');
                cell.className = 'reel'; // Actually cells in grid layout

                const symEl = document.createElement('div');
                symEl.className = `symbol ${symbol}`;
                symEl.textContent = getSymbolIcon(symbol);

                // Highlight winning symbols
                if (winningLines.some(line => line.row === rIdx && cIdx < line.count)) {
                    symEl.classList.add('highlight-win');
                }

                cell.appendChild(symEl);
                ui.reels.appendChild(cell);
            });
        });
    }

    function getSymbolIcon(name) {
        const icons = {
            'LOW': 'J',
            'MEDIUM': 'Q',
            'HIGH': 'K',
            'WILD': '★',
            'SUPER': '7',
            'SCATTER': '◆'
        };
        return icons[name] || '?';
    }

    function updateUI() {
        ui.balance.textContent = state.balance.toFixed(2);
        ui.bet.textContent = state.bet.toFixed(2);
        ui.spinBtn.disabled = state.isSpinning;
    }

    function log(message) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `> ${message}`;
        ui.log.prepend(entry);
    }

    // --- Game Logic ---

    async function spin() {
        if (state.balance < state.bet) {
            log("Insufficient balance!");
            return;
        }

        state.isSpinning = true;
        state.balance -= state.bet;
        ui.win.textContent = "0.00";
        updateUI();

        // 1. Visual Spin Animation
        ui.reels.classList.add('spinning');
        await new Promise(r => setTimeout(r, 500)); // Fake delay
        ui.reels.classList.remove('spinning');

        // 2. Generate Base Board
        state.board = engine.spin();
        let currentBoard = JSON.parse(JSON.stringify(state.board)); // Deep copy

        // 3. Process Active Mechanic
        const activeMech = mechanics[state.currentMechanic];
        let mechanicResult = null;
        let mechanicMultiplier = 1.0;
        let bonusWin = 0;

        if (activeMech) {
            mechanicResult = activeMech.processSpin(currentBoard, state.bet);

            // Apply updates from mechanic
            if (mechanicResult.board) {
                currentBoard = mechanicResult.board;
            }
            if (mechanicResult.multiplier) {
                mechanicMultiplier = mechanicResult.multiplier;
            }
            if (mechanicResult.bonusWin) {
                bonusWin = mechanicResult.bonusWin;
            }
        }

        // 4. Calculate Base Wins on Final Board
        const winResult = engine.calculateWin(currentBoard, state.bet);

        // 5. Total Calculation
        const totalWin = (winResult.totalWin * mechanicMultiplier) + bonusWin;

        // 6. Update State
        state.balance += totalWin;
        renderBoard(currentBoard, winResult.winningLines);
        ui.win.textContent = totalWin.toFixed(2);

        // 7. Logging
        if (winResult.totalWin > 0) {
            log(`Base Win: $${winResult.totalWin.toFixed(2)}`);
        }

        if (mechanicResult && mechanicResult.triggered) {
            log(`ACTIVATE: ${mechanicResult.logMessage}`);
            updateMechanicVis(mechanicResult);
        }

        if (totalWin > 0) {
            log(`💰 TOTAL WIN: $${totalWin.toFixed(2)}`);
            // Trigger Time Travel History Recording
            if (state.currentMechanic === 'timetravel' && mechanics.timetravel) {
                mechanics.timetravel.recordWin(totalWin);
            }
        }

        state.isSpinning = false;
        updateUI();
    }

    // --- Mechanic Switching ---

    function switchMechanic(mechName) {
        state.currentMechanic = mechName;

        // Update Tabs
        ui.tabs.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mechanic === mechName);
        });

        // Update Info Panel
        updateMechanicInfo(mechName);
    }

    function updateMechanicInfo(mechName) {
        const info = {
            'transform': { title: 'Transform Mechanic', rtp: '+10-12%', trigger: '20%' },
            'evolution': { title: 'Evolution Mechanic', rtp: '+10-12%', trigger: '10%' },
            'timetravel': { title: 'Time Travel Mechanic', rtp: '+2-3%', trigger: '8%' },
            'morphing': { title: 'Morphing Mechanic', rtp: '+5-7%', trigger: '8%' }
        };

        const data = info[mechName] || { title: 'Unknown', rtp: '-', trigger: '-' };
        ui.mechanicTitle.textContent = data.title;
        ui.rtpValue.textContent = data.rtp;
        ui.triggerValue.textContent = data.trigger;
        ui.mechanicVis.innerHTML = '<div class="placeholder-vis">Spin to see mechanic in action...</div>';
    }

    function updateMechanicVis(result) {
        if (!result.visualization) return;
        ui.mechanicVis.innerHTML = result.visualization;
    }

    // --- Event Listeners ---

    if (ui.spinBtn) ui.spinBtn.addEventListener('click', spin);

    ui.tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!state.isSpinning) {
                switchMechanic(e.target.dataset.mechanic);
            }
        });
    });

    if (ui.increaseBet) {
        ui.increaseBet.addEventListener('click', () => {
            if (!state.isSpinning) {
                state.bet = Math.min(state.bet + 1, 100);
                updateUI();
            }
        });
    }

    if (ui.decreaseBet) {
        ui.decreaseBet.addEventListener('click', () => {
            if (!state.isSpinning) {
                state.bet = Math.max(state.bet - 1, 1);
                updateUI();
            }
        });
    }

    // Start
    init();
});
