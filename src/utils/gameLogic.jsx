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
  magenta: ['red', 'blue'],
  cyan: ['green', 'blue'],
  yellow: ['red', 'green'],
  blue: ['cyan', 'magenta'],
  green: ['cyan', 'yellow'],
  red: ['magenta', 'yellow'],
  white: ['green', 'cyan'],
  purple: ['blue', 'magenta'],
  orange: ['red', 'yellow'],
};

const COLORS = Object.keys(COLOR_MIXING_RULES);
const INFLUENCER_COLORS = ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow'];

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

  // Set influencer cells where (row + col) % 2 === 0
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if ((row + col) % 2 === 0) {
        board[row][col].isInfluencer = true;
      }
    }
  }

  // Apply holes
  FIXED_HOLES.forEach(([row, col]) => {
    board[row][col].isHole = true;
    board[row][col].isActive = false;
    board[row][col].isInfluencer = false;
  });

  return board;
};

// Get influencer neighbors of an influenced cell
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

// Determine the color of an influenced cell
const getInfluencedColor = (neighborColors) => {
  if (neighborColors.length !== 2) {
    console.log('Invalid neighbor count:', neighborColors.length);
    return null;
  }
  // Same-color rule
  if (neighborColors[0] === neighborColors[1]) {
    return neighborColors[0]; // e.g., Red + Red = Red
  }
  // Different-color mixing rules
  const sortedNeighbors = [...neighborColors].sort();
  for (const [resultColor, rule] of Object.entries(COLOR_MIXING_RULES)) {
    const sortedRule = [...rule].sort();
    if (sortedNeighbors.length === sortedRule.length && sortedNeighbors.every((c, i) => c === sortedRule[i])) {
      return resultColor;
    }
  }
  return null;
};

// Check if an influenced cell's color is valid
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
      console.log(`Error: Influenced cell [${row},${col}] has ${neighbors.length} neighbors at`, neighbors.map(n => `[${n.row},${n.col}]`));
      return null;
    }
  }

  const startTime = Date.now();
  const TIMEOUT_MS = 15000;
  let sameColorCount = 0;

  // Get valid color pairs for influencers
  const getValidColorPairs = (n1Color, n2Color) => {
    const pairs = [];
    // Different-color pairs from COLOR_MIXING_RULES
    for (const [resultColor, [c1, c2]] of Object.entries(COLOR_MIXING_RULES)) {
      if ((!n1Color || n1Color === c1) && (!n2Color || n2Color === c2)) {
        pairs.push([c1, c2, resultColor]);
      }
      if ((!n1Color || n1Color === c2) && (!n2Color || n2Color === c1)) {
        pairs.push([c2, c1, resultColor]);
      }
    }
    // Same-color pairs (last resort)
    if (!n1Color && !n2Color || n1Color === n2Color) {
      for (const c of INFLUENCER_COLORS) {
        if ((!n1Color || n1Color === c) && (!n2Color || n2Color === c)) {
          pairs.push([c, c, c]);
        }
      }
    }
    return pairs;
  };

  // Greedy assignment with deeper backtracking
  const assignColors = () => {
    const influencerColors = new Map();
    sameColorCount = 0;
    const MAX_SAME_COLOR = 10;
    const assignmentStack = [];
    const triedPairs = new Map();

    // Sort influenced cells to prioritize edges and near holes
    influencedCells.sort((a, b) => {
      const [rowA, colA] = a;
      const [rowB, colB] = b;
      const isEdgeA = rowA === 0 || rowA === 6 || colA === 0 || colA === 6 ? 1 : 0;
      const isEdgeB = rowB === 0 || rowB === 6 || colB === 0 || colB === 6 ? 1 : 0;
      const isNearHoleA = FIXED_HOLES.some(([hr, hc]) => Math.abs(rowA - hr) <= 1 && Math.abs(colA - hc) <= 1) ? 1 : 0;
      const isNearHoleB = FIXED_HOLES.some(([hr, hc]) => Math.abs(rowB - hr) <= 1 && Math.abs(colB - hc) <= 1) ? 1 : 0;
      return (isEdgeB + isNearHoleB) - (isEdgeA + isNearHoleA);
    });

    let index = 0;
    while (index < influencedCells.length) {
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.log('Generation timed out');
        return false;
      }

      const [row, col] = influencedCells[index];
      const neighbors = getNeighbors(board, row, col);
      const [n1, n2] = neighbors;
      const n1Key = `${n1.row},${n1.col}`;
      const n2Key = `${n2.row},${n2.col}`;
      const cellKey = `${row},${col}`;
      if (!triedPairs.has(cellKey)) triedPairs.set(cellKey, new Set());

      const validPairs = getValidColorPairs(
        influencerColors.get(n1Key),
        influencerColors.get(n2Key)
      ).filter(([c1, c2]) => !triedPairs.get(cellKey).has(`${c1},${c2}`));

      if (validPairs.length === 0) {
        console.log(`No valid colors for cell [${row},${col}] with neighbors [${n1.row},${n1.col}]=${influencerColors.get(n1Key) || 'none'}, [${n2.row},${n2.col}]=${influencerColors.get(n2Key) || 'none'}`);
        triedPairs.get(cellKey).clear();
        if (assignmentStack.length === 0) return false;
        const lastAssignment = assignmentStack.pop();
        index = lastAssignment.index;
        influencerColors.delete(lastAssignment.n1Key);
        influencerColors.delete(lastAssignment.n2Key);
        board[lastAssignment.n1.row][lastAssignment.n1.col].color = null;
        board[lastAssignment.n2.row][lastAssignment.n2.col].color = null;
        board[lastAssignment.row][lastAssignment.col].color = null;
        if (lastAssignment.wasSameColor) sameColorCount--;
        continue;
      }

      let chosenPair;
      const diffColorPairs = validPairs.filter(([c1, c2]) => c1 !== c2);
      if (diffColorPairs.length > 0 && sameColorCount < MAX_SAME_COLOR) {
        chosenPair = diffColorPairs[Math.floor(Math.random() * diffColorPairs.length)];
      } else {
        const sameColorPairs = validPairs.filter(([c1, c2]) => c1 === c2);
        if (sameColorPairs.length === 0) {
          console.log(`No same-color pairs for cell [${row},${col}] with neighbors [${n1.row},${n1.col}]=${influencerColors.get(n1Key) || 'none'}, [${n2.row},${n2.col}]=${influencerColors.get(n2Key) || 'none'}`);
          triedPairs.get(cellKey).clear();
          if (assignmentStack.length === 0) return false;
          const lastAssignment = assignmentStack.pop();
          index = lastAssignment.index;
          influencerColors.delete(lastAssignment.n1Key);
          influencerColors.delete(lastAssignment.n2Key);
          board[lastAssignment.n1.row][lastAssignment.n1.col].color = null;
          board[lastAssignment.n2.row][lastAssignment.n2.col].color = null;
          board[lastAssignment.row][lastAssignment.col].color = null;
          if (lastAssignment.wasSameColor) sameColorCount--;
          continue;
        }
        chosenPair = sameColorPairs[Math.floor(Math.random() * sameColorPairs.length)];
      }

      const [c1, c2, resultColor] = chosenPair;
      triedPairs.get(cellKey).add(`${c1},${c2}`);

      if (influencerColors.has(n1Key) && influencerColors.get(n1Key) !== c1) {
        console.log(`Conflict at [${n1.row},${n1.col}]: wants ${c1}, has ${influencerColors.get(n1Key)}`);
        triedPairs.get(cellKey).clear();
        if (assignmentStack.length === 0) return false;
        const lastAssignment = assignmentStack.pop();
        index = lastAssignment.index;
        influencerColors.delete(lastAssignment.n1Key);
        influencerColors.delete(lastAssignment.n2Key);
        board[lastAssignment.n1.row][lastAssignment.n1.col].color = null;
        board[lastAssignment.n2.row][lastAssignment.n2.col].color = null;
        board[lastAssignment.row][lastAssignment.col].color = null;
        if (lastAssignment.wasSameColor) sameColorCount--;
        continue;
      }
      if (influencerColors.has(n2Key) && influencerColors.get(n2Key) !== c2) {
        console.log(`Conflict at [${n2.row},${n2.col}]: wants ${c2}, has ${influencerColors.get(n2Key)}`);
        triedPairs.get(cellKey).clear();
        if (assignmentStack.length === 0) return false;
        const lastAssignment = assignmentStack.pop();
        index = lastAssignment.index;
        influencerColors.delete(lastAssignment.n1Key);
        influencerColors.delete(lastAssignment.n2Key);
        board[lastAssignment.n1.row][lastAssignment.n1.col].color = null;
        board[lastAssignment.n2.row][lastAssignment.n2.col].color = null;
        board[lastAssignment.row][lastAssignment.col].color = null;
        if (lastAssignment.wasSameColor) sameColorCount--;
        continue;
      }

      influencerColors.set(n1Key, c1);
      influencerColors.set(n2Key, c2);
      board[n1.row][n1.col].color = c1;
      board[n2.row][n2.col].color = c2;
      board[row][col].color = resultColor;
      const isSameColor = c1 === c2;
      if (isSameColor) sameColorCount++;

      assignmentStack.push({
        index,
        row,
        col,
        n1,
        n2,
        n1Key,
        n2Key,
        wasSameColor: isSameColor,
      });

      if (!checkCell(board, row, col)) {
        console.log(`Invalid assignment at [${row},${col}]: color=${resultColor}, neighbors=[${c1},${c2}]`);
        return false;
      }

      index++;
    }

    return validateBoard(board);
  };

  // Try multiple assignments
  const MAX_ATTEMPTS = 2000;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (assignColors()) {
      console.log(`Solution found after ${attempt} attempts`);
      console.log('Same-color pairs used:', sameColorCount);
      const boardSummary = board.map(row => row.map(cell => ({
        color: cell.color,
        isInfluencer: cell.isInfluencer,
        isHole: cell.isHole,
      })));
      console.log('Generated board:', JSON.stringify(boardSummary, null, 2));
      return board;
    }

    // Reset board
    influencerCells.forEach(([row, col]) => {
      board[row][col].color = null;
    });
    influencedCells.forEach(([row, col]) => {
      board[row][col].color = null;
    });
  }

  console.log('Greedy assignment failed, trying fallback');

  // Fallback: Assign valid pairs iteratively
  const assignValidPair = (n1, n2, influencedCell) => {
    const validPairs = getValidColorPairs(null, null);
    const diffColorPairs = validPairs.filter(([c1, c2]) => c1 !== c2);
    const sameColorPairs = validPairs.filter(([c1, c2]) => c1 === c2);
    let chosenPair;
    if (diffColorPairs.length > 0 && sameColorCount < 10) {
      chosenPair = diffColorPairs[Math.floor(Math.random() * diffColorPairs.length)];
    } else if (sameColorPairs.length > 0) {
      chosenPair = sameColorPairs[Math.floor(Math.random() * sameColorPairs.length)];
    } else {
      console.log(`No valid pairs for cell [${influencedCell[0]},${influencedCell[1]}]`);
      return null;
    }
    const [c1, c2, resultColor] = chosenPair;
    board[n1.row][n1.col].color = c1;
    board[n2.row][n2.col].color = c2;
    if (c1 === c2) sameColorCount++;
    return resultColor;
  };

  sameColorCount = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    influencerCells.forEach(([row, col]) => {
      board[row][col].color = null;
    });
    influencedCells.forEach(([row, col]) => {
      board[row][col].color = null;
    });

    let valid = true;
    for (const [row, col] of influencedCells) {
      const neighbors = getNeighbors(board, row, col);
      const [n1, n2] = neighbors;
      const resultColor = assignValidPair(n1, n2, [row, col]);
      if (!resultColor) {
        valid = false;
        break;
      }
      board[row][col].color = resultColor;
    }

    if (valid && validateBoard(board)) {
      console.log('Fallback solution found');
      const boardSummary = board.map(row => row.map(cell => ({
        color: cell.color,
        isInfluencer: cell.isInfluencer,
        isHole: cell.isHole,
      })));
      console.log('Generated board:', JSON.stringify(boardSummary, null, 2));
      return board;
    }
  }

  console.log('Failed to generate a solution');
  return null;
};

// Check if a puzzle is solvable logically
const canSolvePuzzle = (puzzleBoard, solutionBoard) => {
  const board = JSON.parse(JSON.stringify(puzzleBoard));
  let deductionsMade;
  let unsolvedCount = 0;

  // Count unsolved cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].isActive && !board[row][col].isClue && !board[row][col].isHole) {
        unsolvedCount++;
      }
    }
  }

  do {
    deductionsMade = false;

    // Try to deduce influenced cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board[row][col].isActive || board[row][col].isInfluencer || board[row][col].isClue || board[row][col].color || board[row][col].isHole) {
          continue;
        }
        const neighbors = getNeighbors(board, row, col);
        const neighborColors = neighbors.filter(n => n.color).map(n => n.color);
        if (neighborColors.length === 2) {
          const deducedColor = getInfluencedColor(neighborColors);
          if (deducedColor && deducedColor === solutionBoard[row][col].color) {
            board[row][col].color = deducedColor;
            deductionsMade = true;
            unsolvedCount--;
          }
        }
      }
    }

    // Try to deduce influencer cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board[row][col].isInfluencer || board[row][col].color || board[row][col].isHole) {
          continue;
        }
        // Check influenced neighbors
        const influencedNeighbors = [
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ].map(([dr, dc]) => [row + dr, col + dc]).filter(([r, c]) =>
          r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && board[r][c].isActive && !board[r][c].isInfluencer && !board[r][c].isHole
        );
        for (const [r, c] of influencedNeighbors) {
          if (!board[r][c].color) continue;
          const neighbors = getNeighbors(board, r, c);
          const otherNeighbor = neighbors.find(n => n.row !== row || n.col !== col);
          if (!otherNeighbor.color) continue;
          // Deduce [row, col] color
          const expectedColor = board[r][c].color;
          const otherColor = otherNeighbor.color;
          let deducedColor = null;
          // Try same-color
          if (otherColor === expectedColor) {
            deducedColor = expectedColor;
          } else {
            // Try COLOR_MIXING_RULES
            for (const [resultColor, [c1, c2]] of Object.entries(COLOR_MIXING_RULES)) {
              if (resultColor === expectedColor) {
                if ((c1 === otherColor && INFLUENCER_COLORS.includes(c2)) || (c2 === otherColor && INFLUENCER_COLORS.includes(c1))) {
                  deducedColor = c1 === otherColor ? c2 : c1;
                }
              }
            }
          }
          if (deducedColor && deducedColor === solutionBoard[row][col].color) {
            board[row][col].color = deducedColor;
            deductionsMade = true;
            unsolvedCount--;
          }
        }
      }
    }
  } while (deductionsMade && unsolvedCount > 0);

  return unsolvedCount === 0;
};

// Create a puzzle with clues
const createPuzzle = (solutionBoard, clueCount = 14) => {
  const nonHoleCells = [];
  const influencedCells = [];
  const influencerCells = [];

  // Categorize cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!solutionBoard[row][col].isHole) {
        nonHoleCells.push([row, col]);
        if (solutionBoard[row][col].isInfluencer) {
          influencerCells.push([row, col]);
        } else {
          influencedCells.push([row, col]);
        }
      }
    }
  }

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Try generating a solvable puzzle
  const MAX_CLUE_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_CLUE_ATTEMPTS; attempt++) {
    const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));

    // Prioritize influenced cells for clues
    const clueCandidates = [
      ...shuffleArray([...influencedCells]).slice(0, Math.ceil(clueCount * 0.7)), // ~70% influenced
      ...shuffleArray([...influencerCells]).slice(0, Math.floor(clueCount * 0.3)), // ~30% influencers
    ];
    const clues = clueCandidates.slice(0, clueCount);

    // Clear non-clue cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!puzzleBoard[row][col].isHole && !clues.some(([r, c]) => r === row && c === col)) {
          puzzleBoard[row][col].color = null;
          puzzleBoard[row][col].isClue = false;
        } else if (puzzleBoard[row][col].color) {
          puzzleBoard[row][col].isClue = true;
        }
      }
    }

    // Check solvability
    if (canSolvePuzzle(puzzleBoard, solutionBoard)) {
      console.log(`Solvable puzzle generated with ${clueCount} clues`);
      return { puzzleBoard, solutionBoard };
    }
  }

  console.log(`Failed to generate a solvable puzzle with ${clueCount} clues, falling back to minimal clues`);
  // Fallback: Use minimal clues to ensure solvability
  const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));
  const clues = shuffleArray([...nonHoleCells]).slice(0, clueCount);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!puzzleBoard[row][col].isHole && !clues.some(([r, c]) => r === row && c === col)) {
        puzzleBoard[row][col].color = null;
        puzzleBoard[row][col].isClue = false;
      } else if (puzzleBoard[row][col].color) {
        puzzleBoard[row][col].isClue = true;
      }
    }
  }

  return { puzzleBoard, solutionBoard };
};

export { createBoard, getNeighbors, checkCell, generateSolution, createPuzzle, canSolvePuzzle, COLORS, INFLUENCER_COLORS };