// Sound effects for the game
let soundEnabled = true;

// Audio contexts for generating sounds
let audioContext = null;

// Initialize audio context (user gesture required)
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Evacuation alarm sound for errors
const playErrorSound = () => {
  if (!soundEnabled) return;

  try {
    const ctx = initAudioContext();

    // Create oscillators for alarm effect
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Connect nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Set up the evacuation alarm sound - alternating high/low tones
    oscillator1.type = "sawtooth";
    oscillator2.type = "square";

    // Low-pitched nuclear facility alarm frequencies
    oscillator1.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator1.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
    oscillator1.frequency.setValueAtTime(200, ctx.currentTime + 0.4);
    oscillator1.frequency.setValueAtTime(150, ctx.currentTime + 0.6);

    oscillator2.frequency.setValueAtTime(180, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(130, ctx.currentTime + 0.2);
    oscillator2.frequency.setValueAtTime(180, ctx.currentTime + 0.4);
    oscillator2.frequency.setValueAtTime(130, ctx.currentTime + 0.6);

    // Volume envelope - "errr, errr, errr" pattern
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.25);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.4);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.45);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    // Play the alarm
    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + 0.8);
    oscillator2.stop(ctx.currentTime + 0.8);
  } catch (error) {
    console.log("Audio not supported or failed:", error);
  }
};

// Liquid swoosh sound followed by cha-ching for successful mixing
const playSuccessSound = () => {
  if (!soundEnabled) return;

  try {
    const ctx = initAudioContext();

    // === PART 1: Liquid Swoosh ===
    const swooshOsc = ctx.createOscillator();
    const swooshFilter = ctx.createBiquadFilter();
    const swooshGain = ctx.createGain();

    // Connect swoosh nodes
    swooshOsc.connect(swooshFilter);
    swooshFilter.connect(swooshGain);
    swooshGain.connect(ctx.destination);

    // Set up the liquid swoosh
    swooshOsc.type = "sine";
    swooshOsc.frequency.setValueAtTime(150, ctx.currentTime);
    swooshOsc.frequency.exponentialRampToValueAtTime(
      600,
      ctx.currentTime + 0.4
    );
    swooshOsc.frequency.exponentialRampToValueAtTime(
      100,
      ctx.currentTime + 0.8
    );

    // Filter for liquid effect
    swooshFilter.type = "lowpass";
    swooshFilter.frequency.setValueAtTime(800, ctx.currentTime);
    swooshFilter.frequency.exponentialRampToValueAtTime(
      1500,
      ctx.currentTime + 0.3
    );
    swooshFilter.frequency.exponentialRampToValueAtTime(
      300,
      ctx.currentTime + 0.8
    );
    swooshFilter.Q.setValueAtTime(2, ctx.currentTime);

    // Swoosh volume envelope
    swooshGain.gain.setValueAtTime(0, ctx.currentTime);
    swooshGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
    swooshGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5);
    swooshGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    // === PART 2: Cha-Ching Sound ===
    const chingOsc1 = ctx.createOscillator();
    const chingOsc2 = ctx.createOscillator();
    const chingOsc3 = ctx.createOscillator();
    const chingGain = ctx.createGain();

    // Connect cha-ching nodes
    chingOsc1.connect(chingGain);
    chingOsc2.connect(chingGain);
    chingOsc3.connect(chingGain);
    chingGain.connect(ctx.destination);

    // Set up the cha-ching - harmonic chord
    chingOsc1.type = "sine";
    chingOsc2.type = "sine";
    chingOsc3.type = "sine";

    // Musical chord frequencies (C major)
    chingOsc1.frequency.setValueAtTime(523, ctx.currentTime + 0.7); // C5
    chingOsc2.frequency.setValueAtTime(659, ctx.currentTime + 0.7); // E5
    chingOsc3.frequency.setValueAtTime(784, ctx.currentTime + 0.7); // G5

    // Cha-ching volume envelope - bright chime
    chingGain.gain.setValueAtTime(0, ctx.currentTime + 0.7);
    chingGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.72);
    chingGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    // Play both parts
    swooshOsc.start(ctx.currentTime);
    swooshOsc.stop(ctx.currentTime + 0.8);

    chingOsc1.start(ctx.currentTime + 0.7);
    chingOsc2.start(ctx.currentTime + 0.7);
    chingOsc3.start(ctx.currentTime + 0.7);
    chingOsc1.stop(ctx.currentTime + 1.5);
    chingOsc2.stop(ctx.currentTime + 1.5);
    chingOsc3.stop(ctx.currentTime + 1.5);
  } catch (error) {
    console.log("Audio not supported or failed:", error);
  }
};

// Toggle sound on/off
const toggleSound = () => {
  soundEnabled = !soundEnabled;
  return soundEnabled;
};

// Get current sound state
const isSoundEnabled = () => soundEnabled;

export {
  playErrorSound,
  playSuccessSound,
  toggleSound,
  isSoundEnabled,
  initAudioContext,
};
