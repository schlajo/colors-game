import React from "react";
import { COLOR_LABELS, COLOR_CLASSES } from "../utils/colorUtils";

const Cell = ({ cell, onClick, isSelected, glossAnimation, cellSize }) => {
  const handleClick = () => {
    if (cell.isHole || cell.isClue) return;
    onClick();
  };

  const size = cellSize || 36;
  const circleSize = Math.round(size * 0.8);

  return (
    <div
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
