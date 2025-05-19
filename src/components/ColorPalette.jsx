import React from 'react';

const ColorPalette = ({ onColorClick, colors }) => {
  return (
    <div className="flex flex-nowrap justify-center gap-1 max-w-full">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => {
            console.log('Palette button clicked, applying color:', color);
            onColorClick(color);
          }}
          className={`w-[min(6vw,30px)] h-[min(6vw,30px)] sm:w-8 sm:h-8 rounded-full flex-shrink-0 p-0
            ${color === 'blue' ? 'bg-blue-500' :
              color === 'purple' ? 'bg-purple-500' :
              color === 'orange' ? 'bg-orange-500' :
              color === 'green' ? 'bg-green-500' :
              color === 'red' ? 'bg-red-500' :
              color === 'yellow' ? 'bg-yellow-300' :
              color === 'cyan' ? 'bg-cyan-400' :
              color === 'magenta' ? 'bg-pink-500' :
              color === 'white' ? 'bg-gray-300 border border-gray-300' : 'bg-gray-200'
            }`}
        />
      ))}
    </div>
  );
};

export default ColorPalette;