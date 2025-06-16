import React from "react";

const Cell = ({ cell, onClick, isSelected, glossAnimation }) => {
  console.log(
    `Cell rendering: id=${cell.id}, glossAnimation=${glossAnimation}`
  );

  const getColorLabel = (color) => {
    switch (color) {
      case "green":
        return "G";
      case "silver":
        return "S";
      case "blue":
        return "B";
      case "purple":
        return "P";
      case "orange":
        return "O";
      case "red":
        return "R";
      case "yellow":
        return "Y";
      case "cyan":
        return "C";
      case "black":
        return "K"; // K for black
      case "white":
        return "W";
      case "gold":
        return "Gld";
      default:
        return "";
    }
  };

  return (
    <div
      onClick={cell.isHole || cell.isClue ? null : onClick}
      className={`cell border border-gray-300 flex items-center justify-center relative
        ${
          cell.isHole
            ? "bg-black cursor-default"
            : cell.isClue
            ? "cursor-default"
            : "cursor-pointer"
        }
        ${!cell.isHole ? (cell.isInfluencer ? "bg-gray-500" : "bg-white") : ""}
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
        ${glossAnimation ? "animate-gloss" : ""}
      `}
    >
      {cell.color && (
        <div
          className={`w-[min(8vw,36px)] h-[min(8vw,36px)] rounded-full flex items-center justify-center
      ${
        cell.color === "blue"
          ? "bg-blue-500"
          : cell.color === "purple"
          ? "bg-purple-500"
          : cell.color === "orange"
          ? "bg-orange-500"
          : cell.color === "green"
          ? "bg-green-500"
          : cell.color === "red"
          ? "bg-red-500"
          : cell.color === "yellow"
          ? "bg-yellow-300"
          : cell.color === "cyan"
          ? "bg-cyan-400"
          : cell.color === "magenta"
          ? "bg-pink-500"
          : cell.color === "black"
          ? "bg-black"
          : cell.color === "white"
          ? "bg-white"
          : cell.color === "gold"
          ? "bg-yellow-600" // Corrected to yellow-600 for gold
          : cell.color === "silver"
          ? "bg-gray-400"
          : "bg-gray-200"
      }`}
        >
          <span
            className={`text-black font-bold pointer-events-none text-[12px]
        flex items-center justify-center text-shadow-sm ${
          cell.color === "black" ? "text-white" : "text-black"
        }`}
          >
            {getColorLabel(cell.color)}
          </span>
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