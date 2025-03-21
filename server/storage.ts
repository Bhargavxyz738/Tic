import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame, type UpdateGame,
  type PlayerStats
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: number, outcome: 'win' | 'loss' | 'draw'): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getLeaderboard(limit?: number): Promise<PlayerStats[]>;
  
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  updateGame(id: number, updates: Partial<UpdateGame>): Promise<Game>;
  getGamesByUserId(userId: number, limit?: number): Promise<Game[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private userIdCounter: number;
  private gameIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      wins: 0, 
      losses: 0, 
      draws: 0 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStats(userId: number, outcome: 'win' | 'loss' | 'draw'): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);

    const updatedUser = { ...user };
    
    if (outcome === 'win') {
      updatedUser.wins += 1;
    } else if (outcome === 'loss') {
      updatedUser.losses += 1;
    } else if (outcome === 'draw') {
      updatedUser.draws += 1;
    }

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getLeaderboard(limit: number = 100): Promise<PlayerStats[]> {
    const allUsers = await this.getAllUsers();
    
    const leaderboard = allUsers.map(user => {
      const totalGames = user.wins + user.losses + user.draws;
      const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;
      
      return {
        id: user.id,
        username: user.username,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        winRate
      };
    });
    
    // Sort by win rate descending, then by total wins
    return leaderboard
      .sort((a, b) => {
        if (b.winRate === a.winRate) {
          return b.wins - a.wins;
        }
        return b.winRate - a.winRate;
      })
      .slice(0, limit);
  }

  // Game methods
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const now = new Date();
    
    const game: Game = {
      ...insertGame,
      id,
      boardState: JSON.stringify(Array(9).fill(null)),
      winnerId: null,
      isDraw: false,
      moves: 0,
      createdAt: now,
      completedAt: null
    };
    
    this.games.set(id, game);
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async updateGame(id: number, updates: Partial<UpdateGame>): Promise<Game> {
    const game = await this.getGame(id);
    if (!game) throw new Error(`Game with ID ${id} not found`);
    
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async getGamesByUserId(userId: number, limit: number = 10): Promise<Game[]> {
    const userGames = Array.from(this.games.values())
      .filter(game => game.playerXId === userId || game.playerOId === userId)
      .sort((a, b) => {
        const dateA = a.completedAt || a.createdAt;
        const dateB = b.completedAt || b.createdAt;
        return dateB.getTime() - dateA.getTime();
      });
    
    return userGames.slice(0, limit);
  }
}

export const storage = new MemStorage();
