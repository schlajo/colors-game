// Branching puzzle game logic

export const createSimpleBranchingPuzzle = () => {
  // Create a simple horizontal line: A --- B --- C --- D --- E

  const cells = {
    "cell-0": {
      id: "cell-0",
      row: 0,
      col: 0,
      x: 150,
      y: 150,
      color: "red", // Starting clue
      isClue: true,
      isInfluencer: true, // Gray cell
      isActive: true,
      isHole: false,
      connections: ["cell-1"],
    },
    "cell-1": {
      id: "cell-1",
      row: 0,
      col: 1,
      x: 220,
      y: 150,
      color: null, // Player needs to fill
      isClue: false,
      isInfluencer: false, // White cell
      isActive: true,
      isHole: false,
      connections: ["cell-0", "cell-2"],
    },
    "cell-2": {
      id: "cell-2",
      row: 0,
      col: 2,
      x: 290,
      y: 150,
      color: null, // Player needs to fill
      isClue: false,
      isInfluencer: true, // Gray cell
      isActive: true,
      isHole: false,
      connections: ["cell-1", "cell-3"],
    },
    "cell-3": {
      id: "cell-3",
      row: 0,
      col: 3,
      x: 360,
      y: 150,
      color: null, // Player needs to fill
      isClue: false,
      isInfluencer: false, // White cell
      isActive: true,
      isHole: false,
      connections: ["cell-2", "cell-4"],
    },
    "cell-4": {
      id: "cell-4",
      row: 0,
      col: 4,
      x: 430,
      y: 150,
      color: "blue", // End clue
      isClue: true,
      isInfluencer: true, // Gray cell
      isActive: true,
      isHole: false,
      connections: ["cell-3"],
    },
  };

  // Define the visual connections for rendering lines
  const connections = [
    { from: "cell-0", to: "cell-1" },
    { from: "cell-1", to: "cell-2" },
    { from: "cell-2", to: "cell-3" },
    { from: "cell-3", to: "cell-4" },
  ];

  return {
    cells,
    connections,
    solution: {
      "cell-1": "yellow", // red + ? = yellow, so this should be yellow
      "cell-2": "green", // yellow + green = ?
      "cell-3": "cyan", // green + ? = blue, so this should be cyan
    },
  };
};

// Convert branching puzzle to format compatible with existing game logic
export const branchingToBoard = (branchingData) => {
  const { cells } = branchingData;

  // Create a sparse 2D array representation for compatibility
  const maxRow = Math.max(...Object.values(cells).map((cell) => cell.row)) + 1;
  const maxCol = Math.max(...Object.values(cells).map((cell) => cell.col)) + 1;

  const board = Array(maxRow)
    .fill(null)
    .map(() =>
      Array(maxCol)
        .fill(null)
        .map(() => ({
          color: null,
          isClue: false,
          isInfluencer: false,
          isActive: false,
          isHole: true, // Default to holes
          isIncorrect: false,
        }))
    );

  // Fill in the actual cells
  Object.values(cells).forEach((cell) => {
    board[cell.row][cell.col] = {
      color: cell.color,
      isClue: cell.isClue,
      isInfluencer: cell.isInfluencer,
      isActive: cell.isActive,
      isHole: false,
      isIncorrect: false,
    };
  });

  return board;
};

// Get neighbors for a branching cell (uses connection data instead of grid adjacency)
export const getBranchingNeighbors = (branchingData, cellId) => {
  const { cells } = branchingData;
  const cell = cells[cellId];

  if (!cell || !cell.connections) return [];

  return cell.connections
    .map((connectedId) => cells[connectedId])
    .filter((connectedCell) => connectedCell && connectedCell.color);
};

// Check if a branching puzzle is solved
export const checkBranchingSolution = (branchingData) => {
  const { cells, solution } = branchingData;

  for (const [cellId, expectedColor] of Object.entries(solution)) {
    if (cells[cellId].color !== expectedColor) {
      return false;
    }
  }

  return true;
};

// Validate a color placement in a branching puzzle
export const validateBranchingPlacement = (branchingData, cellId, color) => {
  const { cells } = branchingData;
  const cell = cells[cellId];

  if (!cell || cell.isClue) return false;

  // For now, just allow any placement - we'll add mixing logic later
  return true;
};

// Get the expected color for a cell based on its neighbors (using existing color mixing)
export const getBranchingExpectedColor = (branchingData, cellId, colors) => {
  const neighbors = getBranchingNeighbors(branchingData, cellId);
  const neighborColors = neighbors.map((n) => n.color).filter(Boolean);

  if (neighborColors.length < 2) return null;

  // Use existing color mixing logic
  // This is simplified - we'd need to import the actual mixing functions
  if (neighborColors.length === 2) {
    const [color1, color2] = neighborColors.sort();

    // Basic RGB additive mixing rules
    const mixingRules = {
      "red,green": "yellow",
      "red,blue": "magenta",
      "green,blue": "cyan",
      "red,yellow": "orange",
      "green,yellow": "lime",
      "blue,magenta": "purple",
    };

    return mixingRules[`${color1},${color2}`] || null;
  }

  return null;
};
