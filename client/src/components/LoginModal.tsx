import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onRegister: (username: string, password: string) => Promise<boolean>;
}

export default function LoginModal({ isOpen, onClose, onLogin, onRegister }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoading(true);
    await onLogin(username, password);
    setIsLoading(false);
  };
  
  const handleRegister = async () => {
    if (!username || !password) return;
    
    setIsLoading(true);
    await onRegister(username, password);
    setIsLoading(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-poppins font-semibold text-xl text-primary">Sign In / Register</h2>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={handleRegister}
              className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md font-medium transition"
              disabled={isLoading}
            >
              Register
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-secondary hover:bg-opacity-80 text-white rounded-md font-medium transition"
              disabled={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
