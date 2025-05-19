import { v4 as uuidv4 } from "uuid";

const GRID_SIZE = 7;

// Define permanent holes (black cells)
const FIXED_HOLES = [
  [1, 1],
  [1, 3],
  [1, 5],
  [3, 1],
  [3, 3],
  [3, 5],
  [5, 1],
  [5, 3],
  [5, 5],
];

// Color mixing rules
const COLOR_MIXING_RULES = {
  magenta: ["red", "blue"],
  cyan: ["green", "blue"],
  yellow: ["red", "green"],
  blue: ["cyan", "magenta"],
  green: ["cyan", "yellow"],
  red: ["magenta", "yellow"],
  white: ["green", "cyan"],
  purple: ["blue", "magenta"],
  orange: ["red", "yellow"],
};

const COLORS = Object.keys(COLOR_MIXING_RULES); // All colors: magenta, cyan, yellow, blue, green, red, white, purple, orange
const INFLUENCER_COLORS = COLORS; // Use all colors as influencers to maximize variety

// Create an empty board
const createBoard = () => {
  const board = Array(GRID_SIZE)
    .fill()
    .map(() =>
      Array(GRID_SIZE)
        .fill()
        .map(() => ({
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
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (
      r >= 0 &&
      r < GRID_SIZE &&
      c >= 0 &&
      c < GRID_SIZE &&
      board[r][c].isInfluencer &&
      !board[r][c].isHole
    ) {
      neighbors.push({ row: r, col: c, color: board[r][c].color });
    }
  }
  return neighbors;
};

// Determine the color of an influenced cell
const getInfluencedColor = (neighborColors) => {
  if (neighborColors.length !== 2) {
    console.log("Invalid neighbor count:", neighborColors.length);
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
    if (
      sortedNeighbors.length === sortedRule.length &&
      sortedNeighbors.every((c, i) => c === sortedRule[i])
    ) {
      return resultColor;
    }
  }
  return null;
};

// Deduce colors iteratively
const deduceColors = (board, colors) => {
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          board[i][j].isActive &&
          !board[i][j].isInfluencer &&
          !board[i][j].isClue &&
          !board[i][j].color &&
          !board[i][j].isHole
        ) {
          const neighbors = getNeighbors(board, i, j);
          const neighborColors = neighbors
            .filter((n) => n.color)
            .map((n) => n.color);
          if (neighborColors.length === 2) {
            const deducedColor = getInfluencedColor(neighborColors);
            if (deducedColor) {
              board[i][j].color = deducedColor;
              changed = true;
            }
          }
        }
      }
    }
  }
  return board;
};

// Check if an influenced cell's color is valid
const checkCell = (board, row, col) => {
  const cell = board[row][col];
  if (!cell.isActive || cell.isInfluencer || !cell.color || cell.isClue)
    return true;

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors.filter((n) => n.color).map((n) => n.color);
  const expectedColor = getInfluencedColor(neighborColors);
  return expectedColor === cell.color;
};

// Validate the entire board
const validateBoard = (board) => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isInfluencer &&
        !checkCell(board, row, col)
      ) {
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

  console.log(
    "Influencer cells:",
    influencerCells.length,
    "at",
    influencerCells
  );
  console.log(
    "Influenced cells:",
    influencedCells.length,
    "at",
    influencedCells
  );

  // Verify each influenced cell has exactly 2 influencer neighbors
  for (const [row, col] of influencedCells) {
    const neighbors = getNeighbors(board, row, col);
    if (neighbors.length !== 2) {
      console.log(
        `Error: Influenced cell [${row},${col}] has ${neighbors.length} neighbors at`,
        neighbors.map((n) => `[${n.row},${n.col}]`)
      );
      return null;
    }
  }

  const startTime = Date.now();
  const TIMEOUT_MS = 15000;
  let sameColorCount = 0;

  // Get valid color pairs for influencers, prioritizing different colors
  const getValidColorPairs = (n1Color, n2Color) => {
    const pairs = [];
    // Prioritize different-color pairs
    for (const [resultColor, [c1, c2]] of Object.entries(COLOR_MIXING_RULES)) {
      if ((!n1Color || n1Color === c1) && (!n2Color || n2Color === c2)) {
        pairs.push([c1, c2, resultColor]);
      }
      if ((!n1Color || n1Color === c2) && (!n2Color || n2Color === c1)) {
        pairs.push([c2, c1, resultColor]);
      }
    }
    // Use same-color pairs only if no different-color pairs are available
    if (pairs.length === 0 || (sameColorCount >= 5 && Math.random() < 0.2)) {
      for (const c of COLORS) {
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
    const MAX_SAME_COLOR = 5; // Limit same-color pairs to encourage variety
    const assignmentStack = [];
    const triedPairs = new Map();

    influencedCells.sort((a, b) => {
      const [rowA, colA] = a;
      const [rowB, colB] = b;
      const isEdgeA =
        rowA === 0 || rowA === 6 || colA === 0 || colA === 6 ? 1 : 0;
      const isEdgeB =
        rowB === 0 || rowB === 6 || colB === 0 || colB === 6 ? 1 : 0;
      const isNearHoleA = FIXED_HOLES.some(
        ([hr, hc]) => Math.abs(rowA - hr) <= 1 && Math.abs(colA - hc) <= 1
      )
        ? 1
        : 0;
      const isNearHoleB = FIXED_HOLES.some(
        ([hr, hc]) => Math.abs(rowB - hr) <= 1 && Math.abs(colB - hc) <= 1
      )
        ? 1
        : 0;
      return isEdgeB + isNearHoleB - (isEdgeA + isNearHoleA);
    });

    let index = 0;
    while (index < influencedCells.length) {
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.log("Generation timed out");
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

      let chosenPair =
        validPairs[Math.floor(Math.random() * validPairs.length)];
      // Prioritize different-color pairs if possible
      const diffColorPairs = validPairs.filter(([c1, c2]) => c1 !== c2);
      if (diffColorPairs.length > 0 && sameColorCount < MAX_SAME_COLOR) {
        chosenPair =
          diffColorPairs[Math.floor(Math.random() * diffColorPairs.length)];
      }

      const [c1, c2, resultColor] = chosenPair;
      triedPairs.get(cellKey).add(`${c1},${c2}`);

      if (influencerColors.has(n1Key) && influencerColors.get(n1Key) !== c1) {
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
        return false;
      }

      index++;
    }

    return validateBoard(board);
  };

  const MAX_ATTEMPTS = 2000;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (assignColors()) {
      console.log(`Solution found after ${attempt} attempts`);
      console.log("Same-color pairs used:", sameColorCount);
      const boardSummary = board.map((row) =>
        row.map((cell) => ({
          color: cell.color,
          isInfluencer: cell.isInfluencer,
          isHole: cell.isHole,
        }))
      );
      console.log("Generated board:", JSON.stringify(boardSummary, null, 2));
      return board;
    }

    influencerCells.forEach(([row, col]) => {
      board[row][col].color = null;
    });
    influencedCells.forEach(([row, col]) => {
      board[row][col].color = null;
    });
  }

  console.log("Greedy assignment failed");
  return null;
};

// Check if a puzzle is solvable logically
const canSolvePuzzle = (puzzleBoard, solutionBoard) => {
  const board = JSON.parse(JSON.stringify(puzzleBoard));
  let deductionsMade;
  let unsolvedCount = 0;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isClue &&
        !board[row][col].isHole
      ) {
        unsolvedCount++;
      }
    }
  }

  do {
    deductionsMade = false;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (
          !board[row][col].isActive ||
          board[row][col].isInfluencer ||
          board[row][col].isClue ||
          board[row][col].color ||
          board[row][col].isHole
        ) {
          continue;
        }
        const neighbors = getNeighbors(board, row, col);
        const neighborColors = neighbors
          .filter((n) => n.color)
          .map((n) => n.color);
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
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (
          !board[row][col].isInfluencer ||
          board[row][col].color ||
          board[row][col].isHole
        ) {
          continue;
        }
        const influencedNeighbors = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]
          .map(([dr, dc]) => [row + dr, col + dc])
          .filter(
            ([r, c]) =>
              r >= 0 &&
              r < GRID_SIZE &&
              c >= 0 &&
              c < GRID_SIZE &&
              board[r][c].isActive &&
              !board[r][c].isInfluencer &&
              !board[r][c].isHole
          );
        for (const [r, c] of influencedNeighbors) {
          if (!board[r][c].color) continue;
          const neighbors = getNeighbors(board, r, c);
          const otherNeighbor = neighbors.find(
            (n) => n.row !== row || n.col !== col
          );
          if (!otherNeighbor.color) continue;
          const expectedColor = board[r][c].color;
          const otherColor = otherNeighbor.color;
          let deducedColor = null;
          if (otherColor === expectedColor) {
            deducedColor = expectedColor;
          } else {
            for (const [resultColor, [c1, c2]] of Object.entries(
              COLOR_MIXING_RULES
            )) {
              if (resultColor === expectedColor) {
                if (
                  (c1 === otherColor && INFLUENCER_COLORS.includes(c2)) ||
                  (c2 === otherColor && INFLUENCER_COLORS.includes(c1))
                ) {
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
const createPuzzle = (solutionBoard, clueCount = 20) => {
  const nonHoleCells = [];
  const influencedCells = [];
  const influencerCells = [];

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

  const MAX_CLUE_ATTEMPTS = 50;
  for (let attempt = 0; attempt < MAX_CLUE_ATTEMPTS; attempt++) {
    const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));

    // Increase clue count to ensure solvability
    const clueCandidates = [
      ...shuffleArray([...influencedCells]).slice(
        0,
        Math.ceil(clueCount * 0.7)
      ),
      ...shuffleArray([...influencerCells]).slice(
        0,
        Math.floor(clueCount * 0.3)
      ),
    ];
    const clues = clueCandidates.slice(0, clueCount);

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (
          !puzzleBoard[row][col].isHole &&
          !clues.some(([r, c]) => r === row && c === col)
        ) {
          puzzleBoard[row][col].color = null;
          puzzleBoard[row][col].isClue = false;
        } else if (puzzleBoard[row][col].color) {
          puzzleBoard[row][col].isClue = true;
        }
      }
    }

    if (canSolvePuzzle(puzzleBoard, solutionBoard)) {
      console.log(`Solvable puzzle generated with ${clueCount} clues`);
      return { puzzleBoard, solutionBoard };
    }
  }

  console.log(
    `Failed to generate a solvable puzzle with ${clueCount} clues, falling back to minimal clues`
  );
  const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));
  const clues = shuffleArray([...nonHoleCells]).slice(0, clueCount);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (
        !puzzleBoard[row][col].isHole &&
        !clues.some(([r, c]) => r === row && c === col)
      ) {
        puzzleBoard[row][col].color = null;
        puzzleBoard[row][col].isClue = false;
      } else if (puzzleBoard[row][col].color) {
        puzzleBoard[row][col].isClue = true;
      }
    }
  }

  return { puzzleBoard, solutionBoard };
};

export {
  createBoard,
  getNeighbors,
  checkCell,
  generateSolution,
  createPuzzle,
  canSolvePuzzle,
  COLORS,
  INFLUENCER_COLORS,
  deduceColors,
};
