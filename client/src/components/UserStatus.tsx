import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";

interface UserStatusProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function UserStatus({ user, onLogin, onLogout }: UserStatusProps) {
  if (!user) {
    return (
      <div>
        <Button 
          onClick={onLogin} 
          className="bg-secondary hover:bg-opacity-80 text-white px-4 py-2 rounded-md font-medium transition"
        >
          Sign In
        </Button>
      </div>
    );
  }
  
  // Get first letter of username for the avatar
  const initial = user.username.charAt(0).toUpperCase();
  
  return (
    <div className="flex items-center">
      <div className="bg-white text-primary rounded-full h-10 w-10 flex items-center justify-center font-bold mr-3">
        {initial}
      </div>
      <div className="mr-4">
        <p className="font-medium">{user.username}</p>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
          <span className="text-xs text-gray-200">Online</span>
        </div>
      </div>
      <button 
        onClick={onLogout} 
        className="text-secondary hover:underline text-sm"
      >
        Log out
      </button>
    </div>
  );
}
