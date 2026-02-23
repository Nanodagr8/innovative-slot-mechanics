/**
 * ProceduralVFX - STATE OF THE ART WebGL Engine (PixiJS v8)
 * High-performance GPU-accelerated graphics with custom shaders.
 */
class ProceduralVFX {
    constructor(options = {}) {
        this.options = options;
        this.app = options.app || new PIXI.Application();
        this.particles = [];
        this.pool = [];
        this.maxParticles = 2000; // Massive increase from 500

        // Containers
        this.mainContainer = new PIXI.Container();
        this.shockwaveContainer = new PIXI.Container();

        // Texture Cache
        this.textures = {};

        // Colors
        this.colors = {
            cyan: 0x00f2ff,
            purple: 0xbf7fff,
            gold: 0xffd700,
            green: 0x39ff14,
            white: 0xffffff,
            red: 0xff4d4d
        };

        if (options.autoInit !== false) {
            this.init();
        }
    }

    async init() {
        await this.app.init({
            backgroundAlpha: 0,
            resizeTo: window,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            ...this.options.pixiConfig
        });

        const canvas = this.app.canvas;
        canvas.id = 'vfxCanvas';
        Object.assign(canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            pointerEvents: 'none',
            zIndex: '50'
        });

        const container = this.options.container || document.body;
        container.appendChild(canvas);

        // Mascot Container
        this.mascotContainer = new PIXI.Container();
        this.app.stage.addChild(this.mascotContainer);
        this.mascot = null;

        this.app.stage.addChild(this.shockwaveContainer);
        this.app.stage.addChild(this.mainContainer);

        // Generate Textures
        this.generateTextures();

        // Start Loop
        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime);
        });

        // Responsive Resize
        window.addEventListener('resize', () => {
            if (this.mascot) this.updateMascotLayout();
        });

        // Add Shockwave Filter
        this.createDisplacementMap();
    }

    initMascot() {
        if (this.mascot) return;

        if (typeof pixi_spine === 'undefined' || !pixi_spine?.Spine) {
            return;
        }

        const spineData = PIXI.Assets.get('mascot');
        if (spineData) {
            try {
                this.mascot = pixi_spine.Spine.from({
                    skeleton: spineData,
                    scale: 0.6
                });
                this.updateMascotLayout();
                this.mascot.state.setAnimation(0, 'idle', true);
                this.mascotContainer.addChild(this.mascot);
            } catch (e) {
                console.warn('[VFX] Mascot init failed:', e.message);
            }
        }
    }

    updateMascotLayout() {
        if (!this.mascot) return;

        const isMobile = window.innerWidth < 900;
        if (isMobile) {
            // Move to Top-Right or Bottom-Right to avoid Hex Grid
            // In portrait, the grid is centered, so we want it far out
            this.mascot.scale.set(0.4);
            this.mascot.x = window.innerWidth - 80;
            this.mascot.y = 120; // Top Right
        } else {
            // Desktop: Bottom Left
            this.mascot.scale.set(0.6);
            this.mascot.x = 120;
            this.mascot.y = window.innerHeight - 100;
        }
    }

    playMascot(anim) {
        // Safety: Check if Spine runtime is available
        if (typeof pixi_spine === 'undefined' || !pixi_spine?.Spine) {
            return;
        }

        if (!this.mascot) this.initMascot();
        if (this.mascot) {
            // Priority animations
            this.mascot.state.setAnimation(0, anim, false);
            this.mascot.state.addAnimation(0, 'idle', true, 0);
        }
    }

    createDisplacementMap() {
        // Create a radial gradient texture for shockwaves
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Ripple pattern
        const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, '#808080'); // Neutral
        grad.addColorStop(0.5, '#ffffff'); // Displacement
        grad.addColorStop(1, '#808080');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        const tex = PIXI.Texture.from(canvas);
        // Optimized: Create sprite once
        this.displacementSprite = new PIXI.Sprite(tex);
        this.displacementSprite.anchor.set(0.5);
        this.displacementSprite.scale.set(0);

        // Fix (Issue 10): Sprite must be in scene graph
        this.shockwaveContainer.addChild(this.displacementSprite);

        // Fix (Issue 11): V8 DisplacementFilter signature
        this.displacementFilter = new PIXI.DisplacementFilter({
            sprite: this.displacementSprite,
            scale: 150
        });

        this.shockwaveParams = { active: false, time: 0, maxScale: 40 };
        // Note: Filters can be heavy, apply only when needed or on specific container
        // this.app.stage.filters = [this.displacementFilter]; 
    }

    generateTextures() {
        const g = new PIXI.Graphics();

        // Spark (Soft Glow)
        g.clear();
        g.circle(16, 16, 8);
        g.fill({ color: 0xffffff, alpha: 1 });
        // Add fake glow via larger low-alpha circle
        g.circle(16, 16, 16);
        g.fill({ color: 0xffffff, alpha: 0.3 });
        this.textures.spark = this.app.renderer.generateTexture(g);

        // Shard (Sharp Diamond)
        g.clear();
        g.moveTo(16, 0);
        g.lineTo(24, 16);
        g.lineTo(16, 32);
        g.lineTo(8, 16);
        g.closePath();
        g.fill({ color: 0xffffff, alpha: 1 });
        this.textures.shard = this.app.renderer.generateTexture(g);

        // Ring (Shockwave element)
        g.clear();
        g.circle(32, 32, 30);
        g.stroke({ width: 4, color: 0xffffff, alpha: 1 });
        this.textures.ring = this.app.renderer.generateTexture(g);
    }

    getParticle() {
        let p = this.pool.pop();
        if (!p) {
            p = new PIXI.Sprite(this.textures.spark);
            p.anchor.set(0.5);
            this.mainContainer.addChild(p);
        } else {
            p.visible = true;
            p.texture = this.textures.spark; // Default reset
            // Explicitly reset properties to avoid state leakage
            p.alpha = 1;
            p.tint = 0xFFFFFF;
            p.rotation = 0;
            p.scale.set(1);
            p.x = 0;
            p.y = 0;
        }
        return p;
    }

    // ═══════════════════════════════════════════════════════════
    // CORE EFFECTS
    // ═══════════════════════════════════════════════════════════

    burst(x, y, count = 12, colorKey = 'cyan') {
        const color = this.colors[colorKey] || this.colors.cyan;

        for (let i = 0; i < count; i++) {
            const p = this.getParticle();
            p.texture = Math.random() > 0.5 ? this.textures.spark : this.textures.shard;
            p.x = x;
            p.y = y;
            p.tint = color;

            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 4 + Math.random() * 8;

            p.userData = {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                spin: (Math.random() - 0.5) * 0.2,
                gravity: 0.1
            };

            p.scale.set(0.5 + Math.random() * 0.5);
            this.particles.push(p);
        }
    }

    shatter(x, y) {
        // Crystal Shards 3D Simulation
        for (let i = 0; i < 20; i++) {
            const p = this.getParticle();
            p.texture = this.textures.shard;
            p.x = x;
            p.y = y;
            p.tint = this.colors.green; // Green for win highlights

            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 10;

            p.userData = {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5, // Upward explode
                life: 1.5,
                decay: 0.015,
                spin: (Math.random() - 0.5) * 0.5, // Fast spin
                gravity: 0.4 // Heavy gravity
            };

            p.scale.set(0.8 + Math.random());
            this.particles.push(p);
        }

        // Add Flash
        this.burst(x, y, 10, 'white');
    }

    triggerShockwave(x, y) {
        if (!this.displacementFilter) return;

        this.displacementSprite.x = x;
        this.displacementSprite.y = y;
        this.displacementFilter.scale.x = 0;
        this.displacementFilter.scale.y = 0;

        this.app.stage.filters = [this.displacementFilter];

        this.shockwaveParams = {
            active: true,
            time: 0,
            duration: 1.0,
            maxScale: 150
        };
    }

    megaBurst(x, y) {
        // Superball Hit - Massive Graphical Upgrade
        this.shatter(x, y); // Debris
        this.burst(x, y, 60, 'gold'); // Increased from 40
        this.burst(x, y, 30, 'purple'); // Increased from 20

        // Lightning strikes
        this.electricArc(x - 100, y - 100, x, y, 'cyan');
        this.electricArc(x + 100, y - 100, x, y, 'purple');

        // Trigger Distortion
        this.triggerShockwave(x, y);

        // Shockwave Rings (Delay handled by lifecycle instead of setTimeout closures)
        for (let i = 0; i < 4; i++) { // Increased to 4 rings
            const ring = this.getParticle();
            ring.texture = this.textures.ring;
            ring.x = x;
            ring.y = y;
            ring.tint = i % 2 === 0 ? this.colors.gold : this.colors.purple;
            ring.anchor.set(0.5);
            ring.scale.set(0.1);
            ring.alpha = 0; // Starts invisible

            ring.userData = {
                isRing: true,
                life: 1.0,
                delay: i * 0.15, // Custom delay implementation
                decay: 0.02, // Slower decay
                grow: 0.3 // Faster expansion
            };
            this.particles.push(ring);
        }
    }

    // New: Screen Shake / Glitch handled via CSS usually, but we can do a flash here
    shimmer(x, y, duration) {
        // Handled by particles
    }

    update(dt) {
        // Shockwave Filter Animation
        if (this.shockwaveParams && this.shockwaveParams.active) {
            this.shockwaveParams.time += dt * 0.05;
            const progress = this.shockwaveParams.time;

            if (progress >= 1) {
                this.shockwaveParams.active = false;
                this.app.stage.filters = null;
            } else {
                const scale = Math.sin(progress * Math.PI) * this.shockwaveParams.maxScale;
                this.displacementFilter.scale.set(scale);
                this.displacementSprite.scale.set(progress * 10); // Expand ripple
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const d = p.userData;

            if (d.delay && d.delay > 0) {
                d.delay -= dt * 0.016;
                continue; // Skip physics until delay finishes
            }

            if (d.isRing && p.alpha === 0 && d.life === 1.0) {
                p.alpha = 1; // Unhide after delay is done
            }

            if (d.isRing) {
                p.scale.x += d.grow * dt;
                p.scale.y += d.grow * dt;
                p.alpha -= d.decay * dt;
                p.rotation += 0.01 * dt;
            } else {
                // Physics
                d.vy += d.gravity * dt;
                p.x += d.vx * dt;
                p.y += d.vy * dt;
                p.rotation += d.spin * dt;

                d.life -= d.decay * dt;
                p.alpha = d.life;
                p.scale.x *= 0.98; // Shrink over time
                p.scale.y *= 0.98;
            }

            if (p.alpha <= 0) {
                p.visible = false;
                this.pool.push(p);
                this.particles.splice(i, 1);
            }
        }
    }
    // ═══════════════════════════════════════════════════════════
    // AMBIENT & EXTRA EFFECTS
    // ═══════════════════════════════════════════════════════════

    spawnAmbient() {
        if (this.particles.length > this.maxParticles * 0.5) return;

        const x = Math.random() * this.app.screen.width;
        const y = Math.random() * this.app.screen.height;

        const p = this.getParticle();
        p.texture = this.textures.spark;
        p.x = x;
        p.y = y;
        p.tint = Math.random() > 0.5 ? this.colors.cyan : this.colors.purple;
        p.alpha = 0;
        p.scale.set(0.2 + Math.random() * 0.3);

        p.userData = {
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            life: 2.0 + Math.random() * 2.0,
            decay: 0.005,
            spin: 0,
            gravity: 0,
            fadeIn: true
        };
        this.particles.push(p);
    }

    shimmer(x, y, duration = 500) {
        // High-frequency spark emission for UI elements
        const count = 5;
        for (let i = 0; i < count; i++) {
            const p = this.getParticle();
            p.x = x + (Math.random() - 0.5) * 50;
            p.y = y + (Math.random() - 0.5) * 50;
            p.tint = this.colors.cyan;
            p.scale.set(0.3);

            p.userData = {
                vx: 0, vy: -1,
                life: 0.5,
                decay: 0.05,
                spin: 0,
                gravity: 0
            };
            this.particles.push(p);
        }
    }

    electricArc(x1, y1, x2, y2, colorKey = 'cyan') {
        const color = this.colors[colorKey] || this.colors.cyan;
        const g = new PIXI.Graphics();

        // Draw lightning bolt
        g.moveTo(x1, y1);

        const segments = 10;
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;

        for (let i = 1; i < segments; i++) {
            const px = x1 + dx * i + (Math.random() - 0.5) * 20;
            const py = y1 + dy * i + (Math.random() - 0.5) * 20;
            g.lineTo(px, py);
        }
        g.lineTo(x2, y2);

        g.stroke({ width: 2, color: color, alpha: 1 });

        // Add to stage and animate fade out
        this.mainContainer.addChild(g);

        // Simple ticker to fade out graphics
        const fade = () => {
            g.alpha -= 0.1;
            if (g.alpha <= 0) {
                g.destroy();
                this.app.ticker.remove(fade);
            }
        };
        this.app.ticker.add(fade);
    }
}

// Global instance
// Global instance with autoInit for backward compatibility
window.vfx = new ProceduralVFX({ autoInit: true });
