import React from 'react';

const Cell = ({ cell, onClick, isSelected, glossAnimation }) => {
  console.log(`Cell rendering: id=${cell.id}, glossAnimation=${glossAnimation}`);
  return (
    <div
      onClick={cell.isHole || cell.isClue ? null : onClick}
      className={`w-10 h-10 border border-gray-300 flex items-center justify-center relative
        ${cell.isHole ? 'bg-black cursor-default' :
          cell.isClue ? 'cursor-default' : 'cursor-pointer'}
        ${!cell.isHole ? (cell.isInfluencer ? 'bg-gray-500' : 'bg-white') : ''}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${glossAnimation ? 'animate-gloss' : ''}
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
              cell.color === 'white' ? 'bg-gray-400 border border-gray-300' : 'bg-gray-200'
            }`}
        />
      )}
      {cell.isIncorrect && (
        <div className="absolute text-red-600 font-bold text-2xl pointer-events-none">
          X
        </div>
      )}
    </div>
  );
};

export default Cell;