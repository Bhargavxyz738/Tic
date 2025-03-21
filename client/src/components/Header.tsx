import { GamepadIcon } from "lucide-react";
import UserStatus from "./UserStatus";
import { User } from "@shared/schema";

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ user, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <GamepadIcon className="h-6 w-6 mr-2" />
          <h1 className="font-poppins font-bold text-2xl">Tic Tac Toe</h1>
        </div>
        
        <UserStatus 
          user={user} 
          onLogin={onLogin} 
          onLogout={onLogout} 
        />
      </div>
    </header>
  );
}
