import React, { useEffect, useRef } from "react";
import { COLOR_LABELS, COLOR_CLASSES, COLOR_VALUES } from "../utils/colorUtils";

const Cell = ({
  cell,
  onClick,
  isSelected,
  glossAnimation,
  cellSize,
  isInNewConnection,
  connectionAnimationActive,
  mixingInfo,
  isProvenCorrect,
  provenMixingInfo,
}) => {
  const handleClick = () => {
    if (cell.isHole || cell.isClue) return;
    onClick();
  };

  const size = cellSize || 36;
  const circleSize = Math.round(size * 0.8);
  const cellRef = useRef(null);

  // Determine animation type and CSS variables for color mixing
  const getMixingInfo = () => {
    // For animation, use the current mixingInfo
    if (mixingInfo && connectionAnimationActive) {
      const { influencers, influenced } = mixingInfo;
      const resultColor = COLOR_VALUES[influenced.color];

      if (influencers.length === 2) {
        // Standard 2-color mixing animation
        const directions = influencers.map((inf) => inf.direction);
        const colors = influencers.map((inf) => COLOR_VALUES[inf.color]);

        // Determine animation direction
        let animationType = "diagonal";
        if (directions.includes("top") && directions.includes("bottom")) {
          animationType = "vertical";
        } else if (
          directions.includes("left") &&
          directions.includes("right")
        ) {
          animationType = "horizontal";
        }

        return {
          "--color1": colors[0],
          "--color2": colors[1],
          "--result-color": resultColor,
          "--mix-bg": COLOR_VALUES[influenced.color] || "#ffffff",
          animationType,
          isAnimating: true,
        };
      } else if (influencers.length === 3) {
        // Difficult mode 3-color mixing - create a more complex gradient
        const colors = influencers.map((inf) => COLOR_VALUES[inf.color]);
        return {
          "--color1": colors[0],
          "--color2": colors[1],
          "--color3": colors[2],
          "--result-color": resultColor,
          "--mix-bg": COLOR_VALUES[influenced.color] || "#ffffff",
          animationType: "three-color",
          isAnimating: true,
        };
      }
    }

    // For proven correct cells, use the stored mixing info for permanent display
    if (isProvenCorrect && provenMixingInfo && !cell.isInfluencer) {
      const { influencers, influenced } = provenMixingInfo;
      const resultColor = COLOR_VALUES[influenced.color];

      if (influencers.length === 2) {
        // Standard 2-color mixing
        const directions = influencers.map((inf) => inf.direction);
        const colors = influencers.map((inf) => COLOR_VALUES[inf.color]);

        // Determine animation direction for permanent display
        let animationType = "diagonal-mix";
        if (directions.includes("top") && directions.includes("bottom")) {
          animationType = "vertical-mix";
        } else if (
          directions.includes("left") &&
          directions.includes("right")
        ) {
          animationType = "horizontal-mix";
        }

        return {
          "--color1": colors[0],
          "--color2": colors[1],
          "--result-color": resultColor,
          animationType,
          isAnimating: false,
          isPermanent: true,
        };
      } else if (influencers.length === 3) {
        // Difficult mode 3-color mixing - create a triangular gradient
        const colors = influencers.map((inf) => COLOR_VALUES[inf.color]);
        return {
          "--color1": colors[0],
          "--color2": colors[1],
          "--color3": colors[2],
          "--result-color": resultColor,
          animationType: "three-color-mix",
          isAnimating: false,
          isPermanent: true,
        };
      }
    }

    return {};
  };

  const mixingData = getMixingInfo();

  // Apply CSS custom properties for the animation or permanent state
  useEffect(() => {
    if (
      cellRef.current &&
      (mixingData.animationType || mixingData.isPermanent)
    ) {
      const element = cellRef.current;
      Object.keys(mixingData).forEach((key) => {
        if (
          key !== "animationType" &&
          key !== "isAnimating" &&
          key !== "isPermanent"
        ) {
          element.style.setProperty(key, mixingData[key]);
        }
      });
    }
  }, [mixingData]);

  return (
    <div
      ref={cellRef}
      onClick={handleClick}
      className={`cell border border-gray-300 flex items-center justify-center relative
        ${
          cell.isHole
            ? "bg-black cursor-default"
            : cell.isClue
            ? "cursor-default"
            : "cursor-pointer"
        }
        ${!cell.isHole ? (cell.isInfluencer ? "bg-gray-500" : "bg-white") : ""}
        ${isSelected ? "ring-4 ring-blue-600" : ""}
        ${glossAnimation ? "animate-gloss" : ""}
        ${
          mixingData.isAnimating && mixingData.animationType
            ? `animate-color-mixing ${mixingData.animationType}`
            : mixingData.isPermanent && mixingData.animationType
            ? `mixed-color-cell ${mixingData.animationType}`
            : isInNewConnection && connectionAnimationActive
            ? "animate-valid-connection"
            : ""
        }
      `}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {cell.color && (
        <div
          className="relative bg-gray-900 rounded-full flex items-center justify-center"
          style={{ width: circleSize, height: circleSize }}
        >
          <div
            className={`rounded-full flex items-center justify-center
            ${
              COLOR_CLASSES[cell.color] || "bg-gray-200"
            } border border-black thin-white-ring ring-offset-2
            ${
              cell.color === "silver" ||
              cell.color === "gold" ||
              cell.color === "bronze"
                ? "shine-effect"
                : ""
            }`}
            style={{ width: circleSize, height: circleSize }}
          >
            <span
              className={`font-bold pointer-events-none flex items-center justify-center text-shadow-sm ${
                cell.color === "white" ? "text-black" : "text-white"
              }`}
              style={{ fontSize: Math.round(circleSize * 0.4) }}
            >
              {COLOR_LABELS[cell.color]}
            </span>
          </div>
        </div>
      )}
      {cell.isIncorrect && (
        <svg
          className="absolute inset-0 incorrect-x pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            stroke="red"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="90"
            x2="90"
            y2="10"
            stroke="red"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};

export default Cell;
