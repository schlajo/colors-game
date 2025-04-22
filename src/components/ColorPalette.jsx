import React from 'react';

const ColorPalette = ({ onColorClick, colors }) => {
  return (
    <div className="mt-4">
      <div className="flex flex-row gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => {
              console.log('Palette button clicked, applying color:', color);
              onColorClick(color);
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
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;