import React from "react";
import { COLOR_LABELS, COLOR_CLASSES } from "../utils/colorUtils";

const ColorPalette = ({ onColorClick, colors }) => {
  return (
    <div
      className="grid gap-1 justify-center mx-auto"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(36px, 1fr))`,
        maxWidth: "320px", // You can adjust this value for palette width
      }}
    >
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => {
            console.log("Palette button clicked, applying color:", color);
            onColorClick(color);
          }}
          className={`w-[min(8vw,36px)] h-[min(8vw,36px)] sm:w-8 sm:h-8 rounded-full flex-shrink-0 p-0 flex items-center justify-center
            ${
              COLOR_CLASSES[color] || "bg-gray-200"
            } border border-black thin-white-ring ring-offset-2
            ${
              color === "silver" || color === "gold" || color === "bronze"
                ? "shine-effect"
                : ""
            }`}
        >
          <span
            className={`font-bold pointer-events-none text-[14px] flex items-center justify-center text-shadow-sm
            ${color === "white" ? "text-black" : "text-white"}`}
          >
            {COLOR_LABELS[color]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ColorPalette;
