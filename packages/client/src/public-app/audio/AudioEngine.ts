/**
 * AudioEngine
 *
 * Manages sound playback for the raffle draw experience.
 * Uses the Web Audio API to generate simple synth tones as placeholders.
 * In production, replace with Howler.js and real audio files.
 */

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private cyclingInterval: ReturnType<typeof setInterval> | null = null;
  private muted: boolean;

  constructor() {
    this.muted = sessionStorage.getItem('raffle-muted') === 'true';
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private playTick(frequency: number = 800, duration: number = 0.04): void {
    if (this.muted) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Silently fail if audio is not available
    }
  }

  startCycling(intervalMs: number = 80): void {
    this.stopCycling();

    // Ensure audio context is resumed (requires user gesture)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    this.cyclingInterval = setInterval(() => {
      // Vary pitch slightly for a more interesting sound
      const freq = 600 + Math.random() * 400;
      this.playTick(freq, 0.03);
    }, intervalMs);
  }

  stopCycling(): void {
    if (this.cyclingInterval) {
      clearInterval(this.cyclingInterval);
      this.cyclingInterval = null;
    }
  }

  playReveal(): void {
    if (this.muted) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Ascending chord: C5, E5, G5, C6
      const frequencies = [523.25, 659.25, 783.99, 1046.5];
      const duration = 0.8;

      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);

        const startTime = now + i * 0.08;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch {
      // Silently fail if audio is not available
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    sessionStorage.setItem('raffle-muted', String(muted));
    if (muted) {
      this.stopCycling();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  dispose(): void {
    this.stopCycling();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
