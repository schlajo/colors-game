import React from 'react';
import { COLORS } from '../utils/gameLogic';

const ColorPalette = ({ onColorSelect, selectedColor }) => {
  // Split colors into two rows of 6
  const firstRow = COLORS.slice(0, 6); // blue, purple, orange, green, red, black
  const secondRow = COLORS.slice(6); // yellow, cyan, magenta, white, brown, gray

  return (
    <div className="flex flex-col gap-2 mt-4">
      {/* First row */}
      <div className="grid grid-cols-6 gap-2">
        {firstRow.map((color) => (
          <button
            key={color}
            onClick={() => {
              console.log('Palette button clicked, selecting color:', color);
              onColorSelect(color);
            }}
            className={`w-8 h-8 rounded-full
              ${color === 'blue' ? 'bg-blue-500' :
                color === 'purple' ? 'bg-purple-500' :
                color === 'orange' ? 'bg-orange-500' :
                color === 'green' ? 'bg-green-500' :
                color === 'red' ? 'bg-red-500' :
                color === 'black' ? 'bg-black' :
                color === 'yellow' ? 'bg-yellow-300' :
                color === 'cyan' ? 'bg-cyan-400' :
                color === 'magenta' ? 'bg-pink-500' :
                color === 'white' ? 'bg-white border border-gray-300' :
                color === 'brown' ? 'bg-amber-900' :
                color === 'gray' ? 'bg-gray-500' : 'bg-gray-200'
              } ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
          />
        ))}
      </div>
      {/* Second row */}
      <div className="grid grid-cols-6 gap-2">
        {secondRow.map((color) => (
          <button
            key={color}
            onClick={() => {
              console.log('Palette button clicked, selecting color:', color);
              onColorSelect(color);
            }}
            className={`w-8 h-8 rounded-full
              ${color === 'blue' ? 'bg-blue-500' :
                color === 'purple' ? 'bg-purple-500' :
                color === 'orange' ? 'bg-orange-500' :
                color === 'green' ? 'bg-green-500' :
                color === 'red' ? 'bg-red-500' :
                color === 'black' ? 'bg-black' :
                color === 'yellow' ? 'bg-yellow-300' :
                color === 'cyan' ? 'bg-cyan-400' :
                color === 'magenta' ? 'bg-pink-500' :
                color === 'white' ? 'bg-white border border-gray-300' :
                color === 'brown' ? 'bg-amber-900' :
                color === 'gray' ? 'bg-gray-500' : 'bg-gray-200'
              } ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;