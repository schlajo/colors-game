import { v4 as uuidv4 } from 'uuid';

const GRID_SIZE = 9;

// Fixed positions for inactive cells (holes), using 0-based indexing
const FIXED_HOLES = [
  [1, 1], [1, 2], [1, 4], [1, 6], [1, 7], // Row 1
  [2, 4],                                   // Row 2
  [3, 1], [3, 7],                           // Row 3
  [4, 1], [4, 3], [4, 4], [4, 5], [4, 7],  // Row 4
  [5, 1], [5, 7],                           // Row 5
  [6, 4],                                   // Row 6
  [7, 1], [7, 2], [7, 4], [7, 6], [7, 7],  // Row 7
];

const COLOR_MIXING_RULES = {
  blue: ['cyan', 'magenta'],           // Subtractive
  green: ['cyan', 'yellow'],           // Subtractive
  red: ['magenta', 'yellow'],          // Subtractive
  yellow: ['red', 'green'],            // Additive
  magenta: ['red', 'blue'],            // Additive
  cyan: ['green', 'yellow'],           // Adjusted to break cycle
  orange: ['red', 'yellow'],           // Kindergarten subtractive
  white: ['red', 'green', 'blue'],     // Additive (3 neighbors)
  black: ['cyan', 'magenta', 'yellow'],// Subtractive (3 neighbors)
  gray: ['black', 'white'],            // Custom
  brown: ['orange', 'yellow', 'red'],  // Custom (3 neighbors)
};

const COLORS = Object.keys(COLOR_MIXING_RULES);

const createBoard = () => {
  const board = Array(GRID_SIZE).fill().map(() =>
    Array(GRID_SIZE).fill().map(() => ({
      color: null,
      isHole: false,
      id: uuidv4(),
    }))
  );

  // Apply fixed holes
  FIXED_HOLES.forEach(([row, col]) => {
    board[row][col].isHole = true;
  });

  console.log('Holes placed:', FIXED_HOLES.length);
  return board;
};

// Get the active neighbors of a cell
const getNeighbors = (board, row, col) => {
  const neighbors = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && !board[r][c].isHole) {
      neighbors.push({ row: r, col: c, color: board[r][c].color });
    }
  }
  return neighbors;
};

// Check if a cell's color satisfies the mixing rules during generation (partial match)
const checkCellDuringGeneration = (board, row, col) => {
  const cell = board[row][col];
  if (cell.isHole || !cell.color) return true; // Holes and empty cells are always valid

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors
    .filter(n => n.color) // Only consider neighbors with a color
    .map(n => n.color);

  const rule = COLOR_MIXING_RULES[cell.color];
  if (!rule) return false; // Invalid color

  // Allow placement if the colored neighbors are a subset of the required colors
  const sortedRule = [...rule].sort();
  const sortedNeighbors = [...neighborColors].sort();
  for (let i = 0; i < neighborColors.length; i++) {
    if (!sortedRule.includes(sortedNeighbors[i])) {
      return false; // A neighbor color doesn't match any required color
    }
  }
  return true;
};

// Check if a cell's color satisfies the mixing rules exactly (final validation)
const checkCellFinal = (board, row, col) => {
  const cell = board[row][col];
  if (cell.isHole || !cell.color) return true; // Holes and empty cells are always valid

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors
    .filter(n => n.color) // Only consider neighbors with a color
    .map(n => n.color);

  const rule = COLOR_MIXING_RULES[cell.color];
  if (!rule) return false; // Invalid color

  if (rule.length !== neighborColors.length) return false; // Exact match required

  const sortedRule = [...rule].sort();
  const sortedNeighbors = [...neighborColors].sort();
  return sortedRule.every((color, i) => color === sortedNeighbors[i]);
};

// Validate the entire board
const validateBoard = (board) => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!checkCellFinal(board, row, col)) {
        return false;
      }
    }
  }
  return true;
};

// Basic backtracking algorithm to generate a full solution
const generateSolution = () => {
  const board = createBoard();
  const cells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!board[row][col].isHole) {
        cells.push([row, col]);
      }
    }
  }

  // Pre-tile some cells with Yellow
  const preTiled = [[0, 0], [0, 3], [0, 5]];
  preTiled.forEach(([row, col]) => {
    board[row][col].color = 'yellow';
  });

  // Remove pre-tiled cells from the list to fill
  const cellsToFill = cells.filter(([r, c]) => !preTiled.some(([pr, pc]) => pr === r && pc === c));

  console.log('Starting backtracking with', cellsToFill.length, 'cells to fill (after pre-tiling)');

  const startTime = Date.now();
  const TIMEOUT_MS = 10000; // 10 seconds timeout

  let attempts = 0; // Track number of backtracking attempts

  const solve = (index) => {
    // Check for timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log('Generation timed out after', (Date.now() - startTime) / 1000, 'seconds');
      return false;
    }

    if (index === cellsToFill.length) {
      // Validate the entire board
      if (validateBoard(board)) {
        console.log('Solution found after', attempts, 'attempts');
        return true; // All cells filled and valid
      }
      return false; // Board is filled but doesn't satisfy all rules
    }

    const [row, col] = cellsToFill[index];
    for (const color of COLORS) {
      attempts++;
      if (attempts % 10000 === 0) {
        console.log(`Attempt ${attempts}: Filling cell ${index + 1}/${cellsToFill.length} at [${row},${col}] with ${color}`);
      }

      board[row][col].color = color;
      if (checkCellDuringGeneration(board, row, col)) {
        // Check if neighbors are still valid after placing this color
        const neighbors = getNeighbors(board, row, col);
        let neighborsValid = true;
        for (const { row: r, col: c } of neighbors) {
          if (board[r][c].color && !checkCellDuringGeneration(board, r, c)) {
            neighborsValid = false;
            break;
          }
        }
        if (neighborsValid && solve(index + 1)) return true;
      }
      board[row][col].color = null;
    }
    return false;
  };

  const success = solve(0);
  if (!success) {
    console.log('Failed to generate a solution after', attempts, 'attempts');
    return null;
  }
  return board;
};

// Create a puzzle by masking some cells
const createPuzzle = (solutionBoard, clueCount = 21) => {
  const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard)); // Deep copy
  const activeCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!puzzleBoard[row][col].isHole) {
        activeCells.push([row, col]);
      }
    }
  }

  // Shuffle active cells
  for (let i = activeCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activeCells[i], activeCells[j]] = [activeCells[j], activeCells[i]];
  }

  // Mask all cells except the clueCount
  const clues = activeCells.slice(0, clueCount);
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!puzzleBoard[row][col].isHole && !clues.some(([r, c]) => r === row && c === col)) {
        puzzleBoard[row][col].color = null;
      }
    }
  }

  return { puzzleBoard, solutionBoard };
};

export { createBoard, getNeighbors, checkCellFinal as checkCell, generateSolution, createPuzzle, COLORS };