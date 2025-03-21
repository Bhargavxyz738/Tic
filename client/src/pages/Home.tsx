import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import GameBoard from "@/components/GameBoard";
import GameInfo from "@/components/GameInfo";
import GameResultModal from "@/components/GameResultModal";
import LeaderBoard from "@/components/LeaderBoard";
import MatchHistory from "@/components/MatchHistory";
import OnlinePlayers from "@/components/OnlinePlayers";
import { useGame } from "@/hooks/use-game";

export default function Home() {
  const {
    user,
    gameState,
    onlinePlayers,
    matchHistory,
    leaderboard,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isGameResultModalOpen,
    setIsGameResultModalOpen,
    handleLogin,
    handleRegister,
    handleLogout,
    createNewGame,
    joinGame,
    makeMove,
    resignGame
  } = useGame();
  
  const [showOfferDrawConfirm, setShowOfferDrawConfirm] = useState(false);
  
  const handleOfferDraw = () => {
    setShowOfferDrawConfirm(true);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#ECF0F1] text-[#34495E]">
      <Header 
        user={user} 
        onLogin={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <GameInfo 
              gameState={gameState} 
              user={user} 
              onNewGame={createNewGame} 
            />
            
            <GameBoard 
              gameState={gameState} 
              user={user} 
              onCellClick={makeMove} 
            />
            
            {/* Game Controls */}
            {gameState && gameState.status === 'in_progress' && (
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={resignGame}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-primary rounded-md font-medium transition"
                >
                  Resign Game
                </Button>
                <Button
                  onClick={handleOfferDraw}
                  className="px-6 py-3 bg-primary hover:bg-opacity-80 text-white rounded-md font-medium transition"
                >
                  Offer Draw
                </Button>
              </div>
            )}
          </div>
          
          {/* Sidebar Section - Takes 1 column on large screens */}
          <div className="space-y-6">
            <OnlinePlayers 
              players={onlinePlayers} 
              currentUser={user} 
              onChallenge={joinGame} 
            />
            
            <LeaderBoard 
              leaderboard={leaderboard} 
            />
            
            <MatchHistory 
              matchHistory={matchHistory} 
              currentUser={user} 
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-primary text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Tic Tac Toe Multiplayer. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
      />
      
      <GameResultModal 
        isOpen={isGameResultModalOpen} 
        onClose={() => setIsGameResultModalOpen(false)} 
        gameState={gameState} 
        onRematch={createNewGame} 
      />
    </div>
  );
}
