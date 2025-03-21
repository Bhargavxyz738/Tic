import { PlayerStats } from "@shared/schema";

interface LeaderBoardProps {
  leaderboard: PlayerStats[];
}

export default function LeaderBoard({ leaderboard }: LeaderBoardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="font-poppins font-semibold text-xl text-primary mb-4">Leaderboard</h2>
      
      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No players yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-500">Rank</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-500">Player</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-500">W/L</th>
                <th className="px-2 py-2 text-left text-sm font-semibold text-gray-500">Win %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr key={player.id} className="border-b border-gray-100">
                  <td className="px-2 py-3 text-sm font-medium">{index + 1}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center">
                      <div className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold mr-2">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{player.username}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-sm">{player.wins}/{player.losses}</td>
                  <td className="px-2 py-3 text-sm">{player.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
