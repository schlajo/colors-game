import React from 'react';
import { COLORS } from '../utils/gameLogic';

const ColorPalette = ({ onColorSelect, selectedColor }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {COLORS.map((color) => (
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
  );
};

export default ColorPalette;