import React from 'react';
import Cell from './Cell';

const ColorBoard = ({ board, onCellClick }) => {
  console.log('ColorBoard rendering with board:', board); // Debug log
  if (!board || board.length === 0) {
    return <div>Loading board...</div>; // Fallback UI
  }

  return (
    <div className="grid grid-cols-9 gap-1">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={cell.id}
            cell={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default ColorBoard;