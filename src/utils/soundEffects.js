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

// Wrong answer sound - soft but alternating E-A pattern, ~0.8s duration
const playErrorSound = () => {
  if (!soundEnabled) return;

  try {
    const ctx = initAudioContext();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Triangle wave - warmer than sawtooth/square
    osc.type = "triangle";

    // Alternating E-A-E-A pattern (syncs with red box animation)
    osc.frequency.setValueAtTime(165, ctx.currentTime); // E3
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.2); // A2
    osc.frequency.setValueAtTime(165, ctx.currentTime + 0.4); // E3
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.6); // A2

    // Moderate volume with pulsing to match alternation
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.25);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.4);
    gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.45);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.6);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.65);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (error) {
    console.log("Audio not supported or failed:", error);
  }
};

// Liquid swoosh sound for successful mixing
const playSuccessSound = () => {
  if (!soundEnabled) return;

  try {
    const ctx = initAudioContext();

    // === Liquid Swoosh ===
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
      ctx.currentTime + 0.4,
    );
    swooshOsc.frequency.exponentialRampToValueAtTime(
      100,
      ctx.currentTime + 0.8,
    );

    // Filter for liquid effect
    swooshFilter.type = "lowpass";
    swooshFilter.frequency.setValueAtTime(800, ctx.currentTime);
    swooshFilter.frequency.exponentialRampToValueAtTime(
      1500,
      ctx.currentTime + 0.3,
    );
    swooshFilter.frequency.exponentialRampToValueAtTime(
      300,
      ctx.currentTime + 0.8,
    );
    swooshFilter.Q.setValueAtTime(2, ctx.currentTime);

    // Swoosh volume envelope
    swooshGain.gain.setValueAtTime(0, ctx.currentTime);
    swooshGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
    swooshGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5);
    swooshGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    // Play the swoosh
    swooshOsc.start(ctx.currentTime);
    swooshOsc.stop(ctx.currentTime + 0.8);
  } catch (error) {
    console.log("Audio not supported or failed:", error);
  }
};

// Toggle sound on/off
const toggleSound = () => {
  soundEnabled = !soundEnabled;
  return soundEnabled;
};

// Positive start button sound
const playStartSound = () => {
  if (!soundEnabled) return;

  try {
    const ctx = initAudioContext();

    // Create an uplifting sound - rising chord progression
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Connect nodes
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(ctx.destination);

    // Set up positive, uplifting chord
    osc1.type = "sine";
    osc2.type = "sine";
    osc3.type = "sine";

    // Rising major chord progression
    osc1.frequency.setValueAtTime(262, ctx.currentTime); // C4
    osc2.frequency.setValueAtTime(330, ctx.currentTime); // E4
    osc3.frequency.setValueAtTime(392, ctx.currentTime); // G4

    // Volume envelope - positive and encouraging
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);

    // Play the sound
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc3.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
    osc3.stop(ctx.currentTime + 0.6);
  } catch (error) {
    console.log("Audio not supported or failed:", error);
  }
};

// Celebratory completion sound - multiple futuristic swooshes
const playCelebrationSound = () => {
  if (!soundEnabled) return;

  try {
    const ctx = initAudioContext();

    // === Multiple Futuristic Swooshes ===
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.4;

      const swooshOsc = ctx.createOscillator();
      const swooshFilter = ctx.createBiquadFilter();
      const swooshGain = ctx.createGain();

      // Connect swoosh nodes
      swooshOsc.connect(swooshFilter);
      swooshFilter.connect(swooshGain);
      swooshGain.connect(ctx.destination);

      // Set up the futuristic swoosh
      swooshOsc.type = "sine";
      swooshOsc.frequency.setValueAtTime(100 + i * 50, ctx.currentTime + delay);
      swooshOsc.frequency.exponentialRampToValueAtTime(
        800 + i * 200,
        ctx.currentTime + delay + 0.3,
      );

      // Filter for futuristic effect
      swooshFilter.type = "lowpass";
      swooshFilter.frequency.setValueAtTime(600, ctx.currentTime + delay);
      swooshFilter.frequency.exponentialRampToValueAtTime(
        2000,
        ctx.currentTime + delay + 0.3,
      );
      swooshFilter.Q.setValueAtTime(3, ctx.currentTime + delay);

      // Swoosh volume envelope
      swooshGain.gain.setValueAtTime(0, ctx.currentTime + delay);
      swooshGain.gain.linearRampToValueAtTime(
        0.1,
        ctx.currentTime + delay + 0.05,
      );
      swooshGain.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + delay + 0.35,
      );

      // Play the swoosh
      swooshOsc.start(ctx.currentTime + delay);
      swooshOsc.stop(ctx.currentTime + delay + 0.35);
    }
  } catch (error) {
    console.log("Audio not supported or failed:", error);
  }
};

// Get current sound state
const isSoundEnabled = () => soundEnabled;

export {
  playErrorSound,
  playSuccessSound,
  playStartSound,
  playCelebrationSound,
  toggleSound,
  isSoundEnabled,
  initAudioContext,
};
