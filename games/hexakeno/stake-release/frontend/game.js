/* --- PAYOUT DATA (STAKE.US EXACT) --- */
const STAKE_DATA = {
    classic: {
        1: [0, 3.80],
        2: [0, 1.82, 4.32],
        3: [0, 0.96, 2.98, 9.98],
        4: [0, 0.77, 1.73, 4.80, 21.60],
        5: [0, 0.24, 1.34, 3.94, 15.84, 34.56],
        6: [0, 0, 0.96, 3.53, 6.72, 15.84, 38.40],
        7: [0, 0, 0.45, 2.88, 4.32, 13.44, 29.76, 57.60],
        8: [0, 0, 0, 2.11, 3.84, 12.48, 21.12, 52.80, 67.20],
        9: [0, 0, 0, 1.49, 2.88, 7.68, 14.40, 42.24, 57.60, 81.60],
        10: [0, 0, 0, 1.34, 2.16, 4.32, 7.68, 16.32, 48.00, 76.80, 96.00]
    },
    low: {
        1: [0.67, 1.78],
        2: [0, 1.92, 3.65],
        3: [0, 1.06, 1.32, 24.96],
        4: [0, 0, 2.11, 7.58, 86.40],
        5: [0, 0, 1.44, 4.03, 12.48, 288.00],
        6: [0, 0, 1.06, 1.92, 5.95, 96.00, 672.00],
        7: [0, 0, 1.06, 1.54, 3.36, 14.40, 216.00, 672.00],
        8: [0, 0, 1.06, 1.44, 1.92, 5.28, 37.44, 96.00, 768.00],
        9: [0, 0, 1.06, 1.25, 1.63, 2.40, 7.20, 48.00, 240.00, 960.00],
        10: [0, 0, 1.06, 1.15, 1.25, 1.73, 3.36, 12.48, 48.00, 240.00, 960.00]
    },
    medium: {
        1: [0.38, 2.64],
        2: [0, 1.73, 4.90],
        3: [0, 0, 2.69, 48.00],
        4: [0, 0, 1.63, 9.60, 96.00],
        5: [0, 0, 1.34, 3.84, 13.44, 374.40],
        6: [0, 0, 0, 2.88, 8.64, 172.80, 681.60],
        7: [0, 0, 0, 1.92, 6.72, 28.80, 384.00, 768.00],
        8: [0, 0, 0, 1.92, 3.84, 10.56, 64.32, 384.00, 864.00],
        9: [0, 0, 0, 1.92, 2.40, 4.80, 14.40, 96.00, 480.00, 960.00],
        10: [0, 0, 0, 1.54, 1.92, 3.84, 6.72, 24.96, 96.00, 480.00, 960.00]
    },
    high: {
        1: [0, 3.80],
        2: [0, 0, 16.42],
        3: [0, 0, 0, 78.24],
        4: [0, 0, 9.60, 248.64],
        5: [0, 0, 0, 4.32, 46.08, 432.00],
        6: [0, 0, 0, 0, 10.56, 336.00, 681.60],
        7: [0, 0, 0, 0, 6.72, 86.40, 384.00, 768.00],
        8: [0, 0, 0, 0, 4.80, 19.20, 259.20, 576.00, 864.00],
        9: [0, 0, 0, 0, 3.84, 10.56, 53.76, 480.00, 768.00, 960.00],
        10: [0, 0, 0, 0, 3.36, 7.68, 12.48, 60.48, 480.00, 768.00, 1000.00]
    }
};

/* --- AUDIO ENGINE (Web Audio API) --- */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const SoundBuffers = new Map();

async function loadAudio(key, url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        SoundBuffers.set(key, audioBuffer);
        console.log(`[Audio] Loaded: ${key}`);
    } catch (e) {
        console.warn(`[Audio] Failed to load ${key}, will use procedural fallback.`, e);
    }
}

const SoundEngine = {
    // Advanced Procedural Sound Synthesis

    // Helper: Create a standard envelope
    _env: (param, start, end, duration, time = audioCtx.currentTime) => {
        param.cancelScheduledValues(time);
        param.setValueAtTime(start, time);
        param.exponentialRampToValueAtTime(end > 0 ? end : 0.001, time + duration);
    },

    // 1. Click: High pitched mechanical tick
    click: () => {
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.05); // Pitch drop

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
    },

    // 2. Bet: Coin sound (Dual sine wave ring)
    bet: () => {
        const t = audioCtx.currentTime;
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.value = 0.4;

        [1200, 1600].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            osc.connect(gain);
            osc.start(t);
            osc.stop(t + 0.15);
        });

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    },

    // 3. Draw: Soft "Pop" or water drop
    draw: () => {
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    },

    // 4. Hit: Glassy Chime with Reverb tail feel
    hit: () => {
        const t = audioCtx.currentTime;
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);

        // Extended Pentatonic frequencies for more variation
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const chosen = freqs[Math.floor(Math.random() * freqs.length)];

        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(chosen, t);

        // Add bright harmonic
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(chosen * 2.01, t); // Slight detune for shimmer

        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2); // Longer glassy tail

        osc.connect(gain);
        osc2.connect(gain);

        osc.start(t);
        osc.stop(t + 1.2);
        osc2.start(t);
        osc2.stop(t + 1.2);
    },

    // 5. SuperHit: Intense Laser Zap + Deep Sub Thud
    superHit: () => {
        const t = audioCtx.currentTime;

        // Zap (high freq sawtooth drop)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, t); // Higher start
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);

        // Add square wave clone for destructive crunch
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1200, t);
        osc2.frequency.exponentialRampToValueAtTime(50, t + 0.4);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.4);
        osc2.start(t);
        osc2.stop(t + 0.4);

        // Thud (low sine) - Heavy Box
        const kick = audioCtx.createOscillator();
        const kGain = audioCtx.createGain();
        kick.frequency.setValueAtTime(250, t); // Punchy start
        kick.frequency.exponentialRampToValueAtTime(30, t + 0.2); // Drop to sub bass

        kGain.gain.setValueAtTime(1.0, t); // Harder kick
        kGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        kick.connect(kGain);
        kGain.connect(audioCtx.destination);
        kick.start(t);
        kick.stop(t + 0.3);
    },

    // 6. Win: Ascending Arpeggio
    win: () => {
        const t = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const start = t + i * 0.1;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

            osc.start(start);
            osc.stop(start + 0.4);
        });
    },

    // 7. Super Win: Epic Fanfare + Heavy Bass Arp
    superWin: () => {
        const t = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // Massive ascending C Major

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square'; // Chiptune-like fullness
            osc.frequency.value = freq;

            // Deep bass layer clone
            const bassOsc = audioCtx.createOscillator();
            bassOsc.type = 'sawtooth';
            bassOsc.frequency.value = freq / 4; // 2 octaves down

            // Lowpass to soften square & saw mix
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1500 + (i * 200); // Filter opens up over time

            osc.connect(filter);
            bassOsc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            const start = t + i * 0.12; // Faster, tighter arpeggio
            const len = 0.5; // Longer tails for blend

            // Ducking/Pumping volume
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.25, start + 0.05); // Louder
            gain.gain.exponentialRampToValueAtTime(0.01, start + len);

            osc.start(start);
            osc.stop(start + len);
            bassOsc.start(start);
            bassOsc.stop(start + len);
        });
    },

    // 8. BGM: Ambient Space Drone
    bgmOscillators: [],
    // Simple state tracking
    isPlayingBGM: false,

    playBGM: () => {
        if (SoundEngine.isPlayingBGM) return;
        SoundEngine.isPlayingBGM = true;

        // Create a deep ambient drone
        const chords = [130.81, 196.00, 261.63]; // C3, G3, C4
        const masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.1; // Low ambient
        masterGain.connect(audioCtx.destination);
        SoundEngine.bgmMaster = masterGain;

        chords.forEach(freq => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(masterGain);
            osc.start();
            SoundEngine.bgmOscillators.push(osc);
        });

        // Add LFO for movement
        const lfo = audioCtx.createOscillator();
        lfo.frequency.value = 0.1; // Slow 10s cycle
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 50.0;
        lfo.connect(lfoGain);
        // Modulate filter if we had one, or just pitch slightly? 
        // Keep it simple: Just constant drone for now.
        lfo.start();
        SoundEngine.bgmOscillators.push(lfo);
    },

    stopBGM: () => {
        SoundEngine.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { }
        });
        SoundEngine.bgmOscillators = [];
        if (SoundEngine.bgmMaster) {
            SoundEngine.bgmMaster.disconnect();
            SoundEngine.bgmMaster = null;
        }
        SoundEngine.isPlayingBGM = false;
    },

    updateMute: (muted) => {
        if (SoundEngine.bgmMaster) {
            SoundEngine.bgmMaster.gain.setTargetAtTime(muted ? 0 : 0.1, audioCtx.currentTime, 0.5);
        }
    }
};

function playSound(key) {
    if (game.muted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (SoundEngine[key]) SoundEngine[key]();
}

/* --- STATE --- */
let game = {
    balance: 1000,
    wagered: 0,
    picks: [],
    super: false,
    turbo: false,
    muted: false,
    mode: 'manual',
    running: false,
    autoActive: false,
    nonce: 0,
    serverSeed: CryptoJS.lib.WordArray.random(32).toString(),
    baseBet: 1.00
};

/* --- INITIALIZATION --- */
const adapter = new StakeEngineAdapter();
window.adapter = adapter; // Bind globally for formatCurrency and endRound logic

const vfx = new ProceduralVFX();
window.vfx = vfx; // Bind globally for triggerVFX logic

// DOM CACHE Extended
const HEX_CACHE = new Map();
const DOM = {
    balance: null,
    wagered: null,
    roundId: null,
    grid: null,
    payoutBar: null,
    drawnBalls: null,
    riskLevel: null,
    betAmount: null,
    mainBtn: null,
    costInfo: null,
    winBanner: null,
    winBannerAmount: null,
    winBannerMultiplier: null,
    gameClock: null,
    superToggle: null,
    turboToggle: null,
    fairPanel: null,
    tabManual: null,
    tabAuto: null,
    autoOnly: null,
    onWinInc: null,
    onLossInc: null,
    autoCount: null,
    clientSeed: null,
    hashedServerSeed: null,
    nonceDisplay: null,
    winHistory: null
};

/* --- ASSET PRELOADER --- */
/* --- ASSET LOADER (Spine + Audio) --- */
const AssetLoader = {
    app: null,
    spineBoy: null,

    // List of standard image assets to preload
    images: [
        'assets/images/anime_crystal_scenery_bg.png',
        'assets/images/anime_hex_tile.png',
        'assets/images/anime_hex_spin_sheet.png',
        'assets/images/anime_hex_hit_sheet.png',
        'assets/images/anime_hex_miss_sheet.png',
        'assets/images/anime_hex_super_sheet.png',
        'assets/images/anime_big_win_frame.png',
        'assets/images/anime_hud_layout_bg.png',
        'assets/images/anime_electric_hex_border.png',
        'assets/images/anime_electric_hex_hit.png',
        'assets/images/anime_electric_hex_miss.png'
    ],

    init: async () => {
        // 1. Initialize Pixi Application for Loading Screen
        AssetLoader.app = new PIXI.Application();
        await AssetLoader.app.init({
            backgroundAlpha: 0,
            resizeTo: window,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        document.getElementById('bgCanvas').appendChild(AssetLoader.app.canvas);
        AssetLoader.app.canvas.style.position = 'absolute';
        AssetLoader.app.canvas.style.zIndex = '9999'; // Above everything during loading
        AssetLoader.app.canvas.style.pointerEvents = 'none';

        // Add loading background overlay
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, window.innerWidth, window.innerHeight).fill({ color: 0x1a1a2e, alpha: 0.95 });
        AssetLoader.app.stage.addChild(overlay);

        // Add "LOADING..." text at top
        const loadingStyle = new PIXI.TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 28,
            fontWeight: 'bold',
            fill: '#00CED1',
            align: 'center',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 6,
            dropShadowDistance: 3
        });
        const loadingText = new PIXI.Text({ text: 'LOADING...', style: loadingStyle });
        loadingText.anchor.set(0.5);
        loadingText.x = window.innerWidth / 2;
        loadingText.y = 60;
        AssetLoader.app.stage.addChild(loadingText);

        // 2. Load Spine Runtime & Assets
        // Note: Using a safe try-catch for Spine in case mock runtime is active or fails
        try {
            if (PIXI.Assets) {
                PIXI.Assets.add({ alias: 'mascot', src: 'assets/spine/crystal-mascot.json' });
                const assets = await PIXI.Assets.load(['mascot']);

                // 3. Create Loading Character
                if (assets.mascot && window.pixi_spine && window.pixi_spine.Spine) {
                    AssetLoader.spineBoy = pixi_spine.Spine.from({
                        skeleton: assets.mascot,
                        scale: window.innerWidth < 900 ? 0.8 : 1.2
                    });
                    AssetLoader.spineBoy.x = window.innerWidth / 2;
                    AssetLoader.spineBoy.y = window.innerWidth < 900 ? 150 : window.innerHeight / 2 - 50;
                    if (AssetLoader.spineBoy.state) {
                        AssetLoader.spineBoy.state.setAnimation(0, 'run', true);
                    }
                    AssetLoader.app.stage.addChild(AssetLoader.spineBoy);
                    AssetLoader.app.stage.addChild(AssetLoader.spineBoy);
                }
            }
        } catch (e) {
            console.warn('[AssetLoader] Spine load failed or using mock:', e);
        }

        // Add Game Instructions Text (ALWAYS shown regardless of Spine)
        const instructionsStyle = new PIXI.TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 20,
            fill: '#ffffff',
            align: 'center',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowDistance: 2,
            wordWrap: true,
            wordWrapWidth: 400,
            lineHeight: 28
        });
        const instructions = new PIXI.Text({
            text: '🎮 HOW TO PLAY 🎮\n\n• Pick 1-10 numbers from the hex grid\n• Press PLAY to draw 10 numbers (1-40)\n• Match picks to win up to 10,000x!\n• Superball gives 7x multiplier on hit',
            style: instructionsStyle
        });
        instructions.anchor.set(0.5);
        instructions.x = window.innerWidth / 2;
        instructions.y = window.innerHeight / 2 + 150;
        AssetLoader.app.stage.addChild(instructions);

        // 4. Procedural Audio Only (No external assets to load)
        // const audioRetries = []; // Removed
        // await Promise.all(audioRetries);

        // 5. Cleanup Loading Screen (Fade Out)
        setTimeout(() => {
            if (AssetLoader.spineBoy && AssetLoader.spineBoy.state) {
                try {
                    AssetLoader.spineBoy.state.setAnimation(0, 'jump', false);
                    AssetLoader.spineBoy.state.addAnimation(0, 'idle', true, 0);
                } catch (e) { }
            }

            // Allow time for jump, then fade app
            setTimeout(() => {
                const ticker = PIXI.Ticker.shared;
                const fadeOut = () => {
                    if (!AssetLoader.app || !AssetLoader.app.stage) {
                        ticker.remove(fadeOut);
                        return;
                    }
                    AssetLoader.app.stage.alpha -= 0.05;
                    if (AssetLoader.app.stage.alpha <= 0) {
                        ticker.remove(fadeOut);

                        // Transfer mascot to main game (VFX layer)
                        if (window.vfx) {
                            window.vfx.playMascot('idle');
                        }

                        try {
                            // Don't destroy base textures as they are shared with VFX
                            AssetLoader.app.destroy({ removeView: true, children: true, texture: false, baseTexture: false });
                        } catch (e) { }
                    }
                };
                ticker.add(fadeOut);
            }, 1000);
        }, 500);
    }
};

/* --- INIT --- */
async function init() {
    // Cache DOM
    DOM.balance = document.getElementById('balance');
    DOM.wagered = document.getElementById('wagered');
    DOM.roundId = document.getElementById('roundId');
    DOM.grid = document.getElementById('grid');
    DOM.payoutBar = document.getElementById('payoutBar');
    DOM.drawnBalls = document.getElementById('drawnBalls');
    DOM.riskLevel = document.getElementById('riskLevel');
    DOM.betAmount = document.getElementById('betAmount');
    DOM.mainBtn = document.getElementById('mainBtn');
    DOM.costInfo = document.getElementById('costInfo');
    DOM.winBanner = document.getElementById('winBanner');
    DOM.winBannerAmount = document.getElementById('winBannerAmount');
    DOM.winBannerMultiplier = document.getElementById('winBannerMultiplier');
    DOM.gameClock = document.getElementById('gameClock');
    DOM.superToggle = document.getElementById('superToggle');
    DOM.turboToggle = document.getElementById('turboToggle');
    DOM.fairPanel = document.getElementById('fairPanel');
    DOM.tabManual = document.getElementById('tabManual');
    DOM.tabAuto = document.getElementById('tabAuto');
    DOM.autoOnly = document.getElementById('autoOnly');
    DOM.onWinInc = document.getElementById('onWinInc');
    DOM.onLossInc = document.getElementById('onLossInc');
    DOM.autoCount = document.getElementById('autoCount');
    DOM.clientSeed = document.getElementById('clientSeed');
    DOM.hashedServerSeed = document.getElementById('hashedServerSeed');
    DOM.nonceDisplay = document.getElementById('nonceDisplay');
    DOM.winHistory = document.getElementById('winHistory');
    DOM.rulesModal = document.getElementById('rulesModal');

    // Preload Assets & Show Loading Screen
    await AssetLoader.init();

    // RESTORE STATE
    restoreState();

    // Attach Save Listeners
    if (DOM.betAmount) DOM.betAmount.addEventListener('change', saveState);
    if (DOM.riskLevel) DOM.riskLevel.addEventListener('change', saveState);
    if (DOM.superToggle) DOM.superToggle.addEventListener('click', saveState);
    if (DOM.turboToggle) DOM.turboToggle.addEventListener('click', saveState);

    // Jurisdiction Clock
    setInterval(() => {
        if (DOM.gameClock) {
            const now = new Date();
            DOM.gameClock.innerText = now.toLocaleTimeString();
        }
    }, 1000);

    initGrid();
    updateSeeds();
    renderPayouts();

    // RGS Initialization
    await adapter.init();
    await adapter.authenticate();
    updateBtn();

    // Initial Balance
    if (adapter.getFloatBalance) {
        game.balance = adapter.getFloatBalance();
    }
    updateStats(true);

    // Dynamic Energy Pulse
    setInterval(() => {
        if (game.running && !game.turbo) {
            triggerEnergy(0.2); // Gentle ambient pulse while running
        }
    }, 2000);

}

// Start Game on Load
window.addEventListener('load', init);

function triggerEnergy(intensity = 1.0) {
    // V1: CSS/DOM Effects
    document.body.classList.add('high-energy');
    if (intensity > 0.5) triggerScreenShake();

    setTimeout(() => {
        document.body.classList.remove('high-energy');
    }, 500 * intensity);

    // V2: Delegate to PixiJS VFX
    if (window.vfx) {
        if (!window.vfx.mascot) window.vfx.initMascot();
        const cx = window.innerWidth * 0.5;
        const cy = window.innerHeight * 0.5;

        if (intensity >= 1.0) {
            window.vfx.megaBurst(cx, cy);
            window.vfx.electricArc(0, cy, window.innerWidth, cy, 'gold');
            window.vfx.playMascot('shoot');
        } else {
            window.vfx.shimmer(cx, cy);
            window.vfx.burst(cx, cy, 20, 'green');
            window.vfx.playMascot('jump');
        }
    }
}

// Listen for RGS Balance Updates
window.onBalanceUpdate = (floatAmount) => {
    game.serverBalance = floatAmount;
    if (!game.running) {
        game.balance = floatAmount;
        updateStats();
    }
};

function formatCurrency(amount) {
    if (window.adapter && window.adapter.balance) {
        // Reuse adapter's formatting logic (requires re-inflating to integer representation)
        // API_MULTIPLIER is 1,000,000 (Verified)
        const currency = window.adapter.balance.currency || 'USD';
        return window.adapter.displayBalance({
            amount: Math.round(amount * 1000000),
            currency: currency
        });
    }
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function triggerVFX(el, isHit, isSuper) {
    if (!window.vfx || !el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (isSuper && isHit) {
        window.vfx.shimmer(x, y, 60);
        window.vfx.shatter(x, y);
        spawnCrystalOrb(el, true);
        triggerScreenShake(true); // Heavy shake on super hit
    } else if (isHit) {
        window.vfx.shimmer(x, y, 40);
        window.vfx.burst(x, y, 12, 'cyan');
        spawnCrystalOrb(el, false);
        triggerScreenShake(false); // Light shake on regular hit
    } else {
        window.vfx.burst(x, y, 4, 'cyan');
    }
}

// Spawn 3D Crystal Orb on winning hexagon
function spawnCrystalOrb(hexEl, isSuper = false) {
    // Remove any existing orb on this hex
    const existing = hexEl.querySelector('.crystal-orb');
    if (existing) existing.remove();

    // Create orb container
    const orb = document.createElement('div');
    orb.className = `crystal-orb spawn ${isSuper ? 'super' : ''}`;

    // Create inner rotating element
    const inner = document.createElement('div');
    inner.className = 'crystal-orb-inner';
    orb.appendChild(inner);

    // Add to hex
    hexEl.style.position = 'relative';
    hexEl.appendChild(orb);

    // Auto-remove after animation cycle
    setTimeout(() => {
        orb.classList.add('fade-out');
        setTimeout(() => orb.remove(), 500);
    }, 3000);
}

function triggerScreenShake(heavy = false) {
    const shakeClass = heavy ? 'shake-heavy' : 'shake-light';
    const duration = heavy ? 300 : 200; // Match CSS keyframe lengths

    document.body.classList.remove('shake-heavy', 'shake-light');

    // Force reflow to restart animation if already playing
    void document.body.offsetWidth;

    document.body.classList.add(shakeClass);
    setTimeout(() => document.body.classList.remove(shakeClass), duration);
}

function showBigWin(winAmount, winM) {
    const banner = DOM.winBanner;
    const amountEl = DOM.winBannerAmount;
    const multiplierEl = DOM.winBannerMultiplier;

    if (!banner || !amountEl || !multiplierEl) return;

    multiplierEl.innerText = winM.toFixed(2) + 'x';
    banner.classList.remove('hidden');
    banner.classList.add('active');

    // Count-up animation using requestAnimationFrame
    let startTimestamp = null;
    const duration = 1500;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Easing out curve
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = winAmount * easeOutQuart;

        amountEl.innerText = formatCurrency(current);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            amountEl.innerText = formatCurrency(winAmount);
        }
    };
    window.requestAnimationFrame(step);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        banner.classList.remove('active');
        setTimeout(() => banner.classList.add('hidden'), 300);
    }, 3000);
}



function initGrid() {
    const grid = DOM.grid;
    if (!grid) return;
    grid.innerHTML = '';

    // Rows configuration for Honeycomb 40 numbers
    // Pattern: 3, 6, 7, 8, 7, 6, 3 = 40 total
    const rowsArr = [3, 6, 7, 8, 7, 6, 3];
    let gridVal = 1;

    rowsArr.forEach(c => {
        const r = document.createElement('div');
        r.className = 'hex-row';
        for (let i = 0; i < c; i++) {
            const hex = document.createElement('div');
            hex.className = 'hex';
            hex.dataset.v = gridVal;
            hex.innerText = gridVal;

            const val = gridVal;
            hex.onclick = () => selectHex(val, hex);
            HEX_CACHE.set(val, hex);

            r.appendChild(hex);
            gridVal++;
        }
        grid.appendChild(r);
    });
}

// initGrid(); -> Moved to window.load
// updateSeeds(); -> Moved to window.load
// renderPayouts(); -> Moved to window.load

/* --- PROVABLY FAIR --- */
function generateDraw() {
    const clientSeed = DOM.clientSeed ? DOM.clientSeed.value : 'default';
    const hmac = CryptoJS.HmacSHA256(`${clientSeed}:${game.nonce}`, game.serverSeed).toString();
    let drawn = [];
    let index = 0;
    let tempHmac = hmac;

    while (drawn.length < 10) {
        let subHash = tempHmac.substring(index, index + 8);
        if (subHash.length < 8) {
            tempHmac = CryptoJS.SHA256(tempHmac).toString();
            index = 0;
            continue;
        }
        let num = (parseInt(subHash, 16) % 40) + 1;
        if (!drawn.includes(num)) drawn.push(num);
        index += 8;
    }
    return drawn;
}

function updateSeeds() {
    if (DOM.hashedServerSeed) DOM.hashedServerSeed.value = CryptoJS.SHA256(game.serverSeed).toString();
    if (DOM.nonceDisplay) DOM.nonceDisplay.value = game.nonce;
}

/* --- GAME ACTIONS --- */
function selectHex(v, el) {
    if (game.running) return;
    if (game.picks.includes(v)) {
        game.picks = game.picks.filter(x => x !== v);
        el.classList.remove('selected');
        playSound('click');
    } else {
        if (game.picks.length >= 10) return;
        game.picks.push(v);
        el.classList.add('selected');
        playSound('click');
    }
    renderPayouts();
}

function toggleSuper() {
    if (game.running) return;
    game.super = !game.super;
    if (DOM.superToggle) DOM.superToggle.classList.toggle('active-super');
    updateBtn();
    renderPayouts();
}

function toggleTurbo() {
    if (game.running) return;
    game.turbo = !game.turbo;
    if (DOM.turboToggle) DOM.turboToggle.classList.toggle('active-turbo');
}

function toggleSound() {
    game.muted = !game.muted;
    const btn = document.getElementById('soundToggle');
    if (btn) {
        const indicator = btn.querySelector('.indicator');
        if (indicator) indicator.classList.toggle('active-sound', !game.muted);
    }
    SoundEngine.updateMute(game.muted);
    if (!game.muted) SoundEngine.playBGM();
}

function toggleFairness() {
    const p = DOM.fairPanel;
    if (!p) return;
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function switchMode(m) {
    if (game.running) return;
    game.mode = m;

    if (DOM.tabManual) DOM.tabManual.classList.toggle('active', m === 'manual');
    if (DOM.tabAuto) DOM.tabAuto.classList.toggle('active', m === 'auto');
    if (DOM.autoOnly) DOM.autoOnly.style.display = m === 'auto' ? 'block' : 'none';

    if (m === 'auto' && DOM.betAmount) game.baseBet = parseFloat(DOM.betAmount.value);
    updateBtn();
}

function updateBtn() {
    const base = parseFloat(DOM.betAmount ? DOM.betAmount.value : 0) || 0;
    const total = game.super ? base * 2.5 : base;
    const btn = DOM.mainBtn;
    if (!btn) return;

    if (game.autoActive) {
        btn.classList.add('is-stop');
        btn.classList.remove('is-super');
        btn.innerHTML = `<span>STOP AUTO</span>`;
    } else {
        btn.classList.remove('is-stop');
        if (game.super) btn.classList.add('is-super');
        else btn.classList.remove('is-super');

        const label = game.mode === 'auto' ? 'START AUTO' : 'PLAY';
        btn.innerHTML = `<span>${label}</span><div class="cost-info">Total: ${formatCurrency(total)}</div>`;
    }
}

function renderPayouts(hits = -1, isSuperWin = false) {
    const bar = DOM.payoutBar;
    if (!bar) return;
    if (game.picks.length === 0) {
        bar.innerHTML = '<div style="font-size:0.8rem; text-align:center; width:100%; color:var(--text-dim, white);">Select Numbers</div>';
        return;
    }

    const risk = DOM.riskLevel.value;
    const table = STAKE_DATA[risk][game.picks.length];

    bar.innerHTML = '';
    const fragment = document.createDocumentFragment();

    table.forEach((m, i) => {
        const display = isSuperWin ? m * 7 : m;
        const card = document.createElement('div');
        card.className = 'payout-card';
        if (hits === i) card.classList.add(isSuperWin ? 'super-win' : 'win');
        card.innerHTML = `<strong>${display.toFixed(2)}x</strong>${i}`;
        fragment.appendChild(card);
    });
    bar.appendChild(fragment);
}

function handleAction() {
    if (game.autoActive) {
        game.autoActive = false;
        return;
    }
    if (game.mode === 'manual') {
        if (game.running) return;
        runRound();
    } else {
        // Start autoplay directly (bypassing modal for immediate feedback)
        startAuto();
    }
}

async function startAuto() {
    if (game.picks.length === 0) return alert("Select numbers first");
    game.autoActive = true;
    if (DOM.betAmount) game.baseBet = parseFloat(DOM.betAmount.value);
    let count = parseInt(DOM.autoCount ? DOM.autoCount.value : 0);
    let infinite = (count === 0);

    while (game.autoActive && (infinite || count > 0)) {
        let success = await runRound();
        if (!success) break;
        if (!infinite) count--;
        await new Promise(r => setTimeout(r, game.turbo ? 100 : 300));
    }

    game.autoActive = false;
    updateBtn();
}

// Valid RGS bet levels in dollars (must match stake-adapter.js betLevels)
const RGS_BET_LEVELS = [
    0.10, 0.20, 0.40, 0.60, 0.80,
    1.00, 1.20, 1.40, 1.60, 1.80,
    2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00,
    10.00, 12.00, 14.00, 16.00, 18.00,
    20.00, 30.00, 40.00, 50.00, 75.00,
    100.00, 150.00, 200.00, 250.00, 300.00,
    350.00, 400.00, 450.00, 500.00, 750.00, 1000.00
];

function snapBetToLevel(amount) {
    let closest = RGS_BET_LEVELS[0];
    let minDiff = Math.abs(amount - RGS_BET_LEVELS[0]);
    for (const level of RGS_BET_LEVELS) {
        const diff = Math.abs(amount - level);
        if (diff < minDiff) { minDiff = diff; closest = level; }
    }
    return closest;
}

function doubleBet() {
    if (!DOM.betAmount) return;
    const current = parseFloat(DOM.betAmount.value) || RGS_BET_LEVELS[0];
    const doubled = current * 2;
    const snapped = snapBetToLevel(Math.min(doubled, RGS_BET_LEVELS[RGS_BET_LEVELS.length - 1]));
    DOM.betAmount.value = snapped.toFixed(2);
    updateBtn();
}

function halveBet() {
    if (!DOM.betAmount) return;
    const current = parseFloat(DOM.betAmount.value) || RGS_BET_LEVELS[0];
    const halved = current / 2;
    const snapped = snapBetToLevel(Math.max(halved, RGS_BET_LEVELS[0]));
    DOM.betAmount.value = snapped.toFixed(2);
    updateBtn();
}

async function runRound() {
    if (game.running) return false;
    const rawBet = parseFloat(DOM.betAmount ? DOM.betAmount.value : 1) || 1;
    const currentBet = snapBetToLevel(rawBet);
    // Update input to show snapped value
    if (DOM.betAmount && currentBet !== rawBet) DOM.betAmount.value = currentBet.toFixed(2);
    const cost = game.super ? currentBet * 2.5 : currentBet;

    if (game.picks.length === 0) {
        alert("Pick at least 1 number");
        return false;
    }

    if (game.balance < cost) {
        alert("Insufficient Funds");
        return false;
    }

    game.running = true;
    game.balance -= cost;
    game.wagered += cost;
    updateStats();
    updateBtn();

    DOM.drawnBalls.innerHTML = ''; // Clear drawn strip
    document.querySelectorAll('.hex').forEach(h => h.classList.remove('hit', 'miss', 'super-hit', 'drawn', 'win-highlight'));
    renderPayouts();
    playSound('bet');

    let draw = [];
    let hits = 0;
    let sHitNum = false;

    try {
        // Integration: Play via Adapter
        const risk = DOM.riskLevel ? DOM.riskLevel.value : 'classic';
        // Sanitize Picks (Safety for grid range and ensure integers for strict Python backend)
        const numericPicks = game.picks.map(Number).filter(p => p >= 1 && p <= 40);

        const playRes = await adapter.play(currentBet, risk, game.nonce, {
            picks: numericPicks,
            superball: game.super
        });

        if (playRes.mock) {
            // Mock / Local logic
            draw = generateDraw();
        } else {
            // Real RGS Logic
            // Actual Schema: { balance, round: { state: [{ type: "reveal", drawn: [...] }] } }
            const outcome = playRes.outcome || {};
            const roundState = playRes.round?.state || [];
            const revealState = roundState.find(s => s.type === 'reveal') || {};

            // Try multiple paths for drawn numbers
            const rawDraw = revealState.drawn ||           // Actual RGS path
                outcome.numbers ||
                outcome.drawn_numbers ||
                outcome.drawnNumbers ||
                [];

            // ROBUST MAPPING FOR KENO 40:
            // RGS returns 20 balls (1-80), but we need 10 balls (1-40).
            // We map 1-80 to 1-40 using modulo to preserve entropy.
            const verifiedBalls = new Set();
            for (const b of rawDraw) {
                const n = Number(b);
                if (!isNaN(n)) {
                    // Map 1-80 to 1-40
                    const mapped = ((n - 1) % 40) + 1;
                    verifiedBalls.add(mapped);
                }
            }

            // Convert to array and take target 10 balls
            draw = Array.from(verifiedBalls).slice(0, 10);

            if (draw.length < 10) {
                console.warn("[HexaKeno] Filtered RGS draw too small. Falling back to local gen. Response:", JSON.stringify(playRes));
                draw = generateDraw();
            } else {
                console.log('[HexaKeno] STAKE_RGS_FINAL:', draw);
            }

            // Balance will be synced via 'balanceUpdate' event from RGS Client
        }
    } catch (err) {
        console.error("Play failed", err);
        game.running = false;
        return false;
    }

    // Proceed to Visuals - Ultra-fast draw mode
    const ballDelay = game.turbo ? 15 : 100; // Speed optimized: 15ms turbo, 100ms normal

    for (let i = 0; i < draw.length; i++) {
        const ball = draw[i];
        const hex = HEX_CACHE.get(ball);
        const isHit = game.picks.includes(ball);
        const isSuper = (i === 9 && game.super);

        if (isSuper && !game.turbo) {
            await launchSuperball(ball, hex, isHit);
        } else {
            handleBallLand(ball, hex, isHit, isSuper);
            // Always yield to the browser rendering engine to prevent frame drops in Turbo mode
            await new Promise(r => setTimeout(r, ballDelay));
        }

        if (isHit) {
            hits++;
            if (isSuper) sHitNum = true;
        }
    }

    // After all balls drawn, do NOT mark misses on selected tiles (User Reguest: only drawn numbers get miss animation)
    // game.picks.forEach(pick => { ... });

    game.nonce++;
    await finalize(hits, sHitNum, currentBet);

    // NOTE: Explicit endRound call is now handled in finalize()
    // This ensures cleaner session state management

    return true;
}

async function launchSuperball(num, hex, isHit) {
    // Safety check: if hex element doesn't exist, fall back to regular handling
    if (!hex) {
        console.warn('[HexaKeno] Superball target hex not found for:', num);
        handleBallLand(num, null, isHit, true);
        return;
    }

    const ball = document.createElement('div');
    ball.className = 'flying-ball';
    ball.innerText = num;
    document.body.appendChild(ball);

    // Starting Position (Professor Cave origin - roughly top right)
    const startX = window.innerWidth * 0.85;
    const startY = -60;

    // Target Position
    const rect = hex.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2 - 30;
    const targetY = rect.top + rect.height / 2 - 30;

    ball.style.left = `${startX}px`;
    ball.style.top = `${startY}px`;
    ball.style.transform = 'scale(0)';

    // Force reflow
    void ball.offsetWidth;

    // Phase 1: Launch & Arc
    ball.style.transform = 'scale(2) translate(-100px, 100px)';

    await new Promise(r => setTimeout(r, game.turbo ? 150 : 350));

    // Phase 2: Targeted Impact
    ball.style.left = `${targetX}px`;
    ball.style.top = `${targetY}px`;
    ball.style.transform = 'scale(1) rotate(720deg)';

    await new Promise(r => setTimeout(r, game.turbo ? 200 : 450));

    // Impact
    handleBallLand(num, hex, isHit, true);
    vfx.megaBurst(targetX + 30, targetY + 30);

    // Bounce FX on Hex (Safety check for null hex)
    if (hex) {
        hex.style.transform = 'translateY(-10px) scale(1.3)';
        setTimeout(() => hex.style.transform = '', 300);
    }

    ball.remove();
}

function handleBallLand(num, hex, isHit, isSuper) {
    if (hex) {
        if (isHit) {
            hex.classList.add(isSuper ? 'super-hit' : 'hit');
            hex.classList.add('win-highlight'); // Persistent green glow
            playSound(isSuper ? 'superHit' : 'hit');
            const rect = hex.getBoundingClientRect();
            if (isSuper) vfx.megaBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
            else vfx.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
            // Drawn but NOT selected -> 'miss' state (as requested by user)
            hex.classList.add('miss');
            playSound('draw');
        }
    }

    // Update strip
    const icon = document.createElement('div');
    icon.className = `drawn-icon ${isSuper ? 'super-hit' : (isHit ? 'hit' : 'miss')}`;
    icon.innerText = num;
    DOM.drawnBalls.prepend(icon);
    if (DOM.drawnBalls.children.length > 20) DOM.drawnBalls.lastChild.remove();
}

function animateSuperBall(num, targetEl) {
    return new Promise(resolve => {
        const drawnStrip = DOM.drawnBalls;
        const lastDrawn = drawnStrip ? drawnStrip.lastElementChild : null;
        if (!lastDrawn || !targetEl) { resolve(); return; }

        const startRect = lastDrawn.getBoundingClientRect();
        const endRect = targetEl.getBoundingClientRect();

        const fb = document.createElement('div');
        fb.className = 'flying-ball';
        fb.innerText = num;
        fb.style.position = 'fixed';
        fb.style.left = startRect.left + 'px';
        fb.style.top = startRect.top + 'px';
        fb.style.transformOrigin = 'center center';
        fb.style.zIndex = '1000';
        document.body.appendChild(fb);

        // Calculate deltas
        const deltaX = (endRect.left + endRect.width / 2) - (startRect.left + 20);
        const deltaY = (endRect.top + endRect.height / 2) - (startRect.top + 20);

        // WAAPI Keyframes for Arc
        const flightKeyframes = [
            { transform: 'translate(0, 0) scale(1)', offset: 0 },
            { transform: `translate(${deltaX * 0.5}px, ${deltaY * 0.5 - 100}px) scale(1.8)`, offset: 0.5 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(1.2)`, offset: 1 }
        ];

        const flightOptions = {
            duration: 800,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Snappy elastic feel
            fill: 'forwards'
        };

        const animation = fb.animate(flightKeyframes, flightOptions);

        animation.onfinish = () => {
            // Impact Pop
            const impactKeyframes = [
                { transform: `translate(${deltaX}px, ${deltaY}px) scale(1.2)`, filter: 'brightness(1)' },
                { transform: `translate(${deltaX}px, ${deltaY}px) scale(2)`, filter: 'brightness(3)' },
                { transform: `translate(${deltaX}px, ${deltaY}px) scale(1.0)`, filter: 'brightness(1)' }
            ];

            const impactEffect = fb.animate(impactKeyframes, { duration: 400, easing: 'ease-out' });

            impactEffect.onfinish = () => {
                fb.remove();
                resolve();
            };
        };
    });
}

async function finalize(hits, sHitNum, currentBet) {
    const risk = DOM.riskLevel.value;
    const table = STAKE_DATA[risk][game.picks.length];
    const baseM = table[hits];

    // Win Logic
    let winM = 0;
    if (baseM > 0) {
        if (sHitNum && game.super) winM = baseM * 7; // Fixed 7x multiplier
        else winM = baseM;
    }

    const winAmount = currentBet * winM;

    // Apply official server balance (cached during spin) if available to sync with actual RGS state
    if (game.serverBalance !== undefined) {
        // We know the ultimate balance the RGS replied with
        game.balance = game.serverBalance;
        game.serverBalance = undefined; // consume it
    } else {
        // Fallback to local match
        game.balance += winAmount;
    }

    // Note: endRound() is now called in runRound() after finalize() to properly await it

    if (DOM.roundId) DOM.roundId.innerText = game.nonce;

    if (winM > 0) {
        playSound(sHitNum && game.super ? 'superWin' : 'win');

        // Advanced VFX Celebration
        triggerEnergy(winM >= 5 ? 1.0 : 0.5);

        if (winM >= 5) {
            vfx.megaBurst(window.innerWidth / 2, window.innerHeight / 2);
        }

        // Big Win Banner for 10x+ wins
        if (winM >= 10) {
            // Use the real calculated dollar win amount (server scale agnostic) for the banner
            showBigWin(winAmount, winM);
        }
    } else {
        // Negative Reaction on 0 hits (Loss)
        if (window.vfx && window.vfx.mascot) {
            window.vfx.playMascot('hurt');
        }
    }

    // Auto Strategy
    if (game.autoActive) {
        let isWin = (winM > 0);
        let inc = isWin ? parseFloat(DOM.onWinInc ? DOM.onWinInc.value : 0) : parseFloat(DOM.onLossInc ? DOM.onLossInc.value : 0);

        if (inc !== 0) {
            let newBet = currentBet + (currentBet * (inc / 100));
            DOM.betAmount.value = newBet.toFixed(2);
        } else if (isWin) {
            DOM.betAmount.value = game.baseBet.toFixed(2);
        }
    }

    addHistory(winM, winM > baseM);
    updateStats();
    game.running = false;
    updateSeeds();
    renderPayouts(hits, winM > baseM);

    // Close RGS round to prevent "stuck round" errors
    if (window.adapter) {
        await adapter.endRound().catch(e => console.warn('Failed to end round:', e));
    }

    game.running = false;
    updateBtn();
}

function addHistory(m, superHit) {
    const log = DOM.winHistory;
    if (!log) return;
    const p = document.createElement('div');
    p.className = `hist-pill ${m > 0 ? (superHit ? 'super' : 'win') : ''}`;
    p.innerText = m.toFixed(2) + 'x';
    log.prepend(p);
    if (log.children.length > 20) log.lastChild.remove();
}

function updateStats(noAnim = false) {
    const balEl = DOM.balance;
    const wagEl = DOM.wagered;
    if (!balEl || !wagEl) return;

    if (noAnim) {
        balEl.innerText = formatCurrency(game.balance);
        balEl.dataset.currentRawValue = game.balance;
        wagEl.innerText = formatCurrency(game.wagered);
        return;
    }

    // Balance Count-up/down
    animateValue(balEl, game.balance);
    wagEl.innerText = formatCurrency(game.wagered);
}

function animateValue(el, target) {
    // Rely on a stored float value to prevent currency symbol parsing errors (e.g. 'GC 1,000.00' -> NaN)
    const current = parseFloat(el.dataset.currentRawValue) || parseFloat(el.innerText.replace(/[^0-9.-]+/g, '')) || 0;
    if (Math.abs(current - target) < 0.001) {
        el.innerText = formatCurrency(target);
        el.dataset.currentRawValue = target;
        return;
    }

    // Cancel existing animation on this element
    if (el.dataset.rafId) {
        cancelAnimationFrame(Number(el.dataset.rafId));
        delete el.dataset.rafId;
    }

    const duration = 400;
    const startTime = performance.now();

    function update(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const value = current + (target - current) * ease;
        el.innerText = formatCurrency(value);
        el.dataset.currentRawValue = value;

        if (progress < 1) {
            el.dataset.rafId = requestAnimationFrame(update);
        } else {
            el.innerText = formatCurrency(target);
            el.dataset.currentRawValue = target;
            delete el.dataset.rafId;
        }
    }
    el.dataset.rafId = requestAnimationFrame(update);
}

function autoPick() {
    if (game.running) return;
    clearPicks();
    while (game.picks.length < 10) {
        const r = Math.floor(Math.random() * 40) + 1;
        if (!game.picks.includes(r)) {
            game.picks.push(r);
            const hex = HEX_CACHE.get(r);
            if (hex) hex.classList.add('selected');
        }
    }
    renderPayouts();
}

function clearPicks() {
    if (game.running) return;
    game.picks = [];
    // Optimized clearing using Cache
    HEX_CACHE.forEach(hex => {
        hex.classList.remove('selected', 'hit', 'miss', 'super-hit', 'drawn');
        // Remove any orb vfx
        const orb = hex.querySelector('.crystal-orb');
        if (orb) orb.remove();
    });
    DOM.drawnBalls.innerHTML = '';
    renderPayouts();
}

function addDrawnBall(num, isHit, isSuper) {
    const strip = DOM.drawnBalls;
    const b = document.createElement('div');
    b.className = 'drawn-icon';
    if (isSuper) b.classList.add('super-hit');
    else if (isHit) b.classList.add('hit');
    else b.classList.add('miss');
    b.innerText = num;
    strip.appendChild(b);
}


/* --- MODAL LOGIC --- */
window.toggleRules = function () {
    const m = document.getElementById('rulesModal');
    if (m) m.classList.toggle('hidden');
}

window.closeAutoConfirm = function () {
    const m = document.getElementById('autoConfirmModal');
    if (m) m.classList.add('hidden');
}

window.confirmAutoStart = function () {
    closeAutoConfirm();
    startAuto();
}

/* --- KEYBOARD LISTENERS --- */
window.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (document.activeElement.tagName === 'INPUT') return;

    // Helper for checkbox toggling
    const toggle = (id) => {
        const el = document.getElementById(id);
        if (el) { el.click(); }
    };

    switch (e.code) {
        case 'Space':
            e.preventDefault(); // Prevent scroll
            handleAction();
            break;
        case 'KeyR':
            autoPick();
            break;
        case 'KeyC':
            clearPicks();
            break;
        case 'KeyS':
            toggle('superToggle');
            break;
        case 'KeyT':
            toggle('turboToggle');
            break;
    }
});

/* --- PERSISTENCE --- */
function saveState() {
    const state = {
        bet: DOM.betAmount ? DOM.betAmount.value : 1,
        risk: DOM.riskLevel ? DOM.riskLevel.value : 'classic',
        super: DOM.superToggle ? DOM.superToggle.checked : false,
        turbo: DOM.turboToggle ? DOM.turboToggle.checked : false
    };
    localStorage.setItem('hk_prefs', JSON.stringify(state));
}

function restoreState() {
    try {
        const raw = localStorage.getItem('hk_prefs');
        if (!raw) return;
        const state = JSON.parse(raw);

        if (state.bet && DOM.betAmount) DOM.betAmount.value = state.bet;
        if (state.risk && DOM.riskLevel) DOM.riskLevel.value = state.risk;

        // Use click to toggle visual checks correctly if needed, or set checked manually
        if (state.super && !DOM.superToggle.checked) DOM.superToggle.click();
        if (state.turbo && !DOM.turboToggle.checked) DOM.turboToggle.click();

        console.log('[HexaKeno] State Restored:', state);
    } catch (e) {
        console.warn('Failed to restore state', e);
    }
}

// Custom Dropdown Handlers
window.toggleRiskDropdown = function (event) {
    event.stopPropagation();
    const options = document.getElementById('riskOptions');
    if (options) {
        options.classList.toggle('show');
    }
}

window.setRisk = function (risk) {
    const nativeSelect = document.getElementById('riskLevel');
    const label = document.getElementById('riskValueLabel');
    if (nativeSelect && label) {
        nativeSelect.value = risk;
        label.innerText = risk.charAt(0).toUpperCase() + risk.slice(1);

        // Update selection styling
        const options = document.querySelectorAll('.custom-option');
        options.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.innerText.toLowerCase() === risk) {
                opt.classList.add('selected');
            }
        });

        // Hide dropdown
        const optionsContainer = document.getElementById('riskOptions');
        if (optionsContainer) optionsContainer.classList.remove('show');

        // Trigger simulation update
        if (typeof renderPayouts === 'function') renderPayouts();

        // Save state if needed
        if (typeof saveState === 'function') saveState();
    }
}

// Close dropdown when clicking outside
window.addEventListener('click', function (e) {
    const optionsContainer = document.getElementById('riskOptions');
    const trigger = document.querySelector('.select-trigger');

    if (optionsContainer && optionsContainer.classList.contains('show')) {
        if (!optionsContainer.contains(e.target) && !trigger.contains(e.target)) {
            optionsContainer.classList.remove('show');
        }
    }
});

// Live Game Clock
function updateClock() {
    const el = document.getElementById('gameClock');
    if (!el) return;
    const now = new Date();
    el.innerText = now.toLocaleTimeString('en-US', { hour12: true });
}
setInterval(updateClock, 1000);
updateClock();

console.log('[HexaKeno] Version 1.0.45 Loaded (Stake Release)');
