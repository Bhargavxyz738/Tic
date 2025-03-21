import { User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface MatchHistoryProps {
  matchHistory: Array<{
    id: number;
    playerX: User;
    playerO: User;
    winnerId: number | null;
    isDraw: boolean;
    completedAt: string;
  }>;
  currentUser: User | null;
}

export default function MatchHistory({ matchHistory, currentUser }: MatchHistoryProps) {
  if (!currentUser) return null;
  
  const getOutcomeLabel = (match: any) => {
    if (match.isDraw) return "Draw";
    
    const isCurrentUserWinner = match.winnerId === currentUser.id;
    return isCurrentUserWinner ? "Win" : "Loss";
  };
  
  const getOutcomeStyle = (outcome: string) => {
    if (outcome === "Win") return "bg-[#3498DB] bg-opacity-10 text-[#3498DB]";
    if (outcome === "Loss") return "bg-red-100 text-red-500";
    return "bg-gray-100 text-gray-500"; // Draw
  };
  
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="font-poppins font-semibold text-xl text-primary mb-4">Match History</h2>
      
      {matchHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No match history yet</p>
      ) : (
        <div className="space-y-4">
          {matchHistory.map((match) => {
            const outcome = getOutcomeLabel(match);
            const outcomeStyle = getOutcomeStyle(outcome);
            
            // Determine if current user was X or O
            const isCurrentUserX = match.playerX.id === currentUser.id;
            const currentUserSymbol = isCurrentUserX ? "X" : "O";
            const opponentSymbol = isCurrentUserX ? "O" : "X";
            
            // Get opponent
            const opponent = isCurrentUserX ? match.playerO : match.playerX;
            
            return (
              <div key={match.id} className="p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(match.completedAt)}
                  </span>
                  <span className={`text-xs px-2 py-1 ${outcomeStyle} rounded-full`}>
                    {outcome}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`${isCurrentUserX ? 'bg-[#3498DB]' : 'bg-[#2ECC71]'} text-white rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold mr-2`}>
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium ${isCurrentUserX ? 'text-[#3498DB]' : 'text-[#2ECC71]'}`}>
                      {currentUser.username} ({currentUserSymbol})
                    </span>
                  </div>
                  
                  <span className="text-sm font-bold">vs</span>
                  
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${isCurrentUserX ? 'text-[#2ECC71]' : 'text-[#3498DB]'}`}>
                      {opponent.username} ({opponentSymbol})
                    </span>
                    <div className={`${isCurrentUserX ? 'bg-[#2ECC71]' : 'bg-[#3498DB]'} text-white rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold ml-2`}>
                      {opponent.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
