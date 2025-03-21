import { useState, useEffect } from "react";
import { GameState, User } from "@shared/schema";

interface GameBoardProps {
  gameState: GameState | null;
  user: User | null;
  onCellClick: (index: number) => void;
}

export default function GameBoard({ gameState, user, onCellClick }: GameBoardProps) {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);
  
  // Update board when game state changes
  useEffect(() => {
    if (gameState) {
      setBoard(gameState.board);
      
      // Check if it's the current user's turn
      if (gameState.status === 'in_progress' && user) {
        const isPlayerX = user.id === gameState.playerX.id;
        const isPlayerO = gameState.playerO && user.id === gameState.playerO.id;
        
        setIsMyTurn(
          (isPlayerX && gameState.currentPlayer === 'X') || 
          (isPlayerO && gameState.currentPlayer === 'O')
        );
      } else {
        setIsMyTurn(false);
      }
    } else {
      setBoard(Array(9).fill(null));
      setIsMyTurn(false);
    }
  }, [gameState, user]);
  
  const handleCellClick = (index: number) => {
    if (!gameState || gameState.status !== 'in_progress' || !isMyTurn || board[index] !== null) {
      return;
    }
    
    onCellClick(index);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {board.map((value, index) => (
          <div 
            key={index}
            className={`game-cell aspect-square border-2 border-gray-300 rounded-md flex items-center justify-center text-4xl font-bold cursor-pointer ${value !== null ? 'played' : ''} ${isMyTurn && value === null ? 'hover:bg-gray-100' : ''}`}
            onClick={() => handleCellClick(index)}
          >
            {value && (
              <span className={value === 'X' ? 'text-[#3498DB]' : 'text-[#2ECC71]'}>
                {value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
