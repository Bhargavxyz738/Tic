import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertGameSchema, 
  updateGameSchema,
  type GameState,
  type WsMessage
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

type ClientData = {
  userId?: number;
  username?: string;
};

type ConnectedClient = {
  ws: WebSocket;
  data: ClientData;
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: ConnectedClient[] = [];
  const activeGames: Map<number, GameState> = new Map();
  
  // Helper to find active games for a user
  const findUserActiveGame = (userId: number): GameState | undefined => {
    return Array.from(activeGames.values()).find(game => 
      (game.playerX?.id === userId || game.playerO?.id === userId) && 
      game.status !== 'completed'
    );
  };
  
  // Helper to broadcast to all clients
  const broadcast = (message: WsMessage, excludeClient?: WebSocket) => {
    clients.forEach(client => {
      if (client.ws !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  };
  
  // Helper to send to specific user
  const sendToUser = (userId: number, message: WsMessage) => {
    const client = clients.find(c => c.data.userId === userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  };
  
  // Check for win
  const checkWin = (board: string[]): boolean => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    return winPatterns.some(pattern => {
      const [a, b, c] = pattern;
      return Boolean(board[a] && board[a] === board[b] && board[a] === board[c]);
    });
  };
  
  // Broadcast updated state of a game
  const updateGameState = async (gameId: number) => {
    const gameState = activeGames.get(gameId);
    if (!gameState) return;
    
    // Send to both players
    if (gameState.playerX) {
      sendToUser(gameState.playerX.id, { 
        type: 'gameStateUpdate', 
        payload: gameState 
      });
    }
    
    if (gameState.playerO) {
      sendToUser(gameState.playerO.id, { 
        type: 'gameStateUpdate', 
        payload: gameState 
      });
    }
    
    // Also update online players for everyone
    broadcastOnlinePlayers();
  };
  
  // Update and broadcast online players
  const broadcastOnlinePlayers = async () => {
    const onlinePlayers = clients
      .filter(client => client.data.userId && client.ws.readyState === WebSocket.OPEN)
      .map(client => ({
        id: client.data.userId,
        username: client.data.username,
        inGame: Boolean(findUserActiveGame(client.data.userId!))
      }));
    
    broadcast({ type: 'onlinePlayers', payload: onlinePlayers });
  };
  
  // Handle end of game
  const endGame = async (gameId: number, isDraw: boolean, winnerId?: number) => {
    const gameState = activeGames.get(gameId);
    if (!gameState || gameState.status === 'completed') return;
    
    gameState.status = 'completed';
    gameState.isDraw = isDraw;
    
    if (winnerId && (gameState.playerX.id === winnerId || (gameState.playerO && gameState.playerO.id === winnerId))) {
      gameState.winner = winnerId === gameState.playerX.id ? gameState.playerX : gameState.playerO;
    }
    
    // Update game in database
    await storage.updateGame(gameId, {
      isDraw,
      winnerId: winnerId || null,
      boardState: JSON.stringify(gameState.board),
      moves: gameState.moves,
      completedAt: new Date()
    });
    
    // Update player stats
    if (isDraw) {
      await storage.updateUserStats(gameState.playerX.id, 'draw');
      if (gameState.playerO) {
        await storage.updateUserStats(gameState.playerO.id, 'draw');
      }
    } else if (winnerId) {
      const loserId = winnerId === gameState.playerX.id 
        ? gameState.playerO?.id 
        : gameState.playerX.id;
      
      await storage.updateUserStats(winnerId, 'win');
      if (loserId) {
        await storage.updateUserStats(loserId, 'loss');
      }
    }
    
    // Update and broadcast game state one last time
    updateGameState(gameId);
    
    // Update leaderboard
    const leaderboard = await storage.getLeaderboard(10);
    broadcast({ type: 'leaderboardUpdate', payload: leaderboard });
  };
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    // Add new client
    const clientConnection: ConnectedClient = { ws, data: {} };
    clients.push(clientConnection);
    
    ws.on('message', async (message) => {
      try {
        const data: WsMessage = JSON.parse(message.toString());
        const { type, payload } = data;
        
        switch (type) {
          case 'authenticate': {
            const { userId, username } = payload;
            clientConnection.data = { userId, username };
            
            // Send initial data to the client
            const user = await storage.getUser(userId);
            if (user) {
              // Send user info
              ws.send(JSON.stringify({ 
                type: 'userInfo', 
                payload: user 
              }));
              
              // Send match history
              const matchHistory = await storage.getGamesByUserId(userId);
              const formattedHistory = await Promise.all(matchHistory.map(async (game) => {
                const playerX = await storage.getUser(game.playerXId);
                const playerO = await storage.getUser(game.playerOId);
                return {
                  ...game,
                  playerX,
                  playerO,
                  board: JSON.parse(game.boardState),
                };
              }));
              
              ws.send(JSON.stringify({ 
                type: 'matchHistory', 
                payload: formattedHistory 
              }));
              
              // Check if user is in an active game
              const userGame = findUserActiveGame(userId);
              if (userGame) {
                ws.send(JSON.stringify({ 
                  type: 'gameStateUpdate', 
                  payload: userGame 
                }));
              }
              
              // Send leaderboard
              const leaderboard = await storage.getLeaderboard(10);
              ws.send(JSON.stringify({ 
                type: 'leaderboardUpdate', 
                payload: leaderboard 
              }));
              
              // Broadcast updated online players
              broadcastOnlinePlayers();
            }
            break;
          }
          
          case 'createGame': {
            if (!clientConnection.data.userId) break;
            
            // Check if player is already in a game
            const existingGame = findUserActiveGame(clientConnection.data.userId);
            if (existingGame) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'You are already in a game' 
              }));
              break;
            }
            
            const player = await storage.getUser(clientConnection.data.userId);
            if (!player) break;
            
            // Create a new game in the database
            const newGame = await storage.createGame({
              playerXId: player.id,
              playerOId: player.id, // Temporary, will be updated when someone joins
            });
            
            // Create game state
            const gameState: GameState = {
              id: newGame.id,
              board: Array(9).fill(null),
              currentPlayer: 'X',
              playerX: player,
              playerO: null,
              winner: null,
              isDraw: false,
              moves: 0,
              status: 'waiting'
            };
            
            activeGames.set(newGame.id, gameState);
            
            // Send game state to creator
            ws.send(JSON.stringify({ 
              type: 'gameStateUpdate', 
              payload: gameState 
            }));
            
            // Update online players
            broadcastOnlinePlayers();
            break;
          }
          
          case 'joinGame': {
            if (!clientConnection.data.userId) break;
            
            const { gameId } = payload;
            const gameState = activeGames.get(gameId);
            
            // Check if game exists and is waiting for player
            if (!gameState || gameState.status !== 'waiting') {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'Game not available to join' 
              }));
              break;
            }
            
            // Check if player is trying to join their own game
            if (gameState.playerX.id === clientConnection.data.userId) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'You cannot join your own game' 
              }));
              break;
            }
            
            const player = await storage.getUser(clientConnection.data.userId);
            if (!player) break;
            
            // Update game state
            gameState.playerO = player;
            gameState.status = 'in_progress';
            
            // Update game in database
            await storage.updateGame(gameId, {
              playerOId: player.id
            });
            
            // Broadcast updated game state to both players
            updateGameState(gameId);
            break;
          }
          
          case 'makeMove': {
            if (!clientConnection.data.userId) break;
            
            const { gameId, cellIndex } = payload;
            const gameState = activeGames.get(gameId);
            
            // Check if game exists and is in progress
            if (!gameState || gameState.status !== 'in_progress') {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'Invalid game state' 
              }));
              break;
            }
            
            // Check if it's the player's turn
            const isPlayerX = gameState.playerX.id === clientConnection.data.userId;
            const isPlayerO = gameState.playerO && gameState.playerO.id === clientConnection.data.userId;
            
            if ((!isPlayerX && !isPlayerO) || 
                (isPlayerX && gameState.currentPlayer !== 'X') || 
                (isPlayerO && gameState.currentPlayer !== 'O')) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'Not your turn' 
              }));
              break;
            }
            
            // Check if the cell is empty
            if (gameState.board[cellIndex] !== null || cellIndex < 0 || cellIndex > 8) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'Invalid move' 
              }));
              break;
            }
            
            // Make the move
            gameState.board[cellIndex] = gameState.currentPlayer;
            gameState.moves++;
            
            // Check for win
            if (checkWin(gameState.board)) {
              // Game won by current player
              endGame(
                gameId, 
                false, 
                gameState.currentPlayer === 'X' ? gameState.playerX.id : gameState.playerO!.id
              );
              break;
            }
            
            // Check for draw
            if (gameState.moves === 9) {
              // Game is a draw
              endGame(gameId, true);
              break;
            }
            
            // Switch player
            gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
            
            // Update game state in database and broadcast
            await storage.updateGame(gameId, {
              boardState: JSON.stringify(gameState.board),
              moves: gameState.moves
            });
            
            updateGameState(gameId);
            break;
          }
          
          case 'resignGame': {
            if (!clientConnection.data.userId) break;
            
            const { gameId } = payload;
            const gameState = activeGames.get(gameId);
            
            // Check if game exists and is in progress
            if (!gameState || gameState.status !== 'in_progress') {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'Cannot resign - game not in progress' 
              }));
              break;
            }
            
            // Check if player is in the game
            const isPlayerX = gameState.playerX.id === clientConnection.data.userId;
            const isPlayerO = gameState.playerO && gameState.playerO.id === clientConnection.data.userId;
            
            if (!isPlayerX && !isPlayerO) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                payload: 'You are not part of this game' 
              }));
              break;
            }
            
            // End game, other player wins
            const winnerId = isPlayerX ? gameState.playerO!.id : gameState.playerX.id;
            endGame(gameId, false, winnerId);
            break;
          }
        }
      } catch (err) {
        console.error('Error processing message:', err);
        ws.send(JSON.stringify({ 
          type: 'error', 
          payload: 'Error processing message' 
        }));
      }
    });
    
    ws.on('close', () => {
      // Remove client from clients array
      const index = clients.findIndex(client => client.ws === ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
      
      // Update online players list
      broadcastOnlinePlayers();
    });
  });
  
  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create user
      const newUser = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating user' });
    }
  });
  
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Error during login' });
    }
  });
  
  // User routes
  app.get('/api/users/leaderboard', async (_req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching leaderboard' });
    }
  });
  
  // Game history routes
  app.get('/api/games/history/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const gameHistory = await storage.getGamesByUserId(userId);
      
      // Format the response
      const formattedHistory = await Promise.all(gameHistory.map(async (game) => {
        const playerX = await storage.getUser(game.playerXId);
        const playerO = await storage.getUser(game.playerOId);
        return {
          ...game,
          playerX,
          playerO,
          board: JSON.parse(game.boardState),
        };
      }));
      
      res.status(200).json(formattedHistory);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching game history' });
    }
  });
  
  return httpServer;
}
