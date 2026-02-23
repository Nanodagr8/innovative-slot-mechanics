/**
 * Uranus Spins: Core Game Engine (PixiJS v8 - Arcade Edition)
 * ---------------------------------------------------------
 */

const CONFIG = {
    shipSpeed: 8,
    bulletSpeed: 15,
    spawnRate: 1500,
    maxBullets: 25
};

// --- Object Pooling System ---
class MicroUISystem {
    constructor(container) {
        this.container = container;
        this.pool = [];
        this.active = [];
    }

    spawnTap(x, y) {
        const ring = this.pool.pop() || new PIXI.Graphics();
        ring.clear().lineStyle(2, 0x00f2ff).drawCircle(0, 0, 10);
        ring.x = x; ring.y = y;
        ring.visible = true; ring.alpha = 1; ring.scale.set(1);
        this.container.addChild(ring);
        this.active.push({ obj: ring, type: 'tap', life: 1.0 });
    }

    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const item = this.active[i];
            item.life -= 0.05 * dt;
            if (item.type === 'tap') {
                item.obj.scale.set(1 + (1 - item.life) * 2);
                item.obj.alpha = item.life;
            }
            if (item.life <= 0) {
                item.obj.visible = false;
                this.active.splice(i, 1);
                this.pool.push(item.obj);
            }
        }
    }
}

// --- Text Effect System ---
class BackgroundSystem {
    constructor(container) {
        this.container = container;
        this.layers = [];
        this.currentMode = 'BASE';
        this.filter = new PIXI.filters.ColorMatrixFilter();
        this.container.filters = [this.filter];
    }

    addLayer(texture, scrollSpeed, scale = 1, alpha = 1) {
        const tilingSprite = new PIXI.TilingSprite(texture, window.innerWidth, window.innerHeight);
        tilingSprite.tileScale.set(scale);
        tilingSprite.alpha = alpha;
        tilingSprite.scrollSpeed = scrollSpeed;
        this.container.addChild(tilingSprite);
        this.layers.push(tilingSprite);
        return tilingSprite;
    }

    update(dt) {
        this.layers.forEach(l => {
            l.tilePosition.y += l.scrollSpeed * dt;
            l.width = window.innerWidth;
            l.height = window.innerHeight;
        });
    }

    setMode(mode) {
        this.currentMode = mode;
        this.filter.reset();

        switch (mode) {
            case 'FREE_SPINS':
                this.filter.hue(180, false); // Cyan shift
                this.filter.saturate(1.5, false);
                break;
            case 'SUPER_BONUS':
                this.filter.hue(45, false); // Gold shift
                this.filter.saturate(2.0, false);
                break;
            default:
                this.filter.reset();
        }
    }
}

class SpineUIManager {
    constructor(game, container) {
        this.game = game;
        this.container = container;
        this.buttons = new Map();
        this.labels = new Map();
        this.hud = null;
    }

    async init() {
        console.log("[Uranus] Initializing Spine UI...");
        // Placeholder: Use crystal-mascot for HUD if real HUD spine not yet available
        // In production, this will use assets/ui/spine/hud.json
        const mascotData = this.game.gameAssets['assets/spine/crystal-mascot.json'];

        if (mascotData) {
            this.setupHUD(mascotData);
            this.setupLabels();

            // Placeholder Buttons (Spin, +, -)
            this.addButton('spin', mascotData, window.innerWidth - 100, window.innerHeight - 80, () => {
                console.log("[SpineUI] SPIN Tapped");
                this.game.fire();
            });

            this.addButton('plus', mascotData, 100, window.innerHeight - 80, () => {
                if (window.changeBet) window.changeBet(0.1);
            });

            this.addButton('minus', mascotData, 150, window.innerHeight - 80, () => {
                if (window.changeBet) window.changeBet(-0.1);
            });
        }
    }

    setupHUD(spineData) {
        this.hud = new PIXI.spine.Spine(spineData.spineData);
        this.hud.scale.set(0.6); // Increased from 0.3
        this.hud.x = window.innerWidth / 2;
        this.hud.y = window.innerHeight - 80;
        this.hud.state.setAnimation(0, 'idle_hover', true);
        this.container.addChild(this.hud);
    }

    addButton(id, spineData, x, y, callback) {
        const btn = new PIXI.spine.Spine(spineData.spineData);
        btn.x = x; btn.y = y;
        btn.scale.set(0.2);
        btn.state.setAnimation(0, 'idle_hover', true);

        btn.eventMode = 'static';
        btn.cursor = 'pointer';

        btn.on('pointerover', () => {
            btn.state.setAnimation(0, 'shoot', false); // Feedback animation
            btn.state.addAnimation(0, 'idle_hover', true, 0);
        });

        btn.on('pointertap', () => {
            if (callback) callback();
        });

        this.container.addChild(btn);
        this.buttons.set(id, btn);
        return btn;
    }

    setupLabels() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 22,
            fill: '#00f2ff',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowDistance: 2
        });

        // Credits Label
        const credits = new PIXI.Text('CREDITS: 0.00', style);
        credits.anchor.set(0.5);
        this.container.addChild(credits);
        this.labels.set('credits', credits);

        // Bet Label
        const bet = new PIXI.Text('BET: 1.00', style);
        bet.anchor.set(0.5);
        this.container.addChild(bet);
        this.labels.set('bet', bet);

        // Score Label
        const score = new PIXI.Text('SCORE: 0', style);
        score.anchor.set(0.5);
        this.container.addChild(score);
        this.labels.set('score', score);

        // Jackpot Style & Labels
        const jpStyle = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 16,
            fill: '#ffd700',
            fontWeight: 'bold'
        });

        const mega = new PIXI.Text('MEGA: 0.00', jpStyle);
        mega.anchor.set(0.5);
        this.container.addChild(mega);
        this.labels.set('mega', mega);

        const major = new PIXI.Text('MAJOR: 0.00', jpStyle);
        major.anchor.set(0.5);
        this.container.addChild(major);
        this.labels.set('major', major);

        const mini = new PIXI.Text('MINI: 0.00', jpStyle);
        mini.anchor.set(0.5);
        this.container.addChild(mini);
        this.labels.set('mini', mini);

        // UI Panel Glass Backing
        this.panelBase = new PIXI.Graphics();
        this.panelBase.beginFill(0x0a0a1f, 0.4); // Semi-transparent Navy
        this.panelBase.lineStyle(2, 0x00f2ff, 0.2); // Subtle border
        this.panelBase.drawRoundedRect(-450, -50, 900, 100, 15);
        this.panelBase.endFill();
        this.container.addChildAt(this.panelBase, 0);

        // Label Gloss Backings
        this.labels.forEach((label) => {
            const backing = new PIXI.Graphics();
            backing.beginFill(0x000000, 0.2);
            backing.drawRoundedRect(-85, -28, 170, 56, 12);
            backing.endFill();
            label.addChildAt(backing, 0);
        });
    }

    update(dt) {
        // Handle responsive layout
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight - 80;

        if (this.hud) {
            this.hud.x = centerX;
            this.hud.y = centerY;
            this.hud.update(dt / 60);
        }

        // Sync Labels
        if (this.game.adapter) {
            const credits = this.labels.get('credits');
            if (credits) {
                credits.text = `CREDITS\n${this.game.adapter.balance.toFixed(2)}`;
                credits.x = centerX + 250;
                credits.y = centerY;
            }

            const bet = this.labels.get('bet');
            if (bet) {
                bet.text = `BET\n${this.game.adapter.betPerShot.toFixed(2)}`;
                bet.x = centerX - 250;
                bet.y = centerY;
            }
        }

        if (this.game.scoreManager) {
            const score = this.labels.get('score');
            if (score) {
                score.text = `SCORE: ${this.game.scoreManager.score.toLocaleString()}`;
                score.x = centerX;
                score.y = centerY - 100; // Move up to clear mascot
            }
        }

        // Jackpot Sync
        const megaEl = document.getElementById('jackpot-mega');
        if (megaEl) {
            const mega = this.labels.get('mega');
            if (mega) {
                mega.text = `MEGA: ${megaEl.innerText}`;
                mega.x = centerX - 200;
                mega.y = centerY + 30; // Closer to panel
            }
        }

        const majorEl = document.getElementById('jackpot-major');
        if (majorEl) {
            const major = this.labels.get('major');
            if (major) {
                major.text = `MAJOR: ${majorEl.innerText}`;
                major.x = centerX;
                major.y = centerY + 30;
            }
        }

        const miniEl = document.getElementById('jackpot-mini');
        if (miniEl) {
            const mini = this.labels.get('mini');
            if (mini) {
                mini.text = `MINI: ${miniEl.innerText}`;
                mini.x = centerX + 200;
                mini.y = centerY + 30;
            }
        }

        // Reposition Buttons
        const spin = this.buttons.get('spin');
        if (spin) {
            spin.x = window.innerWidth - 100;
            spin.y = centerY;
        }

        const plus = this.buttons.get('plus');
        if (plus) {
            plus.x = 100;
            plus.y = centerY;
        }

        const minus = this.buttons.get('minus');
        if (minus) {
            minus.x = 180;
            minus.y = centerY;
        }

        this.buttons.forEach(btn => btn.update(dt / 60));
    }
}

class TextEffectSystem {
    constructor(container, capacity = 50) {
        this.container = container;
        this.pool = [];
        this.active = [];
        this.capacity = capacity;

        const style = new PIXI.TextStyle({ fontFamily: 'Courier New', fontSize: 24, fill: '#ffd700', fontWeight: 'bold' });

        for (let i = 0; i < capacity; i++) {
            // PixiJS v7 syntax
            const t = new PIXI.Text('', style);
            t.anchor.set(0.5);
            t.visible = false;
            this.container.addChild(t);
            this.pool.push(t);
        }
    }

    spawn(x, y, textStr, color = '#ffd700') {
        const t = this.pool.pop();
        if (!t) return;

        t.text = textStr;
        t.style.fill = color;
        t.x = x; t.y = y;
        t.visible = true;
        t.alpha = 1;
        t.scale.set(1);
        t.life = 1.0;

        this.active.push(t);
    }

    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const t = this.active[i];
            t.life -= 0.02 * dt;
            t.y -= 1 * dt;
            t.alpha = t.life;

            if (t.life <= 0) {
                t.visible = false;
                this.active.splice(i, 1);
                this.pool.push(t);
            }
        }
    }
}

class SpineEventManager {
    /** @param {UranusGame} game */
    constructor(game) {
        this.game = game;
    }

    /** @param {PIXI.spine.Spine} spineObj */
    attach(spineObj) {
        spineObj.state.addListener({
            event: (trackIndex, event) => {
                this.handleEvent(spineObj, event);
            }
        });
    }

    handleEvent(spineObj, event) {
        const name = event.data.name;
        switch (name) {
            case 'on_fire':
                this.game.spawnSpark(spineObj.x, spineObj.y - 20, 0x00f2ff); // Temporary shot feedback
                if (window.audio) window.audio.playShot();
                break;
            case 'spawn_explosion_small':
                this.game.spawnExplosion(spineObj.x, spineObj.y, 20, 0xffffff);
                break;
            case 'shake_small':
                this.game.triggerScreenShake(2);
                break;
            case 'shake_big':
                this.game.triggerScreenShake(8);
                break;
        }
    }
}

class CelebrationManager {
    /** @param {UranusGame} game */
    constructor(game) {
        this.game = game;
        this.isCelebrating = false;
    }

    async triggerBigWin(amount) {
        if (this.isCelebrating) return;
        this.isCelebrating = true;

        const banner = document.getElementById('win-banner');
        banner.querySelector('.win-amount').innerText = `BIG WIN: $${amount.toFixed(2)}`;
        banner.classList.remove('hidden');
        banner.classList.add('celebration-vibrate');

        // Cinematic Freeze (Logic from timing specs: 0-200ms dim)
        const dimFilter = new PIXI.ColorMatrixFilter();
        dimFilter.brightness(0.5, false); // PixiJS v7 syntax
        this.game.mainContainer.filters = [dimFilter];

        // Spawn Coins (UI-Layered particles)
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.game.spawnSpark(window.innerWidth / 2, window.innerHeight / 2, 0xffd700);
            }, i * 20);
        }

        await new Promise(r => setTimeout(r, 2200)); // Total 2200ms per specs

        banner.classList.add('hidden');
        banner.classList.remove('celebration-vibrate');
        this.game.mainContainer.filters = [];
        this.isCelebrating = false;
    }
}

// =============================================================================
// GALAGA-STYLE WAVE FORMATION SYSTEM
// =============================================================================
class WaveManager {
    static PATTERNS = {
        GRID: 'grid',
        V_SHAPE: 'v_shape',
        DIAMOND: 'diamond',
        SPIRAL: 'spiral'
    };

    constructor(game) {
        this.game = game;
        this.currentWave = 0;
        this.waveEnemies = [];
        this.formationX = 0;
        this.formationY = 0;
        this.formationDir = 1;
        this.formationSpeed = 0.5;
        this.bobOffset = 0;
    }

    spawnWave(pattern = null) {
        const patterns = Object.values(WaveManager.PATTERNS);
        pattern = pattern || patterns[this.currentWave % patterns.length];

        const positions = this.getFormationPositions(pattern);
        const screenWidth = window.innerWidth;

        this.formationX = screenWidth / 2;
        this.formationY = 120;

        positions.forEach((pos, i) => {
            setTimeout(() => {
                const enemy = this.game.spawnFormationEnemy(pos.x, pos.y, pos.type);
                if (enemy) {
                    enemy.formationOffset = pos;
                    enemy.entryProgress = 0;
                    enemy.isInFormation = false;
                    enemy.isDiving = false;
                    this.waveEnemies.push(enemy);
                }
            }, i * 100); // Staggered entry
        });

        this.currentWave++;
    }

    getFormationPositions(pattern) {
        const positions = [];
        const spacing = 60;

        switch (pattern) {
            case WaveManager.PATTERNS.GRID:
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 8; col++) {
                        positions.push({
                            x: (col - 3.5) * spacing,
                            y: row * spacing,
                            type: row === 0 ? 'elite' : row === 1 ? 'fighter' : 'bug'
                        });
                    }
                }
                break;

            case WaveManager.PATTERNS.V_SHAPE:
                for (let i = 0; i < 11; i++) {
                    const offset = Math.abs(i - 5);
                    positions.push({
                        x: (i - 5) * spacing,
                        y: offset * spacing * 0.6,
                        type: offset < 2 ? 'elite' : 'fighter'
                    });
                }
                break;

            case WaveManager.PATTERNS.DIAMOND:
                const diamondCoords = [
                    [0, -2], [-1, -1], [1, -1], [-2, 0], [0, 0], [2, 0],
                    [-1, 1], [1, 1], [0, 2]
                ];
                diamondCoords.forEach((coord, i) => {
                    positions.push({
                        x: coord[0] * spacing,
                        y: coord[1] * spacing * 0.8,
                        type: i === 4 ? 'elite' : 'fighter'
                    });
                });
                break;

            case WaveManager.PATTERNS.SPIRAL:
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = 50 + i * 8;
                    positions.push({
                        x: Math.cos(angle) * radius,
                        y: Math.sin(angle) * radius * 0.5,
                        type: i % 3 === 0 ? 'elite' : 'bug'
                    });
                }
                break;
        }

        return positions;
    }

    update(dt) {
        // Formation movement (left-right sweep)
        this.formationX += this.formationDir * this.formationSpeed * dt;

        const margin = 150;
        if (this.formationX > window.innerWidth - margin) {
            this.formationDir = -1;
        } else if (this.formationX < margin) {
            this.formationDir = 1;
        }

        // Bobbing motion
        this.bobOffset = Math.sin(Date.now() / 500) * 10;

        // Update each enemy in formation
        for (let i = this.waveEnemies.length - 1; i >= 0; i--) {
            const enemy = this.waveEnemies[i];

            if (!enemy || !enemy.parent) {
                this.waveEnemies.splice(i, 1);
                continue;
            }

            if (enemy.isDiving) continue;

            // Entry animation
            if (!enemy.isInFormation && enemy.entryProgress < 1) {
                enemy.entryProgress += 0.02 * dt;
                const t = this.easeOutQuad(enemy.entryProgress);

                // Curved entry from top
                const startX = enemy.formationOffset.x + this.formationX;
                const startY = -50;
                const targetX = enemy.formationOffset.x + this.formationX;
                const targetY = enemy.formationOffset.y + this.formationY;

                enemy.x = startX + (targetX - startX) * t;
                enemy.y = startY + (targetY - startY) * t;

                if (enemy.entryProgress >= 1) {
                    enemy.isInFormation = true;
                }
            } else if (enemy.isInFormation) {
                // Follow formation
                enemy.x = enemy.formationOffset.x + this.formationX;
                enemy.y = enemy.formationOffset.y + this.formationY + this.bobOffset;
            }
        }

        // Random dive triggers
        if (Math.random() < 0.002 * dt && this.waveEnemies.length > 0) {
            const candidates = this.waveEnemies.filter(e => e && e.isInFormation && !e.isDiving);
            if (candidates.length > 0) {
                const diver = candidates[Math.floor(Math.random() * candidates.length)];
                this.game.diveController.startDive(diver);
            }
        }
    }

    easeOutQuad(t) {
        return t * (2 - t);
    }

    clear() {
        this.waveEnemies = [];
    }
}

// =============================================================================
// DIVING ATTACK CONTROLLER
// =============================================================================
class DiveController {
    constructor(game) {
        this.game = game;
        this.divers = [];
    }

    startDive(enemy) {
        if (!enemy || enemy.isDiving) return;

        enemy.isDiving = true;
        enemy.diveProgress = 0;

        // Calculate dive path
        enemy.diveStartX = enemy.x;
        enemy.diveStartY = enemy.y;

        // Target slightly ahead of player
        const playerX = this.game.ship.x + (Math.random() - 0.5) * 100;
        enemy.diveTargetX = playerX;
        enemy.diveTargetY = window.innerHeight + 50;

        // Control point for Bezier curve (creates swooping motion)
        enemy.diveCtrlX = enemy.x + (playerX > enemy.x ? 150 : -150);
        enemy.diveCtrlY = window.innerHeight * 0.4;

        enemy.diveSpeed = 0.8 + Math.random() * 0.4;

        this.divers.push(enemy);

        // Play dive warning sound
        if (window.audio) window.audio.playDiveWarning?.();
    }

    update(dt) {
        for (let i = this.divers.length - 1; i >= 0; i--) {
            const enemy = this.divers[i];

            if (!enemy || !enemy.parent) {
                this.divers.splice(i, 1);
                continue;
            }

            enemy.diveProgress += 0.015 * enemy.diveSpeed * dt;

            const t = enemy.diveProgress;

            // Quadratic Bezier curve
            const oneMinusT = 1 - t;
            enemy.x = oneMinusT * oneMinusT * enemy.diveStartX +
                2 * oneMinusT * t * enemy.diveCtrlX +
                t * t * enemy.diveTargetX;
            enemy.y = oneMinusT * oneMinusT * enemy.diveStartY +
                2 * oneMinusT * t * enemy.diveCtrlY +
                t * t * enemy.diveTargetY;

            // Rotate to face direction of travel
            const dx = enemy.x - (enemy.prevX || enemy.x);
            const dy = enemy.y - (enemy.prevY || enemy.y);
            enemy.rotation = Math.atan2(dy, dx) + Math.PI / 2;
            enemy.prevX = enemy.x;
            enemy.prevY = enemy.y;

            // Fire during dive
            if (Math.random() < 0.02 * dt) {
                this.game.fireEnemyBullet?.(enemy.x, enemy.y);
            }

            // Dive complete
            if (t >= 1) {
                this.divers.splice(i, 1);
                enemy.isDiving = false;

                // Remove from wave (they flew off screen)
                const waveIdx = this.game.waveManager.waveEnemies.indexOf(enemy);
                if (waveIdx > -1) {
                    this.game.waveManager.waveEnemies.splice(waveIdx, 1);
                }

                // Destroy or recycle
                if (enemy.parent) {
                    enemy.parent.removeChild(enemy);
                    this.game.enemyPool?.release(enemy);
                }
            }
        }
    }
}

// =============================================================================
// SCORING SYSTEM WITH COMBOS
// =============================================================================
class ScoreManager {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('uranusHighScore') || '0');
        this.combo = 0;
        this.comboTimer = 0;
        this.comboDecayTime = 120; // 2 seconds at 60fps
        this.killStreak = 0;
        this.totalKills = 0;

        // Point values by enemy type
        this.pointValues = {
            bug: 50,
            fighter: 100,
            elite: 200,
            boss: 1000
        };

        // Combo multipliers
        this.comboMultipliers = [1, 1.5, 2, 3, 5, 10];
    }

    addKill(enemyType, x, y) {
        const basePoints = this.pointValues[enemyType] || 100;

        // Reset combo timer
        this.comboTimer = this.comboDecayTime;

        // Increment combo
        this.combo = Math.min(this.combo + 1, this.comboMultipliers.length - 1);

        // Calculate points with multiplier
        const multiplier = this.comboMultipliers[this.combo];
        const points = Math.round(basePoints * multiplier);

        this.score += points;
        this.killStreak++;
        this.totalKills++;

        // Spawn score popup
        const popupText = this.combo > 0 ? `+${points} x${multiplier}` : `+${points}`;
        const color = this.combo >= 4 ? '#ff00ff' : this.combo >= 2 ? '#00ffff' : '#ffd700';
        this.game.textEffects?.spawn(x, y - 20, popupText, color);

        // Combo sound
        if (this.combo >= 2 && window.audio) {
            window.audio.playCombo?.(this.combo);
        }

        // Kill streak bonuses
        if (this.killStreak === 5) this.spawnStreakBonus('5 KILL STREAK!', 500);
        else if (this.killStreak === 10) this.spawnStreakBonus('10 KILLS!', 1000);
        else if (this.killStreak === 25) this.spawnStreakBonus('MASSACRE!', 2500);
        else if (this.killStreak === 50) this.spawnStreakBonus('UNSTOPPABLE!', 5000);
        else if (this.killStreak === 100) this.spawnStreakBonus('LEGENDARY!', 10000);

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('uranusHighScore', this.highScore.toString());
        }

        this.updateDisplay();

        return points;
    }

    spawnStreakBonus(text, bonus) {
        this.score += bonus;
        this.game.textEffects?.spawn(
            window.innerWidth / 2,
            window.innerHeight / 2 - 50,
            `${text} +${bonus}`,
            '#ff00ff'
        );
        this.game.triggerScreenShake?.(5);
    }

    update(dt) {
        // Decay combo
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
        } else if (this.combo > 0) {
            this.combo = 0;
            this.killStreak = 0;
        }
    }

    updateDisplay() {
        // Update score display in HUD
        const scoreEl = document.getElementById('score-display');
        if (scoreEl) scoreEl.textContent = this.score.toLocaleString();

        const highEl = document.getElementById('highscore-display');
        if (highEl) highEl.textContent = this.highScore.toLocaleString();

        const comboEl = document.getElementById('combo-display');
        if (comboEl) {
            if (this.combo > 0) {
                comboEl.textContent = `x${this.comboMultipliers[this.combo]}`;
                comboEl.style.display = 'block';
            } else {
                comboEl.style.display = 'none';
            }
        }
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.killStreak = 0;
        this.updateDisplay();
    }
}


class ParticleSystem {
    constructor(container, texture, capacity = 200) {
        this.container = container;
        this.texture = texture;
        this.pool = [];
        this.active = [];
        this.capacity = capacity;

        for (let i = 0; i < capacity; i++) {
            const p = new PIXI.Sprite(texture || PIXI.Texture.WHITE);
            p.anchor.set(0.5);
            p.visible = false;
            this.container.addChild(p);
            this.pool.push(p);
        }
    }

    spawn(x, y, color, speed, duration, lifeScale = 1.0) {
        const p = this.pool.pop();
        if (!p) return;

        p.visible = true;
        p.x = x; p.y = y;
        p.tint = color;
        p.blendMode = PIXI.BLEND_MODES.ADD;
        p.scale.set((Math.random() * 0.5 + 0.5) * lifeScale);
        p.alpha = 1;

        const angle = Math.random() * Math.PI * 2;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = 1.0;
        p.decay = 1.0 / duration;

        this.active.push(p);
    }

    update(dt) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const p = this.active[i];
            p.life -= p.decay * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha = p.life;

            if (p.life <= 0) {
                p.visible = false;
                this.active.splice(i, 1);
                this.pool.push(p);
            }
        }
    }
}

class ObjectPool {
    constructor(createFn, initialSize = 10) {
        this.createFn = createFn;
        this.pool = [];
        this.active = [];
        for (let i = 0; i < initialSize; i++) {
            const item = this.createFn();
            item.active = false;
            this.pool.push(item);
        }
    }

    get() {
        const item = this.pool.pop() || this.createFn();
        item.active = true;
        this.active.push(item);
        return item;
    }

    release(item) {
        const idx = this.active.indexOf(item);
        if (idx > -1) this.active.splice(idx, 1);
        // Reset properties
        item.active = false;
        item.rgsPromise = null;
        item.rgsTicket = null;

        if (item.spine) {
            item.spine.skeleton.setToSetupPose();
            item.spine.state.clearTracks();
            item.visible = true; // Container visible
            item.alpha = 1;
            item.scale.set(1);
            item.rotation = 0;
        } else if (item instanceof PIXI.Sprite) {
            item.alpha = 1;
            item.tint = 0xffffff;
            item.scale.set(1);
            item.rotation = 0;
        }


        this.pool.push(item);
    }
}

class UranusGame {
    constructor() {
        this.keys = {};
        this.isInitialized = false;
        this.lastFireTime = 0;

        // Systems
        this.spineEvents = new SpineEventManager(this);
        this.backgrounds = null;
        this.celebrations = new CelebrationManager(this);
        this.microUI = null;

        // Galaga-style systems
        this.waveManager = new WaveManager(this);
        this.diveController = new DiveController(this);
        this.scoreManager = new ScoreManager(this);

        // Pools
        this.bulletPool = null;
        this.enemyPool = null;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;

        this.init();
    }
    async init() {
        // PixiJS v7 sync constructor
        this.app = new PIXI.Application({
            view: document.getElementById('game-canvas'),
            resizeTo: window,
            backgroundColor: 0x0a0a0f, // Deep Space Black
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        // Load Game Assets
        try {
            console.log("[Uranus] Starting asset load...");

            // PixiJS v7 asset loading
            this.gameAssets = await PIXI.Assets.load([
                'assets/ship.png',
                'assets/laser.png',
                'assets/explosion.png',
                'assets/enemy_fighter.png',
                'assets/enemy_bug.png',
                'assets/far_stars.png',
                'assets/spine/crystal-mascot.json', // Load Spine Data
                'assets/ui/bg_space.png' // 8k Nebula Background
            ]);

            console.log("[Uranus] Game assets loaded:", this.gameAssets);

            // Map to expected keys
            this.gameAssets['ship'] = this.gameAssets['assets/ship.png'];
            this.gameAssets['laser'] = this.gameAssets['assets/laser.png'];
            this.gameAssets['explosion_vfx'] = this.gameAssets['assets/explosion.png'];
            this.gameAssets['enemy_fighter'] = this.gameAssets['assets/enemy_fighter.png'];
            this.gameAssets['enemy_bug'] = this.gameAssets['assets/enemy_bug.png'];
            this.gameAssets['far_stars'] = this.gameAssets['assets/far_stars.png'];
            this.gameAssets['bg_space'] = this.gameAssets['assets/ui/bg_space.png'];

        } catch (e) {
            console.error("[Uranus] Asset load failed", e);
        }

        // Try loading extracted sprite sheet atlases manually
        try {
            // Load the atlas JSON data and PNG textures
            const atlasData = await Promise.all([
                fetch('assets/atlases/extracted/enemies_base.json').then(r => r.json()),
                fetch('assets/atlases/extracted/player.json').then(r => r.json()),
                fetch('assets/atlases/extracted/fx.json').then(r => r.json()),
                fetch('assets/atlases/extracted/boss.json').then(r => r.json())
            ]);

            // Load the PNG textures
            const texturePaths = [
                { alias: 'atlas_enemies_png', src: 'assets/atlases/extracted/enemies_base.png' },
                { alias: 'atlas_player_png', src: 'assets/atlases/extracted/player.png' },
                { alias: 'atlas_fx_png', src: 'assets/atlases/extracted/fx.png' },
                { alias: 'atlas_boss_png', src: 'assets/atlases/extracted/boss.png' }
            ];

            for (const tex of texturePaths) {
                PIXI.Assets.add(tex);
            }

            const baseTextures = await PIXI.Assets.load(texturePaths.map(t => t.alias));

            // Create sub-textures from each atlas
            this.atlasTextures = {};
            const atlasNames = ['enemies', 'player', 'fx', 'boss'];
            const texKeys = ['atlas_enemies_png', 'atlas_player_png', 'atlas_fx_png', 'atlas_boss_png'];

            for (let i = 0; i < atlasData.length; i++) {
                const data = atlasData[i];
                const baseTex = baseTextures[texKeys[i]];

                if (!baseTex || !data.frames) {
                    console.warn(`[Uranus] Atlas ${atlasNames[i]} missing data or texture`);
                    continue;
                }

                // Create sub-textures for each frame
                for (const frameName in data.frames) {
                    const frame = data.frames[frameName].frame;
                    const rect = new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h);
                    this.atlasTextures[frameName] = new PIXI.Texture(baseTex.baseTexture || baseTex, rect);
                }

                console.log(`[Uranus] Atlas ${atlasNames[i]}: ${Object.keys(data.frames).length} sprites`);
            }

            console.log("[Uranus] Sprite atlases loaded", Object.keys(this.atlasTextures).length, "textures");

            // Spine Animation Mix Tensions
            if (this.spineData && this.spineData.spineData) {
                this.app.ticker.addOnce(() => {
                    try {
                        // Robust namespace check for v7/v8 and different spine runtimes
                        const AnimStateDataClass = PIXI.spine.AnimationStateData || (PIXI.spine.core && PIXI.spine.core.AnimationStateData);

                        if (AnimStateDataClass) {
                            const stateData = new AnimStateDataClass(this.spineData.spineData);
                            stateData.defaultMix = 0.2; // 200ms default transition
                            stateData.setMix('idle_hover', 'Hit', 0.1);
                            stateData.setMix('Hit', 'idle_hover', 0.3);
                            stateData.setMix('Hit', 'death', 0.1);
                            this.spineData.stateData = stateData;
                            console.log("[Uranus] Spine mix durations initialized");
                        } else {
                            console.warn("[Uranus] Spine AnimationStateData constructor not found");
                        }
                    } catch (spineErr) {
                        console.error("[Uranus] Failed to initialize Spine mix durations", spineErr);
                    }
                });
            }
        } catch (atlasErr) {
            console.warn("[Uranus] Atlases not available, using individual sprites", atlasErr);
        }
        // Initialize Spine UI Manager if it exists (it will be created in setupScene)
        // This call needs to happen after setupScene has created this.spineUI
        this.setupScene();
        if (this.spineUI) await this.spineUI.init();
    }

    setupScene() {
        this.mainContainer = new PIXI.Container();
        this.mainContainer.sortableChildren = true; // Enable zIndex sorting
        this.app.stage.addChild(this.mainContainer);
        this.stars = [];

        this.createTextures();

        // Initialize Pools after textures are ready
        this.bulletPool = new ObjectPool(() => {
            const b = new PIXI.Sprite(this.textures.bullet);
            b.anchor.set(0.5);
            return b;
        }, 20);

        this.enemyPool = new ObjectPool(() => {
            const c = new PIXI.Container();
            // Default sprite child for fallback
            const s = new PIXI.Sprite(PIXI.Texture.WHITE);
            s.anchor.set(0.5);
            s.name = "sprite";
            c.addChild(s);
            c.sprite = s;
            return c;
        }, 30);

        // Initialize Particle System (reusing bullet texture or white)
        this.particles = new ParticleSystem(this.mainContainer, PIXI.Texture.WHITE, 200);
        this.textEffects = new TextEffectSystem(this.mainContainer, 50);

        this.backgroundContainer = new PIXI.Container();
        this.mainContainer.addChildAt(this.backgroundContainer, 0);
        this.backgrounds = new BackgroundSystem(this.backgroundContainer);

        // Initialize Background Layers (3-layer Parallax)
        // Layer 0: Deep Space Nebula (Static/Very Slow)
        if (this.gameAssets && this.gameAssets['bg_space']) {
            this.backgrounds.addLayer(this.gameAssets['bg_space'], 0.05, 1.0, 1.0); // Slow movement
        }

        // Initialize Background Layers (3-layer Parallax)
        if (this.gameAssets && this.gameAssets['far_stars']) {
            // Layer 1: Far Stars (Deep Background)
            this.backgrounds.addLayer(this.gameAssets['far_stars'], 0.2, 0.8, 0.6);

            // Layer 2: Mid Nebula (Simulated with tinted stars for now)
            this.backgrounds.addLayer(this.gameAssets['far_stars'], 0.5, 1.2, 0.4);

            // Layer 3: Near Debris/Stars (Fast Parallax)
            this.backgrounds.addLayer(this.gameAssets['far_stars'], 1.2, 1.5, 0.8);
        }

        // Add Star Layer (if asset exists)
        // We delay slightly to ensure assets are loaded, OR checks in init loop. 
        // But init() waits for await Assets.load. So assets are ready here?
        // Wait, init calls loadGameAssets then createGameObjects? No, look at init structure.


        this.microUIContainer = new PIXI.Container();
        this.app.stage.addChild(this.microUIContainer); // HUD Layer
        this.microUI = new MicroUISystem(this.microUIContainer);

        this.createStarfield();

        console.log("[Uranus] Creating ship with texture:", this.textures.ship);
        console.log("[Uranus] Available textures:", Object.keys(this.textures));

        // Create Ship (Spine or Sprite)
        const spineKey = 'assets/spine/crystal-mascot.json';
        if (this.gameAssets[spineKey] && this.gameAssets[spineKey].spineData) {
            console.log("[Uranus] Creating Spine Mascot Ship");
            this.ship = new PIXI.spine.Spine(this.gameAssets[spineKey].spineData);

            // Spine Setup
            this.ship.scale.set(0.8); // Increased from 0.5 for better visibility
            this.ship.state.setAnimation(0, 'idle_hover', true);

            // Add custom property to track it's a spine object
            this.ship.isSpine = true;
        } else {
            console.log("[Uranus] Creating Static Sprite Ship (Fallback)");
            this.ship = new PIXI.Sprite(this.textures.ship);
            this.ship.anchor.set(0.5);
            this.ship.scale.set(1.5); // Original scale
            this.ship.blendMode = PIXI.BLEND_MODES.NORMAL;
            this.ship.isSpine = false;
        }

        this.ship.x = window.innerWidth / 2;
        this.ship.y = window.innerHeight - 150;

        // Ensure ship is on top
        this.ship.zIndex = 100;

        console.log("[Uranus] Ship position:", this.ship.x, this.ship.y);
        console.log("[Uranus] Ship visible:", this.ship.visible, "alpha:", this.ship.alpha);

        // ship.filters = [this.bloomFilter]; // Disabled as it causes white-box artifacts on some textures

        this.mainContainer.addChild(this.ship);
        console.log("[Uranus] Ship added to stage. mainContainer children:", this.mainContainer.children.length);

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('resize', () => {
            this.cachedWidth = window.innerWidth;
            this.cachedHeight = window.innerHeight;
        });

        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));

        setInterval(() => this.spawnWave(), CONFIG.spawnRate);

        // UI Layer (Spine)
        this.uiLayer = new PIXI.Container();
        this.app.stage.addChild(this.uiLayer);
        this.spineUI = new SpineUIManager(this, this.uiLayer);

        this.isInitialized = true;
        console.log("[Uranus] Arcade Game Initialized");
    }

    createStarfield() {
        // Always use procedural stars for now (fallback until background assets are loaded)
        const count = 100;
        for (let i = 0; i < count; i++) {
            const star = new PIXI.Graphics();
            const color = Math.random() > 0.8 ? 0x00f2ff : 0xffffff;
            star.beginFill(color);
            star.drawCircle(0, 0, Math.random() * 1.5 + 0.5);
            star.endFill();
            star.x = Math.random() * window.innerWidth;
            star.y = Math.random() * window.innerHeight;
            star.speed = 0.5 + Math.random() * 2;
            this.stars.push(star);
            this.backgroundContainer.addChild(star);
        }
    }

    createTextures() {
        this.textures = {};

        // 1. Prefer atlas textures if available (from extracted atlases)
        if (this.atlasTextures) {
            // Debug: Log available atlas texture keys
            console.log("[Uranus] Atlas texture keys:", Object.keys(this.atlasTextures));
            // Player sprites
            if (this.atlasTextures['player_ship']) {
                this.textures.ship = this.atlasTextures['player_ship'];
            } else if (this.atlasTextures['ship']) {
                this.textures.ship = this.atlasTextures['ship'];
            }

            if (this.atlasTextures['player_ship_alt']) this.textures.shipAlt = this.atlasTextures['player_ship_alt'];
            if (this.atlasTextures['engine_flame_blue']) this.textures.engineFlame = this.atlasTextures['engine_flame_blue'];

            // Enemy sprites
            if (this.atlasTextures['enemy_cyan_1']) this.textures.bug = this.atlasTextures['enemy_cyan_1'];
            if (this.atlasTextures['enemy_cyan_2']) this.textures.bugAlt = this.atlasTextures['enemy_cyan_2'];
            if (this.atlasTextures['enemy_purple_1']) this.textures.fighter = this.atlasTextures['enemy_purple_1'];
            if (this.atlasTextures['enemy_purple_2']) this.textures.fighterAlt = this.atlasTextures['enemy_purple_2'];
            if (this.atlasTextures['enemy_gold_1']) this.textures.elite = this.atlasTextures['enemy_gold_1'];
            if (this.atlasTextures['enemy_gold_2']) this.textures.eliteAlt = this.atlasTextures['enemy_gold_2'];
            if (this.atlasTextures['enemy_teal_1']) this.textures.extra = this.atlasTextures['enemy_teal_1'];

            // FX sprites
            if (this.atlasTextures['explosion_large_1']) this.textures.explosion = this.atlasTextures['explosion_large_1'];
            if (this.atlasTextures['explosion_large_2']) this.textures.explosionAlt = this.atlasTextures['explosion_large_2'];
            if (this.atlasTextures['spark_star_1']) this.textures.spark = this.atlasTextures['spark_star_1'];
            if (this.atlasTextures['energy_ring']) this.textures.hitRing = this.atlasTextures['energy_ring'];
            if (this.atlasTextures['explosion_burst']) this.textures.bullet = this.atlasTextures['explosion_burst'];

            // Boss sprites
            if (this.atlasTextures['boss_head_phase1']) this.textures.boss = this.atlasTextures['boss_head_phase1'];
            if (this.atlasTextures['boss_head_rage']) this.textures.bossRage = this.atlasTextures['boss_head_rage'];
            if (this.atlasTextures['boss_shield_ring']) this.textures.bossShield = this.atlasTextures['boss_shield_ring'];

            console.log("[Uranus] Using atlas textures for sprites");
        }

        // 2. Use individual PNG sprites as fallback
        if (this.gameAssets) {
            if (!this.textures.ship && this.gameAssets['ship']) this.textures.ship = this.gameAssets['ship'];
            if (!this.textures.bullet && this.gameAssets['laser']) this.textures.bullet = this.gameAssets['laser'];
            if (!this.textures.explosion && this.gameAssets['explosion_vfx']) this.textures.explosion = this.gameAssets['explosion_vfx'];
            if (!this.textures.fighter && this.gameAssets['enemy_fighter']) this.textures.fighter = this.gameAssets['enemy_fighter'];
            if (!this.textures.bug && this.gameAssets['enemy_bug']) this.textures.bug = this.gameAssets['enemy_bug'];
        }

        // 2. Fallbacks for missing assets (PixiJS v7 syntax)
        // DEBUG: Force procedural textures for visibility testing
        const g = new PIXI.Graphics();

        // Check for Ship texture (prefer Atlas)
        if (!this.textures.ship) {
            // Fallback procedural
            const g = new PIXI.Graphics();
            g.beginFill(0x00f2ff);
            g.lineStyle(2, 0xffffff);
            g.drawPolygon([0, -20, 15, 10, -15, 10]);
            g.endFill();
            this.textures.ship = this.app.renderer.generateTexture(g);
        }

        // Bullet
        if (!this.textures.bullet) {
            g.clear();
            g.beginFill(0x00f2ff);
            g.drawRect(-2, -8, 4, 16);
            g.endFill();
            this.textures.bullet = this.app.renderer.generateTexture(g);
        }

        // Bug Enemy
        if (!this.textures.bug) {
            g.clear();
            g.beginFill(0xff4d4d);
            g.lineStyle(2, 0xffffff);
            g.drawPolygon([0, -15, 10, 0, 0, 15, -10, 0]);
            g.endFill();
            this.textures.bug = this.app.renderer.generateTexture(g);
        }

        // Fighter Enemy
        if (!this.textures.fighter) {
            g.clear();
            g.beginFill(0xbf7fff);
            g.lineStyle(2, 0xffffff);
            g.drawPolygon([0, 15, 15, -15, 0, -5, -15, -15]);
            g.endFill();
            this.textures.fighter = this.app.renderer.generateTexture(g);
        }

        if (!this.textures.elite) {
            g.clear();
            g.beginFill(0xffd700);
            g.lineStyle(4, 0xff00ff);
            g.drawPolygon([0, -40, 35, 0, 0, 40, -35, 0]);
            g.beginFill(0xff0000);
            g.drawCircle(0, 0, 10);
            g.endFill();
            this.textures.elite = this.app.renderer.generateTexture(g);
        }
    }

    fire() {
        if (this.bulletPool.active.length >= CONFIG.maxBullets) return;

        // Visual feedback
        if (window.audio) {
            window.audio.resume();
            window.audio.playShot();
        }

        const bullet = this.bulletPool.get();
        bullet.texture = this.textures.bullet;
        bullet.scale.set(0.4); // laser scale
        bullet.x = this.ship.x;
        // Adjust for Mascot size (scaled 0.5 of 512 = 256px tall)
        bullet.y = this.ship.y - 50;

        // Trigger Spine Animation
        if (this.ship.isSpine) {
            // Track 1 for additive shoot animation
            this.ship.state.setAnimation(1, 'shoot', false);
            this.ship.state.addEmptyAnimation(1, 0.1, 0); // Clear quickly
        }

        this.mainContainer.addChild(bullet);

        // --- RGS TRANSACTION ---
        if (window.adapter) {
            // Attach promise to bullet (revealed on collision)
            bullet.rgsPromise = window.adapter.fire("GENERIC_ENEMY");
        }
    }

    spawnWave() {
        if (!this.isInitialized) return;

        // Use formation spawning every other wave if wave manager is available
        if (this.waveManager && this.waveManager.currentWave % 2 === 0) {
            // Spawn a Galaga-style formation
            this.waveManager.spawnWave();
            return;
        }

        // Determine enemy tier (rarer = higher tier)
        const roll = Math.random();
        let tier = 'BUG';
        if (roll > 0.95 && this.textures.elite) tier = 'ELITE';
        else if (roll > 0.8) tier = 'FIGHTER';

        const count = tier === 'ELITE' ? 1 : 2 + Math.floor(Math.random() * 2);

        for (let i = 0; i < count; i++) {
            let enemy = this.enemyPool.get();

            if (this.spineData && this.spineData.spineData) {
                try {
                    if (!enemy.spine) {
                        const s = new PIXI.spine.Spine(this.spineData.spineData);
                        s.name = "spine";
                        s.autoUpdate = false;
                        enemy.addChild(s);
                        enemy.spine = s;
                        this.spineEvents.attach(s);
                    }
                    enemy.spine.visible = true;
                    if (enemy.sprite) enemy.sprite.visible = false;

                    enemy.skeleton = enemy.spine.skeleton;
                    enemy.state = enemy.spine.state;

                    // Animation Alignment (Design Reference)
                    const idleAnim = (tier === 'ELITE') ? 'idle_breathe' : 'idle_hover';
                    try {
                        enemy.state.setAnimation(0, idleAnim, true);
                    } catch (e) {
                        enemy.state.setAnimation(0, 'idle', true);
                    }

                    enemy.spine.scale.set(tier === 'ELITE' ? 1.4 : 1.0);
                } catch (e) {
                    this.setupEnemySprite(enemy, tier);
                }
            } else {
                this.setupEnemySprite(enemy, tier);
            }

            enemy.x = Math.random() * (window.innerWidth - 100) + 50;
            enemy.y = -50;
            enemy.type = tier;
            enemy.vx = (Math.random() - 0.5) * 2;
            enemy.vy = tier === 'ELITE' ? 0.8 + Math.random() : 1 + Math.random() * 2;

            this.mainContainer.addChild(enemy);
        }
    }

    setupEnemySprite(enemy, tier) {
        if (enemy.spine) enemy.spine.visible = false;
        if (enemy.sprite) {
            enemy.sprite.visible = true;
            // Use atlas textures with proper scaling for visibility
            const textureKey = tier === 'ELITE' ? 'elite' : (tier === 'FIGHTER' ? 'fighter' : 'bug');
            enemy.sprite.texture = this.textures[textureKey] || this.textures.bug;
            enemy.sprite.scale.set(tier === 'ELITE' ? 1.2 : tier === 'FIGHTER' ? 1.0 : 0.8);
            enemy.sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
            enemy.sprite.anchor.set(0.5);
        }
        enemy.skeleton = null;
        enemy.state = null;
    }

    /**
     * Spawn an enemy for the wave formation system using atlas textures
     * @param {number} offsetX - X offset from formation center
     * @param {number} offsetY - Y offset from formation center  
     * @param {string} type - Enemy type: 'bug', 'fighter', 'elite'
     * @returns {PIXI.Container} The enemy container
     */
    spawnFormationEnemy(offsetX, offsetY, type) {
        const enemy = this.enemyPool.get();
        if (!enemy) return null;

        // Get texture from atlas (prefer atlas, fallback to individual PNGs)
        let texture;
        if (this.atlasTextures) {
            // Use atlas enemy sprites
            if (type === 'elite') {
                texture = this.atlasTextures['enemy_gold_1'] ||
                    this.atlasTextures['enemy_purple_1'] ||
                    this.textures.elite;
            } else if (type === 'fighter') {
                texture = this.atlasTextures['enemy_purple_1'] ||
                    this.atlasTextures['enemy_cyan_2'] ||
                    this.textures.fighter;
            } else {
                texture = this.atlasTextures['enemy_cyan_1'] ||
                    this.atlasTextures['enemy_teal_1'] ||
                    this.textures.bug;
            }
        }

        // Fallback to standard textures
        if (!texture) {
            texture = type === 'elite' ? this.textures.elite :
                type === 'fighter' ? this.textures.fighter :
                    this.textures.bug;
        }

        // Setup sprite
        if (enemy.sprite) {
            enemy.sprite.texture = texture || PIXI.Texture.WHITE;
            enemy.sprite.visible = true;
            enemy.sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
            // Scale based on type - larger for visibility
            const scale = type === 'elite' ? 1.2 : type === 'fighter' ? 1.0 : 0.8;
            enemy.sprite.scale.set(scale);
            enemy.sprite.anchor.set(0.5);
        }

        if (enemy.spine) enemy.spine.visible = false;

        // Set properties
        enemy.type = type;
        enemy.x = offsetX;
        enemy.y = -50; // Start off-screen
        enemy.rotation = 0;
        enemy.alpha = 1;
        enemy.formationOffset = { x: offsetX, y: offsetY, type };
        enemy.entryProgress = 0;
        enemy.isInFormation = false;
        enemy.isDiving = false;

        this.mainContainer.addChild(enemy);

        return enemy;
    }

    triggerScreenShake(amount) {
        // Add trauma (clamped to 1.0)
        this.shakeTrauma = Math.min(1.0, (this.shakeTrauma || 0) + amount);
    }


    update(dt) {
        if (!this.isInitialized) return;

        // Cache window dimensions for this frame
        const W = this.cachedWidth || (this.cachedWidth = window.innerWidth);
        const H = this.cachedHeight || (this.cachedHeight = window.innerHeight);

        if (this.backgrounds) this.backgrounds.update(dt);
        if (this.microUI) this.microUI.update(dt);

        // Galaga-style systems update
        if (this.waveManager) this.waveManager.update(dt);
        if (this.diveController) this.diveController.update(dt);
        if (this.scoreManager) this.scoreManager.update(dt);
        if (this.spineUI) this.spineUI.update(dt);

        // Screen shake effect (Trauma-based)
        if (this.shakeTrauma > 0) {
            this.shakeTrauma = Math.max(0, this.shakeTrauma - this.shakeDecay * dt);
            const shake = this.shakeTrauma * this.shakeTrauma; // Quadratic falloff
            const maxOffset = 30;
            const maxRot = 0.2; // Radians

            // Perlin-like noise simulation
            this.mainContainer.x = (Math.random() - 0.5) * 2 * maxOffset * shake;
            this.mainContainer.y = (Math.random() - 0.5) * 2 * maxOffset * shake;
            this.mainContainer.rotation = (Math.random() - 0.5) * 2 * maxRot * shake;
        } else {
            this.mainContainer.x = 0;
            this.mainContainer.y = 0;
            this.mainContainer.rotation = 0;
        }

        // Procedural stars parallax
        const starsLen = this.stars.length;
        for (let i = 0; i < starsLen; i++) {
            const s = this.stars[i];
            s.y += s.speed * dt;
            if (s.y > H) s.y = -10;
        }

        // Ship movement
        let moveX = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.ship.x -= CONFIG.shipSpeed * dt;
            moveX = -1;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.ship.x += CONFIG.shipSpeed * dt;
            moveX = 1;
        }
        this.ship.x = Math.max(20, Math.min(W - 20, this.ship.x));

        // Inertia-based Tilt
        const targetRotation = moveX * 0.2; // ~12 degrees
        this.ship.rotation += (targetRotation - this.ship.rotation) * 0.1 * dt;

        // Update Particles
        if (this.particles) this.particles.update(dt);
        if (this.textEffects) this.textEffects.update(dt);

        // Throttled firing (~6/sec)
        if (this.keys['Space']) {
            const now = Date.now();
            if (now - this.lastFireTime > 166) {
                this.fire();
                this.lastFireTime = now;
            }
        }

        // Engine Exhaust VFX (Cyberpunk Style)
        if (this.particles) {
            // Core Ion Glow (Cyan) - Constant stream
            const offset = (Math.random() - 0.5) * 8;
            this.particles.spawn(
                this.ship.x + offset,
                this.ship.y + 40,
                0x00f2ff, // Neon Cyan
                2 + Math.random(),
                0.4,
                0.6
            );

            // Secondary Drive (Purple) - Occasional erratic bursts
            if (Math.random() > 0.6) {
                this.particles.spawn(
                    this.ship.x + offset * 1.5,
                    this.ship.y + 45,
                    0xbf7fff, // Neon Purple
                    3 + Math.random() * 2,
                    0.2,
                    0.3
                );
            }

            // Reactive Trail based on movement
            if (moveX !== 0) {
                this.particles.spawn(
                    this.ship.x - moveX * 15, // Trail behind movement
                    this.ship.y + 35,
                    0xffffff, // White stabilizers
                    1.5,
                    0.3,
                    0.2
                );
            }
        }

        // Update active bullets (reverse iteration for safe removal)
        const bullets = this.bulletPool.active;
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.y -= CONFIG.bulletSpeed * dt;

            if (b.y < -50) {
                this.mainContainer.removeChild(b);
                this.bulletPool.release(b);
                continue;
            }

            // Collision Check (early break on hit)
            const enemies = this.enemyPool.active;
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                if (dx * dx + dy * dy < 625) {
                    this.mainContainer.removeChild(b);
                    this.bulletPool.release(b);
                    this.handleHit(e, b); // Unified RGS Hit resolve
                    break;
                }
            }
        }

        // Update active enemies (manual Spine update)
        const activeEnemies = this.enemyPool.active;
        for (let i = activeEnemies.length - 1; i >= 0; i--) {
            const e = activeEnemies[i];
            e.y += e.vy * dt;
            e.x += e.vx * dt;

            // Manual Spine update since autoUpdate is disabled
            if (e.spine && e.spine.visible) {
                // deltaTime / 60 = approx seconds for Spine update
                e.spine.update(dt / 60);
            }

            if (e.y > H + 50) {
                this.mainContainer.removeChild(e);
                this.enemyPool.release(e);
            }
        }
    }

    async handleHit(enemy, bullet) {
        // Resolve wager on hit (Arcade trigger)
        let ticket = null;
        try {
            // Use the result already requested on fire
            ticket = bullet && bullet.rgsPromise ? await bullet.rgsPromise : null;

            // Fallback if bullet missing or promise failed
            if (!ticket && window.adapter) {
                ticket = await window.adapter.fire(enemy.type);
            }
        } catch (e) {
            console.warn('[Uranus] Adapter not available, using mock kill');
        }

        // Mock response if no adapter
        if (!ticket) {
            ticket = {
                outcomes: [{ isKill: Math.random() > 0.3, multiplier: 1 + Math.random() * 10, type: 'LOW', payout: 1.0 }],
                ticketId: 'MOCK'
            };
        }

        if (ticket.outcomes[0].isKill) {
            const outcome = ticket.outcomes[0];
            const size = outcome.multiplier > 50 ? 80 : (outcome.multiplier > 10 ? 40 : 20);
            const color = outcome.type === 'JACKPOT' ? 0xffd700 : (outcome.type === 'HIGH' ? 0xbf7fff : 0xff4d4d);

            this.spawnExplosion(enemy.x, enemy.y, size, color);


            // Trauma Calculation:
            // Multiplier 1-5  -> Trauma 0.2 (Light)
            // Multiplier 5-20 -> Trauma 0.5 (Medium) 
            // Multiplier 20+  -> Trauma 0.8 (Heavy)
            const trauma = outcome.multiplier > 20 ? 0.8 : (outcome.multiplier > 5 ? 0.5 : 0.2);
            this.triggerScreenShake(trauma);

            if (window.audio) window.audio.playExplosion(outcome.multiplier > 10 ? 1.5 : 0.8);

            // Add to score with combo system
            const enemyType = enemy.type?.toLowerCase() || 'bug';
            if (this.scoreManager) {
                this.scoreManager.addKill(enemyType, enemy.x, enemy.y);
            }

            // Remove from wave manager if in formation
            if (this.waveManager) {
                const waveIdx = this.waveManager.waveEnemies.indexOf(enemy);
                if (waveIdx > -1) {
                    this.waveManager.waveEnemies.splice(waveIdx, 1);
                }
            }

            // Time Dilation on Big Wins
            if (outcome.multiplier > 20) {
                this.triggerTimeDilation(1000);
            }

            // Spine Death Sequence (Design Reference: death / death_big)
            if (enemy.skeleton) {
                const deathAnim = (enemy.type === 'ELITE' || enemy.type === 'elite') ? 'death_big' : 'death';
                try {
                    enemy.state.setAnimation(0, deathAnim, false);
                } catch (e) {
                    enemy.state.setAnimation(0, 'death', false);
                }
                setTimeout(() => {
                    this.mainContainer.removeChild(enemy);
                    this.enemyPool.release(enemy);
                }, 450);
            } else {
                // Quick fade-out for sprite enemies
                enemy.alpha = 0;
                this.mainContainer.removeChild(enemy);
                this.enemyPool.release(enemy);
            }

            if (outcome.payout > 0) {
                this.showWinText(enemy.x, enemy.y, outcome.payout);
                if (outcome.multiplier >= 10) {
                    this.showWinBanner(outcome.payout, outcome.type);
                }
            }

            // Claim (only for real tickets)
            if (ticket.ticketId && !ticket.ticketId.startsWith('MOCK') && window.adapter) {
                window.adapter.claim(ticket.ticketId);
            }
        } else {
            // "Hit" reaction with Skin Switching or Flinch
            if (enemy.skeleton) {
                if (ticket.outcomes[0].multiplier > 5) {
                    try {
                        enemy.skeleton.setSkinByName('rage');
                        enemy.skeleton.setSlotsToSetupPose();
                    } catch (e) { /* Skin may not exist */ }
                }

                // Animation Alignment (Design Reference: Hit)
                try {
                    enemy.state.setAnimation(0, 'Hit', false);
                } catch (e) {
                    enemy.state.setAnimation(0, 'hit', false);
                }

                const idleAnim = (enemy.type === 'ELITE') ? 'idle_breathe' : 'idle_hover';
                try {
                    enemy.state.addAnimation(0, idleAnim, true, 0);
                } catch (e) {
                    enemy.state.addAnimation(0, 'idle', true, 0);
                }
            } else {
                this.flashEnemy(enemy);
            }
        }
    }

    triggerTimeDilation(duration = 500) {
        this.app.ticker.speed = 0.1; // Slow motion
        setTimeout(() => {
            this.app.ticker.speed = 1.0; // Restore
        }, duration);
    }

    spawnExplosion(x, y, radius = 20, color = 0xffffff) {
        // 1. Shockwave Ring
        const ring = new PIXI.Graphics();
        ring.lineStyle(4, color, 1);
        ring.drawCircle(0, 0, radius);
        ring.x = x; ring.y = y;
        ring.scale.set(0.1);
        this.mainContainer.addChild(ring);

        // 2. White Flash (Core)
        const flash = new PIXI.Graphics();
        flash.beginFill(0xffffff);
        flash.drawCircle(0, 0, radius * 0.8);
        flash.endFill();
        flash.x = x; flash.y = y;
        this.mainContainer.addChild(flash);

        // Animate Rings/Flash
        let t = 0;
        const tick = (delta) => {
            t += 0.08 * delta.deltaTime;

            // Ring expansion
            ring.scale.set(t * 3);
            ring.alpha = 1 - t;

            // Flash shrink
            flash.scale.set(1 + t);
            flash.alpha = 1 - (t * 2);

            if (t >= 1) {
                this.app.ticker.remove(tick);
                ring.destroy();
                flash.destroy();
            }
        };
        this.app.ticker.add(tick);

        // 3. Debris Particles
        if (this.particles) {
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12;
                const speed = 4 + Math.random() * 4;
                // Add velocity support to ParticleSystem if needed, or update manually here?
                // Assuming spawn supports basic direction or we modify ParticleSystem.
                // Current spawn: (x, y, color, speed, duration, scale)
                // It calculates random angle internally. We might want directed debris?
                // For now, let's use the random cloud but colorful.
                this.particles.spawn(x, y, color, speed, 0.6, 0.8);
            }
        }
    }

    spawnSpark(x, y, color) {
        if (this.particles) {
            const speed = 2 + Math.random() * 4;
            this.particles.spawn(x, y, color, speed, 0.5); // 0.5s duration
        }
    }

    triggerScreenShake(amount) {
        // Redundant method, already defined earlier. Removing legacy implementation.
        this.shakeTrauma = Math.min(1.0, (this.shakeTrauma || 0) + amount);
    }

    flashEnemy(enemy) {
        enemy.tint = 0xff0000;
        setTimeout(() => enemy.tint = 0xffffff, 100);
    }

    showWinText(x, y, amount) {
        if (this.textEffects) {
            this.textEffects.spawn(x, y, `+${amount.toFixed(2)}`, '#ffd700');
        }
    }

    showWinBanner(amount, type) {
        const banner = document.getElementById('win-banner');
        banner.querySelector('.win-amount').innerText = `WIN ${amount.toFixed(2)}`;
        banner.querySelector('.win-type').innerText = `${type} KILL!`;
        banner.classList.remove('hidden');

        // Auto-hide after 3s
        if (this.winBannerTimer) clearTimeout(this.winBannerTimer);
        this.winBannerTimer = setTimeout(() => {
            banner.classList.add('hidden');
        }, 3000);
    }
}

// UI Toggles
window.toggleHelp = () => {
    const modal = document.getElementById('help-modal');
    modal.classList.toggle('hidden');
};

window.game = new UranusGame();
