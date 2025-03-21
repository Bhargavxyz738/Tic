import { User } from "@shared/schema";

interface PlayerInfoProps {
  playerX: User;
  playerO: User | null;
  playerXStats: string;
  playerOStats: string;
}

export default function PlayerInfo({ playerX, playerO, playerXStats, playerOStats }: PlayerInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Player X */}
      <div className="flex items-center p-4 bg-playerX bg-opacity-10 rounded-lg border-l-4 border-[#3498DB]">
        <div className="bg-[#3498DB] text-white rounded-full h-10 w-10 flex items-center justify-center font-bold mr-3">
          {playerX.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-poppins font-medium text-[#3498DB]">{playerX.username}</p>
          <p className="text-sm text-gray-600">{playerXStats}</p>
        </div>
      </div>
      
      {/* Player O */}
      <div className="flex items-center p-4 bg-playerO bg-opacity-10 rounded-lg border-l-4 border-[#2ECC71]">
        <div className="bg-[#2ECC71] text-white rounded-full h-10 w-10 flex items-center justify-center font-bold mr-3">
          {playerO ? playerO.username.charAt(0).toUpperCase() : "O"}
        </div>
        <div>
          <p className="font-poppins font-medium text-[#2ECC71]">
            {playerO ? playerO.username : "Waiting..."}
          </p>
          <p className="text-sm text-gray-600">
            {playerO ? playerOStats : "Join the game"}
          </p>
        </div>
      </div>
    </div>
  );
}
