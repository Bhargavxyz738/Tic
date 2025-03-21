import { Button } from "@/components/ui/button";
import { GameState } from "@shared/schema";

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState | null;
  onRematch: () => void;
}

export default function GameResultModal({ isOpen, onClose, gameState, onRematch }: GameResultModalProps) {
  if (!isOpen || !gameState || gameState.status !== 'completed') return null;
  
  let resultTitle = "Game Over";
  let resultText = "The game has ended.";
  let winnerSymbol = "";
  let winnerName = "";
  let symbolColor = "";
  
  if (gameState.isDraw) {
    resultTitle = "It's a Draw!";
    resultText = "The game ended in a draw.";
  } else if (gameState.winner) {
    const isWinnerX = gameState.winner.id === gameState.playerX.id;
    winnerSymbol = isWinnerX ? "X" : "O";
    winnerName = gameState.winner.username;
    symbolColor = isWinnerX ? "text-[#3498DB] bg-[#3498DB]" : "text-[#2ECC71] bg-[#2ECC71]";
    resultTitle = `${winnerName} Wins!`;
    resultText = "has won the game!";
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className={`mx-auto my-4 w-20 h-20 ${symbolColor} text-white rounded-full flex items-center justify-center text-4xl`}>
            {winnerSymbol || "?"}
          </div>
          <h2 className={`font-poppins font-semibold text-2xl ${gameState.isDraw ? 'text-gray-700' : symbolColor} mb-2`}>
            {resultTitle}
          </h2>
          {!gameState.isDraw && (
            <p className="text-gray-600 text-lg">{resultText}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-500">Total Moves</p>
            <p className="font-medium">{gameState.moves}</p>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-500">Players</p>
            <p className="font-medium">
              {gameState.playerX.username} vs {gameState.playerO ? gameState.playerO.username : 'AI'}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            onClick={onClose} 
            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md font-medium transition"
          >
            Back to Lobby
          </Button>
          <Button 
            onClick={onRematch} 
            className="px-4 py-2 bg-secondary hover:bg-opacity-80 text-white rounded-md font-medium transition"
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
