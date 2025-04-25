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
    initializeBoard();
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
      <div className="instruction-panel lg:w-1/4 w-full mb-4 lg:mb-0 lg:mr-4 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-2">How to Play</h2>
        <ul className="list-disc list-inside text-gray-300">
          <li>Black cells are inactive.</li>
          <li>Gray cells are influencers.</li>
          <li>White cells are influenced by tiles in surrounding gray cells.</li>
          <li>Use color-mixing rules on right to place correct color tiles in cells.</li>
          <li>Click cell to select it.</li>
          <li>Choose color from palette below to fill cell.</li>
          <li>Match hidden solution using pre-filled clue cells to win.</li>
        </ul>
      </div>

      {/* Center: Game Board and Controls */}
      <div className="flex flex-col items-center w-full lg:w-2/4">
        <h1 className="text-2xl font-bold mb-4">Color Mixing Puzzle</h1>
        <ColorBoard
          board={board}
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
          lightAnimation={lightAnimation}
        />
        <ColorPalette
          onColorClick={handleColorButton}
          colors={['cyan', 'magenta', 'yellow', 'red', 'green', 'blue', 'purple', 'orange', 'white']}
        />
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => {
              console.log('Check button clicked');
              checkSolution();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isGameWon}
          >
            Check
          </button>
          <button
            onClick={() => {
              console.log('Hint button clicked');
              getHint();
            }}
            className="px-4 py-2 bg-yellow-300 text-white rounded hover:bg-yellow-600"
            disabled={isGameWon}
          >
            Hint
          </button>
          <button
            onClick={() => {
              console.log('Start Game button clicked');
              initializeBoard();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start Game
          </button>
          <button
            onClick={() => {
              console.log('Delete button clicked');
              deleteLast();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={isGameWon}
          >
            Delete
          </button>
          <button
            onClick={() => {
              console.log('Clear button clicked');
              clearBoard();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-gray-600"
            disabled={isGameWon}
          >
            Clear
          </button>
        </div>
        {showCongrats && (
          <div className="congratulations-message">
            You Win!
          </div>
        )}
      </div>

      {/* Right Panel: Color-Mixing Rules */}
      <div className="instruction-panel lg:w-1/4 w-full mt-4 lg:mt-0 lg:ml-4 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-2">Color-Mixing Rules</h2>
        <ul className="list-disc list-inside text-gray-300">Additive Mixing (RGB) for Light
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
        </ul>
      </div>
    </div>
  );
};

export default App;