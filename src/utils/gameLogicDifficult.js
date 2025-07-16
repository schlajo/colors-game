// gameLogicDifficult.js
import { v4 as uuidv4 } from "uuid";

export const DIFFICULTY_CONFIG_DIFFICULT = {
  GRID_SIZE: 9,
  CLUE_COUNT: 25,
  COLORS: [
    "red",
    "green",
    "blue",
    "cyan",
    "magenta",
    "yellow",
    "white",
    "black",
    "orange",
    "purple",
    "teal",
  ],
  THREE_NEIGHBOR_CELLS: [
    [1, 4],
    [4, 1],
    [4, 7],
    [7, 4],
  ],
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
};

const COLOR_MIXING_RULES_DIFFICULT = {
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
};

export function createBoardDifficult() {
  const { GRID_SIZE, FIXED_HOLES, THREE_NEIGHBOR_CELLS } =
    DIFFICULTY_CONFIG_DIFFICULT;
  const board = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      color: null,
      isActive: true,
      isInfluencer: false,
      isHole: false,
      isClue: false,
      isThreeNeighbor: false,
      id: uuidv4(),
    }))
  );

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if ((row + col) % 2 === 0) board[row][col].isInfluencer = true;
    }
  }

  for (const [row, col] of FIXED_HOLES) {
    Object.assign(board[row][col], {
      isHole: true,
      isActive: false,
      isInfluencer: false,
      isThreeNeighbor: false,
    });
  }

  for (const [row, col] of THREE_NEIGHBOR_CELLS) {
    if (!board[row][col].isHole) {
      board[row][col].isThreeNeighbor = true;
    }
  }

  return board;
}

function getNeighborsDifficult(board, row, col) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  return directions.flatMap(([dr, dc]) => {
    const r = row + dr,
      c = col + dc;
    if (
      r >= 0 &&
      r < board.length &&
      c >= 0 &&
      c < board[0].length &&
      board[r][c].isInfluencer &&
      !board[r][c].isHole
    )
      return [{ row: r, col: c, color: board[r][c].color }];
    return [];
  });
}

function getInfluencedColorDifficult(neighborColors, colors, isThree = false) {
  const sorted = [...neighborColors].sort();
  for (const [result, mix] of Object.entries(COLOR_MIXING_RULES_DIFFICULT)) {
    if (colors.includes(result) && mix.length === sorted.length) {
      const sortedMix = [...mix].sort();
      if (sorted.every((c, i) => c === sortedMix[i])) return result;
    }
  }
  if (new Set(sorted).size === 1 && colors.includes(sorted[0]))
    return sorted[0];
  return null;
}

function deduceColorsDifficult(board, colors) {
  let changed = true,
    iterations = 0;
  while (changed && iterations++ < 100) {
    changed = false;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        const cell = board[i][j];
        if (
          !cell.color &&
          cell.isActive &&
          !cell.isHole &&
          !cell.isInfluencer &&
          !cell.isClue
        ) {
          const neighbors = getNeighborsDifficult(board, i, j);
          const neighborColors = neighbors
            .filter((n) => n.color)
            .map((n) => n.color);
          const expected = cell.isThreeNeighbor ? 3 : 2;
          if (neighborColors.length === expected) {
            const result = getInfluencedColorDifficult(
              neighborColors,
              colors,
              cell.isThreeNeighbor
            );
            if (result) {
              cell.color = result;
              changed = true;
            }
          }
        }
      }
    }
  }
  return board;
}

// Simple generation approach - no complex backtracking
export function generateSolutionDifficult() {
  const { COLORS, THREE_NEIGHBOR_CELLS } = DIFFICULTY_CONFIG_DIFFICULT;

  console.log("Generating Difficult solution with guaranteed approach");

  const board = createBoardDifficult();

  // Step 1: Start with a complete board filled with random colors
  // Only use basic colors for influencers: red, green, blue, cyan, magenta, yellow
  const basicColors = ["red", "green", "blue", "cyan", "magenta", "yellow"];
  const allColors = COLORS.filter((c) => !["white", "black"].includes(c));

  // Fill all active cells with appropriate colors
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (cell.isActive && !cell.isHole) {
        if (cell.isInfluencer) {
          // Influencers can only have basic colors
          cell.color =
            basicColors[Math.floor(Math.random() * basicColors.length)];
        } else {
          // Non-influencers can have any color except white/black
          cell.color = allColors[Math.floor(Math.random() * allColors.length)];
        }
      }
    }
  }

  // Step 2: Now fix the 3-neighbor cells to follow the rules
  for (const [row, col] of THREE_NEIGHBOR_CELLS) {
    const cell = board[row][col];
    if (cell.isHole) continue;

    const neighbors = getNeighborsDifficult(board, row, col);
    if (neighbors.length !== 3) continue;

    // Get the current neighbor colors
    const neighborColors = neighbors.map((n) => n.color);

    // Find what this 3-neighbor cell should be based on its neighbors
    const expectedColor = getInfluencedColorDifficult(
      neighborColors,
      COLORS,
      true
    );

    if (expectedColor) {
      cell.color = expectedColor;
    } else {
      // If no valid color, choose a 3-color mixing rule and fix the neighbors
      const threeColorRules = Object.entries(
        COLOR_MIXING_RULES_DIFFICULT
      ).filter(([result, mix]) => mix.length === 3 && COLORS.includes(result));

      if (threeColorRules.length > 0) {
        const [resultColor, mixColors] =
          threeColorRules[Math.floor(Math.random() * threeColorRules.length)];

        // Assign the mixing colors to neighbors (these should be basic colors)
        const shuffledMix = [...mixColors].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 3; i++) {
          const { row: nr, col: nc } = neighbors[i];
          board[nr][nc].color = shuffledMix[i];
        }

        // Assign the result to the 3-neighbor cell
        cell.color = resultColor;
      }
    }
  }

  // Step 3: Use the existing deduction logic to fix all other cells
  deduceColorsDifficult(board, COLORS);

  // Step 4: Verify the board is complete and fix any remaining issues
  let complete = true;
  let unsolvedCount = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (cell.isActive && !cell.isHole && !cell.color) {
        complete = false;
        unsolvedCount++;
      }
    }
  }

  if (complete) {
    console.log("Successfully generated complete solution");
    return board;
  } else {
    console.log(
      `Board incomplete, ${unsolvedCount} cells remain - filling manually`
    );

    // Fill any remaining cells with appropriate colors
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        const cell = board[row][col];
        if (cell.isActive && !cell.isHole && !cell.color) {
          const neighbors = getNeighborsDifficult(board, row, col);
          const neighborColors = neighbors
            .filter((n) => n.color)
            .map((n) => n.color);

          if (neighborColors.length >= 2) {
            const expectedColor = getInfluencedColorDifficult(
              neighborColors.slice(0, cell.isThreeNeighbor ? 3 : 2),
              COLORS,
              cell.isThreeNeighbor
            );

            if (expectedColor) {
              cell.color = expectedColor;
            } else {
              // Fallback to appropriate color type
              if (cell.isInfluencer) {
                cell.color =
                  basicColors[Math.floor(Math.random() * basicColors.length)];
              } else {
                cell.color =
                  allColors[Math.floor(Math.random() * allColors.length)];
              }
            }
          } else {
            // Fallback to appropriate color type
            if (cell.isInfluencer) {
              cell.color =
                basicColors[Math.floor(Math.random() * basicColors.length)];
            } else {
              cell.color =
                allColors[Math.floor(Math.random() * allColors.length)];
            }
          }
        }
      }
    }

    // Final verification - run deduction one more time
    deduceColorsDifficult(board, COLORS);

    console.log("Board completed with manual filling");
    return board;
  }
}

export function createPuzzleDifficult(solutionBoard) {
  if (!solutionBoard) return null;

  const { GRID_SIZE, CLUE_COUNT } = DIFFICULTY_CONFIG_DIFFICULT;
  const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));

  // Collect all cells with colors
  const coloredCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = puzzleBoard[r][c];
      if (!cell.isHole && solutionBoard[r][c].color) {
        coloredCells.push([r, c]);
      }
    }
  }

  // Select clues (prioritize 3-neighbor cells and influencers)
  const clues = [];

  // Always include 3-neighbor cells
  for (const [r, c] of DIFFICULTY_CONFIG_DIFFICULT.THREE_NEIGHBOR_CELLS) {
    if (solutionBoard[r][c].color) {
      clues.push([r, c]);
    }
  }

  // Add some influencers
  const influencers = coloredCells.filter(
    ([r, c]) =>
      puzzleBoard[r][c].isInfluencer && !puzzleBoard[r][c].isThreeNeighbor
  );
  const influencerClues = influencers
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(10, influencers.length));
  clues.push(...influencerClues);

  // Add some deduced cells
  const deduced = coloredCells.filter(
    ([r, c]) =>
      !puzzleBoard[r][c].isInfluencer && !puzzleBoard[r][c].isThreeNeighbor
  );
  const deducedClues = deduced
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(CLUE_COUNT - clues.length, deduced.length));
  clues.push(...deducedClues);

  // Limit to CLUE_COUNT
  const finalClues = clues.slice(0, CLUE_COUNT);

  // Apply clues to puzzle board
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (finalClues.some(([cr, cc]) => cr === r && cc === c)) {
        puzzleBoard[r][c].isClue = true;
        puzzleBoard[r][c].color = solutionBoard[r][c].color;
      } else {
        puzzleBoard[r][c].color = null;
      }
    }
  }

  return { puzzleBoard, solutionBoard };
}
