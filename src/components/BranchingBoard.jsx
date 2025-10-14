import React from "react";
import Cell from "./Cell";

const BranchingBoard = ({
  branchingData,
  onCellClick,
  selectedCell,
  lightAnimation,
  cellSize = 60,
}) => {
  console.log("BranchingBoard render called with:", {
    branchingData,
    selectedCell,
  });

  if (!branchingData) {
    return (
      <div className="text-white text-xl">Loading branching puzzle...</div>
    );
  }

  const { cells, connections } = branchingData;
  console.log("Rendering cells:", cells);
  console.log("Rendering connections:", connections);

  return (
    <div className="branching-board-container relative flex flex-col items-center">
      <div className="text-white mb-6 text-lg">
        Branching Puzzle - Simple Line
      </div>

      <div className="relative">
        {/* Render connection lines */}
        <svg
          width="400"
          height="200"
          className="absolute top-0 left-0"
          style={{ zIndex: 1 }}
        >
          {connections.map((connection, index) => {
            const fromCell = cells[connection.from];
            const toCell = cells[connection.to];

            console.log(
              `Drawing line from ${connection.from} to ${connection.to}:`,
              fromCell,
              toCell
            );

            return (
              <line
                key={index}
                x1={fromCell.x}
                y1={fromCell.y}
                x2={toCell.x}
                y2={toCell.y}
                stroke="#666"
                strokeWidth="3"
                className="connection-line"
              />
            );
          })}
        </svg>

        {/* Render cells */}
        <div className="relative" style={{ zIndex: 2 }}>
          {Object.entries(cells).map(([cellId, cellData]) => {
            const isSelected =
              selectedCell &&
              selectedCell[0] === cellData.row &&
              selectedCell[1] === cellData.col;

            console.log(
              `Rendering cell ${cellId}:`,
              cellData,
              "isSelected:",
              isSelected
            );

            return (
              <div
                key={cellId}
                className="absolute"
                style={{
                  left: cellData.x - cellSize / 2,
                  top: cellData.y - cellSize / 2,
                  width: cellSize,
                  height: cellSize,
                  zIndex: 3,
                }}
              >
                <Cell
                  cell={{
                    ...cellData,
                    isSelected,
                    isIncorrect: false,
                  }}
                  onClick={() => {
                    console.log(
                      `Cell clicked: ${cellId} at [${cellData.row}, ${cellData.col}]`
                    );
                    onCellClick(cellData.row, cellData.col);
                  }}
                  lightAnimation={lightAnimation}
                  size={cellSize}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BranchingBoard;
