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
      id: uuidv4(),
    }))
  );

  const [board, setBoard] = useState(initialBoard);
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  const initializeBoard = () => {
    console.log('initializeBoard called');
    const solution = generateSolution();
    console.log('Solution generated:', solution);
    if (solution) {
      const { puzzleBoard, solutionBoard } = createPuzzle(solution);
      console.log('Puzzle board:', puzzleBoard);
      // Mark clues
      const newBoard = JSON.parse(JSON.stringify(puzzleBoard));
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
          if (newBoard[row][col].color) {
            newBoard[row][col].isClue = true;
          }
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
  };

  const checkSolution = () => {
    let isCorrect = true;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!board[row][col].isHole) {
          if (board[row][col].color !== (solutionBoard[row]?.[col]?.color || null)) {
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
    setBoard(newBoard);
    console.log(`Hint provided: Cell [${row},${col}] set to ${newBoard[row][col].color}`);
  };

  const deleteLast = () => {
    if (!selectedCell) {
      alert('No cell selected to delete!');
      return;
    }
    const [row, col] = selectedCell;
    if (!board[row][col].isHole && !board[row][col].isClue && board[row][col].color) {
      const newBoard = JSON.parse(JSON.stringify(board));
      newBoard[row][col].color = null;
      setBoard(newBoard);
      console.log(`Deleted color from cell [${row},${col}]`);
    } else {
      alert('Selected cell is empty, a hole, or a clue!');
    }
  };

  const clearBoard = () => {
    const newBoard = JSON.parse(JSON.stringify(board));
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (!newBoard[row][col].isHole && !newBoard[row][col].isClue) {
          newBoard[row][col].color = null;
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
    console.log(`Cell clicked: [${row},${col}], isHole=${board[row][col].isHole}, isClue=${board[row][col].isClue}, hasColor=${board[row][col].color}`);
    if (board[row][col].isHole || board[row][col].isClue) {
      console.log(`Cell [${row},${col}] is a hole or clue, cannot interact`);
      return;
    }
    // Set persistent highlight
    setSelectedCell([row, col]);
    console.log(`Cell [${row},${col}] highlighted`);
  };

  const handleColorButton = (color) => {
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
        setBoard(newBoard);
        console.log(`Cell [${row},${col}] updated to color: ${color}`);
      } else {
        console.log(`Cell [${row},${col}] already has color: ${color}, no change`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Color Mixing Puzzle</h1>
      <ColorBoard
        board={board}
        onCellClick={handleCellClick}
        selectedCell={selectedCell}
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
        >
          Check
        </button>
        <button
          onClick={() => {
            console.log('Hint button clicked');
            getHint();
          }}
          className="px-4 py-2 bg-yellow-300 text-white rounded hover:bg-yellow-600"
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
        >
          Delete
        </button>
        <button
          onClick={() => {
            console.log('Clear button clicked');
            clearBoard();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default App;