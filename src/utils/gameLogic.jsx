import { v4 as uuidv4 } from "uuid";

// Define constants based on difficulty
const DIFFICULTY_CONFIG = {
  Easy: {
    GRID_SIZE: 5,
    FIXED_HOLES: [
      [1, 1],
      [1, 3],
      [3, 1],
      [3, 3],
    ],
    COLORS: ["red", "green", "blue", "cyan", "magenta", "yellow"],
    CLUE_COUNT: 10,
  },
  Medium: {
    GRID_SIZE: 7,
    FIXED_HOLES: [
      [1, 1],
      [1, 3],
      [1, 5],
      [3, 1],
      [3, 3],
      [3, 5],
      [5, 1],
      [5, 3],
      [5, 5],
    ],
    COLORS: [
      "red",
      "green",
      "blue",
      "cyan",
      "magenta",
      "yellow",
      "purple",
      "orange",
      "teal",
    ],
    CLUE_COUNT: 20,
  },
  Difficult: {
    GRID_SIZE: 9,
    FIXED_HOLES: [
      [0, 4],
      [1, 1],
      [1, 7],
      [2, 2],
      [2, 6],
      [3, 3],
      [3, 5],
      [4, 0],
      [4, 8],
      [5, 3],
      [5, 5],
      [6, 2],
      [6, 6],
      [7, 1],
      [7, 7],
      [8, 4],
    ],
    COLORS: [
      "red",
      "green",
      "blue",
      "cyan",
      "magenta",
      "yellow",
      "purple",
      "orange",
      "teal",
      "white",
      "black",
      // "gold",
      // "silver",
      // "bronze",
    ],
    CLUE_COUNT: 30,
    THREE_NEIGHBOR_CELLS: [
      [1, 4],
      [4, 1],
      [4, 7],
      [7, 4],
    ],
  },
};

// Color mixing rules
const COLOR_MIXING_RULES = {
  magenta: ["red", "blue"],
  cyan: ["green", "blue"],
  yellow: ["red", "green"],
  blue: ["cyan", "magenta"],
  green: ["cyan", "yellow"],
  red: ["magenta", "yellow"],
  teal: ["green", "cyan"],
  purple: ["blue", "magenta"],
  orange: ["red", "yellow"],
  white: ["red", "green", "blue"],
  black: ["cyan", "magenta", "yellow"],
  // gold: ["yellow", "orange", "red"],
  // silver: ["cyan", "magenta", "yellow"],
  // bronze: ["purple", "orange", "teal"],
};

// Create an empty board based on difficulty
const createBoard = (difficulty = "Medium") => {
  const { GRID_SIZE, FIXED_HOLES, THREE_NEIGHBOR_CELLS } =
    DIFFICULTY_CONFIG[difficulty];
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

  // Apply fixed holes
  FIXED_HOLES.forEach(([row, col]) => {
    board[row][col].isHole = true;
    board[row][col].isActive = false;
    board[row][col].isInfluencer = false;
  });

  // For difficult level, mark three-neighbor cells
  if (difficulty === "Difficult" && THREE_NEIGHBOR_CELLS) {
    THREE_NEIGHBOR_CELLS.forEach(([row, col]) => {
      if (!board[row][col].isHole) {
        board[row][col].isThreeNeighbor = true;
      }
    });
  }

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
      r < board.length &&
      c >= 0 &&
      c < board[0].length &&
      board[r][c].isInfluencer &&
      !board[r][c].isHole
    ) {
      neighbors.push({ row: r, col: c, color: board[r][c].color });
    }
  }
  return neighbors;
};

// Determine the color of an influenced cell
const getInfluencedColor = (neighborColors, colors) => {
  if (neighborColors.length < 2 || neighborColors.length > 3) {
    console.log("Invalid neighbor count:", neighborColors.length);
    return null;
  }

  // Handle 2-neighbor cells (same as before)
  if (neighborColors.length === 2) {
    // Same-color rule
    if (
      neighborColors[0] === neighborColors[1] &&
      colors.includes(neighborColors[0])
    ) {
      return neighborColors[0];
    }
    // Different-color mixing rules
    const sortedNeighbors = [...neighborColors].sort();
    for (const [resultColor, rule] of Object.entries(COLOR_MIXING_RULES)) {
      if (!colors.includes(resultColor)) continue;
      const sortedRule = [...rule].sort();
      if (
        sortedNeighbors.length === sortedRule.length &&
        sortedNeighbors.every((c, i) => c === sortedRule[i])
      ) {
        return resultColor;
      }
    }
  }

  // Handle 3-neighbor cells (for difficult level)
  if (neighborColors.length === 3) {
    const sortedNeighbors = [...neighborColors].sort();

    // Check for 3-color mixing rules (white, black, gold, silver, bronze)
    for (const [resultColor, rule] of Object.entries(COLOR_MIXING_RULES)) {
      if (!colors.includes(resultColor)) continue;
      const sortedRule = [...rule].sort();
      if (
        sortedNeighbors.length === sortedRule.length &&
        sortedNeighbors.every((c, i) => c === sortedRule[i])
      ) {
        return resultColor;
      }
    }

    // If no 3-color rule matches, check if all colors are the same
    if (
      neighborColors[0] === neighborColors[1] &&
      neighborColors[1] === neighborColors[2] &&
      colors.includes(neighborColors[0])
    ) {
      return neighborColors[0];
    }
  }

  return null;
};

// Deduce colors iteratively
const deduceColors = (board, colors) => {
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
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
          const expectedNeighbors = board[i][j].isThreeNeighbor ? 3 : 2;
          if (neighborColors.length === expectedNeighbors) {
            const deducedColor = getInfluencedColor(neighborColors, colors);
            if (deducedColor) {
              board[i][j].color = deducedColor;
              changed = true;
            }
          }
        }
      }
    }
    // Deduce influencer colors
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        if (
          !board[i][j].isInfluencer ||
          board[i][j].color ||
          board[i][j].isHole
        ) {
          continue;
        }
        const influencedNeighbors = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]
          .map(([dr, dc]) => [i + dr, j + dc])
          .filter(
            ([r, c]) =>
              r >= 0 &&
              r < board.length &&
              c >= 0 &&
              c < board[0].length &&
              board[r][c].isActive &&
              !board[r][c].isInfluencer &&
              !board[r][c].isHole
          );
        for (const [r, c] of influencedNeighbors) {
          if (!board[r][c].color) continue;
          const neighbors = getNeighbors(board, r, c);
          const otherNeighbors = neighbors.filter(
            (n) => n.row !== i || n.col !== j
          );
          if (otherNeighbors.length === 0) continue;

          const expectedColor = board[r][c].color;
          const otherColors = otherNeighbors
            .map((n) => n.color)
            .filter(Boolean);

          if (otherColors.length === 0) continue;

          let deducedColor = null;

          if (board[r][c].isThreeNeighbor) {
            // Handle 3-neighbor deduction
            if (otherColors.length === 2) {
              const allColors = [expectedColor, ...otherColors].sort();
              for (const [resultColor, rule] of Object.entries(
                COLOR_MIXING_RULES
              )) {
                if (!colors.includes(resultColor) || rule.length !== 3)
                  continue;
                const sortedRule = [...rule].sort();
                if (
                  allColors.length === sortedRule.length &&
                  allColors.every((c, idx) => c === sortedRule[idx])
                ) {
                  // Find the missing color
                  const missingColor = rule.find((c) => !allColors.includes(c));
                  if (missingColor && colors.includes(missingColor)) {
                    deducedColor = missingColor;
                    break;
                  }
                }
              }
            }
          } else {
            // Handle 2-neighbor deduction (original logic)
            const otherColor = otherColors[0];
            if (otherColor === expectedColor) {
              deducedColor = expectedColor;
            } else {
              for (const [resultColor, [c1, c2]] of Object.entries(
                COLOR_MIXING_RULES
              )) {
                if (!colors.includes(resultColor)) continue;
                if (resultColor === expectedColor) {
                  if (
                    (c1 === otherColor && colors.includes(c2)) ||
                    (c2 === otherColor && colors.includes(c1))
                  ) {
                    deducedColor = c1 === otherColor ? c2 : c1;
                  }
                }
              }
            }
          }

          if (deducedColor) {
            board[i][j].color = deducedColor;
            changed = true;
          }
        }
      }
    }
  }
  return board;
};

// Check if an influenced cell's color is valid
const checkCell = (board, row, col, colors) => {
  const cell = board[row][col];
  if (!cell.isActive || cell.isInfluencer || !cell.color || cell.isClue)
    return true;

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors.filter((n) => n.color).map((n) => n.color);
  const expectedColor = getInfluencedColor(neighborColors, colors);
  return expectedColor === cell.color;
};

// Validate the entire board
const validateBoard = (board, colors) => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isInfluencer &&
        !checkCell(board, row, col, colors)
      ) {
        return false;
      }
    }
  }
  return true;
};

// Generate a solution board
const generateSolution = (difficulty = "Medium") => {
  const { GRID_SIZE, COLORS, FIXED_HOLES } = DIFFICULTY_CONFIG[difficulty];
  const board = createBoard(difficulty);
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

  // Verify each influenced cell has the correct number of influencer neighbors
  for (const [row, col] of influencedCells) {
    const neighbors = getNeighbors(board, row, col);
    const expectedNeighbors = board[row][col].isThreeNeighbor ? 3 : 2;
    if (neighbors.length !== expectedNeighbors) {
      console.log(
        `Error: Influenced cell [${row},${col}] has ${neighbors.length} neighbors (expected ${expectedNeighbors}) at`,
        neighbors.map((n) => `[${n.row},${n.col}]`)
      );
      console.log(
        `Cell [${row},${col}] isThreeNeighbor:`,
        board[row][col].isThreeNeighbor
      );
      return null;
    }
  }

  const startTime = Date.now();
  const TIMEOUT_MS = 15000;
  let sameColorCount = 0;

  // Get valid color combinations for influencers
  const getValidColorCombinations = (
    neighborColors,
    isThreeNeighbor = false
  ) => {
    const combinations = [];

    if (!isThreeNeighbor) {
      // Handle 2-neighbor cells (same as before)
      const [n1Color, n2Color] = neighborColors;
      // Prioritize different-color pairs
      for (const [resultColor, [c1, c2]] of Object.entries(
        COLOR_MIXING_RULES
      )) {
        if (!COLORS.includes(resultColor)) continue;
        if ((!n1Color || n1Color === c1) && (!n2Color || n2Color === c2)) {
          combinations.push([c1, c2, resultColor]);
        }
        if ((!n1Color || n1Color === c2) && (!n2Color || n2Color === c1)) {
          combinations.push([c2, c1, resultColor]);
        }
      }
      // Allow same-color pairs, limited to 3 for Easy
      if (
        combinations.length === 0 ||
        (difficulty === "Easy" && sameColorCount >= 3)
      ) {
        return combinations;
      }
      for (const c of COLORS) {
        if ((!n1Color || n1Color === c) && (!n2Color || n2Color === c)) {
          combinations.push([c, c, c]);
        }
      }
    } else {
      // Handle 3-neighbor cells for difficult level
      const [n1Color, n2Color, n3Color] = neighborColors;

      // Check for 3-color mixing rules (white, black, gold, silver, bronze)
      for (const [resultColor, rule] of Object.entries(COLOR_MIXING_RULES)) {
        if (!COLORS.includes(resultColor) || rule.length !== 3) continue;
        const [c1, c2, c3] = rule;
        if (
          (!n1Color || n1Color === c1) &&
          (!n2Color || n2Color === c2) &&
          (!n3Color || n3Color === c3)
        ) {
          combinations.push([c1, c2, c3, resultColor]);
        }
        // Add permutations
        if (
          (!n1Color || n1Color === c1) &&
          (!n2Color || n2Color === c3) &&
          (!n3Color || n3Color === c2)
        ) {
          combinations.push([c1, c3, c2, resultColor]);
        }
        if (
          (!n1Color || n1Color === c2) &&
          (!n2Color || n2Color === c1) &&
          (!n3Color || n3Color === c3)
        ) {
          combinations.push([c2, c1, c3, resultColor]);
        }
        if (
          (!n1Color || n1Color === c2) &&
          (!n2Color || n2Color === c3) &&
          (!n3Color || n3Color === c1)
        ) {
          combinations.push([c2, c3, c1, resultColor]);
        }
        if (
          (!n1Color || n1Color === c3) &&
          (!n2Color || n2Color === c1) &&
          (!n3Color || n3Color === c2)
        ) {
          combinations.push([c3, c1, c2, resultColor]);
        }
        if (
          (!n1Color || n1Color === c3) &&
          (!n2Color || n2Color === c2) &&
          (!n3Color || n3Color === c1)
        ) {
          combinations.push([c3, c2, c1, resultColor]);
        }
      }

      // Allow same-color combinations
      for (const c of COLORS) {
        if (
          (!n1Color || n1Color === c) &&
          (!n2Color || n2Color === c) &&
          (!n3Color || n3Color === c)
        ) {
          combinations.push([c, c, c, c]);
        }
      }
    }

    return combinations;
  };

  // Greedy assignment with backtracking
  const assignColors = () => {
    const influencerColors = new Map();
    sameColorCount = 0;
    const MAX_SAME_COLOR = 3;
    const assignmentStack = [];
    const triedPairs = new Map();

    influencedCells.sort((a, b) => {
      const [rowA, colA] = a;
      const [rowB, colB] = b;
      const isEdgeA =
        rowA === 0 ||
        rowA === GRID_SIZE - 1 ||
        colA === 0 ||
        colA === GRID_SIZE - 1
          ? 1
          : 0;
      const isEdgeB =
        rowB === 0 ||
        rowB === GRID_SIZE - 1 ||
        colB === 0 ||
        colB === GRID_SIZE - 1
          ? 1
          : 0;
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
      const isThreeNeighbor = board[row][col].isThreeNeighbor;
      const cellKey = `${row},${col}`;
      if (!triedPairs.has(cellKey)) triedPairs.set(cellKey, new Set());

      const currentNeighborColors = neighbors.map((n) =>
        influencerColors.get(`${n.row},${n.col}`)
      );
      const validCombinations = getValidColorCombinations(
        currentNeighborColors,
        isThreeNeighbor
      ).filter(
        (combo) => !triedPairs.get(cellKey).has(combo.slice(0, -1).join(","))
      );

      if (validCombinations.length === 0) {
        triedPairs.get(cellKey).clear();
        if (assignmentStack.length === 0) return false;
        const lastAssignment = assignmentStack.pop();
        index = lastAssignment.index;
        // Clear all neighbor colors
        lastAssignment.neighbors.forEach((n) => {
          influencerColors.delete(`${n.row},${n.col}`);
          board[n.row][n.col].color = null;
        });
        board[lastAssignment.row][lastAssignment.col].color = null;
        if (lastAssignment.wasSameColor) sameColorCount--;
        continue;
      }

      let chosenCombination =
        validCombinations[Math.floor(Math.random() * validCombinations.length)];
      const diffColorCombinations = validCombinations.filter((combo) => {
        const colors = combo.slice(0, -1);
        return colors.length === new Set(colors).size; // All colors different
      });
      if (diffColorCombinations.length > 0 && sameColorCount < MAX_SAME_COLOR) {
        chosenCombination =
          diffColorCombinations[
            Math.floor(Math.random() * diffColorCombinations.length)
          ];
      }

      const resultColor = chosenCombination[chosenCombination.length - 1];
      const neighborColors = chosenCombination.slice(0, -1);
      triedPairs.get(cellKey).add(neighborColors.join(","));

      // Check if any neighbor already has a conflicting color
      let hasConflict = false;
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        const expectedColor = neighborColors[i];
        if (
          influencerColors.has(neighborKey) &&
          influencerColors.get(neighborKey) !== expectedColor
        ) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) {
        triedPairs.get(cellKey).clear();
        if (assignmentStack.length === 0) return false;
        const lastAssignment = assignmentStack.pop();
        index = lastAssignment.index;
        // Clear all neighbor colors
        lastAssignment.neighbors.forEach((n) => {
          influencerColors.delete(`${n.row},${n.col}`);
          board[n.row][n.col].color = null;
        });
        board[lastAssignment.row][lastAssignment.col].color = null;
        if (lastAssignment.wasSameColor) sameColorCount--;
        continue;
      }

      // Assign colors to all neighbors
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        const color = neighborColors[i];
        influencerColors.set(neighborKey, color);
        board[neighbor.row][neighbor.col].color = color;
      }

      board[row][col].color = resultColor;
      const isSameColor = new Set(neighborColors).size === 1;
      if (isSameColor) sameColorCount++;

      assignmentStack.push({
        index,
        row,
        col,
        neighbors,
        wasSameColor: isSameColor,
      });

      if (!checkCell(board, row, col, COLORS)) {
        return false;
      }

      index++;
    }

    return validateBoard(board, COLORS);
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
  console.log(
    "This might be due to complex 3-color rules. Trying with simplified rules..."
  );
  return null;
};

// Check if a puzzle is solvable logically
const canSolvePuzzle = (puzzleBoard, solutionBoard, colors) => {
  const board = JSON.parse(JSON.stringify(puzzleBoard));
  let deductionsMade;
  let unsolvedCells = [];

  // Identify unsolved cells
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isClue &&
        !board[row][col].isHole
      ) {
        unsolvedCells.push([row, col]);
      }
    }
  }

  let unsolvedCount = unsolvedCells.length;
  do {
    deductionsMade = false;
    // Deduce influenced cells
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
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
        const expectedNeighbors = board[row][col].isThreeNeighbor ? 3 : 2;
        if (neighborColors.length === expectedNeighbors) {
          const deducedColor = getInfluencedColor(neighborColors, colors);
          if (deducedColor) {
            board[row][col].color = deducedColor;
            deductionsMade = true;
            unsolvedCount--;
          }
        }
      }
    }
    // Deduce influencer colors
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
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
              r < board.length &&
              c >= 0 &&
              c < board[0].length &&
              board[r][c].isActive &&
              !board[r][c].isInfluencer &&
              !board[r][c].isHole
          );
        for (const [r, c] of influencedNeighbors) {
          if (!board[r][c].color) continue;
          const neighbors = getNeighbors(board, r, c);
          const otherNeighbors = neighbors.filter(
            (n) => n.row !== row || n.col !== col
          );
          if (otherNeighbors.length === 0) continue;

          const expectedColor = board[r][c].color;
          const otherColors = otherNeighbors
            .map((n) => n.color)
            .filter(Boolean);

          if (otherColors.length === 0) continue;

          let deducedColor = null;

          if (board[r][c].isThreeNeighbor) {
            // Handle 3-neighbor deduction
            if (otherColors.length === 2) {
              const allColors = [expectedColor, ...otherColors].sort();
              for (const [resultColor, rule] of Object.entries(
                COLOR_MIXING_RULES
              )) {
                if (!colors.includes(resultColor) || rule.length !== 3)
                  continue;
                const sortedRule = [...rule].sort();
                if (
                  allColors.length === sortedRule.length &&
                  allColors.every((c, idx) => c === sortedRule[idx])
                ) {
                  // Find the missing color
                  const missingColor = rule.find((c) => !allColors.includes(c));
                  if (missingColor && colors.includes(missingColor)) {
                    deducedColor = missingColor;
                    break;
                  }
                }
              }
            }
          } else {
            // Handle 2-neighbor deduction (original logic)
            const otherColor = otherColors[0];
            if (otherColor === expectedColor) {
              deducedColor = expectedColor;
            } else {
              for (const [resultColor, [c1, c2]] of Object.entries(
                COLOR_MIXING_RULES
              )) {
                if (!colors.includes(resultColor)) continue;
                if (resultColor === expectedColor) {
                  if (
                    (c1 === otherColor && colors.includes(c2)) ||
                    (c2 === otherColor && colors.includes(c1))
                  ) {
                    deducedColor = c1 === otherColor ? c2 : c1;
                  }
                }
              }
            }
          }

          if (deducedColor) {
            board[row][col].color = deducedColor;
            deductionsMade = true;
            unsolvedCount--;
          }
        }
      }
    }
  } while (deductionsMade && unsolvedCount > 0);

  // Ensure all cells are solved and match the solution
  if (unsolvedCount > 0) {
    console.log(`Puzzle not fully solvable, ${unsolvedCount} cells remain`);
    return false;
  }

  // Verify the solved board matches the solution
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isHole &&
        board[row][col].color !== solutionBoard[row][col].color
      ) {
        console.log(
          `Mismatch at [${row},${col}]: got ${board[row][col].color}, expected ${solutionBoard[row][col].color}`
        );
        return false;
      }
    }
  }

  return true;
};

// Create a puzzle with clues
const createPuzzle = (solutionBoard, difficulty = "Medium") => {
  const { GRID_SIZE, COLORS, CLUE_COUNT } = DIFFICULTY_CONFIG[difficulty];
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

  const MAX_CLUE_ATTEMPTS = 200; // Increased for better chance of solvable puzzle
  for (let attempt = 0; attempt < MAX_CLUE_ATTEMPTS; attempt++) {
    const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));

    // Clue distribution: 70% influenced, 30% influencer
    const clueCandidates = [
      ...shuffleArray([...influencedCells]).slice(
        0,
        Math.ceil(CLUE_COUNT * 0.7)
      ),
      ...shuffleArray([...influencerCells]).slice(
        0,
        Math.floor(CLUE_COUNT * 0.3)
      ),
    ];
    const clues = clueCandidates.slice(0, CLUE_COUNT);

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

    if (canSolvePuzzle(puzzleBoard, solutionBoard, COLORS)) {
      console.log(`Solvable puzzle generated with ${CLUE_COUNT} clues`);
      return { puzzleBoard, solutionBoard };
    }
  }

  console.log(
    `Failed to generate a solvable puzzle with ${CLUE_COUNT} clues, falling back to minimal puzzle`
  );
  const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));
  const clues = shuffleArray([...nonHoleCells]).slice(0, CLUE_COUNT);

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
  DIFFICULTY_CONFIG,
  deduceColors,
};
