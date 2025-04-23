import { v4 as uuidv4 } from 'uuid';

const GRID_SIZE = 7;

// Define permanent holes (black cells)
const FIXED_HOLES = [
  [1, 1], [1, 3], [1, 5],
  [3, 1], [3, 3], [3, 5],
  [5, 1], [5, 3], [5, 5],
];

// Color mixing rules
const COLOR_MIXING_RULES = {
  yellow: ['red', 'green'],
  magenta: ['red', 'blue'],
  cyan: ['green', 'blue'],
  blue: ['cyan', 'magenta'],
  green: ['cyan', 'yellow'],
  red: ['magenta', 'yellow'],
  orange: ['yellow', 'red'],
  purple: ['magenta', 'blue'],
  white: ['cyan', 'green'],
};

const COLORS = Object.keys(COLOR_MIXING_RULES);
const INFLUENCER_COLORS = ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow']; // Exclude purple, orange, white

// Create an empty board
const createBoard = () => {
  const board = Array(GRID_SIZE).fill().map(() =>
    Array(GRID_SIZE).fill().map(() => ({
      color: null,
      isActive: true,
      isInfluencer: false,
      isHole: false,
      isClue: false,
      id: uuidv4(),
    }))
  );

  // Set influencer (dark gray) cells where (row + col) % 2 === 0
  // Set influenced (light gray) cells where (row + col) % 2 === 1
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if ((row + col) % 2 === 0) {
        board[row][col].isInfluencer = true;
      }
    }
  }

  // Apply holes (inactive, no tiles)
  FIXED_HOLES.forEach(([row, col]) => {
    board[row][col].isHole = true;
    board[row][col].isActive = false;
    board[row][col].isInfluencer = false;
  });

  return board;
};

// Get influencer (dark gray) neighbors of an influenced (light gray) cell
const getNeighbors = (board, row, col) => {
  const neighbors = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && board[r][c].isInfluencer && !board[r][c].isHole) {
      neighbors.push({ row: r, col: c, color: board[r][c].color });
    }
  }
  return neighbors;
};

// Determine the color of an influenced cell based on its influencer neighbors
const getInfluencedColor = (neighborColors) => {
  if (neighborColors.length !== 2) {
    console.log('Invalid neighbor count:', neighborColors.length);
    return null; // Enforce exactly 2 neighbors
  }
  // Check for same-color rule
  if (neighborColors[0] === neighborColors[1]) {
    return neighborColors[0]; // e.g., Cyan + Cyan = Cyan
  }
  // Check color mixing rules
  const sortedNeighbors = [...neighborColors].sort();
  for (const [resultColor, rule] of Object.entries(COLOR_MIXING_RULES)) {
    const sortedRule = [...rule].sort();
    if (sortedNeighbors.length === sortedRule.length && sortedNeighbors.every((c, i) => c === sortedRule[i])) {
      return resultColor;
    }
  }
  return null; // No valid color found
};

// Check if an influenced cell's color matches its influencer neighbors
const checkCell = (board, row, col) => {
  const cell = board[row][col];
  if (!cell.isActive || cell.isInfluencer || !cell.color) return true;

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors.filter(n => n.color).map(n => n.color);
  const expectedColor = getInfluencedColor(neighborColors);
  return expectedColor === cell.color;
};

// Validate the entire board
const validateBoard = (board) => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].isActive && !board[row][col].isInfluencer && !checkCell(board, row, col)) {
        return false;
      }
    }
  }
  return true;
};

// Generate a solution board
const generateSolution = () => {
  const board = createBoard();
  const influencerCells = [];
  const influencedCells = [];

  // Identify influencer and influenced cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].isInfluencer) {
        influencerCells.push([row, col]);
      } else if (board[row][col].isActive) {
        influencedCells.push([row, col]);
      }
    }
  }

  console.log('Influencer cells:', influencerCells.length, 'at', influencerCells);
  console.log('Influenced cells:', influencedCells.length, 'at', influencedCells);

  // Verify each influenced cell has exactly 2 influencer neighbors
  for (const [row, col] of influencedCells) {
    const neighbors = getNeighbors(board, row, col);
    if (neighbors.length !== 2) {
      console.log(`Error: Influenced cell [${row},${col}] has ${neighbors.length} influencer neighbors at`, neighbors.map(n => `[${n.row},${n.col}]`));
      return null;
    }
    console.log(`Influenced cell [${row},${col}] has 2 influencer neighbors at`, neighbors.map(n => `[${n.row},${n.col}]`));
  }

  // Pre-tile corner influencer cells with yellow
  const preTiledInfluencers = [
    [0, 0], [0, 6],
    [6, 0], [6, 6],
  ];
  preTiledInfluencers.forEach(([row, col]) => {
    board[row][col].color = 'yellow';
  });

  const startTime = Date.now();
  const TIMEOUT_MS = 10000;
  let attempts = 0;

  // Randomly assign colors to influencers and try to find a valid board
  const tryRandomSolution = () => {
    attempts++;
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log('Generation timed out after', (Date.now() - startTime) / 1000, 'seconds');
      return false;
    }

    // Assign random colors to non-pre-tiled influencers
    influencerCells.forEach(([row, col]) => {
      if (!preTiledInfluencers.some(([r, c]) => r === row && c === col)) {
        board[row][col].color = INFLUENCER_COLORS[Math.floor(Math.random() * INFLUENCER_COLORS.length)];
      }
    });

    // Assign colors to influenced cells
    let invalidCells = [];
    influencedCells.forEach(([row, col]) => {
      const neighbors = getNeighbors(board, row, col);
      const neighborColors = neighbors.filter(n => n.color).map(n => n.color);
      const assignedColor = getInfluencedColor(neighborColors);
      board[row][col].color = assignedColor;
      if (!assignedColor) {
        invalidCells.push([row, col, neighborColors, neighbors.map(n => `[${n.row},${n.col}]`)]);
      }
    });

    if (invalidCells.length > 0) {
      console.log('Invalid influenced cells:', invalidCells.map(([row, col, colors, neighbors]) => ({
        cell: `[${row},${col}]`,
        neighborColors: colors,
        neighborPositions: neighbors,
      })));
      return false;
    }

    if (validateBoard(board)) {
      console.log('Solution found after', attempts, 'random attempts');
      // Log the board for debugging
      const boardSummary = board.map(row => row.map(cell => ({
        color: cell.color,
        isInfluencer: cell.isInfluencer,
        isHole: cell.isHole,
      })));
      console.log('Generated board:', JSON.stringify(boardSummary, null, 2));
      return true;
    }
    return false;
  };

  // Try multiple random configurations
  const MAX_ATTEMPTS = 10000;
  while (attempts < MAX_ATTEMPTS) {
    if (tryRandomSolution()) {
      return board;
    }
    // Clear non-pre-tiled influencer colors for next attempt
    influencerCells.forEach(([row, col]) => {
      if (!preTiledInfluencers.some(([r, c]) => r === row && c === col)) {
        board[row][col].color = null;
      }
    });
    // Clear influenced cell colors
    influencedCells.forEach(([row, col]) => {
      board[row][col].color = null;
    });
  }

  console.log('Failed to generate a solution after', attempts, 'random attempts');
  return null;
};

// Create a puzzle with clues
const createPuzzle = (solutionBoard, clueCount = 8) => {
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

export { createBoard, getNeighbors, checkCell, generateSolution, createPuzzle, COLORS, INFLUENCER_COLORS };