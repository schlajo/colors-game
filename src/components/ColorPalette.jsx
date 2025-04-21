import React from 'react';

const ColorPalette = ({ onColorSelect, selectedColor, colors }) => {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-2">
        {colors.map((color) => (
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
                color === 'yellow' ? 'bg-yellow-300' :
                color === 'cyan' ? 'bg-cyan-400' :
                color === 'magenta' ? 'bg-pink-500' :
                color === 'white' ? 'bg-white border border-gray-300' : 'bg-gray-200'
              } ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;