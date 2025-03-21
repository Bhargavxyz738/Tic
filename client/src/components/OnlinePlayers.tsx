import { User } from "@shared/schema";

interface OnlinePlayersProps {
  players: Array<{ id: number; username: string; inGame: boolean }>;
  currentUser: User | null;
  onChallenge: (playerId: number) => void;
}

export default function OnlinePlayers({ players, currentUser, onChallenge }: OnlinePlayersProps) {
  // Filter out current user
  const filteredPlayers = players.filter(player => 
    currentUser && player.id !== currentUser.id
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="font-poppins font-semibold text-xl text-primary mb-4">Online Players</h2>
      
      {filteredPlayers.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No other players online</p>
      ) : (
        <div className="space-y-3">
          {filteredPlayers.map(player => (
            <div 
              key={player.id}
              className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-md transition"
            >
              <div className="flex items-center">
                <div className="bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center font-bold mr-2">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <p className="font-medium">{player.username}</p>
              </div>
              
              <button
                className={`text-xs ${
                  player.inGame 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-secondary text-white hover:bg-opacity-80'
                } px-2 py-1 rounded`}
                onClick={() => !player.inGame && onChallenge(player.id)}
                disabled={player.inGame}
              >
                {player.inGame ? 'In Game' : 'Challenge'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
