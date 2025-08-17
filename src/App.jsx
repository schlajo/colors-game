import React, { useState, useEffect } from "react";
import ColorBoard from "./components/ColorBoard";
import ColorPalette from "./components/ColorPalette";
import {
  generateSolution,
  createPuzzle,
  createBoard,
  DIFFICULTY_CONFIG,
} from "./utils/gameLogic";
import {
  generateSolutionDifficult,
  createPuzzleDifficult,
  createBoardDifficult,
  DIFFICULTY_CONFIG_DIFFICULT,
} from "./utils/gameLogicDifficult";
import { v4 as uuidv4 } from "uuid";
import Venns from "./assets/venn-words.png";
import Blue from "./assets/cyan-blue-magenta-example.png";
import CB from "./assets/cyan-blue-example.png";
import RG from "./assets/red-green-example.png";
import Yellow from "./assets/red-yellow-green-example.png";
import ColorMixingRules from "./components/ColorMixingRules";
import GameCompletionModal from "./components/GameCompletionModal";
import LeaderboardDisplay from "./components/LeaderboardDisplay";

const App = () => {
  const [board, setBoard] = useState(null);
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
    setTimeout(() => {
      setLightAnimation(false);
      setShowCongrats(true);
      setGameStarted(false);
      setIsPaused(false);
      // Show completion modal immediately after celebration
      setShowCompletionModal(true);
    }, 1000);
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
    setBoard(newBoard);

    if (startTime) {
      setStartTime((prevStartTime) => {
        const newStartTime = prevStartTime - 20000;
        setElapsedTime(Date.now() - newStartTime);
        return newStartTime;
      });
      setTimerShake(true);
      setTimeout(() => setTimerShake(false), 500);
    }

    console.log(
      `Hint provided: Cell [${row},${col}] set to ${newBoard[row][col].color}`
    );
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
        setBoard(newBoard);
        console.log(`Cell [${row},${col}] updated to color: ${color}`);

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

  return (
    <>
      <style>
        {`:root {
        --cell-size: ${48 - config.GRID_SIZE}px;
        --inner-size: ${38 - config.GRID_SIZE}px;
      }`}
      </style>
      <div className="app-container flex flex-col lg:flex-row justify-center gap-4 p-4 w-full max-w-6xl mx-auto relative">
        {/* Left Panel: Instructions */}
        <div className="instruction-panel lg:w-1/2 w-full mt-4 lg:mb-0 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            About the Game
          </h2>
          <div className="text-gray-300 mb-6">
            <p className="mb-3">
              This puzzle game combines two different color-mixing systems that
              are the inverse of each other: <i><strong className="text-white">Additive (RGB) </strong></i>for <i><strong className="text-white">Light</strong></i>, and 
              <i><strong className="text-white"> Subtractive (CMY)</strong></i> for <i><strong className="text-white">Ink</strong></i>. Players must logically deduce which
              colors belong in each cell using these complementary mixing
              systems, creating a unique puzzle experience that teaches real color
              theory.
            </p>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 text-center">
            How to Play
          </h3>
          <ul className="list-disc list-inside text-gray-300">
            <li>
              The objective of the game is to fill all the white and gray cells
              with the correct colors.
            </li>
            <li>Use the provided <strong className="text-white">Color-Mixing Rules</strong>.</li>
            <li>
              Fill the white cells with the color that would result from the
              colors of the two surrounding gray cells; or fill the gray cells
              with colors that will produce the color in the white cells.
            </li>
            <br></br>
            <li>
              So Red and Green...
              <img
                src={RG}
                alt="red and green surrounding and empty white cell"
                className="max-w-[76] h-10 mx-auto"
              />
              ......make Yellow (using Additive Mixing Rules).
              <img
                src={Yellow}
                alt="a yellow tile surrounded by a red tile and a green tile"
                className="max-w-[76] h-10 mx-auto"
              />
            </li>
            <br></br>
            <li>
              Cyan and what make Blue?
              <img
                src={CB}
                alt="a cyan tile on in agray cell with a blue tile next to it in a white cell"
                className="max-w-[76] h-10 mx-auto"
              />
              .......Magenta (using Subtractive Mixing Rules).
              <img
                src={Blue}
                alt="a blue tile surrounded by a cyan tile and a magenta tile"
                className="max-w-[76] h-10 mx-auto"
              />
            </li>
            <br></br>
            <li>
              Black cells are inactive, gray cells are influencers, and white
              cells are influenced by surrounding gray cells.
            </li>
            <li>Logic applies vertically and horizontally.</li>
            <li>
              Click a cell to select it, outlining it in blue. You can't select
              pre-tiled cells.
            </li>
            <li>
              To fill a cell, choose a color from the palette below the board.
            </li>
          </ul>
        </div>

        {/* Center: Game Board and Controls */}
        <div className="flex flex-col items-center w-full lg:w-2/4 relative">
          <div className="flex justify-center mb-2 mt-5">
            <img
              src={Venns}
              alt="Color Venn Diagrams"
              className="max-w-[76] h-auto mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold mb-3">Colors</h1>

          <div className="mb-4 flex items-center gap-2">
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
              className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              title="View Leaderboard"
            >
              🏆
            </button>
          </div>
          <div
            className="relative board-container"
            style={{
              minHeight: boardContainerSize,
              maxWidth: boardContainerSize,
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
          <div
            className="w-full lg:w-2/4 max-w-md flex flex-wrap justify-center gap-1 mt-2"
            style={{ maxWidth: "680px" }}
          >
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

          <div
            className="mt-4 flex flex-wrap justify-center gap-2"
            style={{ maxWidth: boardContainerSize }}
          >
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
          <div
            className="mt-4 flex flex-wrap justify-center gap-2"
            style={{ maxWidth: boardContainerSize }}
          >
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

          {/* Game Controls - Bottom of Center Column */}
          <div className="mt-4 bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-3 text-center">
              Game Controls
            </h3>
            <ul className="list-none list-inside text-gray-300">
              <li className="mb-2">
                <i><strong className="text-white">Hint</strong></i> fills a
                random cell with the correct color, but penalizes you 20
                seconds for every usage.
              </li>
              <li className="mb-2">
                <i><strong className="text-white">Check</strong></i> places
                red X's on all incorrect tiles.
              </li>
              <li className="mb-2">
                <i><strong className="text-white">Delete</strong></i> removes whatever is in the cell you've selected. You cannot
                delete the tiles you were given to start.
              </li>
              <li className="mb-2">
                <i><strong className="text-white">Clear</strong></i> removes
                all the tiles you've placed.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Panel: Color-Mixing Rules */}

        <ColorMixingRules difficulty={difficulty} />
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
