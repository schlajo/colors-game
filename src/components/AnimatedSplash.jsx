import React, { useState, useEffect } from "react";
import { playSuccessSound, initAudioContext } from "../utils/soundEffects";

const AnimatedSplash = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  // Phase 0: Empty - circles off screen
  // Phase 1: Circles moving inward, starting to overlap (Venn forming)
  // Phase 2: Full Venn visible (Y, M, C showing)
  // Phase 3: Circles continue merging into one white orb
  // Phase 4: White explosion + sound
  // Phase 5: Logo reveal (Colors icon only)
  // Phase 6: Fade out

  useEffect(() => {
    initAudioContext();

    const timeline = [
      { delay: 400, nextPhase: 1 }, // Start circles moving toward Venn
      { delay: 1600, nextPhase: 2 }, // Full Venn formed
      { delay: 800, nextPhase: 3 }, // Continue merging into white orb
      { delay: 1200, nextPhase: 4 }, // White explosion + sound
      { delay: 700, nextPhase: 5 }, // Logo reveal
      { delay: 2000, nextPhase: 6 }, // Start fade out
      { delay: 500, nextPhase: 7 }, // Complete
    ];

    let timeouts = [];
    let accumulatedDelay = 0;

    timeline.forEach((step) => {
      accumulatedDelay += step.delay;
      const timeout = setTimeout(() => {
        setPhase(step.nextPhase);
        if (step.nextPhase === 4) {
          playSuccessSound();
        }
        if (step.nextPhase === 7) {
          onComplete();
        }
      }, accumulatedDelay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  // Determine circle class based on phase
  const getCircleClass = (color) => {
    let classes = `venn-circle ${color}`;
    if (phase >= 1) classes += " move-in";
    if (phase >= 2) classes += " venn-position";
    if (phase >= 3) classes += " merged";
    return classes;
  };

  return (
    <div
      className={`splash-screen ${phase >= 6 ? "fade-out" : ""}`}
      onClick={handleSkip}
    >
      {/* Animated Venn - circles that blend together (hide when explosion starts) */}
      {phase < 4 && (
        <div className="venn-animation">
          <div className={getCircleClass("red")} />
          <div className={getCircleClass("green")} />
          <div className={getCircleClass("blue")} />
        </div>
      )}

      {/* White explosion */}
      {phase === 4 && <div className="white-explosion" />}

      {/* Final Colors icon */}
      {phase >= 5 && (
        <div className="colors-icon-reveal">
          <div className="colors-icon">
            <div className="icon-circle red" />
            <div className="icon-circle green" />
            <div className="icon-circle blue" />
            <div className="icon-center">C</div>
          </div>
          <h1 className="colors-title">Colors</h1>
          <p className="colors-byline">by schlajo</p>
        </div>
      )}

      {phase < 4 && <div className="tap-skip">Tap to skip</div>}
    </div>
  );
};

export default AnimatedSplash;
