import React from 'react';

const Cell = ({ cell, onClick, isSelected }) => {
  return (
    <div
      onClick={cell.isHole || cell.isClue ? null : onClick}
      className={`w-10 h-10 border border-gray-300 flex items-center justify-center
        ${cell.isHole ? 'bg-gray-800 cursor-default' :
          cell.isClue ? 'opacity-70 cursor-default' : 'cursor-pointer'}
        ${cell.isInfluencer ? 'bg-gray-400' : 'bg-gray-200'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {cell.color && (
        <div
          className={`w-8 h-8 rounded-full
            ${cell.color === 'blue' ? 'bg-blue-500' :
              cell.color === 'purple' ? 'bg-purple-500' :
              cell.color === 'orange' ? 'bg-orange-500' :
              cell.color === 'green' ? 'bg-green-500' :
              cell.color === 'red' ? 'bg-red-500' :
              cell.color === 'yellow' ? 'bg-yellow-300' :
              cell.color === 'cyan' ? 'bg-cyan-400' :
              cell.color === 'magenta' ? 'bg-pink-500' :
              cell.color === 'white' ? 'bg-white border border-gray-300' : 'bg-gray-200'
            }`}
        />
      )}
    </div>
  );
};

export default Cell;