import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  playerXId: integer("player_x_id").notNull(),
  playerOId: integer("player_o_id").notNull(),
  winnerId: integer("winner_id"),
  isDraw: boolean("is_draw").notNull().default(false),
  boardState: text("board_state").notNull(),
  moves: integer("moves").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertGameSchema = createInsertSchema(games).pick({
  playerXId: true,
  playerOId: true,
});

export const updateGameSchema = createInsertSchema(games).pick({
  winnerId: true,
  isDraw: true,
  boardState: true,
  moves: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type UpdateGame = z.infer<typeof updateGameSchema>;

// Game state types for WebSocket communication
export type GameState = {
  id: number;
  board: string[];
  currentPlayer: "X" | "O";
  playerX: User;
  playerO: User | null;
  winner: User | null;
  isDraw: boolean;
  moves: number;
  status: "waiting" | "in_progress" | "completed";
};

export type PlayerStats = {
  id: number;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
};

export type WsMessage = {
  type: string;
  payload?: any;
};
