import { 
  users, type User, type InsertUser, 
  games, type Game, type InsertGame, 
  gameInvitations, type GameInvitation, type InsertGameInvitation,
  chatMessages, type ChatMessage, type InsertChatMessage,
  type GameBoard, type GamePiece, type GameStatus, type GameWinner
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRating(userId: number, newRating: number): Promise<User | undefined>;
  updateUserStats(userId: number, won: boolean, tied: boolean): Promise<User | undefined>;
  getTopRatedUsers(limit: number): Promise<User[]>;
  
  // Game operations
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGameBoard(gameId: number, board: GameBoard, currentTurn: "black" | "white", validMoves: { row: number, col: number }[]): Promise<Game | undefined>;
  updateGameScore(gameId: number, blackScore: number, whiteScore: number): Promise<Game | undefined>;
  addGameMove(gameId: number, move: string[]): Promise<Game | undefined>;
  completeGame(gameId: number, winner: GameWinner, blackScore: number, whiteScore: number, blackRatingChange: number, whiteRatingChange: number): Promise<Game | undefined>;
  getActiveGameByPlayerId(userId: number): Promise<Game | undefined>;
  getGameHistory(userId: number, limit: number): Promise<Game[]>;
  
  // Game Invitation operations
  createGameInvitation(invitation: InsertGameInvitation): Promise<GameInvitation>;
  getGameInvitationsByUser(userId: number): Promise<GameInvitation[]>;
  updateGameInvitationStatus(invitationId: number, status: string): Promise<GameInvitation | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByGame(gameId: number): Promise<ChatMessage[]>;
}

// Initial board setup for Reversi - creates a standard 8x8 board with starting pieces
function createInitialBoard(): GameBoard {
  const board: GameBoard = Array(8).fill(null).map(() => Array(8).fill("empty"));
  
  // Place the initial 4 pieces in the center
  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";
  
  return board;
}

// Calculate valid moves for a player
function getValidMoves(board: GameBoard, player: "black" | "white"): { row: number; col: number }[] {
  const opponent = player === "black" ? "white" : "black";
  const validMoves: { row: number; col: number }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] !== "empty") continue;
      
      // Check in all 8 directions
      const directions = [
        { dr: -1, dc: 0 },  // up
        { dr: -1, dc: 1 },  // up-right
        { dr: 0, dc: 1 },   // right
        { dr: 1, dc: 1 },   // down-right
        { dr: 1, dc: 0 },   // down
        { dr: 1, dc: -1 },  // down-left
        { dr: 0, dc: -1 },  // left
        { dr: -1, dc: -1 }  // up-left
      ];
      
      for (const dir of directions) {
        let r = row + dir.dr;
        let c = col + dir.dc;
        let foundOpponent = false;
        
        // Check if there's at least one opponent piece in this direction
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          if (board[r][c] === opponent) {
            foundOpponent = true;
          } else if (board[r][c] === player && foundOpponent) {
            // Found a valid move
            validMoves.push({ row, col });
            break;
          } else {
            // Empty cell or player's piece without opponent pieces in between
            break;
          }
          
          r += dir.dr;
          c += dir.dc;
        }
        
        if (foundOpponent && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
          break; // Already added this move
        }
      }
    }
  }
  
  return validMoves;
}

// Calculate scores from the board
function calculateScores(board: GameBoard): { blackScore: number; whiteScore: number } {
  let blackScore = 0;
  let whiteScore = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === "black") blackScore++;
      if (board[row][col] === "white") whiteScore++;
    }
  }
  
  return { blackScore, whiteScore };
}

// Make a move and update the board
function makeMove(board: GameBoard, row: number, col: number, player: "black" | "white"): GameBoard {
  const newBoard = board.map(r => [...r]);
  const opponent = player === "black" ? "white" : "black";
  
  // Place the player's piece
  newBoard[row][col] = player;
  
  // Check in all 8 directions
  const directions = [
    { dr: -1, dc: 0 },  // up
    { dr: -1, dc: 1 },  // up-right
    { dr: 0, dc: 1 },   // right
    { dr: 1, dc: 1 },   // down-right
    { dr: 1, dc: 0 },   // down
    { dr: 1, dc: -1 },  // down-left
    { dr: 0, dc: -1 },  // left
    { dr: -1, dc: -1 }  // up-left
  ];
  
  for (const dir of directions) {
    let r = row + dir.dr;
    let c = col + dir.dc;
    const piecesToFlip: { r: number, c: number }[] = [];
    
    // Find opponent pieces to flip
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && newBoard[r][c] === opponent) {
      piecesToFlip.push({ r, c });
      r += dir.dr;
      c += dir.dc;
    }
    
    // If we found the player's piece at the end, flip all opponent pieces
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && newBoard[r][c] === player && piecesToFlip.length > 0) {
      for (const piece of piecesToFlip) {
        newBoard[piece.r][piece.c] = player;
      }
    }
  }
  
  return newBoard;
}

// Calculate ELO rating change
function calculateRatingChange(playerRating: number, opponentRating: number, result: number): number {
  const kFactor = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(kFactor * (result - expectedScore));
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private gameInvitations: Map<number, GameInvitation>;
  private chatMessages: Map<number, ChatMessage>;
  private userIdCounter: number;
  private gameIdCounter: number;
  private invitationIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.gameInvitations = new Map();
    this.chatMessages = new Map();
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.invitationIdCounter = 1;
    this.messageIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === uid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      rating: 1200, 
      gamesPlayed: 0, 
      gamesWon: 0, 
      gamesLost: 0, 
      gamesTied: 0, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserRating(userId: number, newRating: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, rating: newRating };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStats(userId: number, won: boolean, tied: boolean): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: won ? user.gamesWon + 1 : user.gamesWon,
      gamesLost: !won && !tied ? user.gamesLost + 1 : user.gamesLost,
      gamesTied: tied ? user.gamesTied + 1 : user.gamesTied
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getTopRatedUsers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Game operations
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const now = new Date();
    
    const initialBoard = createInitialBoard();
    const validMoves = getValidMoves(initialBoard, "black"); // Black goes first
    
    const game: Game = {
      ...insertGame,
      id,
      startedAt: now,
      endedAt: null,
      blackRatingChange: null,
      whiteRatingChange: null,
      board: initialBoard,
      blackScore: 2,
      whiteScore: 2,
      currentTurn: "black",
      validMoves,
      moves: [],
      status: "active",
      winner: null
    };
    
    this.games.set(id, game);
    return game;
  }

  async updateGameBoard(gameId: number, board: GameBoard, currentTurn: "black" | "white", validMoves: { row: number, col: number }[]): Promise<Game | undefined> {
    const game = this.games.get(gameId);
    if (!game) return undefined;
    
    const scores = calculateScores(board);
    
    const updatedGame = { 
      ...game, 
      board, 
      currentTurn, 
      validMoves,
      blackScore: scores.blackScore,
      whiteScore: scores.whiteScore
    };
    
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  async updateGameScore(gameId: number, blackScore: number, whiteScore: number): Promise<Game | undefined> {
    const game = this.games.get(gameId);
    if (!game) return undefined;
    
    const updatedGame = { ...game, blackScore, whiteScore };
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  async addGameMove(gameId: number, move: string[]): Promise<Game | undefined> {
    const game = this.games.get(gameId);
    if (!game) return undefined;
    
    const updatedMoves = [...game.moves, move];
    const updatedGame = { ...game, moves: updatedMoves };
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  async completeGame(
    gameId: number, 
    winner: GameWinner, 
    blackScore: number, 
    whiteScore: number, 
    blackRatingChange: number, 
    whiteRatingChange: number
  ): Promise<Game | undefined> {
    const game = this.games.get(gameId);
    if (!game) return undefined;
    
    const now = new Date();
    const updatedGame = { 
      ...game, 
      status: "completed" as GameStatus, 
      winner, 
      blackScore, 
      whiteScore, 
      blackRatingChange, 
      whiteRatingChange, 
      endedAt: now 
    };
    
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  async getActiveGameByPlayerId(userId: number): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(game => 
      (game.blackPlayerId === userId || game.whitePlayerId === userId) && 
      game.status === "active"
    );
  }

  async getGameHistory(userId: number, limit: number): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => 
        (game.blackPlayerId === userId || game.whitePlayerId === userId) && 
        game.status !== "active"
      )
      .sort((a, b) => {
        const dateA = a.endedAt || a.startedAt;
        const dateB = b.endedAt || b.startedAt;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  // Game Invitation operations
  async createGameInvitation(invitation: InsertGameInvitation): Promise<GameInvitation> {
    const id = this.invitationIdCounter++;
    const now = new Date();
    
    // Set expiration time to 24 hours from now
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const gameInvitation: GameInvitation = {
      ...invitation,
      id,
      createdAt: now,
      expiresAt
    };
    
    this.gameInvitations.set(id, gameInvitation);
    return gameInvitation;
  }

  async getGameInvitationsByUser(userId: number): Promise<GameInvitation[]> {
    return Array.from(this.gameInvitations.values())
      .filter(invitation => 
        (invitation.receiverId === userId || invitation.senderId === userId) && 
        invitation.status === "pending"
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateGameInvitationStatus(invitationId: number, status: string): Promise<GameInvitation | undefined> {
    const invitation = this.gameInvitations.get(invitationId);
    if (!invitation) return undefined;
    
    const updatedInvitation = { ...invitation, status };
    this.gameInvitations.set(invitationId, updatedInvitation);
    return updatedInvitation;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageIdCounter++;
    const now = new Date();
    
    const chatMessage: ChatMessage = {
      ...message,
      id,
      createdAt: now
    };
    
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getChatMessagesByGame(gameId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.gameId === gameId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
