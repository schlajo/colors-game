import React from 'react';

const Cell = ({ cell, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-10 h-10 border border-gray-300 flex items-center justify-center cursor-pointer
        ${cell.isHole ? 'bg-gray-800' :
          cell.color === 'white' ? 'bg-white border-gray-400' :
          cell.color === 'black' ? 'bg-black' :
          cell.color === 'gray' ? 'bg-gray-500' :
          cell.color === 'red' ? 'bg-red-500' :
          cell.color === 'green' ? 'bg-green-500' :
          cell.color === 'blue' ? 'bg-blue-500' :
          cell.color === 'yellow' ? 'bg-yellow-300' :
          cell.color === 'magenta' ? 'bg-pink-500' :
          cell.color === 'cyan' ? 'bg-cyan-400' :
          cell.color === 'orange' ? 'bg-orange-500' :
          cell.color === 'brown' ? 'bg-amber-900' : 'bg-gray-200'
        }`}
    />
  );
};

export default Cell;