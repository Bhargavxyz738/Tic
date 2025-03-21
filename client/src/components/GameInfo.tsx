import { Button } from "@/components/ui/button";
import PlayerInfo from "./PlayerInfo";
import { GameState, User } from "@shared/schema";

interface GameInfoProps {
  gameState: GameState | null;
  user: User | null;
  onNewGame: () => void;
}

export default function GameInfo({ gameState, user, onNewGame }: GameInfoProps) {
  let gameStatus = "Start a new game";
  let currentTurn = "";
  let playerXStats = "";
  let playerOStats = "";
  
  if (gameState) {
    // Set game status based on state
    if (gameState.status === 'waiting') {
      gameStatus = "Waiting for opponent...";
    } else if (gameState.status === 'in_progress') {
      gameStatus = "Game in progress";
    } else if (gameState.status === 'completed') {
      if (gameState.isDraw) {
        gameStatus = "Game ended in a draw";
      } else if (gameState.winner) {
        gameStatus = `${gameState.winner.username} won the game`;
      }
    }
    
    // Set current turn text
    if (gameState.status === 'in_progress') {
      const currentPlayerName = gameState.currentPlayer === 'X' 
        ? gameState.playerX.username 
        : (gameState.playerO ? gameState.playerO.username : "Player O");
      
      currentTurn = (
        <span>
          <span className={gameState.currentPlayer === 'X' ? "text-[#3498DB]" : "text-[#2ECC71]"} style={{ fontWeight: 600 }}>
            {currentPlayerName}'s
          </span> turn to play
        </span>
      );
    }
    
    // Calculate player stats
    if (gameState.playerX) {
      const totalX = gameState.playerX.wins + gameState.playerX.losses + gameState.playerX.draws;
      const winRateX = totalX > 0 ? Math.round((gameState.playerX.wins / totalX) * 100) : 0;
      playerXStats = `Win rate: ${winRateX}%`;
    }
    
    if (gameState.playerO) {
      const totalO = gameState.playerO.wins + gameState.playerO.losses + gameState.playerO.draws;
      const winRateO = totalO > 0 ? Math.round((gameState.playerO.wins / totalO) * 100) : 0;
      playerOStats = `Win rate: ${winRateO}%`;
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="font-poppins font-semibold text-xl text-primary">Current Match</h2>
          <p className="text-gray-500">{gameStatus}</p>
        </div>
        <Button 
          onClick={onNewGame} 
          className="bg-secondary hover:bg-opacity-80 text-white px-4 py-2 rounded-md font-medium transition"
        >
          New Game
        </Button>
      </div>
      
      {gameState && (
        <>
          <PlayerInfo 
            playerX={gameState.playerX}
            playerO={gameState.playerO}
            playerXStats={playerXStats}
            playerOStats={playerOStats}
          />
          
          {gameState.status === 'in_progress' && (
            <div className="mb-6 text-center py-2 bg-gray-100 rounded-md">
              <p className="font-poppins">{currentTurn}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
