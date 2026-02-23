/**
 * Uranus Spins: Procedural Audio Engine
 * ------------------------------------
 */

class UranusAudio {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.3;
        this.master.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    /**
     * Pew-pew! Classic arcade laser.
     */
    playShot() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.master);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Explosions! Multi-tier.
     */
    playExplosion(intensity = 1.0) {
        const duration = 0.3 * intensity;
        const noise = this.ctx.createBufferSource();
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000 * intensity, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(intensity, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        noise.start();
        noise.stop(this.ctx.currentTime + duration);
    }

    /**
     * Combo sound - ascending pitch based on combo level
     */
    playCombo(level = 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Higher pitch for higher combos
        const baseFreq = 400 + (level * 100);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.master);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * Dive warning - descending swoosh for enemy diving
     */
    playDiveWarning() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.master);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    /**
     * Jackpot fanfare
     */
    playJackpot() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(this.master);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            }, i * 100);
        });
    }

    /**
     * Ambient Synth Drone loop.
     */
    playBGM() {
        // Bass drone
        this.createDrone(110); // A2
        this.createDrone(164.81); // E3
    }

    createDrone(freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        lfo.type = 'sine';
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 5;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.value = 0.05;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        osc.start();
        lfo.start();
    }
}

window.audio = new UranusAudio();
