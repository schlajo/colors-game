import React from 'react';
import Cell from './Cell';

const ColorBoard = ({ board, onCellClick, selectedCell }) => {
  console.log('ColorBoard rendering with board:', board);
  if (!board || board.length === 0) {
    return <div>Loading board...</div>;
  }

  return (
    <div className="grid grid-cols-8 gap-1">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={cell.id}
            cell={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            isSelected={selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex}
          />
        ))
      )}
    </div>
  );
};

export default ColorBoard;