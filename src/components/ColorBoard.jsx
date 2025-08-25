import React from "react";
import Cell from "./Cell";

const ColorBoard = ({
  board,
  onCellClick,
  selectedCell,
  lightAnimation,
  cellSize,
  newValidConnections,
  connectionAnimationActive,
  provenCorrectCells,
  provenMixingInfo,
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
        row.map((cell, colIndex) => {
          // Check if this cell is part of a new valid connection
          const connectionInfo = newValidConnections.find(
            (connection) =>
              connection.influenced.row === rowIndex &&
              connection.influenced.col === colIndex
          );

          const isInNewConnection = !!connectionInfo;

          // Check if this cell has been proven correct
          const cellKey = `${rowIndex}-${colIndex}`;
          const isProvenCorrect = provenCorrectCells.has(cellKey);
          const provenMixing = provenMixingInfo.get(cellKey);

          return (
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
              isInNewConnection={isInNewConnection}
              connectionAnimationActive={connectionAnimationActive}
              mixingInfo={connectionInfo}
              isProvenCorrect={isProvenCorrect}
              provenMixingInfo={provenMixing}
            />
          );
        })
      )}
    </div>
  );
};

export default ColorBoard;
