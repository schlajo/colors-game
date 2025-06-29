import React, { useState, useEffect } from "react";
import ColorBoard from "./components/ColorBoard";
import ColorPalette from "./components/ColorPalette";
import {
  generateSolution,
  createPuzzle,
  createBoard,
  DIFFICULTY_CONFIG,
} from "./utils/gameLogic";
import { v4 as uuidv4 } from "uuid";
import Venns from "./assets/venn-words.png";
import Magenta from "./assets/magenta-example.png";
import BC from "./assets/blue-cyan-example.png";
import RG from "./assets/red-green-example.png";
import Yellow from "./assets/yellow-example.png";

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
    const solution = generateSolution(difficulty);
    console.log("Solution generated:", solution);
    if (solution) {
      const { puzzleBoard, solutionBoard } = createPuzzle(solution, difficulty);
      console.log("Puzzle board:", puzzleBoard);
      const newBoard = JSON.parse(JSON.stringify(puzzleBoard));
      for (let row = 0; row < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; row++) {
        for (
          let col = 0;
          col < DIFFICULTY_CONFIG[difficulty].GRID_SIZE;
          col++
        ) {
          if (newBoard[row][col].color) {
            newBoard[row][col].isClue = true;
          }
          newBoard[row][col].isIncorrect = false;
        }
      }
      setBoard(newBoard);
      setSolutionBoard(solutionBoard);
      console.log("Board state updated with puzzleBoard");
      setStartTime(Date.now());
      setElapsedTime(0);
      setGameStarted(true);
      setIsPaused(false);
      setShowWelcomeOverlay(false);
    } else {
      console.log("No solution generated, resetting to empty board");
      const emptyBoard = createBoard(difficulty);
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

  const endGame = () => {
    console.log("End Game called");
    const emptyBoard = createBoard(difficulty || "Easy");
    for (
      let row = 0;
      row < DIFFICULTY_CONFIG[difficulty || "Easy"].GRID_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < DIFFICULTY_CONFIG[difficulty || "Easy"].GRID_SIZE;
        col++
      ) {
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
    const newBoard = JSON.parse(JSON.stringify(board));
    let isCorrect = true;
    for (let row = 0; row < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; row++) {
      for (let col = 0; col < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; col++) {
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
    }, 1000);
  };

  const checkWinCondition = (updatedBoard) => {
    for (let row = 0; row < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; row++) {
      for (let col = 0; col < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; col++) {
        if (!updatedBoard[row][col].isHole) {
          if (
            updatedBoard[row][col].color !==
            (solutionBoard[row]?.[col]?.color || null)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const getHint = () => {
    if (isGameWon || isPaused) return;
    const emptyCells = [];
    for (let row = 0; row < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; row++) {
      for (let col = 0; col < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; col++) {
        if (
          !board[row][col].isHole &&
          !board[row][col].isClue &&
          !board[row][col].color
        ) {
          emptyCells.push([row, col]);
        }
      }
    }

    if (emptyCells.length === 0) {
      alert("No empty cells left for a hint!");
      return;
    }

    const [row, col] =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[row][col].color =
      solutionBoard[row]?.[col]?.color ||
      DIFFICULTY_CONFIG[difficulty].COLORS[
        Math.floor(Math.random() * DIFFICULTY_CONFIG[difficulty].COLORS.length)
      ];
    newBoard[row][col].isIncorrect = false;
    setBoard(newBoard);

    if (startTime) {
      setStartTime((prevStartTime) => {
        const newStartTime = prevStartTime - 15000;
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
    const newBoard = JSON.parse(JSON.stringify(board));
    for (let row = 0; row < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; row++) {
      for (let col = 0; col < DIFFICULTY_CONFIG[difficulty].GRID_SIZE; col++) {
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
        if (checkWinCondition(newBoard)) {
          setIsGameWon(true);
          triggerCelebration();
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
    setBoard(createBoard(newDifficulty));
    setSolutionBoard([]);
    setShowCongrats(false);
    setStartTime(null);
    setElapsedTime(0);
    setShowWelcomeOverlay(false);
  };

  // Calculate board container size based on difficulty
  const boardContainerSize = difficulty
    ? `${DIFFICULTY_CONFIG[difficulty].GRID_SIZE * 48}px`
    : "240px";

  return (
    <>
      <div className="app-container flex flex-col lg:flex-row justify-center gap-4 p-4 w-full max-w-6xl mx-auto relative">
        {/* Left Panel: Instructions */}
        <div className="instruction-panel lg:w-1/2 w-full mt-4 lg:mb-0 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-2 text-center">
            How to Play
          </h2>
          <ul className="list-disc list-inside text-gray-300">
            <li>
              The object of the game is to fill all the white and gray cells
              with the correct colors.
            </li>
            <li>Use the provided Color-Mixing Rules.</li>
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
                alt="cyan and magenta surrounding and empty white cell"
                className="max-w-[76] h-10 mx-auto"
              />
              ......make Yellow.
              <img
                src={Yellow}
                alt="example showing blue made by cyan and magenta"
                className="max-w-[76] h-10 mx-auto"
              />
            </li>
            <br></br>
            <li>
              What and Cyan make Blue?
              <img
                src={BC}
                alt="cyan and magenta surrounding and empty white cell"
                className="max-w-[76] h-10 mx-auto"
              />
              .......Magenta!
              <img
                src={Magenta}
                alt="example showing blue made by cyan and magenta"
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
            <li>
              The Hint button fills a random cell with the correct color, but
              you are penalized 15 seconds for every usage.
            </li>
            <li>The Check button places red X's on all the incorrect tiles.</li>
            <li>
              The Delete button deletes whatever is in the cell you've selected.
              You cannot delete the tiles you were given to start.
            </li>
            <li>The Clear button clears all the tiles that you've placed.</li>
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

          <div className="mb-4">
            <select
              value={difficulty}
              onChange={handleDifficultyChange}
              className="px-4 py-2 bg-gray-800 text-white rounded z-20"
              disabled={gameStarted && !showCongrats && !isPaused}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Difficult" disabled>
                Difficult (Coming Soon!)
              </option>
            </select>
          </div>
          <div
            className="relative board-container"
            style={{ minHeight: boardContainerSize, maxWidth: boardContainerSize }}
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
                />
              ))}
            {showCongrats && (
              <div className="congratulations-message flex flex-col items-center">
                <div className="whitespace-nowrap font-bold">You Win!</div>
                <div className="text-xl mt-2">
                  Time: {formatTime(elapsedTime)}
                </div>
              </div>
            )}
            {showWelcomeOverlay && !showCongrats && (
              <div className="overlay-message">
                <div className="welcome-message">
                  Welcome to Colors! Select difficulty level above and click
                  Start Game below.
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
          <div className="w-full lg:w-2/4 max-w-md flex flex-nowrap justify-center gap-1 mt-2">
            <ColorPalette
              onColorClick={handleColorButton}
              colors={difficulty ? DIFFICULTY_CONFIG[difficulty].COLORS : []}
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
              className="px-2 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1 min-w-[60px] max-w-[80px]"
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
              className={`px-2 h-8 text-white rounded text-sm flex-1 min-w-[100px] max-w-[120px] ${
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
                : "Start Game"}
            </button>
            <button
              onClick={() => {
                console.log("Check button clicked");
                checkSolution();
              }}
              className="px-2 h-8 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1 min-w-[60px] max-w-[80px]"
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
              className="px-2 h-8 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm flex-1 min-w-[60px] max-w-[80px]"
              disabled={isGameWon || !gameStarted || isPaused}
            >
              Delete
            </button>
            <button
              onClick={() => {
                console.log("End Game button clicked");
                endGame();
              }}
              className="px-2 h-8 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex-1 min-w-[100px] max-w-[100px]"
              disabled={!gameStarted || showCongrats}
            >
              End Game
            </button>
            <button
              onClick={() => {
                console.log("Clear button clicked");
                clearBoard();
              }}
              className="px-2 h-8 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm flex-1 min-w-[60px] max-w-[80px]"
              disabled={isGameWon || !gameStarted || isPaused}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Panel: Color-Mixing Rules */}
        <div className="instruction-panel lg:w-1/2 w-full text-center mt-2 lg:mt-4 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-2">
            Color-Mixing Rules
          </h2>
          <ul className="list-disc list-inside mb-4 text-gray-300">
            Additive Mixing (RGB) for Light
            <li>Red + Green = Yellow</li>
            <li>Red + Blue = Magenta</li>
            <li>Blue + Green = Cyan</li>
          </ul>
          <ul className="list-disc list-inside mb-4 text-gray-300">
            Subtractive Mixing (CMY) for Ink
            <li>Cyan + Magenta = Blue</li>
            <li>Cyan + Yellow = Green</li>
            <li>Magenta + Yellow = Red</li>
          </ul>
          {difficulty === "Medium" && (
            <ul className="list-disc list-inside mb-4 text-gray-300">
              Arbitrary Mixing
              <li>Magenta + Blue = Purple</li>
              <li>Yellow + Red = Orange</li>
              <li>Cyan + Green = Silver</li>
              <li>Two of Same Color = That Color</li>
            </ul>
          )}
          <h3 className="text-lg font-bold text-white mb-2">
            Understanding RGB vs. CMY
          </h3>
          <div className="text-gray-300 text-left">
            <span>
              With additive color-mixing (RGB), we start with darkness
              (black) and add colored light. We see light directly emitted from
              a source, like a TV.  This model's three primary colors (red, green, and
              blue) can combine to make white.<br></br>
              <br></br>
              But with subtractive color-mixing (CMY), we see light that has
              bounced off of an object, with certain wavelengths absorbed by the
              pigments. We start with white, like a sheet of paper, and subtract
              light through pigments. That's why a red apple appears red - it
              absorbs most wavelengths but reflects primarily red light back to
              our eyes. <br></br>
              <br></br>
              On ink cartridges, the letters CMYK refer to cyan, magenta,
              yellow, and black. Cartridges include black ink even though CMY's three primary colors could combine to make black.
            </span>
          </div>
        </div>
      </div>
      <div className="w-full text-center text-white mt-8 py-4 bg-gray-900">
        © 2025 Schlajo. All Rights Reserved.
      </div>
    </>
  );
};

export default App;