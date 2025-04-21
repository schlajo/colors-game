import { v4 as uuidv4 } from 'uuid';

const GRID_SIZE = 7;

// Holes on white-ish (affected) cells
const FIXED_HOLES = [
  [1, 2], [1, 4],
  [3, 0], [3,2], [3,4], [3, 6],
  [5, 2], [5, 4],
];

const COLOR_MIXING_RULES = {
  blue: ['cyan', 'purple'],
  purple: ['blue', 'magenta'],
  orange: ['red', 'yellow'],
  green: ['cyan', 'yellow'],
  red: ['magenta', 'yellow'],
  yellow: ['red', 'green'],
  cyan: ['blue', 'green'],
  magenta: ['red', 'blue'],
  white: ['red', 'blue', 'green'],
};

const COLORS = Object.keys(COLOR_MIXING_RULES);

const createBoard = () => {
  const board = Array(GRID_SIZE).fill().map(() =>
    Array(GRID_SIZE).fill().map(() => ({
      color: null,
      isActive: false,
      isHole: false,
      isClue: false,
      id: uuidv4(),
    }))
  );

  // Set active (white-ish, affected) squares where (row + col) % 2 === 1
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col].isActive = true;
      }
    }
  }

  // Apply holes
  FIXED_HOLES.forEach(([row, col]) => {
    board[row][col].isHole = true;
    // Ensure holes override isActive to prevent validation
    board[row][col].isActive = false;
  });

  // Count active and inactive non-hole cells for logging
  let activeCount = 0;
  let inactiveCount = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!board[row][col].isHole) {
        if (board[row][col].isActive) {
          activeCount++;
        } else {
          inactiveCount++;
        }
      }
    }
  }

  console.log('Board created with', activeCount, 'active (white-ish, affected) squares,', inactiveCount, 'inactive (gray, affector) squares, and', FIXED_HOLES.length, 'holes');
  return board;
};

// Get inactive (gray, affector, non-hole) neighbors of an active cell
const getNeighbors = (board, row, col) => {
  const neighbors = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && !board[r][c].isActive && !board[r][c].isHole) {
      neighbors.push({ row: r, col: c, color: board[r][c].color });
    }
  }
  return neighbors;
};

// Check cell during generation (subset match)
const checkCellDuringGeneration = (board, row, col) => {
  const cell = board[row][col];
  if (!cell.isActive || !cell.color) return true;

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors.filter(n => n.color).map(n => n.color);
  const rule = COLOR_MIXING_RULES[cell.color];
  if (!rule) return false;

  const sortedRule = [...rule].sort();
  const sortedNeighbors = [...neighborColors].sort();
  for (let i = 0; i < neighborColors.length; i++) {
    if (!sortedRule.includes(sortedNeighbors[i])) {
      return false;
    }
  }
  return true;
};

// Check cell for final validation (exact match)
const checkCellFinal = (board, row, col) => {
  const cell = board[row][col];
  if (!cell.isActive || !cell.color) return true;

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors.filter(n => n.color).map(n => n.color);
  const rule = COLOR_MIXING_RULES[cell.color];
  if (!rule) return false;

  if (rule.length !== neighborColors.length) return false;

  const sortedRule = [...rule].sort();
  const sortedNeighbors = [...neighborColors].sort();
  return sortedRule.every((color, i) => color === sortedNeighbors[i]);
};

// Validate the entire board
const validateBoard = (board) => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].isActive && !checkCellFinal(board, row, col)) {
        return false;
      }
    }
  }
  return true;
};

// Generate a solution board
const generateSolution = () => {
  const board = createBoard();
  const activeCells = [];
  const inactiveCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].isActive) {
        activeCells.push([row, col]);
      } else if (!board[row][col].isHole) {
        inactiveCells.push([row, col]);
      }
    }
  }

  // Pre-tile corner inactive (gray) cells with yellow
  const preTiledInactive = [
    [0, 0], [0, 6],
    [6, 0], [6, 6],
  ];
  preTiledInactive.forEach(([row, col]) => {
    board[row][col].color = 'yellow';
  });

  console.log('Starting backtracking with', activeCells.length, 'active cells');

  const startTime = Date.now();
  const TIMEOUT_MS = 10000;

  let attempts = 0;

  const solve = (index) => {
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log('Generation timed out after', (Date.now() - startTime) / 1000, 'seconds');
      return false;
    }

    if (index === activeCells.length) {
      if (validateBoard(board)) {
        console.log('Solution found after', attempts, 'attempts');
        return true;
      }
      return false;
    }

    const [row, col] = activeCells[index];
    for (const color of COLORS) {
      attempts++;
      if (attempts % 5000 === 0) {
        console.log(`Attempt ${attempts}: Filling cell ${index + 1}/${activeCells.length} at [${row},${col}] with ${color}`);
      }

      board[row][col].color = color;
      if (checkCellDuringGeneration(board, row, col)) {
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
    console.log(`Backtracking at cell ${index + 1}/${activeCells.length} [${row},${col}]`);
    return false;
  };

  const success = solve(0);
  if (!success) {
    console.log('Failed to generate a solution after', attempts, 'attempts');
    return null;
  }
  return board;
};

// Create a puzzle with clues
const createPuzzle = (solutionBoard, clueCount = 10) => {
  const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));
  const nonHoleCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!puzzleBoard[row][col].isHole) {
        nonHoleCells.push([row, col]);
      }
    }
  }

  // Shuffle non-hole cells
  for (let i = nonHoleCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonHoleCells[i], nonHoleCells[j]] = [nonHoleCells[j], nonHoleCells[i]];
  }

  // Keep clueCount cells as clues
  const clues = nonHoleCells.slice(0, clueCount);
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!puzzleBoard[row][col].isHole && !clues.some(([r, c]) => r === row && c === col)) {
        puzzleBoard[row][col].color = null;
      } else if (puzzleBoard[row][col].color) {
        puzzleBoard[row][col].isClue = true;
      }
    }
  }

  return { puzzleBoard, solutionBoard };
};

export { createBoard, getNeighbors, checkCellFinal as checkCell, generateSolution, createPuzzle, COLORS };