import { v4 as uuidv4 } from "uuid";

export const DIFFICULTY_CONFIG_DIFFICULT = {
  GRID_SIZE: 9,
  CLUE_COUNT: 25,
  MAX_CLUES: 35,
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
    "silver",
    "gold",
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

// Define primary colors explicitly
const PRIMARY_COLORS = ["red", "green", "blue", "cyan", "magenta", "yellow"];

const COLOR_MIXING_RULES_DIFFICULT = {
  magenta: ["red", "blue"],
  cyan: ["green", "blue"],
  yellow: ["red", "green"],
  orange: ["red", "yellow"],
  purple: ["blue", "magenta"],
  teal: ["green", "cyan"],
  red: ["magenta", "yellow"],
  green: ["cyan", "yellow"],
  blue: ["cyan", "magenta"],
  white: ["red", "green", "blue"],
  black: ["cyan", "magenta", "yellow"],
  silver: ["cyan", "magenta", "blue"],
  gold: ["red", "yellow", "magenta"],
};

const VALID_INFLUENCER_COMBINATIONS = [
  ["red", "blue"],
  ["green", "blue"],
  ["red", "green"],
  ["red", "yellow"],
  ["blue", "magenta"],
  ["green", "cyan"],
  ["magenta", "yellow"],
  ["cyan", "yellow"],
  ["cyan", "magenta"],
  ["cyan", "magenta", "blue"], // For silver
  ["red", "yellow", "magenta"], // For gold
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

function getInfluencedColorDifficult(neighborColors, colors, isThree = false) {
  const expectedCount = isThree ? 3 : 2;

  if (neighborColors.length !== expectedCount) {
    return null;
  }

  const sorted = [...neighborColors].sort();

  for (const [result, mix] of Object.entries(COLOR_MIXING_RULES_DIFFICULT)) {
    if (colors.includes(result) && mix.length === sorted.length) {
      const sortedMix = [...mix].sort();
      if (sorted.every((c, i) => c === sortedMix[i])) {
        return result;
      }
    }
  }

  if (new Set(sorted).size === 1 && colors.includes(sorted[0])) {
    return sorted[0];
  }

  const availableColors = colors.filter((c) => !neighborColors.includes(c));
  return availableColors.length > 0 ? availableColors[0] : null;
}

function deduceColorsDifficult(board, colors) {
  let changed = true;
  let iterations = 0;

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

function deduceInfluencerColor(targetColor, otherColors, isThree, colors) {
  const expectedCount = isThree ? 3 : 2;

  if (otherColors.length !== expectedCount - 1) return null;

  for (const testColor of PRIMARY_COLORS) {
    // Restrict to primary colors
    const allColors = [...otherColors, testColor].sort();
    const result = getInfluencedColorDifficult(allColors, colors, isThree);
    if (result === targetColor) {
      return testColor;
    }
  }

  return null;
}

function solvePuzzleLogically(puzzleBoard, solutionBoard, colors) {
  const board = JSON.parse(JSON.stringify(puzzleBoard));
  const deducedBoard = deduceColorsDifficult(board, colors);

  let undeducibleCells = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = deducedBoard[r][c];
      const solutionCell = solutionBoard[r][c];
      if (cell.isActive && !cell.isHole) {
        if (!cell.color || cell.color !== solutionCell.color) {
          undeducibleCells.push([r, c]);
        }
      }
    }
  }

  return {
    isFullyDeducible: undeducibleCells.length === 0,
    undeducibleCells,
    deducedBoard,
  };
}

function hasUniqueSolution(puzzleBoard, solutionBoard, colors) {
  const board = JSON.parse(JSON.stringify(puzzleBoard));
  let alternativeSolutions = 0;
  const MAX_CHECKS = 1000;

  function tryColorCombinations(row, col, currentBoard, checks) {
    if (alternativeSolutions > 1 || checks >= MAX_CHECKS) return checks;

    if (row >= currentBoard.length) {
      if (validateSolutionRelaxed(currentBoard, colors)) {
        let differs = false;
        for (let r = 0; r < currentBoard.length; r++) {
          for (let c = 0; c < currentBoard[0].length; c++) {
            if (
              currentBoard[r][c].isActive &&
              !currentBoard[r][c].isHole &&
              currentBoard[r][c].color !== solutionBoard[r][c].color
            ) {
              differs = true;
              break;
            }
          }
          if (differs) break;
        }
        if (differs) alternativeSolutions++;
        return checks;
      }
      return checks;
    }

    let nextRow = row;
    let nextCol = col + 1;
    if (nextCol >= currentBoard[0].length) {
      nextRow++;
      nextCol = 0;
    }

    if (
      currentBoard[row][col].isActive &&
      !currentBoard[row][col].isHole &&
      !currentBoard[row][col].isClue
    ) {
      for (const color of colors) {
        currentBoard[row][col].color = color;
        let valid = true;
        if (currentBoard[row][col].isInfluencer) {
          const influenced = getInfluencedNeighbors(currentBoard, row, col);
          for (const neighbor of influenced) {
            const neighborCell = currentBoard[neighbor.row][neighbor.col];
            if (neighborCell.color) {
              const neighbors = getNeighborsDifficult(
                currentBoard,
                neighbor.row,
                neighbor.col
              );
              const neighborColors = neighbors
                .filter((n) => n.color)
                .map((n) => n.color);
              const expected = neighborCell.isThreeNeighbor ? 3 : 2;
              if (
                neighborColors.length === expected &&
                getInfluencedColorDifficult(
                  neighborColors,
                  colors,
                  neighborCell.isThreeNeighbor
                ) !== neighborCell.color
              ) {
                valid = false;
                break;
              }
            }
          }
        } else {
          const neighbors = getNeighborsDifficult(currentBoard, row, col);
          const neighborColors = neighbors
            .filter((n) => n.color)
            .map((n) => n.color);
          const expected = currentBoard[row][col].isThreeNeighbor ? 3 : 2;
          if (
            neighborColors.length === expected &&
            getInfluencedColorDifficult(
              neighborColors,
              colors,
              currentBoard[row][col].isThreeNeighbor
            ) !== color
          ) {
            valid = false;
          }
        }
        if (valid) {
          checks = tryColorCombinations(
            nextRow,
            nextCol,
            JSON.parse(JSON.stringify(currentBoard)),
            checks + 1
          );
          if (checks >= MAX_CHECKS || alternativeSolutions > 1) return checks;
        }
      }
      currentBoard[row][col].color = null;
    } else {
      checks = tryColorCombinations(nextRow, nextCol, currentBoard, checks + 1);
    }
    return checks;
  }

  tryColorCombinations(0, 0, JSON.parse(JSON.stringify(board)), 0);
  return alternativeSolutions <= 1;
}

export function generateSolutionDifficult() {
  const { COLORS, THREE_NEIGHBOR_CELLS, GRID_SIZE } =
    DIFFICULTY_CONFIG_DIFFICULT;

  const MAX_ATTEMPTS = 30;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const board = createBoardDifficult();

    if (assignThreeNeighborColors(board, THREE_NEIGHBOR_CELLS, COLORS)) {
      // Validate that no influencers have secondary colors
      let isValid = true;
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[0].length; col++) {
          if (board[row][col].isInfluencer && board[row][col].color) {
            if (!PRIMARY_COLORS.includes(board[row][col].color)) {
              isValid = false;
              break;
            }
          }
        }
        if (!isValid) break;
      }
      if (isValid) {
        console.log(`Solution found on attempt ${attempt + 1}`);
        return board;
      }
    }

    console.log(`Attempt ${attempt + 1} failed, retrying...`);
  }

  console.log("Failed to generate solution after all attempts");
  return null;
}

function assignThreeNeighborColors(board, threeNeighborCells, allColors) {
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

  for (const [row, col] of threeNeighborCells) {
    const cell = board[row][col];
    if (cell.isHole) continue;

    const neighbors = getNeighborsDifficult(board, row, col);
    if (neighbors.length !== 3) {
      console.log(
        `3-neighbor cell [${row},${col}] has ${neighbors.length} neighbors, expected 3`
      );
      return false;
    }

    const assignedNeighbors = neighbors.filter(
      (n) => board[n.row][n.col].color
    );
    if (assignedNeighbors.length > 0) {
      const existingColors = assignedNeighbors.map(
        (n) => board[n.row][n.col].color
      );

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
        return false;
      }

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
      const random = Math.random();
      let targetColor;
      if (random < 0.35) {
        targetColor = "white";
      } else if (random < 0.7) {
        targetColor = "black";
      } else if (random < 0.9) {
        targetColor = "silver";
      } else {
        targetColor = "gold";
      }
      const requiredColors = COLOR_MIXING_RULES_DIFFICULT[targetColor];

      for (let i = 0; i < 3; i++) {
        const neighborRow = neighbors[i].row;
        const neighborCol = neighbors[i].col;
        board[neighborRow][neighborCol].color = requiredColors[i];
      }

      cell.color = targetColor;
    }
  }

  const basicColors = PRIMARY_COLORS; // Use only primary colors for influencers
  for (const [row, col] of influencers) {
    if (!board[row][col].color) {
      const influencedNeighbors = getInfluencedNeighbors(board, row, col);
      const validColors = [];

      for (const color of basicColors) {
        let isValid = true;

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

      if (validColors.length > 0) {
        board[row][col].color =
          validColors[Math.floor(Math.random() * validColors.length)];
      } else {
        board[row][col].color =
          basicColors[Math.floor(Math.random() * basicColors.length)];
      }
    }
  }

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
      cell.color = allColors[Math.floor(Math.random() * allColors.length)];
    }
  }

  const improvedBoard = deduceColorsDifficult(
    JSON.parse(JSON.stringify(board)),
    allColors
  );

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
          if (!neighborColors.includes(cell.color)) {
            validCells++;
          }
        }
      }
    }
  }

  const validityRatio = totalCells > 0 ? validCells / totalCells : 0;
  console.log(
    `Solution validity: ${validCells}/${totalCells} (${(
      validityRatio * 100
    ).toFixed(1)}%)`
  );

  return validityRatio >= 0.7;
}

export function createPuzzleDifficult(solutionBoard) {
  if (!solutionBoard) {
    console.error("No solution board provided");
    return null;
  }

  const { GRID_SIZE, CLUE_COUNT, MAX_CLUES, COLORS } =
    DIFFICULTY_CONFIG_DIFFICULT;
  const MAX_ATTEMPTS = 20;
  let bestPuzzle = null;
  let bestUndeducibleCount = Infinity;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));
    let clues = [];

    const coloredCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = puzzleBoard[r][c];
        if (!cell.isHole && solutionBoard[r][c].color) {
          coloredCells.push([r, c]);
        }
      }
    }

    for (const [r, c] of DIFFICULTY_CONFIG_DIFFICULT.THREE_NEIGHBOR_CELLS) {
      if (solutionBoard[r][c].color) {
        clues.push([r, c]);
      }
    }

    const influencers = coloredCells
      .filter(
        ([r, c]) =>
          puzzleBoard[r][c].isInfluencer && !puzzleBoard[r][c].isThreeNeighbor
      )
      .map(([r, c]) => {
        const influenceCount = getInfluencedNeighbors(puzzleBoard, r, c).length;
        let minHoleDistance = Infinity;
        for (const [hr, hc] of DIFFICULTY_CONFIG_DIFFICULT.FIXED_HOLES) {
          const distance = Math.abs(r - hr) + Math.abs(c - hc);
          minHoleDistance = Math.min(minHoleDistance, distance);
        }
        return { pos: [r, c], influenceCount, minHoleDistance };
      })
      .sort((a, b) => {
        if (a.influenceCount !== b.influenceCount) {
          return b.influenceCount - a.influenceCount;
        }
        return a.minHoleDistance - b.minHoleDistance;
      });
    // Reduce the number of influencer clues to make puzzles more challenging
    clues.push(...influencers.slice(0, 8).map((i) => i.pos));

    const deduced = coloredCells.filter(
      ([r, c]) =>
        !puzzleBoard[r][c].isInfluencer && !puzzleBoard[r][c].isThreeNeighbor
    );
    clues.push(
      ...deduced
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(CLUE_COUNT - clues.length, deduced.length))
    );

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (clues.some(([cr, cc]) => cr === r && cc === c)) {
          puzzleBoard[r][c].isClue = true;
          puzzleBoard[r][c].color = solutionBoard[r][c].color;
        } else {
          puzzleBoard[r][c].color = null;
        }
      }
    }

    let innerAttempt = 0;
    const INNER_MAX_ATTEMPTS = 10;
    while (innerAttempt++ < INNER_MAX_ATTEMPTS && clues.length <= MAX_CLUES) {
      const { isFullyDeducible, undeducibleCells } = solvePuzzleLogically(
        puzzleBoard,
        solutionBoard,
        COLORS
      );

      if (isFullyDeducible) {
        if (hasUniqueSolution(puzzleBoard, solutionBoard, COLORS)) {
          console.log(
            `Puzzle generated with ${clues.length} clues on attempt ${
              attempt + 1
            }`
          );
          return { puzzleBoard, solutionBoard };
        }
      }

      if (undeducibleCells.length < bestUndeducibleCount) {
        bestUndeducibleCount = undeducibleCells.length;
        bestPuzzle = {
          puzzleBoard: JSON.parse(JSON.stringify(puzzleBoard)),
          solutionBoard,
        };
      }

      if (clues.length >= MAX_CLUES) break;

      const undeducibleInfluencers = undeducibleCells.filter(
        ([r, c]) => puzzleBoard[r][c].isInfluencer
      );
      const cellToAdd =
        undeducibleInfluencers.length > 0
          ? undeducibleInfluencers[0]
          : undeducibleCells[0];
      if (
        cellToAdd &&
        !clues.some(([cr, cc]) => cr === cellToAdd[0] && cc === cellToAdd[1])
      ) {
        clues.push(cellToAdd);
        puzzleBoard[cellToAdd[0]][cellToAdd[1]].isClue = true;
        puzzleBoard[cellToAdd[0]][cellToAdd[1]].color =
          solutionBoard[cellToAdd[0]][cellToAdd[1]].color;
      }
    }

    console.log(
      `Attempt ${attempt + 1} failed with ${
        clues.length
      } clues, undeducible cells: ${undeducibleCells.length}`
    );
  }

  if (bestPuzzle) {
    console.warn(
      `Could not create fully deducible puzzle after ${MAX_ATTEMPTS} attempts. ` +
        `Returning best puzzle with ${bestUndeducibleCount} undeducible cells.`
    );
    return bestPuzzle;
  }

  console.error("Failed to generate any valid puzzle");
  return null;
}
