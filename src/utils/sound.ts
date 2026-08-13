/**
 * Roulette tick sound using Web Audio API.
 * No external audio files needed — synthesises a short percussive "click"
 * that mimics a roulette wheel peg.
 */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/**
 * Play a single tick/click sound.
 * @param pitch 0–1, where 0 is a low tick and 1 is a high "landing" tick.
 */
export function playTick(pitch: number = 0.5): void {
  try {
    const ctx = getAudioCtx();

    // Short burst oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    // Frequency range: 800–2400 Hz based on pitch
    osc.frequency.value = 800 + pitch * 1600;

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Silently fail — audio is non-critical
  }
}

/**
 * Play a satisfying "landing" sound (two-tone chime).
 */
export function playLand(): void {
  try {
    const ctx = getAudioCtx();

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.value = 1200;
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Second tone (slightly higher, delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 1600;
    gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.25);
  } catch {
    // Silently fail
  }
}
