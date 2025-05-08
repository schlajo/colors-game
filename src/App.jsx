import React, { useState, useEffect } from 'react';
import ColorBoard from './components/ColorBoard';
import ColorPalette from './components/ColorPalette';
import { generateSolution, createPuzzle, createBoard, COLORS } from './utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const initialBoard = Array(7).fill().map(() =>
    Array(7).fill().map(() => ({
      color: null,
      isActive: false,
      isHole: false,
      isClue: false,
      isIncorrect: false,
      id: uuidv4(),
    }))
  );

  const [board, setBoard] = useState(initialBoard);
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [lightAnimation, setLightAnimation] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    let timer;
    if (startTime && !isGameWon) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isGameWon]);

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const initializeBoard = () => {
    console.log('initializeBoard called');
    const solution = generateSolution();
    console.log('Solution generated:', solution);
    if (solution) {
      const { puzzleBoard, solutionBoard } = createPuzzle(solution);
      console.log('Puzzle board:', puzzleBoard);
      const newBoard = JSON.parse(JSON.stringify(puzzleBoard));
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
          if (newBoard[row][col].color) {
            newBoard[row][col].isClue = true;
          }
          newBoard[row][col].isIncorrect = false;
        }
      }
      setBoard(newBoard);
      setSolutionBoard(solutionBoard);
      console.log('Board state updated with puzzleBoard');
    } else {
      console.log('No solution generated, resetting to empty board');
      const emptyBoard = createBoard();
      setBoard(emptyBoard);
      setSolutionBoard([]);
      console.log('Board state updated with emptyBoard:', emptyBoard);
    }
    setSelectedCell(null);
    setIsGameWon(false);
    setLightAnimation(false);
    setShowCongrats(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameStarted(true);
  };

  const endGame = () => {
    console.log('End Game called');
    const emptyBoard = createBoard(); // Use createBoard to get holes and influencers
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
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
  };

  const checkSolution = () => {
    if (isGameWon) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    let isCorrect = true;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!newBoard[row][col].isHole) {
          const isTileCorrect = newBoard[row][col].color === (solutionBoard[row]?.[col]?.color || null);
          newBoard[row][col].isIncorrect = !isTileCorrect && !!newBoard[row][col].color;
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
      setGameStarted(false); // Reset to show "Start Game" button after win
    }, 1000); // Animation duration: 1 second
  };

  const checkWinCondition = (updatedBoard) => {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!updatedBoard[row][col].isHole) {
          if (updatedBoard[row][col].color !== (solutionBoard[row]?.[col]?.color || null)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const getHint = () => {
    if (isGameWon) return;
    const emptyCells = [];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!board[row][col].isHole && !board[row][col].isClue && !board[row][col].color) {
          emptyCells.push([row, col]);
        }
      }
    }

    if (emptyCells.length === 0) {
      alert('No empty cells left for a hint!');
      return;
    }

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[row][col].color = solutionBoard[row]?.[col]?.color || COLORS[Math.floor(Math.random() * COLORS.length)];
    newBoard[row][col].isIncorrect = false;
    setBoard(newBoard);
    console.log(`Hint provided: Cell [${row},${col}] set to ${newBoard[row][col].color}`);
    if (checkWinCondition(newBoard)) {
      setIsGameWon(true);
      triggerCelebration();
    }
  };

  const deleteLast = () => {
    if (isGameWon) return;
    if (!selectedCell) {
      alert('No cell selected to delete!');
      return;
    }
    const [row, col] = selectedCell;
    if (!board[row][col].isHole && !board[row][col].isClue && board[row][col].color) {
      const newBoard = JSON.parse(JSON.stringify(board));
      newBoard[row][col].color = null;
      newBoard[row][col].isIncorrect = false;
      setBoard(newBoard);
      console.log(`Deleted color from cell [${row},${col}]`);
    } else {
      alert('Selected cell is empty, a hole, or a clue!');
    }
  };

  const clearBoard = () => {
    if (isGameWon) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!newBoard[row][col].isHole && !newBoard[row][col].isClue) {
          newBoard[row][col].color = null;
          newBoard[row][col].isIncorrect = false;
        }
      }
    }
    setBoard(newBoard);
    setSelectedCell(null);
    console.log('Board cleared of player-placed colors');
  };

  useEffect(() => {
    console.log('useEffect running');
    // Do not call initializeBoard to prevent timer start on load
  }, []);

  const handleCellClick = (row, col) => {
    if (isGameWon) return;
    console.log(`Cell clicked: [${row},${col}], isHole=${board[row][col].isHole}, isClue=${board[row][col].isClue}, hasColor=${board[row][col].color}`);
    if (board[row][col].isHole || board[row][col].isClue) {
      console.log(`Cell [${row},${col}] is a hole or clue, cannot interact`);
      return;
    }
    setSelectedCell([row, col]);
    console.log(`Cell [${row},${col}] highlighted`);
  };

  const handleColorButton = (color) => {
    if (isGameWon) return;
    if (!selectedCell) {
      alert('Please select a cell first!');
      console.log('Color button clicked, but no cell selected');
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
        console.log(`Cell [${row},${col}] already has color: ${color}, no change`);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between p-4 w-full max-w-7xl mx-auto relative">
      {/* Left Panel: Basic Instructions */}
      <div className="instruction-panel lg:w-1/4 w-full mt-2 lg:mb-0 lg:mr-4 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-2">How to Play</h2>
        <ul className="list-disc list-inside text-gray-300">
          <li>The object of the game is to fill all the white and gray cells with the correct colors.</li>
          <li>Black cells are inactive.</li>
          <li>Gray cells are influencers.</li>
          <li>White cells are influenced by surrounding gray cells.</li>
          <li>Use the color-mixing rules on the right to place the correct color tiles in the cells.</li>
          <li>Click a cell to select it.</li>
          <li>Choose a color from the palette below to fill a cell.</li>
        </ul>
      </div>

      {/* Center: Game Board and Controls */}
      <div className="flex flex-col items-center w-full lg:w-2/4">
        <h1 className="text-2xl font-bold mb-2">Colors</h1>
        <ColorBoard
          board={board}
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
          lightAnimation={lightAnimation}
        />
        <div className="mt-2 text-white text-lg">
          Time: {formatTime(elapsedTime)}
        </div>
        <ColorPalette
          onColorClick={handleColorButton}
          colors={['cyan', 'magenta', 'yellow', 'red', 'green', 'blue', 'purple', 'orange', 'white']}
        />
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => {
              console.log('Check button clicked');
              checkSolution();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isGameWon || !gameStarted}
          >
            Check
          </button>
          <button
            onClick={() => {
              console.log('Hint button clicked');
              getHint();
            }}
            className="px-4 py-2 bg-yellow-300 text-white rounded hover:bg-yellow-600"
            disabled={isGameWon || !gameStarted}
          >
            Hint
          </button>
          <button
            onClick={() => {
              if (gameStarted && !showCongrats) {
                console.log('End Game button clicked');
                endGame();
              } else {
                console.log('Start Game button clicked');
                initializeBoard();
              }
            }}
            className={`px-4 py-2 text-white rounded ${
              gameStarted && !showCongrats
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {gameStarted && !showCongrats ? 'End Game' : 'Start Game'}
          </button>
          <button
            onClick={() => {
              console.log('Delete button clicked');
              deleteLast();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={isGameWon || !gameStarted}
          >
            Delete
          </button>
          <button
            onClick={() => {
              console.log('Clear button clicked');
              clearBoard();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-gray-600"
            disabled={isGameWon || !gameStarted}
          >
            Clear
          </button>
        </div>
        {showCongrats && (
          <div className="congratulations-message text-white flex flex-col items-center">
            <div className="text-5xl font-bold">You Win!</div>
            <div className="text-2xl">Time: {formatTime(elapsedTime)}</div>
          </div>
        )}
      </div>

      {/* Right Panel: Color-Mixing Rules */}
      <div className="instruction-panel lg:w-1/4 w-full mt-2 lg:mt-0 lg:ml-4 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-2">Color-Mixing Rules</h2>
        <ul className="list-disc list-inside text-gray-300">Additive Mixing (RGB) Light
          <li>Red + Blue = Magenta</li>
          <li>Red + Green = Yellow</li>
          <li>Blue + Green = Cyan</li>
        </ul> 
        <ul className="list-disc list-inside text-gray-300">Subtractive Mixing (CMY) Ink
          <li>Cyan + Magenta = Blue</li>
          <li>Cyan + Yellow = Green</li>
          <li>Magenta + Yellow = Red</li>
        </ul>
          <ul className="list-disc list-inside text-gray-300">Arbitrary Mixing
          <li>Magenta + Blue = Purple</li>
          <li>Yellow + Red = Orange</li>
          <li>Cyan + Green = Gray</li>
          <li>2 Same Colors = That Color</li>
        </ul>
      </div>
    </div>
  );
};

export default App;