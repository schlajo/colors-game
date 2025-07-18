import React from "react";
import Cell from "./Cell";

const ColorBoard = ({
  board,
  onCellClick,
  selectedCell,
  lightAnimation,
  cellSize,
}) => {
  console.log("ColorBoard rendering with board:", board);
  if (!board || board.length === 0) {
    return <div>Loading board...</div>;
  }

  return (
    <div
      className={`grid gap-1 relative ${lightAnimation ? "light-pass" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${board[0].length}, ${cellSize}px)`,
      }}
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
            cellSize={cellSize}
          />
        ))
      )}
    </div>
  );
};

export default ColorBoard;
