import React from "react";

const ColorPalette = ({ onColorClick, colors }) => {
  // Map colors to their display labels
  const getColorLabel = (color) => {
    switch (color) {
      case "green":
        return "G";
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
      case "magenta":
        return "M";
      case "silver":
        return "S";
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
    <div className="flex flex-nowrap justify-center gap-1 max-w-full">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => {
            console.log("Palette button clicked, applying color:", color);
            onColorClick(color);
          }}
          className={`w-[min(8vw,36px)] h-[min(8vw,36px)] sm:w-8 sm:h-8 rounded-full flex-shrink-0 p-0 flex items-center justify-center
            ${
              color === "blue"
                ? "bg-blue-500 border border-gray-300"
                : color === "purple"
                ? "bg-purple-500 border border-gray-300"
                : color === "orange"
                ? "bg-orange-500 border border-gray-300"
                : color === "green"
                ? "bg-green-500 border border-gray-300"
                : color === "red"
                ? "bg-red-500 border border-gray-300"
                : color === "yellow"
                ? "bg-yellow-300 border border-gray-300"
                : color === "cyan"
                ? "bg-cyan-400 border border-gray-300"
                : color === "magenta"
                ? "bg-pink-500 border border-gray-300"
                : color === "silver"
                ? "bg-gray-400 border border-gray-300"
                : color === "black"
                ? "bg-black border border-gray-300"
                : color === "white"
                ? "bg-white border border-gray-300"
                : color === "gold"
                ? "bg-yellow-600 border border-gray-300" // Corrected to yellow-600 for gold
                : "bg-gray-200"
            }`}
        >
          <span
            className={`text-black font-bold pointer-events-none text-[14px] flex items-center justify-center text-shadow-sm ${
              color === "white" || color === "gold" ? "text-black" : "text-white"
            }`}
          >
            {getColorLabel(color)}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ColorPalette;