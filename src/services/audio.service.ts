import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private currentOsc: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContext();
      } catch (e) {
        console.error('AudioContext not supported');
      }
    }
    return this.audioContext;
  }

  async resumeAudioContext(): Promise<void> {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  playBeep(freq: number = 600, duration: number = 0.15, vol: number = 0.1) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Stop any currently playing beep to prevent overlap and ensure cleanup
    this.stopBeep();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    this.currentOsc = osc;
    this.currentGain = gain;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envelope to avoid clicks: Start at vol, fade to near-zero
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Handle cleanup when the oscillator stops naturally
    osc.onended = () => {
      this.cleanup(osc, gain);
    };

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  stopBeep() {
    // Manually stop the current oscillator if it exists
    if (this.currentOsc) {
      try {
        this.currentOsc.stop();
      } catch (e) {
        // Ignore if already stopped or invalid
      }
      
      // Force cleanup immediately
      if (this.currentGain) {
        this.cleanup(this.currentOsc, this.currentGain);
      }
    }
  }

  private cleanup(osc: OscillatorNode, gain: GainNode) {
    try {
      osc.disconnect();
      gain.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }

    // Only nullify if these are still the active nodes
    if (this.currentOsc === osc) {
      this.currentOsc = null;
    }
    if (this.currentGain === gain) {
      this.currentGain = null;
    }
  }
}