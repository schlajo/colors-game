import React from "react";
import { COLOR_VALUES } from "../utils/colorUtils";

const ColorSwatch = ({ color, size = "w-4 h-4" }) => {
  const colorValue = COLOR_VALUES[color.toLowerCase()];

  if (!colorValue) {
    return null;
  }

  return (
    <span
      className={`inline-block ${size} rounded-full border border-gray-400 mx-1`}
      style={{ backgroundColor: colorValue }}
      title={color}
    />
  );
};

export default ColorSwatch;
