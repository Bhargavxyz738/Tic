import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './use-websocket';
import { useToast } from './use-toast';
import { GameState, User, PlayerStats } from '@shared/schema';

export function useGame() {
  const { isConnected, sendMessage, addMessageHandler } = useWebSocket();
  const { toast } = useToast();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<{ id: number; username: string; inGame: boolean }[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGameResultModalOpen, setIsGameResultModalOpen] = useState(false);
  
  // Authenticate with the WebSocket server
  const authenticate = useCallback((userId: number, username: string) => {
    if (isConnected) {
      sendMessage('authenticate', { userId, username });
    }
  }, [isConnected, sendMessage]);
  
  // Login handler
  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Authenticate with WebSocket
      authenticate(userData.id, userData.username);
      
      setIsLoginModalOpen(false);
      return true;
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return false;
    }
  }, [authenticate, toast]);
  
  // Register handler
  const handleRegister = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Authenticate with WebSocket
      authenticate(userData.id, userData.username);
      
      setIsLoginModalOpen(false);
      return true;
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return false;
    }
  }, [authenticate, toast]);
  
  // Logout handler
  const handleLogout = useCallback(() => {
    setUser(null);
    setGameState(null);
    localStorage.removeItem('user');
  }, []);
  
  // Game actions
  const createNewGame = useCallback(() => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You must be logged in to create a game",
        variant: "destructive",
      });
      setIsLoginModalOpen(true);
      return;
    }
    
    sendMessage('createGame');
  }, [user, sendMessage, toast]);
  
  const joinGame = useCallback((gameId: number) => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You must be logged in to join a game",
        variant: "destructive",
      });
      setIsLoginModalOpen(true);
      return;
    }
    
    sendMessage('joinGame', { gameId });
  }, [user, sendMessage, toast]);
  
  const makeMove = useCallback((cellIndex: number) => {
    if (!gameState) return;
    
    sendMessage('makeMove', { 
      gameId: gameState.id, 
      cellIndex 
    });
  }, [gameState, sendMessage]);
  
  const resignGame = useCallback(() => {
    if (!gameState) return;
    
    if (confirm('Are you sure you want to resign this game?')) {
      sendMessage('resignGame', { gameId: gameState.id });
    }
  }, [gameState, sendMessage]);
  
  // WS message handlers
  useEffect(() => {
    if (!isConnected) return;
    
    const handlers = [
      addMessageHandler('userInfo', (data) => {
        setUser(data);
      }),
      
      addMessageHandler('gameStateUpdate', (data) => {
        setGameState(data);
        
        // Show game result modal when game is completed
        if (data.status === 'completed' && !isGameResultModalOpen) {
          setIsGameResultModalOpen(true);
        }
      }),
      
      addMessageHandler('onlinePlayers', (data) => {
        setOnlinePlayers(data);
      }),
      
      addMessageHandler('matchHistory', (data) => {
        setMatchHistory(data);
      }),
      
      addMessageHandler('leaderboardUpdate', (data) => {
        setLeaderboard(data);
      }),
      
      addMessageHandler('error', (message) => {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      })
    ];
    
    // Clean up all handlers on unmount
    return () => {
      handlers.forEach(removeHandler => removeHandler());
    };
  }, [isConnected, addMessageHandler, toast, isGameResultModalOpen]);
  
  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Authenticate with WebSocket if connected
        if (isConnected) {
          authenticate(userData.id, userData.username);
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [isConnected, authenticate]);
  
  return {
    user,
    gameState,
    onlinePlayers,
    matchHistory,
    leaderboard,
    isConnected,
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
  };
}
