import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").unique(),
  rating: integer("rating").default(1200).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  gamesWon: integer("games_won").default(0).notNull(),
  gamesLost: integer("games_lost").default(0).notNull(),
  gamesTied: integer("games_tied").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  blackPlayerId: integer("black_player_id").notNull(),
  whitePlayerId: integer("white_player_id").notNull(),
  status: text("status").notNull().default("active"), // active, completed, abandoned
  winner: text("winner"), // black, white, draw, null if not completed
  blackScore: integer("black_score").default(2).notNull(),
  whiteScore: integer("white_score").default(2).notNull(),
  blackRatingChange: integer("black_rating_change"),
  whiteRatingChange: integer("white_rating_change"),
  moves: json("moves").$type<string[][]>().default([]).notNull(),
  currentTurn: text("current_turn").default("black").notNull(), // black or white
  board: json("board").$type<string[][]>().notNull(),
  validMoves: json("valid_moves").$type<{ row: number, col: number }[]>(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

// Game invitations
export const gameInvitations = pgTable("game_invitations", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, declined, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insertion schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  gamesPlayed: true,
  gamesWon: true,
  gamesLost: true,
  gamesTied: true,
  rating: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  startedAt: true,
  endedAt: true,
  blackRatingChange: true,
  whiteRatingChange: true,
});

export const insertGameInvitationSchema = createInsertSchema(gameInvitations).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertGameInvitation = z.infer<typeof insertGameInvitationSchema>;
export type GameInvitation = typeof gameInvitations.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Game-related types
export type GamePiece = "black" | "white" | "empty";
export type GameBoard = GamePiece[][];
export type GameMove = { row: number; col: number; player: "black" | "white" };
export type GameStatus = "active" | "completed" | "abandoned";
export type GameWinner = "black" | "white" | "draw" | null;

// WebSocket message types
export type WSMessage = {
  type: string;
  payload: any;
};

export type WSGameState = {
  gameId: number;
  board: GameBoard;
  currentTurn: "black" | "white";
  blackScore: number;
  whiteScore: number;
  blackPlayer: User;
  whitePlayer: User;
  validMoves: { row: number; col: number }[];
  moves: { position: string; player: "black" | "white" }[];
  status: GameStatus;
  winner: GameWinner;
};
