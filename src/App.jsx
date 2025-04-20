import React, { useState, useEffect } from 'react';
import ColorBoard from './components/ColorBoard';
import ColorPalette from './components/ColorPalette';
import { generateSolution, createPuzzle, createBoard } from './utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const initialBoard = Array(9).fill().map(() =>
    Array(9).fill().map(() => ({
      color: null,
      isHole: false,
      id: uuidv4(),
    }))
  );

  const [board, setBoard] = useState(initialBoard);
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  const initializeBoard = () => {
    console.log('initializeBoard called');
    const solution = generateSolution();
    console.log('Solution generated:', solution);
    if (solution) {
      const { puzzleBoard, solutionBoard } = createPuzzle(solution);
      console.log('Puzzle board:', puzzleBoard);
      setBoard(puzzleBoard);
      setSolutionBoard(solutionBoard);
      console.log('Board state updated with puzzleBoard');
    } else {
      console.log('No solution generated, resetting to empty board');
      const emptyBoard = createBoard();
      setBoard(emptyBoard);
      setSolutionBoard([]);
      console.log('Board state updated with emptyBoard:', emptyBoard);
    }
  };

  const checkSolution = () => {
    let isCorrect = true;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!board[row][col].isHole) {
          if (board[row][col].color !== solutionBoard[row][col].color) {
            isCorrect = false;
            break;
          }
        }
      }
      if (!isCorrect) break;
    }
    if (isCorrect) {
      alert('Congratulations! You solved the puzzle!');
    } else {
      alert('Not quite! Keep trying.');
    }
  };

  const getHint = () => {
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!board[row][col].isHole && !board[row][col].color) {
          emptyCells.push([row, col]);
        }
      }
    }

    if (emptyCells.length === 0) {
      alert('No empty cells left for a hint!');
      return;
    }

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = [...board];
    newBoard[row][col].color = solutionBoard[row][col].color;
    setBoard(newBoard);
    console.log(`Hint provided: Cell [${row},${col}] set to ${solutionBoard[row][col].color}`);
  };

  useEffect(() => {
    console.log('useEffect running');
    initializeBoard();
    console.log('Solution Board after init:', solutionBoard);
  }, []);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    console.log('Selected color:', color);
  };

  const handleCellClick = (row, col) => {
    if (!board[row][col].isHole && !board[row][col].color) {
      const newBoard = [...board];
      newBoard[row][col].color = selectedColor;
      setBoard(newBoard);
      console.log(`Cell [${row},${col}] updated to color:`, selectedColor);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Color Mixing Puzzle</h1>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            console.log('Start Game button clicked');
            initializeBoard();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Game
        </button>
        <button
          onClick={() => {
            console.log('Check button clicked');
            checkSolution();
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Check
        </button>
        <button
          onClick={() => {
            console.log('Hint button clicked');
            getHint();
          }}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Hint
        </button>
      </div>
      <ColorBoard board={board} onCellClick={handleCellClick} />
      <ColorPalette onColorSelect={handleColorSelect} selectedColor={selectedColor} />
    </div>
  );
};

export default App;