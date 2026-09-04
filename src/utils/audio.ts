// Web Audio API Cyberpunk Synth Engine (No external sound files needed)

export interface AtmosphereStageConfig {
  stageId: number;
  name: string;
  subtitle: string;
  bpm: number;
  rootFreq: number;
  scale: number[];
  filterCutoffExploration: number;
  filterCutoffBoss: number;
  bassWave: OscillatorType;
  padWave: OscillatorType;
  accentColor: string;
}

export const ATMOSPHERE_STAGES: Record<number, AtmosphereStageConfig> = {
  1: {
    stageId: 1,
    name: 'Montréal 2033 // Le RÉSO & Mont-Royal',
    subtitle: 'Sub-Zero Dark Synth • D Minor Pentatonic (108 BPM)',
    bpm: 108,
    rootFreq: 73.42, // D2
    scale: [73.42, 146.83, 174.61, 220.00, 261.63, 293.66, 349.23, 440.00],
    filterCutoffExploration: 420,
    filterCutoffBoss: 1150,
    bassWave: 'sawtooth',
    padWave: 'triangle',
    accentColor: '#00f3ff'
  },
  2: {
    stageId: 2,
    name: 'Los Angeles // Silicon Coast & AI Renegades',
    subtitle: 'Acid Industrial Overdrive • F Phrygian (124 BPM)',
    bpm: 124,
    rootFreq: 87.31, // F2
    scale: [87.31, 130.81, 174.61, 196.00, 207.65, 261.63, 349.23, 392.00],
    filterCutoffExploration: 560,
    filterCutoffBoss: 1600,
    bassWave: 'sawtooth',
    padWave: 'sawtooth',
    accentColor: '#39ff14'
  },
  3: {
    stageId: 3,
    name: 'Rome // Cryptes Occultes & Abaddon',
    subtitle: 'Gothic Cyber-Doom & Occult Chimes • C# Harmonic Minor (132 BPM)',
    bpm: 132,
    rootFreq: 69.30, // C#2
    scale: [69.30, 103.83, 138.59, 164.81, 207.65, 220.00, 277.18, 329.63],
    filterCutoffExploration: 460,
    filterCutoffBoss: 1400,
    bassWave: 'square',
    padWave: 'sine',
    accentColor: '#ff007f'
  },
  4: {
    stageId: 4,
    name: 'Antarctique // Trône Noir & L’Antéchrist',
    subtitle: 'Apocalyptic Dimensional Climax • B Locrian (144 BPM)',
    bpm: 144,
    rootFreq: 61.74, // B1
    scale: [61.74, 87.31, 123.47, 146.83, 174.61, 220.00, 246.94, 293.66],
    filterCutoffExploration: 650,
    filterCutoffBoss: 2400,
    bassWave: 'sawtooth',
    padWave: 'sawtooth',
    accentColor: '#ffaa00'
  }
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private beatInterval: number | null = null;

  // Background Atmospheric Soundscape Loop State
  private atmosphereMasterGain: GainNode | null = null;
  private atmosphereFilter: BiquadFilterNode | null = null;
  private atmosphereDroneOsc1: OscillatorNode | null = null;
  private atmosphereDroneOsc2: OscillatorNode | null = null;
  private atmosphereDroneOsc3: OscillatorNode | null = null;
  private atmosphereDroneGain: GainNode | null = null;
  private atmosphereLfo: OscillatorNode | null = null;
  private atmosphereLfoGain: GainNode | null = null;
  private atmosphereStepInterval: number | null = null;
  private currentStageId: number = 1;
  private isBossActive: boolean = false;
  private stepIndex: number = 0;
  private isAtmosphereActiveState: boolean = false;

  public init() {
    this.initContext();
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.musicGain) {
        this.musicGain.gain.setValueAtTime(muted ? 0 : 0.12, now);
      }
      if (this.atmosphereMasterGain) {
        const targetGain = muted ? 0 : (this.isBossActive ? 0.22 : 0.15);
        this.atmosphereMasterGain.gain.cancelScheduledValues(now);
        this.atmosphereMasterGain.gain.linearRampToValueAtTime(targetGain, now + 0.3);
      }
    }
    if (!muted && !this.isAtmosphereActiveState) {
      this.startAtmosphericLoop(this.currentStageId, this.isBossActive);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCEDURAL BACKGROUND ATMOSPHERIC SOUNDSCAPE LOOP (STAGE-AWARE)
  // ═══════════════════════════════════════════════════════════════

  public startAtmosphericLoop(stageId: number = 1, isBoss: boolean = false) {
    this.initContext();
    if (!this.ctx) return;

    this.currentStageId = stageId;
    this.isBossActive = isBoss;
    this.isAtmosphereActiveState = true;

    // Clean up existing if any
    this.stopAtmosphericLoop(false);

    const now = this.ctx.currentTime;
    const config = ATMOSPHERE_STAGES[stageId] || ATMOSPHERE_STAGES[1];

    // Master Atmosphere Bus
    this.atmosphereMasterGain = this.ctx.createGain();
    const targetGain = this.isMuted ? 0 : (isBoss ? 0.22 : 0.15);
    this.atmosphereMasterGain.gain.setValueAtTime(targetGain, now);
    this.atmosphereMasterGain.connect(this.ctx.destination);

    // Resonant Filter Node for Cyber Atmosphere
    this.atmosphereFilter = this.ctx.createBiquadFilter();
    this.atmosphereFilter.type = 'lowpass';
    this.atmosphereFilter.frequency.setValueAtTime(isBoss ? config.filterCutoffBoss : config.filterCutoffExploration, now);
    this.atmosphereFilter.Q.setValueAtTime(isBoss ? 4.5 : 2.5, now);
    this.atmosphereFilter.connect(this.atmosphereMasterGain);

    // LFO (Low Frequency Oscillator for analog breathing/drift)
    this.atmosphereLfo = this.ctx.createOscillator();
    this.atmosphereLfo.type = 'sine';
    this.atmosphereLfo.frequency.setValueAtTime(isBoss ? 0.4 : 0.15, now);

    this.atmosphereLfoGain = this.ctx.createGain();
    this.atmosphereLfoGain.gain.setValueAtTime(isBoss ? 180 : 80, now);
    this.atmosphereLfo.connect(this.atmosphereLfoGain);
    this.atmosphereLfoGain.connect(this.atmosphereFilter.frequency);
    this.atmosphereLfo.start(now);

    // Continuous Sub-Drone & Dark Synth Chords
    this.atmosphereDroneGain = this.ctx.createGain();
    this.atmosphereDroneGain.gain.setValueAtTime(0.35, now);
    this.atmosphereDroneGain.connect(this.atmosphereFilter);

    // Drone Osc 1: Root sub-bass
    this.atmosphereDroneOsc1 = this.ctx.createOscillator();
    this.atmosphereDroneOsc1.type = config.bassWave;
    this.atmosphereDroneOsc1.frequency.setValueAtTime(config.rootFreq, now);
    this.atmosphereDroneOsc1.connect(this.atmosphereDroneGain);
    this.atmosphereDroneOsc1.start(now);

    // Drone Osc 2: 5th harmonic or Octave
    this.atmosphereDroneOsc2 = this.ctx.createOscillator();
    this.atmosphereDroneOsc2.type = config.padWave;
    this.atmosphereDroneOsc2.frequency.setValueAtTime(config.rootFreq * 1.498, now); // ~Perfect 5th
    this.atmosphereDroneOsc2.connect(this.atmosphereDroneGain);
    this.atmosphereDroneOsc2.start(now);

    // Drone Osc 3: Detuned sub shimmer
    this.atmosphereDroneOsc3 = this.ctx.createOscillator();
    this.atmosphereDroneOsc3.type = 'sine';
    this.atmosphereDroneOsc3.frequency.setValueAtTime(config.rootFreq * 2 + 1.2, now); // Octave + detune
    this.atmosphereDroneOsc3.connect(this.atmosphereDroneGain);
    this.atmosphereDroneOsc3.start(now);

    // Dynamic Step Sequencer for Rhythmic Cyber Ambience (BPM Synchronized)
    const stepDurationMs = (60 / config.bpm / 4) * 1000; // 16th note step
    this.stepIndex = 0;

    this.atmosphereStepInterval = window.setInterval(() => {
      this.playAtmosphereStep(config);
    }, stepDurationMs);
  }

  public updateAtmosphereStage(stageId: number, isBoss: boolean = false) {
    if (this.currentStageId === stageId && this.isBossActive === isBoss && this.atmosphereDroneOsc1) {
      return;
    }

    this.currentStageId = stageId;
    this.isBossActive = isBoss;

    if (!this.atmosphereMasterGain || !this.atmosphereFilter || !this.atmosphereDroneOsc1 || !this.ctx) {
      this.startAtmosphericLoop(stageId, isBoss);
      return;
    }

    const now = this.ctx.currentTime;
    const config = ATMOSPHERE_STAGES[stageId] || ATMOSPHERE_STAGES[1];

    // Smooth ramp filter & frequencies for seamless cinematic transition
    const targetCutoff = isBoss ? config.filterCutoffBoss : config.filterCutoffExploration;
    this.atmosphereFilter.frequency.cancelScheduledValues(now);
    this.atmosphereFilter.frequency.exponentialRampToValueAtTime(Math.max(100, targetCutoff), now + 0.8);
    this.atmosphereFilter.Q.setValueAtTime(isBoss ? 4.5 : 2.5, now);

    if (this.atmosphereDroneOsc1) {
      this.atmosphereDroneOsc1.frequency.cancelScheduledValues(now);
      this.atmosphereDroneOsc1.frequency.exponentialRampToValueAtTime(config.rootFreq, now + 0.8);
    }
    if (this.atmosphereDroneOsc2) {
      this.atmosphereDroneOsc2.frequency.cancelScheduledValues(now);
      this.atmosphereDroneOsc2.frequency.exponentialRampToValueAtTime(config.rootFreq * 1.498, now + 0.8);
    }
    if (this.atmosphereDroneOsc3) {
      this.atmosphereDroneOsc3.frequency.cancelScheduledValues(now);
      this.atmosphereDroneOsc3.frequency.exponentialRampToValueAtTime(config.rootFreq * 2 + 1.2, now + 0.8);
    }

    if (this.atmosphereMasterGain) {
      const targetGain = this.isMuted ? 0 : (isBoss ? 0.22 : 0.15);
      this.atmosphereMasterGain.gain.cancelScheduledValues(now);
      this.atmosphereMasterGain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
    }

    // Update tempo of step sequencer
    if (this.atmosphereStepInterval !== null) {
      clearInterval(this.atmosphereStepInterval);
      const stepDurationMs = (60 / config.bpm / 4) * 1000;
      this.atmosphereStepInterval = window.setInterval(() => {
        this.playAtmosphereStep(config);
      }, stepDurationMs);
    }
  }

  private playAtmosphereStep(config: AtmosphereStageConfig) {
    if (this.isMuted || !this.ctx || !this.atmosphereFilter) return;

    const now = this.ctx.currentTime;
    const step = this.stepIndex % 16;
    this.stepIndex++;

    // 1. Kick / Deep Sub Impact Pulse on Downbeats (0, 4, 8, 12)
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();

      kickOsc.type = 'sine';
      const startFreq = this.isBossActive ? 140 : 95;
      const endFreq = this.isBossActive ? 30 : 42;
      kickOsc.frequency.setValueAtTime(startFreq, now);
      kickOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);

      const kickVol = (step === 0 ? 0.35 : 0.22) * (this.isBossActive ? 1.3 : 1.0);
      kickGain.gain.setValueAtTime(kickVol, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      kickOsc.connect(kickGain);
      kickGain.connect(this.atmosphereFilter);
      kickOsc.start(now);
      kickOsc.stop(now + 0.23);
    }

    // 2. High-Tech Cyber Noise Hi-Hat / Glitch Ticks on 16th Notes
    if (step % 2 === 0 || (this.isBossActive && step % 1 === 0)) {
      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(config.stageId === 3 ? 4000 : 7000, now);

      const noiseGain = this.ctx.createGain();
      const noiseVol = (step % 4 === 2 ? 0.08 : 0.035) * (this.isBossActive ? 1.4 : 1.0);
      noiseGain.gain.setValueAtTime(noiseVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.atmosphereFilter);
      whiteNoise.start(now);
    }

    // 3. Arpeggiated Cyber Synth Pulse Notes (Synced to Stage Scale)
    const arpSteps = this.isBossActive ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 3, 6, 8, 11, 14];
    if (arpSteps.includes(step)) {
      const noteIndex = (step * 2 + (config.stageId * 3)) % config.scale.length;
      const noteFreq = config.scale[noteIndex];

      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = config.padWave;
      arpOsc.frequency.setValueAtTime(noteFreq * (this.isBossActive ? 2 : 1), now);

      const noteDuration = this.isBossActive ? 0.12 : 0.18;
      const noteVol = (this.isBossActive ? 0.14 : 0.08);
      arpGain.gain.setValueAtTime(noteVol, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + noteDuration);

      arpOsc.connect(arpGain);
      arpGain.connect(this.atmosphereFilter);
      arpOsc.start(now);
      arpOsc.stop(now + noteDuration + 0.02);
    }

    // 4. Boss Intensity Tension Stabs & Dramatic Glissando Swirls (Only when Boss is active)
    if (this.isBossActive && (step === 2 || step === 10)) {
      const stabOsc = this.ctx.createOscillator();
      const stabGain = this.ctx.createGain();
      stabOsc.type = 'sawtooth';
      stabOsc.frequency.setValueAtTime(config.rootFreq * 4, now);
      stabOsc.frequency.exponentialRampToValueAtTime(config.rootFreq * 2, now + 0.25);

      stabGain.gain.setValueAtTime(0.18, now);
      stabGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      stabOsc.connect(stabGain);
      stabGain.connect(this.atmosphereFilter);
      stabOsc.start(now);
      stabOsc.stop(now + 0.28);
    }
  }

  public stopAtmosphericLoop(resetState: boolean = true) {
    if (this.atmosphereStepInterval !== null) {
      clearInterval(this.atmosphereStepInterval);
      this.atmosphereStepInterval = null;
    }

    const now = this.ctx ? this.ctx.currentTime : 0;
    if (this.atmosphereMasterGain && this.ctx) {
      this.atmosphereMasterGain.gain.cancelScheduledValues(now);
      this.atmosphereMasterGain.gain.linearRampToValueAtTime(0, now + 0.2);
    }

    if (this.atmosphereDroneOsc1) {
      try { this.atmosphereDroneOsc1.stop(); this.atmosphereDroneOsc1.disconnect(); } catch {}
      this.atmosphereDroneOsc1 = null;
    }
    if (this.atmosphereDroneOsc2) {
      try { this.atmosphereDroneOsc2.stop(); this.atmosphereDroneOsc2.disconnect(); } catch {}
      this.atmosphereDroneOsc2 = null;
    }
    if (this.atmosphereDroneOsc3) {
      try { this.atmosphereDroneOsc3.stop(); this.atmosphereDroneOsc3.disconnect(); } catch {}
      this.atmosphereDroneOsc3 = null;
    }
    if (this.atmosphereLfo) {
      try { this.atmosphereLfo.stop(); this.atmosphereLfo.disconnect(); } catch {}
      this.atmosphereLfo = null;
    }

    if (resetState) {
      this.isAtmosphereActiveState = false;
    }
  }

  public getCurrentAtmosphereInfo(): { stageId: number; name: string; subtitle: string; bpm: number; isBoss: boolean; isPlaying: boolean; accentColor: string } {
    const config = ATMOSPHERE_STAGES[this.currentStageId] || ATMOSPHERE_STAGES[1];
    return {
      stageId: this.currentStageId,
      name: config.name,
      subtitle: config.subtitle,
      bpm: config.bpm,
      isBoss: this.isBossActive,
      isPlaying: !this.isMuted && this.isAtmosphereActiveState,
      accentColor: config.accentColor
    };
  }

  public playSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playCritHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(900, now);
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.21);
    osc2.stop(now + 0.21);
  }

  public playSynapticLance() {
    this.playPsiLance();
  }

  public playLaserShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playShieldRestore() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playAchievement() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Cyber Synth Triad Fanfare (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.46);
    });
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playPsiLance() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playEmpExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  public playVortex() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.6);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.62);
  }

  public playBulletTime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.8);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.82);
  }

  public playDash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playLoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 660, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.16);
    });
  }

  public playLootDrop(rarity: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = rarity === 'legendary' ? [523, 659, 783, 1046] : rarity === 'epic' ? [440, 554, 659] : [330, 440];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.32);
    });
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [392, 523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0.22, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.62);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const victoryNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    victoryNotes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.2, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.82);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [330, 293, 246, 196, 146];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.18);

      gain.gain.setValueAtTime(0.25, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.65);
    });
  }

  public startCyberpunkMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const baseFreqs = [55, 65.41, 73.42, 82.41, 98]; // A1, C2, D2, E2, G2
    let step = 0;

    this.beatInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Bass synth pulse
      const freq = baseFreqs[step % baseFreqs.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300 + (step % 4) * 80, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);

      // Hi-hat cyber click
      if (step % 2 === 0) {
        const hhOsc = this.ctx.createOscillator();
        const hhGain = this.ctx.createGain();
        hhOsc.type = 'square';
        hhOsc.frequency.setValueAtTime(4500, now);
        hhGain.gain.setValueAtTime(0.03, now);
        hhGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        hhOsc.connect(hhGain);
        hhGain.connect(this.ctx.destination);
        hhOsc.start(now);
        hhOsc.stop(now + 0.05);
      }

      step++;
    }, 280);
  }

  public playCyberForgeCharge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.6);
    gain.gain.linearRampToValueAtTime(0.35, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(2400, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.35);
  }

  public playCyberForgeSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Bright chord arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C Major arpeggio
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });

    // Metallic heavy synth impact
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'square';
    bassOsc.frequency.setValueAtTime(160, now + 0.35);
    bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.85);

    bassGain.gain.setValueAtTime(0.25, now + 0.35);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);

    bassOsc.start(now + 0.35);
    bassOsc.stop(now + 0.95);
  }

  public playItemSlot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playUiClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playCodexOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playCodexDecrypt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + i * 220, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  public playAudioLogBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(950, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playWeaponSkinEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Metallic slash + energy hum
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playFF7BattleEncounter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // FF7 classic alert arpeggio swirl: 4 rapid ascending alert notes
    const freqs = [330, 440, 554, 659, 880, 1108];
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const time = now + i * 0.07;

      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, time + 0.12);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(time);
      osc.stop(time + 0.22);
    });

    // Dramatic sub-bass sweep
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.5);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.6);
  }

  public playFF7BattleStart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Dramatic impact crash and energetic battle fanfare surge
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    osc1.frequency.setValueAtTime(440, now + 0.25);

    osc2.frequency.setValueAtTime(330, now);
    osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
    osc2.frequency.setValueAtTime(660, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  public playFF7Escape() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playHeal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A Major chime
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const time = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(time);
      osc.stop(time + 0.28);
    });
  }

  public playSave() {
    this.playUiClick();
  }

  public play(soundName?: string) {
    if (this.isMuted) return;
    switch (soundName) {
      case 'slash':
      case 'attack':
        this.playSlash();
        break;
      case 'hit':
        this.playHit();
        break;
      case 'crit':
        this.playCritHit();
        break;
      case 'equip':
        this.playEquip();
        break;
      case 'loot':
        this.playLoot();
        break;
      case 'levelUp':
        this.playLevelUp();
        break;
      case 'achievement':
        this.playAchievement();
        break;
      case 'powerUp':
        this.playPowerUp();
        break;
      case 'vortex':
        this.playVortex();
        break;
      case 'emp':
        this.playEmpExplosion();
        break;
      case 'dash':
        this.playDash();
        break;
      case 'decrypt':
        this.playCodexDecrypt();
        break;
      default:
        this.playUiClick();
        break;
    }
  }

  public stopCyberpunkMusic() {
    if (this.beatInterval !== null) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new SoundEngine();
export const soundEngine = sound;
