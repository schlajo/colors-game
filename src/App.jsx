import React, { useState, useEffect } from "react";
import ColorBoard from "./components/ColorBoard";
import ColorPalette from "./components/ColorPalette";
import {
  generateSolution,
  createPuzzle,
  createBoard,
  DIFFICULTY_CONFIG,
  getNewValidConnections,
  getNeighbors,
  getInfluencedColor,
  getDirection,
  getInfluencedNeighborsEasy,
} from "./utils/gameLogic";
import {
  generateSolutionDifficult,
  createPuzzleDifficult,
  createBoardDifficult,
  DIFFICULTY_CONFIG_DIFFICULT,
  getNewValidConnectionsDifficult,
  getNeighborsDifficult,
  getInfluencedColorDifficult,
  getDirectionDifficult,
  getInfluencedNeighbors,
} from "./utils/gameLogicDifficult";
import { v4 as uuidv4 } from "uuid";
import Venns from "./assets/venn-words.png";
import Blue from "./assets/magenta-blue-cyan.png";
import CB from "./assets/blue-cyan.png";
import RG from "./assets/red-green.png";
import Yellow from "./assets/red-yellow-green.png";
import ColorMixingRules from "./components/ColorMixingRules";
import GameCompletionModal from "./components/GameCompletionModal";
import LeaderboardDisplay from "./components/LeaderboardDisplay";
import {
  playErrorSound,
  playSuccessSound,
  playStartSound,
  playCelebrationSound,
  toggleSound,
  isSoundEnabled,
  initAudioContext,
} from "./utils/soundEffects";

const App = () => {
  const [board, setBoard] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize sound state on component mount
  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
  }, []);
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [lightAnimation, setLightAnimation] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerShake, setTimerShake] = useState(false);
  const [difficulty, setDifficulty] = useState("Easy");
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [newValidConnections, setNewValidConnections] = useState([]);
  const [connectionAnimationActive, setConnectionAnimationActive] =
    useState(false);
  const [provenCorrectCells, setProvenCorrectCells] = useState(new Set());
  const [provenMixingInfo, setProvenMixingInfo] = useState(new Map());
  const [skipAutoUpdate, setSkipAutoUpdate] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showColorRules, setShowColorRules] = useState(false);

  // Initialize Easy board on mount
  useEffect(() => {
    const initialBoard = createBoard("Easy");
    setBoard(initialBoard);
  }, []);

  // Update timer
  useEffect(() => {
    let timer;
    if (startTime && !isGameWon && !isPaused) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isGameWon, isPaused]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check for all valid connections whenever the board changes
  useEffect(() => {
    if (board && !skipAutoUpdate) {
      updateAllValidConnections();
    }
  }, [board, difficulty, skipAutoUpdate]);

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const initializeBoard = () => {
    if (!difficulty) return;
    console.log("initializeBoard called with difficulty:", difficulty);

    let solution, puzzleObj;

    if (difficulty === "Difficult") {
      // Use Difficult-specific functions
      solution = generateSolutionDifficult();
      puzzleObj = createPuzzleDifficult(solution);
    } else {
      // Use original functions for Easy and Medium
      solution = generateSolution(difficulty);
      puzzleObj = createPuzzle(solution, difficulty);
    }

    console.log("Solution generated:", solution);
    if (solution) {
      const { puzzleBoard, solutionBoard } = puzzleObj;
      console.log("Puzzle board:", puzzleBoard);
      const newBoard = JSON.parse(JSON.stringify(puzzleBoard));

      // Get the correct config based on difficulty
      const config =
        difficulty === "Difficult"
          ? DIFFICULTY_CONFIG_DIFFICULT
          : DIFFICULTY_CONFIG[difficulty];

      for (let row = 0; row < config.GRID_SIZE; row++) {
        for (let col = 0; col < config.GRID_SIZE; col++) {
          if (newBoard[row][col].color) {
            newBoard[row][col].isClue = true;
          }
          newBoard[row][col].isIncorrect = false;
        }
      }
      setBoard(newBoard);
      setSolutionBoard(solutionBoard);
      console.log("Board state updated with puzzleBoard");
      console.log("Solution board stored:", solutionBoard);
      console.log("Sample solution cells:", {
        "[0,0]": solutionBoard[0]?.[0]?.color,
        "[1,1]": solutionBoard[1]?.[1]?.color,
        "[4,4]": solutionBoard[4]?.[4]?.color,
      });
      setStartTime(Date.now());
      setElapsedTime(0);
      setGameStarted(true);
      setIsPaused(false);
      setShowWelcomeOverlay(false);
    } else {
      console.log("No solution generated, resetting to empty board");
      const emptyBoard =
        difficulty === "Difficult"
          ? createBoardDifficult()
          : createBoard(difficulty);
      setBoard(emptyBoard);
      setSolutionBoard([]);
      console.log("Board state updated with emptyBoard:", emptyBoard);
    }
    setSelectedCell(null);
    setIsGameWon(false);
    setLightAnimation(false);
    setShowCongrats(false);
    setProvenCorrectCells(new Set());
    setProvenMixingInfo(new Map());
  };

  const togglePause = () => {
    if (!gameStarted || isGameWon) return;
    if (isPaused) {
      setStartTime(Date.now() - elapsedTime);
      setIsPaused(false);
      console.log(
        "Game resumed, timer restarted from:",
        formatTime(elapsedTime)
      );
    } else {
      setIsPaused(true);
      console.log("Game paused at:", formatTime(elapsedTime));
    }
  };

  // Helper function to get the correct config based on difficulty
  const getConfig = (diff) => {
    return diff === "Difficult"
      ? DIFFICULTY_CONFIG_DIFFICULT
      : DIFFICULTY_CONFIG[diff];
  };

  const endGame = () => {
    console.log("End Game called");
    const config = getConfig(difficulty || "Easy");
    const emptyBoard =
      (difficulty || "Easy") === "Difficult"
        ? createBoardDifficult()
        : createBoard(difficulty || "Easy");
    for (let row = 0; row < config.GRID_SIZE; row++) {
      for (let col = 0; col < config.GRID_SIZE; col++) {
        emptyBoard[row][col].color = null;
        emptyBoard[row][col].isClue = false;
        emptyBoard[row][col].isIncorrect = false;
      }
    }
    setBoard(emptyBoard);
    setSolutionBoard([]);
    setStartTime(null);
    setElapsedTime(0);
    setSelectedCell(null);
    setIsGameWon(false);
    setLightAnimation(false);
    setShowCongrats(false);
    setGameStarted(false);
    setIsPaused(false);
    setShowWelcomeOverlay(true);
    setProvenCorrectCells(new Set());
    setProvenMixingInfo(new Map());
  };

  const checkSolution = () => {
    if (isGameWon || isPaused) return;
    const config = getConfig(difficulty);
    const newBoard = JSON.parse(JSON.stringify(board));
    let isCorrect = true;
    for (let row = 0; row < config.GRID_SIZE; row++) {
      for (let col = 0; col < config.GRID_SIZE; col++) {
        if (!newBoard[row][col].isHole) {
          const isTileCorrect =
            newBoard[row][col].color ===
            (solutionBoard[row]?.[col]?.color || null);
          newBoard[row][col].isIncorrect =
            !isTileCorrect && !!newBoard[row][col].color;
          if (!isTileCorrect) {
            isCorrect = false;
          }
        } else {
          newBoard[row][col].isIncorrect = false;
        }
      }
    }
    setBoard(newBoard);
    if (isCorrect) {
      setIsGameWon(true);
      triggerCelebration();
    }
  };

  const triggerCelebration = () => {
    setLightAnimation(true);
    playCelebrationSound();
    setTimeout(() => {
      setLightAnimation(false);
      setShowCongrats(true);
      setGameStarted(false);
      setIsPaused(false);
      // Show completion modal immediately after celebration
      setShowCompletionModal(true);
    }, 1000);
  };

  // Check for all valid connections on the board and show permanent mixing state
  const updateAllValidConnections = () => {
    const config = getConfig(difficulty);
    const newProvenCells = new Set();
    const newMixingInfo = new Map();

    console.log(`Checking all valid connections for ${difficulty} mode`);

    if (difficulty === "Difficult") {
      // Handle Difficult mode with 3-neighbor cells
      for (let row = 0; row < config.GRID_SIZE; row++) {
        for (let col = 0; col < config.GRID_SIZE; col++) {
          const cell = board[row][col];

          // Only check influenced cells that have colors (including clues)
          if (!cell.isInfluencer && cell.isActive && cell.color) {
            const neighbors = getNeighborsDifficult(board, row, col);
            const neighborColors = neighbors
              .filter((n) => n.color)
              .map((n) => n.color);

            const expected = cell.isThreeNeighbor ? 3 : 2;

            // Check if this cell has all its neighbors filled and is valid
            if (neighborColors.length === expected) {
              const expectedColor = getInfluencedColorDifficult(
                neighborColors,
                config.COLORS,
                cell.isThreeNeighbor
              );
              if (expectedColor === cell.color) {
                // Check if this is a 2-neighbor cell adjacent to a 3-neighbor cell
                const isAdjacentToThreeNeighbor =
                  !cell.isThreeNeighbor && neighbors.length === 2;
                const logPrefix = isAdjacentToThreeNeighbor
                  ? "🔍 SUSPECT"
                  : "✅ Found valid";

                console.log(
                  `${logPrefix} cell at [${row},${col}]: ${cell.color} = ${expectedColor} (${neighbors.length} neighbors, isThreeNeighbor: ${cell.isThreeNeighbor})`
                );
                // This is a valid connection - add to permanent display
                const cellKey = `${row}-${col}`;
                newProvenCells.add(cellKey);

                const mixingInfo = {
                  influenced: { row, col, color: cell.color },
                  influencers: neighbors.map((n) => ({
                    row: n.row,
                    col: n.col,
                    color: n.color,
                    direction: getDirectionDifficult(row, col, n.row, n.col),
                  })),
                  mixingType:
                    neighbors.length === 2 ? "two-color" : "three-color",
                  colors: neighborColors.sort(),
                };
                newMixingInfo.set(cellKey, mixingInfo);
              } else {
                console.log(
                  `❌ Invalid cell at [${row},${col}]: ${cell.color} ≠ ${expectedColor} (${neighbors.length} neighbors, isThreeNeighbor: ${cell.isThreeNeighbor})`
                );
              }
            } else if (cell.color) {
              console.log(
                `⚠️ Cell at [${row},${col}] has ${neighborColors.length}/${expected} neighbors filled`
              );
            }
          }
        }
      }
    } else {
      // Handle Easy/Medium mode with 2-neighbor cells
      for (let row = 0; row < config.GRID_SIZE; row++) {
        for (let col = 0; col < config.GRID_SIZE; col++) {
          const cell = board[row][col];

          // Only check influenced cells that have colors (including clues)
          if (!cell.isInfluencer && cell.isActive && cell.color) {
            const neighbors = getNeighbors(board, row, col);
            const neighborColors = neighbors
              .filter((n) => n.color)
              .map((n) => n.color);

            // Check if this cell has both neighbors filled and is valid
            if (neighborColors.length === 2) {
              const expectedColor = getInfluencedColor(
                neighborColors,
                config.COLORS
              );
              if (expectedColor === cell.color) {
                // This is a valid connection - add to permanent display
                const cellKey = `${row}-${col}`;
                newProvenCells.add(cellKey);

                const mixingInfo = {
                  influenced: { row, col, color: cell.color },
                  influencers: neighbors.map((n) => ({
                    row: n.row,
                    col: n.col,
                    color: n.color,
                    direction: getDirection(row, col, n.row, n.col),
                  })),
                  mixingType: "two-color",
                  colors: neighborColors.sort(),
                };
                newMixingInfo.set(cellKey, mixingInfo);
              }
            }
          }
        }
      }
    }

    console.log(`Found ${newProvenCells.size} valid connections total`);
    setProvenCorrectCells(newProvenCells);
    setProvenMixingInfo(newMixingInfo);
  };

  const animateNewConnections = (connections) => {
    if (connections.length === 0) return;

    console.log("Starting animation for connections:", connections);
    setNewValidConnections(connections);
    setConnectionAnimationActive(true);

    // Play success sound for correct mixing
    playSuccessSound();

    // Add these cells to the proven correct set and store their mixing info
    const newProvenCells = new Set(provenCorrectCells);
    const newMixingInfo = new Map(provenMixingInfo);
    connections.forEach((connection) => {
      const cellKey = `${connection.influenced.row}-${connection.influenced.col}`;
      newProvenCells.add(cellKey);
      newMixingInfo.set(cellKey, connection);
    });
    setProvenCorrectCells(newProvenCells);
    setProvenMixingInfo(newMixingInfo);

    // Clear animation after 3 seconds (slower), but keep the cells marked as proven
    setTimeout(() => {
      console.log("Clearing animation");
      setConnectionAnimationActive(false);
      setNewValidConnections([]);
      // Re-enable auto-update after animation completes
      setSkipAutoUpdate(false);
    }, 3000);
  };

  const animateAttempt = (attemptInfo) => {
    console.log("Starting animation for attempt:", attemptInfo);
    setNewValidConnections([attemptInfo]);
    setConnectionAnimationActive(true);

    // Play appropriate sound
    if (attemptInfo.isCorrect) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

    // Clear animation after 3 seconds for correct, 2 seconds for incorrect
    const duration = attemptInfo.isCorrect ? 3000 : 2000;
    setTimeout(() => {
      console.log("Clearing attempt animation");
      setConnectionAnimationActive(false);
      setNewValidConnections([]);
    }, duration);
  };

  const checkWinCondition = (updatedBoard) => {
    const config = getConfig(difficulty);
    console.log("Checking win condition for difficulty:", difficulty);
    console.log("Solution board length:", solutionBoard.length);

    for (let row = 0; row < config.GRID_SIZE; row++) {
      for (let col = 0; col < config.GRID_SIZE; col++) {
        if (!updatedBoard[row][col].isHole) {
          const boardColor = updatedBoard[row][col].color;
          const solutionColor = solutionBoard[row]?.[col]?.color || null;

          if (boardColor !== solutionColor) {
            console.log(
              `Win condition failed at [${row},${col}]: board=${boardColor}, solution=${solutionColor}`
            );
            return false;
          }
        }
      }
    }
    console.log("Win condition passed! All cells match solution.");
    return true;
  };

  const getHint = () => {
    if (isGameWon || isPaused) return;
    const config = getConfig(difficulty);
    const emptyCells = [];
    let clueCount = 0;
    let holeCount = 0;
    let filledCount = 0;

    for (let row = 0; row < config.GRID_SIZE; row++) {
      for (let col = 0; col < config.GRID_SIZE; col++) {
        if (board[row][col].isHole) {
          holeCount++;
        } else if (board[row][col].isClue) {
          clueCount++;
        } else if (board[row][col].color) {
          filledCount++;
        } else {
          emptyCells.push([row, col]);
        }
      }
    }

    console.log(
      `Board analysis: ${clueCount} clues, ${holeCount} holes, ${filledCount} filled, ${emptyCells.length} empty`
    );
    console.log("Empty cells:", emptyCells);

    if (emptyCells.length === 0) {
      // Check if the game is won when all cells are filled
      if (checkWinCondition(board)) {
        setIsGameWon(true);
        triggerCelebration();
      } else {
        alert("No empty cells left for a hint!");
      }
      return;
    }

    const [row, col] =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = JSON.parse(JSON.stringify(board));

    // For Difficult level, respect 3-neighbor rules
    let hintColor;
    if (difficulty === "Difficult") {
      // Always use solution color for hints in Difficult level
      console.log(
        `Checking solution for cell [${row},${col}]:`,
        solutionBoard[row]?.[col]?.color
      );
      if (solutionBoard[row]?.[col]?.color) {
        hintColor = solutionBoard[row][col].color;
        console.log(`Using solution color: ${hintColor}`);
      } else {
        // Fallback to a regular color if no solution color (shouldn't happen)
        console.log(`No solution color found, using fallback`);
        const regularColors = config.COLORS.filter(
          (color) => color !== "white" && color !== "black"
        );
        hintColor =
          regularColors[Math.floor(Math.random() * regularColors.length)];
      }
    } else {
      // For Easy/Medium, use solution color or random color
      hintColor =
        solutionBoard[row]?.[col]?.color ||
        config.COLORS[Math.floor(Math.random() * config.COLORS.length)];
    }

    // Debug: Log the final hint color
    console.log(`Final hint color for [${row},${col}]: ${hintColor}`);

    newBoard[row][col].color = hintColor;
    newBoard[row][col].isIncorrect = false;

    // Check for new valid connections created by this hint placement
    const newConnections =
      difficulty === "Difficult"
        ? getNewValidConnectionsDifficult(board, newBoard, config.COLORS)
        : getNewValidConnections(board, newBoard, config.COLORS);

    setBoard(newBoard);
    console.log(
      `Hint provided: Cell [${row},${col}] set to ${newBoard[row][col].color}`
    );
    console.log(
      `🔍 HINT DEBUG: Found ${newConnections.length} new connections:`,
      newConnections
    );

    // Play success sound and animate if hint created valid connections
    if (newConnections.length > 0) {
      console.log(
        `🎉 HINT SUCCESS ANIMATION TRIGGERED: Created ${newConnections.length} new valid connections:`,
        newConnections,
        `Hint placed ${
          newBoard[row][col].isInfluencer ? "gray" : "white"
        } cell [${row},${col}] with color ${hintColor}`
      );
      // Prevent auto-update during animation to ensure proper mixing animation
      setSkipAutoUpdate(true);
      animateNewConnections(newConnections);
    }

    if (startTime) {
      setStartTime((prevStartTime) => {
        const newStartTime = prevStartTime - 20000;
        setElapsedTime(Date.now() - newStartTime);
        return newStartTime;
      });
      setTimerShake(true);
      setTimeout(() => setTimerShake(false), 500);
    }

    if (checkWinCondition(newBoard)) {
      setIsGameWon(true);
      triggerCelebration();
    }
  };

  const deleteLast = () => {
    if (isGameWon || isPaused) return;
    if (!selectedCell) {
      alert("No cell selected to delete!");
      return;
    }
    const [row, col] = selectedCell;
    if (
      !board[row][col].isHole &&
      !board[row][col].isClue &&
      board[row][col].color
    ) {
      const newBoard = JSON.parse(JSON.stringify(board));
      newBoard[row][col].color = null;
      newBoard[row][col].isIncorrect = false;
      setBoard(newBoard);
      console.log(`Deleted color from cell [${row},${col}]`);
    } else {
      alert("Selected cell is empty, a hole, or a clue!");
    }
  };

  const clearBoard = () => {
    if (isGameWon || isPaused) return;
    const config = getConfig(difficulty);
    const newBoard = JSON.parse(JSON.stringify(board));
    for (let row = 0; row < config.GRID_SIZE; row++) {
      for (let col = 0; col < config.GRID_SIZE; col++) {
        if (!newBoard[row][col].isHole && !newBoard[row][col].isClue) {
          newBoard[row][col].color = null;
          newBoard[row][col].isIncorrect = false;
        }
      }
    }
    setBoard(newBoard);
    setSelectedCell(null);
    console.log("Board cleared of player-placed colors");
  };

  const handleCellClick = (row, col) => {
    if (isGameWon || isPaused) return;
    console.log(
      `Cell clicked: [${row},${col}], isHole=${board[row][col].isHole}, isClue=${board[row][col].isClue}, hasColor=${board[row][col].color}`
    );
    if (board[row][col].isHole || board[row][col].isClue) {
      console.log(`Cell [${row},${col}] is a hole or clue, cannot interact`);
      return;
    }
    setSelectedCell([row, col]);
    console.log(`Cell [${row},${col}] highlighted`);
  };

  const handleColorButton = (color) => {
    if (isGameWon || isPaused) return;
    if (!selectedCell) {
      alert("Please select a cell first!");
      console.log("Color button clicked, but no cell selected");
      return;
    }
    const [row, col] = selectedCell;
    if (!board[row][col].isHole && !board[row][col].isClue) {
      const newBoard = JSON.parse(JSON.stringify(board));
      if (board[row][col].color !== color) {
        newBoard[row][col].color = color;
        newBoard[row][col].isIncorrect = false;

        // Check for new valid connections created by this placement
        const config = getConfig(difficulty);

        const newConnections =
          difficulty === "Difficult"
            ? getNewValidConnectionsDifficult(board, newBoard, config.COLORS)
            : getNewValidConnections(board, newBoard, config.COLORS);

        setBoard(newBoard);
        console.log(`Cell [${row},${col}] updated to color: ${color}`);
        console.log(
          `🔍 PLACEMENT DEBUG: Found ${newConnections.length} new connections:`,
          newConnections
        );
        console.log(
          `🔍 PLACEMENT DEBUG: Cell is ${
            newBoard[row][col].isInfluencer
              ? "GRAY (influencer)"
              : "WHITE (influenced)"
          }`
        );
        console.log(
          `🔍 PLACEMENT DEBUG: connectionAnimationActive = ${connectionAnimationActive}`
        );

        // Always animate the attempt, whether correct or incorrect
        if (newConnections.length > 0) {
          console.log(
            `🎉 SUCCESS ANIMATION TRIGGERED: Created ${newConnections.length} new valid connections:`,
            newConnections,
            `Placed ${
              newBoard[row][col].isInfluencer ? "gray" : "white"
            } cell [${row},${col}] with color ${color}`
          );
          // Prevent auto-update during animation to ensure proper mixing animation
          setSkipAutoUpdate(true);
          animateNewConnections(newConnections);
        } else {
          // Check for incorrect attempts in both influenced and influencer cells
          let attemptInfo = null;

          // For both white and gray cells, animate the cell that was just placed
          // This provides clearer feedback about which placement was wrong

          if (!newBoard[row][col].isInfluencer) {
            // This is an influenced cell (white cell) - check if the placement is incorrect
            const neighbors =
              difficulty === "Difficult"
                ? getNeighborsDifficult(newBoard, row, col)
                : getNeighbors(newBoard, row, col);
            if (neighbors.length >= 2) {
              const neighborColors = neighbors
                .filter((n) => n.color)
                .map((n) => n.color);

              if (neighborColors.length >= 2) {
                // Check if this placement creates an invalid result
                const expectedColor =
                  difficulty === "Difficult"
                    ? getInfluencedColorDifficult(
                        neighborColors,
                        config.COLORS,
                        newBoard[row][col].isThreeNeighbor
                      )
                    : getInfluencedColor(neighborColors, config.COLORS);

                // Only trigger error animation if the placement is actually wrong (doesn't match solution)
                const solutionColor = solutionBoard[row]?.[col]?.color;
                if (expectedColor !== color && solutionColor !== color) {
                  // Animate the cell that was just placed (more intuitive)
                  attemptInfo = {
                    influenced: { row, col, color: color },
                    influencers: neighbors.map((n) => ({
                      row: n.row,
                      col: n.col,
                      color: n.color,
                      direction:
                        difficulty === "Difficult"
                          ? getDirectionDifficult(row, col, n.row, n.col)
                          : getDirection(row, col, n.row, n.col),
                    })),
                    mixingType:
                      neighbors.length === 2 ? "two-color" : "three-color",
                    colors: neighborColors.sort(),
                    isCorrect: false, // This is an incorrect attempt
                  };
                }
              }
            }
          } else {
            // This is an influencer cell (gray cell) - check if it creates invalid trios
            const influencedNeighbors =
              difficulty === "Difficult"
                ? getInfluencedNeighbors(newBoard, row, col)
                : getInfluencedNeighborsEasy(newBoard, row, col);

            for (const influenced of influencedNeighbors) {
              if (influenced.color) {
                const allNeighbors =
                  difficulty === "Difficult"
                    ? getNeighborsDifficult(
                        newBoard,
                        influenced.row,
                        influenced.col
                      )
                    : getNeighbors(newBoard, influenced.row, influenced.col);
                const neighborColors = allNeighbors
                  .filter((n) => n.color)
                  .map((n) => n.color);

                if (neighborColors.length >= 2) {
                  // Check if this creates an invalid trio
                  const expectedColor =
                    difficulty === "Difficult"
                      ? getInfluencedColorDifficult(
                          neighborColors,
                          config.COLORS,
                          newBoard[influenced.row][influenced.col]
                            .isThreeNeighbor
                        )
                      : getInfluencedColor(neighborColors, config.COLORS);

                  // Only trigger error animation if the placement is actually wrong (doesn't match solution)
                  const solutionColor = solutionBoard[row]?.[col]?.color;
                  if (
                    expectedColor !== influenced.color &&
                    solutionColor !== color
                  ) {
                    // Animate the cell that was just placed (the gray cell causing the error)
                    attemptInfo = {
                      influenced: { row, col, color: color }, // The cell just placed
                      influencers: [], // No need for influencers for error animation
                      mixingType: "error",
                      colors: [],
                      isCorrect: false, // This is an incorrect attempt
                    };
                    break;
                  }
                }
              }
            }
          }

          if (attemptInfo) {
            console.log(
              `❌ ERROR ANIMATION TRIGGERED: Incorrect placement in ${
                newBoard[row][col].isInfluencer ? "gray" : "white"
              } cell [${row},${col}] with color ${color}`
            );
            animateAttempt(attemptInfo);
          }
        }

        // Check win condition
        console.log("Checking win condition after color placement...");
        if (checkWinCondition(newBoard)) {
          console.log("Win condition met! Triggering celebration.");
          setIsGameWon(true);
          triggerCelebration();
        } else {
          console.log("Win condition not met yet.");
        }
      } else {
        console.log(
          `Cell [${row},${col}] already has color: ${color}, no change`
        );
      }
    }
  };

  const handleDifficultyChange = (e) => {
    const newDifficulty = e.target.value;
    setDifficulty(newDifficulty);
    setGameStarted(false);
    setIsPaused(false);
    const config = getConfig(newDifficulty);
    const newBoard =
      newDifficulty === "Difficult"
        ? createBoardDifficult()
        : createBoard(newDifficulty);
    setBoard(newBoard);
    setSolutionBoard([]);
    setShowCongrats(false);
    setStartTime(null);
    setElapsedTime(0);
    setShowWelcomeOverlay(false);
    setProvenCorrectCells(new Set());
    setProvenMixingInfo(new Map());
  };

  // Calculate board container size based on difficulty
  const config = getConfig(difficulty);
  const cellSizes = {
    Easy: 65, // <--- Play with this number for Easy (desktop/tablet)
    Medium: 55, // <--- Play with this number for Medium (desktop/tablet)
    Difficult: 45, // <--- Play with this number for Difficult (desktop/tablet)
  };
  const cellSizesMobile = {
    Easy: 55, // <--- Play with this number for Easy (mobile)
    Medium: 45, // <--- Play with this number for Medium (mobile)
    Difficult: 35, // <--- Play with this number for Difficult (mobile)
  };
  const cellSize = (isMobile ? cellSizesMobile : cellSizes)[difficulty] || 36;
  const boardContainerSize = `${
    config.GRID_SIZE * cellSize + (config.GRID_SIZE - 1) * 4
  }px`;

  // Content for How to Play section (reusable)
  const HowToPlayContent = ({ includeGameControls = false }) => (
    <>
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        About the Game
      </h2>
      <div className="text-gray-300 mb-6">
        <p className="mb-3">
          This puzzle game combines two different color-mixing systems that are
          inverse to each other.{" "}
          <i>
            <strong className="text-white"> Subtractive Mixing (CMY) </strong>
          </i>
          will feel more intuitive for you, as it corresponds to the colors we
          see reflected off of everyday objects.
          <i>
            <strong className="text-white"> Additive Mixing (RGB)</strong>
          </i>
          , however, may seem foreign to you becasue it refers to the colors of
          light before they are reflected off of an object. Players must
          logically deduce which colors belong in each cell using these
          complementary mixing systems, creating a unique puzzle experience that
          teaches real color theory.
        </p>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 text-center">
        How to Play
      </h3>
      <ul className="list-none list-inside text-gray-300">
        <li>
          The objective of the game is to fill all the white and gray cells with
          the correct colors. Black cells are inactive, gray cells are
          influencers, and white cells are influenced by surrounding gray cells.
        </li>
        <br></br>

        <li>
          Use the provided{" "}
          <strong className="text-white">Color-Mixing Rules</strong> to fill all
          the white cells with colors that would result from the surrounding
          gray cells. Fill all the gray cells with colors that will mix to
          produce the colors in the white cells.
        </li>
        <br></br>
        <li>
          So Red and Green...
          <img
            src={RG}
            alt="red and green surrounding and empty white cell"
            className="max-w-[76] h-10 mx-auto"
          />
          ......make Yellow (using Additive Mixing).
          <img
            src={Yellow}
            alt="a yellow tile surrounded by a red tile and a green tile"
            className="max-w-[76] h-10 mx-auto"
          />
        </li>
        <br></br>
        <li>
          What and Cyan make Blue?
          <img
            src={CB}
            alt="a cyan tile on in agray cell with a blue tile next to it in a white cell"
            className="max-w-[76] h-10 mx-auto"
          />
          .......Magenta (using Subtractive Mixing).
          <img
            src={Blue}
            alt="a blue tile surrounded by a cyan tile and a magenta tile"
            className="max-w-[76] h-10 mx-auto"
          />
        </li>
        <br></br>
        <li>
          Click a cell to select it, outlining it in blue. (You can't select
          pre-tiled cells.) To fill a cell, choose a color from the palette
          below the board. Logic applies vertically and horizontally.
        </li>
      </ul>

      {/* Game Controls - Only show on mobile */}
      {includeGameControls && (
        <>
          <h3 className="text-xl font-bold text-white mb-3 text-center mt-6">
            Game Controls
          </h3>
          <ul className="list-none list-inside text-gray-300">
            <li className="mb-2">
              <i>
                <strong className="text-white">Hint</strong>
              </i>{" "}
              fills a random cell with the correct color, but penalizes you 20
              seconds for every usage.
            </li>
            <li className="mb-2">
              <i>
                <strong className="text-white">Check</strong>
              </i>{" "}
              places red X's on all incorrect tiles.
            </li>
            <li className="mb-2">
              <i>
                <strong className="text-white">Delete</strong>
              </i>{" "}
              removes a tile you've placed in the selected square. (You can't
              delete the given starting tiles.)
            </li>
            <li className="mb-2">
              <i>
                <strong className="text-white">Clear</strong>
              </i>{" "}
              removes all the tiles you've placed.
            </li>
          </ul>
        </>
      )}
    </>
  );

  return (
    <>
      <style>
        {`:root {
        --cell-size: ${48 - config.GRID_SIZE}px;
        --inner-size: ${38 - config.GRID_SIZE}px;
      }`}
      </style>
      <div className="app-container flex flex-col lg:flex-row lg:justify-center lg:items-stretch gap-4 p-4 w-full mx-auto relative">
        {/* Left Panel: Instructions - Hidden on mobile */}
        <div className="instruction-panel flex-1 lg:flex-none lg:w-[27%] w-full mt-4 lg:mb-0 bg-gray-800 p-4 rounded-lg hidden lg:block">
          <HowToPlayContent includeGameControls={false} />
        </div>

        {/* Center: Game Board and Controls */}
        <div className="flex flex-col items-center flex-1 lg:flex-none lg:w-[40%] lg:relative order-first lg:order-none">
          <div className="flex justify-center mb-1 mt-3 sm:mb-2 sm:mt-5">
            <img
              src={Venns}
              alt="Color Venn Diagrams"
              className="max-w-[55] sm:max-w-[76] h-auto mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold mb-3">Colors</h1>

          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => {
                const newSoundState = toggleSound();
                setSoundEnabled(newSoundState);
                console.log("Sound toggled:", newSoundState ? "ON" : "OFF");
                // Initialize audio context on first user interaction
                if (newSoundState) {
                  initAudioContext();
                }
              }}
              className={`px-3 py-2 text-white rounded transition-colors ${
                soundEnabled
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
              title={soundEnabled ? "Sound: ON" : "Sound: OFF"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
            <select
              value={difficulty}
              onChange={handleDifficultyChange}
              className="px-4 py-2 bg-gray-800 text-white rounded z-20"
              disabled={gameStarted && !showCongrats && !isPaused}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Difficult">Difficult</option>
            </select>
            <button
              onClick={() => {
                console.log("Leaderboard button clicked");
                setShowLeaderboard(true);
              }}
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              title="View Leaderboard"
            >
              🏆
            </button>
          </div>
          <div
            className="relative board-container"
            style={{
              minHeight: boardContainerSize,
            }}
          >
            {board &&
              (isPaused ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="paused-message text-white text-lg text-center bg-gray-800 bg-opacity-90 px-8 py-4 rounded-lg border-2 border-gray-600">
                    Paused
                  </div>
                </div>
              ) : (
                <ColorBoard
                  board={board}
                  onCellClick={handleCellClick}
                  selectedCell={selectedCell}
                  lightAnimation={lightAnimation}
                  cellSize={cellSize}
                  newValidConnections={newValidConnections}
                  connectionAnimationActive={connectionAnimationActive}
                  provenCorrectCells={provenCorrectCells}
                  provenMixingInfo={provenMixingInfo}
                />
              ))}

            {showWelcomeOverlay && !showCongrats && (
              <div className="overlay-message">
                <div
                  className={`welcome-message ${
                    difficulty === "Difficult" ? "difficult" : ""
                  }`}
                >
                  Welcome to Colors! Select difficulty level above and click
                  Start below.
                </div>
              </div>
            )}
          </div>
          <div
            className={`mt-2 text-white text-lg ${
              timerShake ? "timer-shake" : ""
            }`}
          >
            Time: {formatTime(elapsedTime)}
          </div>
          <div className="w-full lg:w-full flex flex-wrap justify-center gap-1 mt-2">
            <ColorPalette
              onColorClick={handleColorButton}
              colors={
                difficulty
                  ? difficulty === "Difficult"
                    ? config.COLORS.filter(
                        (color) =>
                          color !== "black" &&
                          color !== "white" &&
                          color !== "silver" &&
                          color !== "gold"
                      )
                    : config.COLORS
                  : []
              }
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                console.log("Hint button clicked");
                getHint();
              }}
              className="px-2 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1 min-w-[60px] sm:min-w-[60px] max-w-[70px] sm:max-w-[80px]"
              disabled={isGameWon || !gameStarted || isPaused}
            >
              Hint
            </button>
            <button
              onClick={() => {
                if (gameStarted && !showCongrats) {
                  console.log("Pause/Resume button clicked");
                  togglePause();
                } else {
                  console.log("Start Game button clicked");
                  playStartSound();
                  initializeBoard();
                }
              }}
              className={`px-2 h-8 text-white rounded text-sm flex-1 min-w-[75px] sm:min-w-[100px] max-w-[100px] sm:max-w-[120px] ${
                gameStarted && !showCongrats
                  ? isPaused
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-yellow-400 hover:bg-yellow-500"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              disabled={!difficulty}
            >
              {gameStarted && !showCongrats
                ? isPaused
                  ? "Resume"
                  : "Pause"
                : "Start"}
            </button>
            <button
              onClick={() => {
                console.log("Check button clicked");
                checkSolution();
              }}
              className="px-2 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1 min-w-[60px] sm:min-w-[60px] max-w-[70px] sm:max-w-[80px]"
              disabled={isGameWon || !gameStarted || isPaused}
            >
              Check
            </button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                console.log("Delete button clicked");
                deleteLast();
              }}
              className="px-2 h-8 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm flex-1 min-w-[60px] sm:min-w-[60px] max-w-[70px] sm:max-w-[80px]"
              disabled={isGameWon || !gameStarted || isPaused}
            >
              Delete
            </button>
            <button
              onClick={() => {
                console.log("End Game button clicked");
                endGame();
              }}
              className="px-2 h-8 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex-1 min-w-[75px] sm:min-w-[100px] max-w-[90px] sm:max-w-[100px]"
              disabled={!gameStarted || showCongrats}
            >
              End
            </button>
            <button
              onClick={() => {
                console.log("Clear button clicked");
                clearBoard();
              }}
              className="px-2 h-8 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm flex-1 min-w-[60px] sm:min-w-[60px] max-w-[70px] sm:max-w-[80px]"
              disabled={isGameWon || !gameStarted || isPaused}
            >
              Clear
            </button>
          </div>

          {/* Game Controls - Bottom of Center Column - Hidden on mobile */}
          <div className="mt-8 bg-gray-800 p-4 rounded-lg w-full hidden lg:block">
            <h3 className="text-xl font-bold text-white mb-3 text-center">
              Game Controls
            </h3>
            <ul className="list-none list-inside text-gray-300">
              <li className="mb-2">
                <i>
                  <strong className="text-white">Hint</strong>
                </i>{" "}
                fills a random cell with the correct color, but penalizes you 20
                seconds for every usage.
              </li>
              <li className="mb-2">
                <i>
                  <strong className="text-white">Check</strong>
                </i>{" "}
                places red X's on all incorrect tiles.
              </li>
              <li className="mb-2">
                <i>
                  <strong className="text-white">Delete</strong>
                </i>{" "}
                removes a tile you've placed in the selected square. (You can't
                delete the given starting tiles.)
              </li>
              <li className="mb-2">
                <i>
                  <strong className="text-white">Clear</strong>
                </i>{" "}
                removes all the tiles you've placed.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Color-Mixing Rules - Hidden on mobile */}
        <div className="hidden lg:flex lg:flex-col lg:flex-none lg:w-[27%]">
          <ColorMixingRules difficulty={difficulty} />
        </div>

        {/* Mobile Collapsible Sections */}
        <div className="lg:hidden w-full flex flex-col gap-4 mt-2 mb-8">
          {/* How to Play Collapsible */}
          <div className="bg-gray-600 rounded-lg overflow-hidden border-2 border-gray-500">
            <button
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className="w-full px-4 py-3 flex justify-between items-center text-blue-500 font-bold text-lg hover:bg-gray-500 transition-colors"
            >
              <span>📖 How to Play</span>
              <span
                className={`transform transition-transform text-blue-500 ${
                  showHowToPlay ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {showHowToPlay && (
              <div className="p-4 border-t-2 border-gray-500 bg-gray-700">
                <HowToPlayContent includeGameControls={true} />
              </div>
            )}
          </div>

          {/* Color-Mixing Rules Collapsible */}
          <div className="bg-gray-600 rounded-lg overflow-hidden border-2 border-gray-500">
            <button
              onClick={() => setShowColorRules(!showColorRules)}
              className="w-full px-4 py-3 flex justify-between items-center text-blue-500 font-bold text-lg hover:bg-gray-500 transition-colors"
            >
              <span>🎨 Color-Mixing Rules</span>
              <span
                className={`transform transition-transform text-blue-500 ${
                  showColorRules ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {showColorRules && (
              <div className="p-4 border-t-2 border-gray-500 bg-gray-700">
                <ColorMixingRules difficulty={difficulty} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Completion Modal */}
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        elapsedTime={elapsedTime}
        difficulty={difficulty}
        onScoreSaved={(savedScore) => {
          console.log("Score saved:", savedScore);
          // You can add additional logic here if needed
        }}
      />

      {/* Leaderboard Display */}
      <LeaderboardDisplay
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <div className="w-full text-center text-white mt-8 py-4 bg-gray-900">
        © 2025 Schlajo. All Rights Reserved.
      </div>
    </>
  );
};

export default App;
