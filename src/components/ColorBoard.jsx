import React from "react";
import Cell from "./Cell";

const ColorBoard = ({ board, onCellClick, selectedCell, lightAnimation }) => {
  console.log("ColorBoard rendering with board:", board);
  if (!board || board.length === 0) {
    return <div>Loading board...</div>;
  }

  return (
    <div
      className={`grid grid-cols-7 gap-1 relative ${
        lightAnimation ? "light-pass" : ""
      }`}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={cell.id}
            cell={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            isSelected={
              selectedCell &&
              selectedCell[0] === rowIndex &&
              selectedCell[1] === colIndex
            }
          />
        ))
      )}
    </div>
  );
};

export default ColorBoard;
