export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.generateSounds();
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.enabled = false;
    }
  }

  private async generateSounds() {
    if (!this.audioContext) return;

    // Generate victory chime (ascending notes)
    const victoryBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1.5, this.audioContext.sampleRate);
    const victoryData = victoryBuffer.getChannelData(0);
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    for (let i = 0; i < victoryData.length; i++) {
      const time = i / this.audioContext.sampleRate;
      let sample = 0;
      
      frequencies.forEach((freq, index) => {
        const noteStart = index * 0.3;
        const noteEnd = noteStart + 0.4;
        if (time >= noteStart && time <= noteEnd) {
          const envelope = Math.exp(-(time - noteStart) * 3);
          sample += Math.sin(2 * Math.PI * freq * (time - noteStart)) * envelope * 0.1;
        }
      });
      
      victoryData[i] = sample;
    }
    this.sounds.set('victory', victoryBuffer);

    // Generate failure buzzer (descending harsh tone)
    const failureBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1, this.audioContext.sampleRate);
    const failureData = failureBuffer.getChannelData(0);
    
    for (let i = 0; i < failureData.length; i++) {
      const time = i / this.audioContext.sampleRate;
      const frequency = 200 - (time * 150); // Descending from 200Hz to 50Hz
      const envelope = Math.exp(-time * 2);
      failureData[i] = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.15;
    }
    this.sounds.set('failure', failureBuffer);

    // Generate level up sound (magical ascending arpeggio)
    const levelUpBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
    const levelUpData = levelUpBuffer.getChannelData(0);
    const levelUpFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4 to G5
    
    for (let i = 0; i < levelUpData.length; i++) {
      const time = i / this.audioContext.sampleRate;
      let sample = 0;
      
      levelUpFreqs.forEach((freq, index) => {
        const noteStart = index * 0.25;
        const noteEnd = noteStart + 0.35;
        if (time >= noteStart && time <= noteEnd) {
          const envelope = Math.exp(-(time - noteStart) * 2);
          sample += Math.sin(2 * Math.PI * freq * (time - noteStart)) * envelope * 0.08;
        }
      });
      
      levelUpData[i] = sample;
    }
    this.sounds.set('levelUp', levelUpBuffer);

    // Generate button click sound
    const clickBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    
    for (let i = 0; i < clickData.length; i++) {
      const time = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-time * 50);
      clickData[i] = Math.sin(2 * Math.PI * 800 * time) * envelope * 0.05;
    }
    this.sounds.set('click', clickBuffer);

    // Generate warning sound (urgent beep)
    const warningBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const warningData = warningBuffer.getChannelData(0);
    
    for (let i = 0; i < warningData.length; i++) {
      const time = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-time * 4);
      warningData[i] = Math.sin(2 * Math.PI * 1000 * time) * envelope * 0.2;
    }
    this.sounds.set('warning', warningBuffer);

    // Generate tick sound (clock tick)
    const tickBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
    const tickData = tickBuffer.getChannelData(0);
    
    for (let i = 0; i < tickData.length; i++) {
      const time = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-time * 30);
      tickData[i] = Math.sin(2 * Math.PI * 1200 * time) * envelope * 0.1;
    }
    this.sounds.set('tick', tickBuffer);

    // Generate time up buzzer (long harsh buzzer)
    const timeUpBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
    const timeUpData = timeUpBuffer.getChannelData(0);
    
    for (let i = 0; i < timeUpData.length; i++) {
      const time = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-time * 1);
      const frequency = 150 + Math.sin(time * 20) * 50; // Warbling effect
      timeUpData[i] = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.2;
    }
    this.sounds.set('timeUp', timeUpBuffer);
  }

  async playSound(soundName: string, volume: number = 1) {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundName);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const audioManager = AudioManager.getInstance();