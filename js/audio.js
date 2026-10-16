/**
 * NEUTRONIS 3D — Procedural Web Audio Engine
 * Generates realistic synthesized astrophysical audio:
 * 1. Pulsar radio chirp / beam clicks synced to rotation rate
 * 2. Cosmic ambient deep space low-frequency drone
 * 3. Pulsar glitch frequency ramp / spin-up SFX
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isInitialized = false;

    // Pulsar pulse timing
    this.pulseInterval = 350; // ms
    this.pulseTimer = null;

    // Listen for glitch events
    window.addEventListener('glitchTriggered', () => this.playGlitchSound());
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initCosmicDrone();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  // Deep space cosmic ambient drone
  initCosmicDrone() {
    if (!this.ctx) return;

    // Sub-bass drone oscillator
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // 55 Hz (A1)

    // Detuned harmonic drone oscillator
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // 82.4 Hz (E2)

    // Lowpass filter to muffle harsh harmonics
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(160, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  // Periodic Pulsar Lighthouse Radio Pulse
  playPulsarChirp() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    // Frequency chirp from 1200 Hz down to 240 Hz (mimics interstellar plasma dispersion)
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.06);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(2.5, now);

    // Fast envelope
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Catastrophic Pulsar Glitch SFX
  playGlitchSound() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.45);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (this.masterGain && this.ctx) {
      if (this.isMuted) {
        this.masterGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.05);
        if (this.pulseTimer) clearInterval(this.pulseTimer);
      } else {
        this.masterGain.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.1);
        this.pulseTimer = setInterval(() => this.playPulsarChirp(), this.pulseInterval);
      }
    }

    return !this.isMuted;
  }
}

window.AudioEngine = AudioEngine;
