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
    COLORS: ["cyan", "magenta", "yellow", "red", "green", "blue"],
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
    COLORS: ["cyan", "magenta", "yellow", "red", "green", "blue", "purple", "orange", "silver"],
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
    COLORS: ["cyan", "magenta", "yellow", "red", "green", "blue", "purple", "orange", "silver", "black", "white", "gold"],
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
  silver: ["green", "cyan"],
  purple: ["blue", "magenta"],
  orange: ["red", "yellow"],
  white: ["red", "green", "blue"],
  black: ["cyan", "magenta", "yellow"],
  gold: ["yellow", "orange", "red"],
};

// Create an empty board based on difficulty
const createBoard = (difficulty = "Medium") => {
  const { GRID_SIZE, FIXED_HOLES } = DIFFICULTY_CONFIG[difficulty];
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

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if ((row + col) % 2 === 0) {
        board[row][col].isInfluencer = true;
      }
    }
  }

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
const getInfluencedColor = (neighborColors, colors, isThreeNeighborCell) => {
  if (neighborColors.length !== (isThreeNeighborCell ? 3 : 2)) {
    return null;
  }

  // Same-color rule - all neighbors have the same color
  if (neighborColors.every((c, i, arr) => c === arr[0])) {
    const color = neighborColors[0];
    if (colors.includes(color)) {
      // For 3-neighbor cells, same color only works for black, white, gold
      if (isThreeNeighborCell) {
        return ["black", "white", "gold"].includes(color) ? color : null;
      }
      // For 2-neighbor cells, same color works for all colors except black, white, gold
      return !["black", "white", "gold"].includes(color) ? color : null;
    }
  }

  // Different-color mixing rules
  const sortedNeighbors = [...neighborColors].sort();
  for (const [resultColor, rule] of Object.entries(COLOR_MIXING_RULES)) {
    if (!colors.includes(resultColor)) continue;
    
    // Check if this rule applies to the current cell type
    if (isThreeNeighborCell && !["black", "white", "gold"].includes(resultColor)) continue;
    if (!isThreeNeighborCell && ["black", "white", "gold"].includes(resultColor)) continue;
    
    if (rule.length !== neighborColors.length) continue;
    
    const sortedRule = [...rule].sort();
    if (sortedNeighbors.every((c, i) => c === sortedRule[i])) {
      return resultColor;
    }
  }

  return null;
};

// Check if an influenced cell's color is valid
const checkCell = (board, row, col, colors, difficulty) => {
  const cell = board[row][col];
  if (!cell.isActive || cell.isInfluencer || !cell.color || cell.isClue)
    return true;

  const neighbors = getNeighbors(board, row, col);
  const neighborColors = neighbors.filter((n) => n.color).map((n) => n.color);
  const isThreeNeighborCell = DIFFICULTY_CONFIG[difficulty].THREE_NEIGHBOR_CELLS?.some(
    ([r, c]) => r === row && c === col
  );
  
  const expectedColor = getInfluencedColor(neighborColors, colors, isThreeNeighborCell);
  return expectedColor === cell.color;
};

// Validate the entire board
const validateBoard = (board, colors, difficulty) => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isInfluencer &&
        !checkCell(board, row, col, colors, difficulty)
      ) {
        return false;
      }
    }
  }
  return true;
};

// Generate a solution board
const generateSolution = (difficulty = "Medium") => {
  const { GRID_SIZE, COLORS, FIXED_HOLES, THREE_NEIGHBOR_CELLS = [] } = DIFFICULTY_CONFIG[difficulty];
  const board = createBoard(difficulty);
  
  const influencerCells = [];
  const influencedCells = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].isInfluencer) {
        influencerCells.push([row, col]);
      } else if (board[row][col].isActive) {
        influencedCells.push([row, col]);
      }
    }
  }

  console.log(`Influencer cells: ${influencerCells.length}`);
  console.log(`Influenced cells: ${influencedCells.length}`);

  // Validate that influenced cells have correct neighbor counts
  for (const [row, col] of influencedCells) {
    const neighbors = getNeighbors(board, row, col);
    const isThreeNeighborCell = THREE_NEIGHBOR_CELLS.some(([r, c]) => r === row && c === col);
    const expectedCount = isThreeNeighborCell ? 3 : 2;
    
    if (neighbors.length !== expectedCount) {
      console.log(`Error: Cell [${row},${col}] has ${neighbors.length} neighbors, expected ${expectedCount}`);
      return null;
    }
  }

  const MAX_ATTEMPTS = 1000;
  
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Clear the board
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board[row][col].isHole) {
          board[row][col].color = null;
        }
      }
    }

    // Try to assign colors using a constraint satisfaction approach
    if (solveWithConstraints(board, COLORS, difficulty)) {
      console.log(`Solution found after ${attempt} attempts`);
      return board;
    }
  }

  console.log("Failed to generate solution after maximum attempts");
  return null;
};

// Solve using constraint satisfaction
const solveWithConstraints = (board, colors, difficulty) => {
  const { GRID_SIZE, THREE_NEIGHBOR_CELLS = [] } = DIFFICULTY_CONFIG[difficulty];
  
  // Get all cells that need colors
  const influencerCells = [];
  const influencedCells = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].isInfluencer) {
        influencerCells.push([row, col]);
      } else if (board[row][col].isActive) {
        influencedCells.push([row, col]);
      }
    }
  }

  // Sort influenced cells by constraint difficulty (3-neighbor first, then edge cells)
  influencedCells.sort((a, b) => {
    const [rowA, colA] = a;
    const [rowB, colB] = b;
    
    const isThreeNeighborA = THREE_NEIGHBOR_CELLS.some(([r, c]) => r === rowA && c === colA);
    const isThreeNeighborB = THREE_NEIGHBOR_CELLS.some(([r, c]) => r === rowB && c === colB);
    
    if (isThreeNeighborA !== isThreeNeighborB) {
      return isThreeNeighborA ? -1 : 1;
    }
    
    // Prioritize edge cells as they have fewer neighbors
    const edgePriorityA = (rowA === 0 || rowA === GRID_SIZE - 1 || colA === 0 || colA === GRID_SIZE - 1) ? 1 : 0;
    const edgePriorityB = (rowB === 0 || rowB === GRID_SIZE - 1 || colB === 0 || colB === GRID_SIZE - 1) ? 1 : 0;
    
    return edgePriorityB - edgePriorityA;
  });

  // Try to solve iteratively
  let progress = true;
  const maxIterations = 50;
  let iteration = 0;
  
  while (progress && iteration < maxIterations) {
    progress = false;
    iteration++;
    
    // Try to assign colors to influenced cells first
    for (const [row, col] of influencedCells) {
      if (board[row][col].color) continue;
      
      const neighbors = getNeighbors(board, row, col);
      const isThreeNeighborCell = THREE_NEIGHBOR_CELLS.some(([r, c]) => r === row && c === col);
      
      // Get possible color combinations for this cell
      const possibleCombinations = getPossibleColorCombinations(neighbors, colors, isThreeNeighborCell);
      
      if (possibleCombinations.length === 1) {
        // Only one possibility - assign it
        const combination = possibleCombinations[0];
        assignColorCombination(board, neighbors, combination, row, col);
        progress = true;
      } else if (possibleCombinations.length > 1) {
        // Multiple possibilities - try a random one
        const combination = possibleCombinations[Math.floor(Math.random() * possibleCombinations.length)];
        assignColorCombination(board, neighbors, combination, row, col);
        progress = true;
      }
    }
    
    // Fill in any remaining influencer cells with random colors
    for (const [row, col] of influencerCells) {
      if (!board[row][col].color) {
        const availableColors = colors.filter(c => 
          difficulty === "Difficult" ? true : !["black", "white", "gold"].includes(c)
        );
        board[row][col].color = availableColors[Math.floor(Math.random() * availableColors.length)];
        progress = true;
      }
    }
  }
  
  // Validate the solution
  return validateBoard(board, colors, difficulty);
};

// Get possible color combinations for a cell
const getPossibleColorCombinations = (neighbors, colors, isThreeNeighborCell) => {
  const combinations = [];
  const neighborCount = isThreeNeighborCell ? 3 : 2;
  
  if (neighbors.length !== neighborCount) return combinations;
  
  // Get current neighbor colors
  const currentColors = neighbors.map(n => n.color);
  const unassignedCount = currentColors.filter(c => !c).length;
  
  if (unassignedCount === 0) {
    // All neighbors already have colors - check if valid
    const resultColor = getInfluencedColor(currentColors, colors, isThreeNeighborCell);
    if (resultColor) {
      combinations.push({ neighborColors: currentColors, resultColor });
    }
    return combinations;
  }
  
  // Generate all possible color assignments for unassigned neighbors
  const availableColors = colors.filter(c => 
    isThreeNeighborCell ? true : !["black", "white", "gold"].includes(c)
  );
  
  const generateCombinations = (index, currentAssignment) => {
    if (index >= neighbors.length) {
      const testColors = currentAssignment.map((c, i) => c || currentColors[i]);
      const resultColor = getInfluencedColor(testColors, colors, isThreeNeighborCell);
      if (resultColor) {
        combinations.push({ neighborColors: testColors, resultColor });
      }
      return;
    }
    
    if (currentColors[index]) {
      // Already assigned
      generateCombinations(index + 1, [...currentAssignment, currentColors[index]]);
    } else {
      // Try all available colors
      for (const color of availableColors) {
        generateCombinations(index + 1, [...currentAssignment, color]);
      }
    }
  };
  
  generateCombinations(0, []);
  return combinations;
};

// Assign a color combination to neighbors and the influenced cell
const assignColorCombination = (board, neighbors, combination, influencedRow, influencedCol) => {
  const { neighborColors, resultColor } = combination;
  
  neighbors.forEach((neighbor, index) => {
    if (!neighbor.color) {
      board[neighbor.row][neighbor.col].color = neighborColors[index];
    }
  });
  
  board[influencedRow][influencedCol].color = resultColor;
};

// Deduce colors iteratively
const deduceColors = (board, colors, difficulty) => {
  const { THREE_NEIGHBOR_CELLS = [] } = DIFFICULTY_CONFIG[difficulty];
  let changed = true;
  
  while (changed) {
    changed = false;
    
    // First pass: deduce influenced cell colors
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
          const isThreeNeighborCell = THREE_NEIGHBOR_CELLS.some(([r, c]) => r === i && c === j);
          
          if (neighborColors.length === (isThreeNeighborCell ? 3 : 2)) {
            const deducedColor = getInfluencedColor(neighborColors, colors, isThreeNeighborCell);
            if (deducedColor) {
              board[i][j].color = deducedColor;
              changed = true;
            }
          }
        }
      }
    }
    
    // Second pass: deduce influencer colors from influenced cells
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
          
          if (otherNeighbors.some((n) => !n.color)) continue;
          
          const expectedColor = board[r][c].color;
          const otherColors = otherNeighbors.map((n) => n.color);
          const isThreeNeighborCell = THREE_NEIGHBOR_CELLS.some(([tr, tc]) => tr === r && tc === c);
          
          // Try to deduce the missing color
          const deducedColor = deduceInfluencerColor(otherColors, expectedColor, colors, isThreeNeighborCell);
          
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

// Deduce influencer color from other neighbors and expected result
const deduceInfluencerColor = (otherColors, expectedColor, colors, isThreeNeighborCell) => {
  const neighborCount = isThreeNeighborCell ? 3 : 2;
  
  if (otherColors.length !== neighborCount - 1) return null;
  
  // Try all possible colors for the missing neighbor
  const availableColors = colors.filter(c => 
    isThreeNeighborCell ? true : !["black", "white", "gold"].includes(c)
  );
  
  for (const testColor of availableColors) {
    const testNeighbors = [...otherColors, testColor];
    const resultColor = getInfluencedColor(testNeighbors, colors, isThreeNeighborCell);
    
    if (resultColor === expectedColor) {
      return testColor;
    }
  }
  
  return null;
};

// Check if a puzzle is solvable logically
const canSolvePuzzle = (puzzleBoard, solutionBoard, colors, difficulty) => {
  const board = JSON.parse(JSON.stringify(puzzleBoard));
  deduceColors(board, colors, difficulty);
  
  // Check if all cells are solved correctly
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (
        board[row][col].isActive &&
        !board[row][col].isHole &&
        board[row][col].color !== solutionBoard[row][col].color
      ) {
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

  const MAX_CLUE_ATTEMPTS = 200;
  
  for (let attempt = 0; attempt < MAX_CLUE_ATTEMPTS; attempt++) {
    const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));

    // Balance clues between influenced and influencer cells
    const clueCandidates = [
      ...shuffleArray([...influencedCells]).slice(0, Math.ceil(CLUE_COUNT * 0.6)),
      ...shuffleArray([...influencerCells]).slice(0, Math.floor(CLUE_COUNT * 0.4)),
    ];
    const clues = clueCandidates.slice(0, CLUE_COUNT);

    // Clear non-clue cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!puzzleBoard[row][col].isHole) {
          const isClue = clues.some(([r, c]) => r === row && c === col);
          if (!isClue) {
            puzzleBoard[row][col].color = null;
            puzzleBoard[row][col].isClue = false;
          } else {
            puzzleBoard[row][col].isClue = true;
          }
        }
      }
    }

    if (canSolvePuzzle(puzzleBoard, solutionBoard, COLORS, difficulty)) {
      console.log(`Solvable puzzle generated with ${CLUE_COUNT} clues`);
      return { puzzleBoard, solutionBoard };
    }
  }

  console.log("Failed to generate solvable puzzle, returning fallback");
  
  // Fallback: use more clues
  const puzzleBoard = JSON.parse(JSON.stringify(solutionBoard));
  const clues = shuffleArray([...nonHoleCells]).slice(0, CLUE_COUNT);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!puzzleBoard[row][col].isHole) {
        const isClue = clues.some(([r, c]) => r === row && c === col);
        if (!isClue) {
          puzzleBoard[row][col].color = null;
          puzzleBoard[row][col].isClue = false;
        } else {
          puzzleBoard[row][col].isClue = true;
        }
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