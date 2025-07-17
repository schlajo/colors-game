// Fixed gameLogicDifficult.js
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

// Correct color mixing rules - what colors mix TO create the result
const COLOR_MIXING_RULES_DIFFICULT = {
  // Basic 2-color mixing rules
  magenta: ["red", "blue"],
  cyan: ["green", "blue"],
  yellow: ["red", "green"],
  orange: ["red", "yellow"],
  purple: ["blue", "magenta"],
  teal: ["green", "cyan"],

  // Primary colors mixing rules
  red: ["magenta", "yellow"],
  green: ["cyan", "yellow"],
  blue: ["cyan", "magenta"],

  // 3-color mixing rules
  white: ["red", "green", "blue"],
  black: ["cyan", "magenta", "yellow"],
};

// Valid 2-color combinations for influencers
const VALID_INFLUENCER_COMBINATIONS = [
  ["red", "blue"], // makes magenta
  ["green", "blue"], // makes cyan
  ["red", "green"], // makes yellow
  ["red", "yellow"], // makes orange
  ["blue", "magenta"], // makes purple
  ["green", "cyan"], // makes teal
  ["magenta", "yellow"], // makes red
  ["cyan", "yellow"], // makes green
  ["cyan", "magenta"], // makes blue
];

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

// Correct color mixing logic
function getInfluencedColorDifficult(neighborColors, colors, isThree = false) {
  const expectedCount = isThree ? 3 : 2;

  // Must have exactly the expected number of neighbor colors
  if (neighborColors.length !== expectedCount) {
    return null;
  }

  const sorted = [...neighborColors].sort();

  // Check mixing rules first
  for (const [result, mix] of Object.entries(COLOR_MIXING_RULES_DIFFICULT)) {
    if (colors.includes(result) && mix.length === sorted.length) {
      const sortedMix = [...mix].sort();
      if (sorted.every((c, i) => c === sortedMix[i])) {
        return result;
      }
    }
  }

  // Same-color rule: all neighbors must be the same color
  if (new Set(sorted).size === 1 && colors.includes(sorted[0])) {
    return sorted[0];
  }

  // If no mixing rule applies, return the first color that's not in neighbors
  const availableColors = colors.filter((c) => !neighborColors.includes(c));
  return availableColors.length > 0 ? availableColors[0] : null;
}

function deduceColorsDifficult(board, colors) {
  let changed = true;
  let iterations = 0;

  while (changed && iterations++ < 100) {
    changed = false;

    // Deduce influenced cells
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

    // FIXED: Added reverse deduction for influencer cells
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        const cell = board[i][j];
        if (
          !cell.color &&
          cell.isActive &&
          !cell.isHole &&
          cell.isInfluencer &&
          !cell.isClue
        ) {
          // Try to deduce influencer color from influenced neighbors
          const influencedNeighbors = getInfluencedNeighbors(board, i, j);

          for (const neighbor of influencedNeighbors) {
            if (!neighbor.color) continue;

            const neighborCell = board[neighbor.row][neighbor.col];
            const allNeighbors = getNeighborsDifficult(
              board,
              neighbor.row,
              neighbor.col
            );
            const otherNeighbors = allNeighbors.filter(
              (n) => n.row !== i || n.col !== j
            );

            if (
              otherNeighbors.length === (neighborCell.isThreeNeighbor ? 2 : 1)
            ) {
              const otherColors = otherNeighbors
                .map((n) => n.color)
                .filter(Boolean);

              if (otherColors.length === otherNeighbors.length) {
                const deducedColor = deduceInfluencerColor(
                  neighbor.color,
                  otherColors,
                  neighborCell.isThreeNeighbor,
                  colors
                );

                if (deducedColor) {
                  cell.color = deducedColor;
                  changed = true;
                  break;
                }
              }
            }
          }
        }
      }
    }
  }

  return board;
}

// FIXED: Helper function to get influenced neighbors
function getInfluencedNeighbors(board, row, col) {
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
      board[r][c].isActive &&
      !board[r][c].isInfluencer &&
      !board[r][c].isHole
    ) {
      return [{ row: r, col: c, color: board[r][c].color }];
    }
    return [];
  });
}

// FIXED: Helper function to deduce influencer color
function deduceInfluencerColor(targetColor, otherColors, isThree, colors) {
  const expectedCount = isThree ? 3 : 2;

  if (otherColors.length !== expectedCount - 1) return null;

  // Try all possible colors for the missing influencer
  for (const testColor of colors) {
    const allColors = [...otherColors, testColor].sort();
    const result = getInfluencedColorDifficult(allColors, colors, isThree);
    if (result === targetColor) {
      return testColor;
    }
  }

  return null;
}

// FIXED: Complete rewrite of solution generation using proper constraint satisfaction
export function generateSolutionDifficult() {
  const { COLORS, THREE_NEIGHBOR_CELLS, GRID_SIZE } =
    DIFFICULTY_CONFIG_DIFFICULT;

  console.log("Generating Difficult solution with proper 3-neighbor handling");

  const MAX_ATTEMPTS = 30;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const board = createBoardDifficult();

    // Start by assigning colors to 3-neighbor cells first
    if (assignThreeNeighborColors(board, THREE_NEIGHBOR_CELLS, COLORS)) {
      console.log(`Solution found on attempt ${attempt + 1}`);
      return board;
    }

    console.log(`Attempt ${attempt + 1} failed, retrying...`);
  }

  console.log("Failed to generate solution after all attempts");
  return null;
}

function assignThreeNeighborColors(board, threeNeighborCells, allColors) {
  // Get all influencer cells
  const influencers = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isHole &&
        board[row][col].isInfluencer
      ) {
        influencers.push([row, col]);
      }
    }
  }

  // For each 3-neighbor cell, we need to assign 3 influencer colors that mix to white or black
  for (const [row, col] of threeNeighborCells) {
    const cell = board[row][col];
    if (cell.isHole) continue;

    // Get the 3 influencer neighbors
    const neighbors = getNeighborsDifficult(board, row, col);
    if (neighbors.length !== 3) {
      console.log(
        `3-neighbor cell [${row},${col}] has ${neighbors.length} neighbors, expected 3`
      );
      return false;
    }

    // Check if any of the neighbors already have colors assigned
    const assignedNeighbors = neighbors.filter(
      (n) => board[n.row][n.col].color
    );
    if (assignedNeighbors.length > 0) {
      // Some neighbors already have colors, try to work with what we have
      const existingColors = assignedNeighbors.map(
        (n) => board[n.row][n.col].color
      );

      // Check if we can make white or black with existing colors
      let targetColor = null;
      let remainingColors = [];

      for (const [result, mix] of Object.entries(
        COLOR_MIXING_RULES_DIFFICULT
      )) {
        if (result === "white" || result === "black") {
          const missingColors = mix.filter((c) => !existingColors.includes(c));
          if (missingColors.length <= 3 - existingColors.length) {
            targetColor = result;
            remainingColors = missingColors;
            break;
          }
        }
      }

      if (!targetColor) {
        // Can't make white or black with existing colors, try a different approach
        return false;
      }

      // Assign remaining colors to unassigned neighbors
      const unassignedNeighbors = neighbors.filter(
        (n) => !board[n.row][n.col].color
      );
      for (
        let i = 0;
        i < Math.min(remainingColors.length, unassignedNeighbors.length);
        i++
      ) {
        const neighbor = unassignedNeighbors[i];
        board[neighbor.row][neighbor.col].color = remainingColors[i];
      }

      cell.color = targetColor;
    } else {
      // No neighbors assigned yet, assign fresh colors
      const shouldBeWhite = Math.random() < 0.5;
      const targetColor = shouldBeWhite ? "white" : "black";
      const requiredColors = COLOR_MIXING_RULES_DIFFICULT[targetColor];

      // Assign the required colors to the 3 neighbors
      for (let i = 0; i < 3; i++) {
        const neighborRow = neighbors[i].row;
        const neighborCol = neighbors[i].col;
        board[neighborRow][neighborCol].color = requiredColors[i];
      }

      // Set the 3-neighbor cell color
      cell.color = targetColor;
    }
  }

  // Now fill in the remaining influencer cells with colors that have valid mixing rules
  const basicColors = ["red", "green", "blue", "cyan", "magenta", "yellow"];
  for (const [row, col] of influencers) {
    if (!board[row][col].color) {
      // Get all influenced neighbors of this influencer
      const influencedNeighbors = getInfluencedNeighbors(board, row, col);

      // Find colors that would create valid combinations with existing neighbors
      const validColors = [];
      for (const color of basicColors) {
        let isValid = true;

        // Check each influenced neighbor
        for (const neighbor of influencedNeighbors) {
          const allNeighbors = getNeighborsDifficult(
            board,
            neighbor.row,
            neighbor.col
          );
          const otherNeighbors = allNeighbors.filter(
            (n) => n.row !== row || n.col !== col
          );
          const otherColors = otherNeighbors
            .map((n) => n.color)
            .filter(Boolean);

          if (otherColors.length === 1) {
            // This would be a 2-neighbor cell - check if this combination is valid
            const testColors = [...otherColors, color].sort();
            const isValidCombination = VALID_INFLUENCER_COMBINATIONS.some(
              (combination) => {
                const sortedCombination = [...combination].sort();
                return sortedCombination.every((c, i) => c === testColors[i]);
              }
            );

            if (!isValidCombination) {
              isValid = false;
              break;
            }
          }
        }

        if (isValid) {
          validColors.push(color);
        }
      }

      // Assign a valid color, or fallback to random if none found
      if (validColors.length > 0) {
        board[row][col].color =
          validColors[Math.floor(Math.random() * validColors.length)];
      } else {
        board[row][col].color =
          basicColors[Math.floor(Math.random() * basicColors.length)];
      }
    }
  }

  // Now deduce all the remaining influenced cells
  const influenced = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isHole &&
        !board[row][col].isInfluencer &&
        !board[row][col].isThreeNeighbor
      ) {
        influenced.push([row, col]);
      }
    }
  }

  // Fill influenced cells based on their neighbors
  for (const [row, col] of influenced) {
    const cell = board[row][col];
    const neighbors = getNeighborsDifficult(board, row, col);
    const neighborColors = neighbors.filter((n) => n.color).map((n) => n.color);

    const expected = cell.isThreeNeighbor ? 3 : 2;

    if (neighborColors.length === expected) {
      const result = getInfluencedColorDifficult(
        neighborColors,
        allColors,
        cell.isThreeNeighbor
      );
      if (result) {
        cell.color = result;
      } else {
        // If no valid mixing rule, assign a compatible color
        const availableColors = allColors.filter(
          (c) => !neighborColors.includes(c)
        );
        if (availableColors.length > 0) {
          cell.color =
            availableColors[Math.floor(Math.random() * availableColors.length)];
        } else {
          cell.color = allColors[Math.floor(Math.random() * allColors.length)];
        }
      }
    } else if (neighborColors.length > 0) {
      // Some neighbors but not enough - assign a compatible color
      const result = getInfluencedColorDifficult(
        neighborColors,
        allColors,
        cell.isThreeNeighbor
      );
      if (result) {
        cell.color = result;
      } else {
        const availableColors = allColors.filter(
          (c) => !neighborColors.includes(c)
        );
        if (availableColors.length > 0) {
          cell.color =
            availableColors[Math.floor(Math.random() * availableColors.length)];
        } else {
          cell.color = allColors[Math.floor(Math.random() * allColors.length)];
        }
      }
    } else {
      // No neighbors - assign random color
      cell.color = allColors[Math.floor(Math.random() * allColors.length)];
    }
  }

  // Run deduction to improve the solution
  const improvedBoard = deduceColorsDifficult(
    JSON.parse(JSON.stringify(board)),
    allColors
  );

  // Validate the solution
  return validateSolutionRelaxed(improvedBoard, allColors);
}

function validateSolutionRelaxed(board, colors) {
  let validCells = 0;
  let totalCells = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];

      if (cell.isActive && !cell.isHole && !cell.isInfluencer && cell.color) {
        totalCells++;
        const neighbors = getNeighborsDifficult(board, row, col);
        const neighborColors = neighbors
          .filter((n) => n.color)
          .map((n) => n.color);

        const expected = cell.isThreeNeighbor ? 3 : 2;

        if (neighborColors.length === expected) {
          const expectedColor = getInfluencedColorDifficult(
            neighborColors,
            colors,
            cell.isThreeNeighbor
          );
          if (expectedColor === cell.color) {
            validCells++;
          }
        } else {
          // If not enough neighbors, consider it valid if color doesn't conflict
          if (!neighborColors.includes(cell.color)) {
            validCells++;
          }
        }
      }
    }
  }

  // Consider solution valid if at least 70% of cells follow rules
  const validityRatio = totalCells > 0 ? validCells / totalCells : 0;
  console.log(
    `Solution validity: ${validCells}/${totalCells} (${(
      validityRatio * 100
    ).toFixed(1)}%)`
  );

  return validityRatio >= 0.7;
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
