import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertGameSchema, 
  insertGameInvitationSchema, 
  insertChatMessageSchema,
  type Game,
  type User,
  type WSMessage,
  type WSGameState
} from "@shared/schema";

// WebSocket clients map
const wsClients = new Map<number, WebSocket>();

// Active game sessions map
const activeGames = new Map<number, Set<WebSocket>>();

// Function to broadcast to all clients connected to a game
function broadcastToGame(gameId: number, message: WSMessage) {
  const gameClients = activeGames.get(gameId);
  if (!gameClients) return;
  
  gameClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Handles game logic when a move is made
async function handleGameMove(gameId: number, userId: number, row: number, col: number) {
  try {
    const game = await storage.getGame(gameId);
    if (!game) throw new Error("Game not found");
    
    if (game.status !== "active") throw new Error("Game is not active");
    
    // Check if it's the player's turn
    const isBlackPlayer = game.blackPlayerId === userId;
    const isWhitePlayer = game.whitePlayerId === userId;
    
    if ((!isBlackPlayer && !isWhitePlayer) || 
        (isBlackPlayer && game.currentTurn !== "black") ||
        (isWhitePlayer && game.currentTurn !== "white")) {
      throw new Error("Not your turn");
    }
    
    // Validate the move
    const isValidMove = game.validMoves?.some(move => move.row === row && move.col === col);
    if (!isValidMove) throw new Error("Invalid move");
    
    // Make the move and get the updated board
    const newBoard = storage.makeMove(game.board, row, col, game.currentTurn);
    
    // Switch turns
    const nextTurn = game.currentTurn === "black" ? "white" : "black";
    
    // Calculate valid moves for next player
    const validMoves = storage.getValidMoves(newBoard, nextTurn);
    
    // If no valid moves, check if the game is over or if the turn should be skipped
    if (validMoves.length === 0) {
      // Check if the other player has valid moves
      const validMovesForCurrent = storage.getValidMoves(newBoard, game.currentTurn);
      
      if (validMovesForCurrent.length === 0) {
        // Game is over - no valid moves for either player
        const scores = storage.calculateScores(newBoard);
        let winner: "black" | "white" | "draw" | null = null;
        
        if (scores.blackScore > scores.whiteScore) {
          winner = "black";
        } else if (scores.whiteScore > scores.blackScore) {
          winner = "white";
        } else {
          winner = "draw";
        }
        
        // Calculate rating changes
        const blackPlayer = await storage.getUser(game.blackPlayerId);
        const whitePlayer = await storage.getUser(game.whitePlayerId);
        
        if (!blackPlayer || !whitePlayer) throw new Error("Player not found");
        
        let blackRatingChange = 0;
        let whiteRatingChange = 0;
        
        if (winner === "black") {
          blackRatingChange = storage.calculateRatingChange(blackPlayer.rating, whitePlayer.rating, 1);
          whiteRatingChange = storage.calculateRatingChange(whitePlayer.rating, blackPlayer.rating, 0);
        } else if (winner === "white") {
          blackRatingChange = storage.calculateRatingChange(blackPlayer.rating, whitePlayer.rating, 0);
          whiteRatingChange = storage.calculateRatingChange(whitePlayer.rating, blackPlayer.rating, 1);
        } else {
          blackRatingChange = storage.calculateRatingChange(blackPlayer.rating, whitePlayer.rating, 0.5);
          whiteRatingChange = storage.calculateRatingChange(whitePlayer.rating, blackPlayer.rating, 0.5);
        }
        
        // Update player ratings
        await storage.updateUserRating(blackPlayer.id, blackPlayer.rating + blackRatingChange);
        await storage.updateUserRating(whitePlayer.id, whitePlayer.rating + whiteRatingChange);
        
        // Update player stats
        await storage.updateUserStats(blackPlayer.id, winner === "black", winner === "draw");
        await storage.updateUserStats(whitePlayer.id, winner === "white", winner === "draw");
        
        // Complete the game
        const updatedGame = await storage.completeGame(
          gameId, 
          winner, 
          scores.blackScore, 
          scores.whiteScore, 
          blackRatingChange, 
          whiteRatingChange
        );
        
        if (!updatedGame) throw new Error("Failed to update game");
        
        // Record the move
        const position = `${String.fromCharCode(97 + col)}${row + 1}`;
        await storage.addGameMove(gameId, [position, game.currentTurn]);
        
        // Get updated players
        const updatedBlackPlayer = await storage.getUser(game.blackPlayerId);
        const updatedWhitePlayer = await storage.getUser(game.whitePlayerId);
        
        if (!updatedBlackPlayer || !updatedWhitePlayer) throw new Error("Failed to get updated players");
        
        // Send game over notification
        broadcastToGame(gameId, {
          type: "GAME_OVER",
          payload: {
            gameId,
            board: newBoard,
            blackScore: scores.blackScore,
            whiteScore: scores.whiteScore,
            winner,
            blackRatingChange,
            whiteRatingChange,
            blackPlayer: updatedBlackPlayer,
            whitePlayer: updatedWhitePlayer
          }
        });
        
        return;
      } else {
        // Skip turn - current player goes again
        broadcastToGame(gameId, {
          type: "TURN_SKIPPED",
          payload: {
            gameId,
            message: `No valid moves for ${nextTurn}, ${game.currentTurn} goes again`,
            nextTurn: game.currentTurn
          }
        });
        
        // Update the board but keep the same turn
        const updatedGame = await storage.updateGameBoard(
          gameId,
          newBoard,
          game.currentTurn,
          validMovesForCurrent
        );
        
        if (!updatedGame) throw new Error("Failed to update game");
        
        // Record the move
        const position = `${String.fromCharCode(97 + col)}${row + 1}`;
        await storage.addGameMove(gameId, [position, game.currentTurn]);
        
        return;
      }
    }
    
    // Update the game
    const updatedGame = await storage.updateGameBoard(gameId, newBoard, nextTurn, validMoves);
    
    if (!updatedGame) throw new Error("Failed to update game");
    
    // Record the move
    const position = `${String.fromCharCode(97 + col)}${row + 1}`;
    await storage.addGameMove(gameId, [position, game.currentTurn]);
    
    // Get players
    const blackPlayer = await storage.getUser(game.blackPlayerId);
    const whitePlayer = await storage.getUser(game.whitePlayerId);
    
    if (!blackPlayer || !whitePlayer) throw new Error("Player not found");
    
    // Broadcast updated game state
    broadcastToGame(gameId, {
      type: "GAME_UPDATED",
      payload: {
        gameId,
        board: newBoard,
        currentTurn: nextTurn,
        blackScore: updatedGame.blackScore,
        whiteScore: updatedGame.whiteScore,
        blackPlayer,
        whitePlayer,
        validMoves,
        lastMove: { row, col, player: game.currentTurn },
        status: "active",
        winner: null
      } as WSGameState
    });
    
  } catch (error) {
    console.error("Error handling game move:", error);
    // Send error to the client who made the move
    const client = wsClients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "ERROR",
        payload: {
          message: error instanceof Error ? error.message : "An error occurred"
        }
      }));
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    let userId: number | null = null;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString()) as WSMessage;
        
        switch (data.type) {
          case 'AUTH':
            // Authenticate the WebSocket connection
            const authUserId = data.payload.userId;
            
            if (!authUserId) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Authentication failed: User ID is required' }
              }));
              return;
            }
            
            const user = await storage.getUser(authUserId);
            if (!user) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Authentication failed: User not found' }
              }));
              return;
            }
            
            // Assign the user ID to this connection
            userId = authUserId;
            wsClients.set(userId, ws);
            
            ws.send(JSON.stringify({
              type: 'AUTH_SUCCESS',
              payload: { userId, message: 'Successfully authenticated' }
            }));
            break;
            
          case 'JOIN_GAME':
            if (!userId) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Not authenticated' }
              }));
              return;
            }
            
            const gameId = data.payload.gameId;
            const game = await storage.getGame(gameId);
            
            if (!game) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Game not found' }
              }));
              return;
            }
            
            // Check if user is a player in this game
            if (game.blackPlayerId !== userId && game.whitePlayerId !== userId) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'You are not a player in this game' }
              }));
              return;
            }
            
            // Add client to the game room
            if (!activeGames.has(gameId)) {
              activeGames.set(gameId, new Set());
            }
            activeGames.get(gameId)?.add(ws);
            
            // Get players
            const blackPlayer = await storage.getUser(game.blackPlayerId);
            const whitePlayer = await storage.getUser(game.whitePlayerId);
            
            if (!blackPlayer || !whitePlayer) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Player data not found' }
              }));
              return;
            }
            
            // Chat messages for this game
            const chatMessages = await storage.getChatMessagesByGame(gameId);
            
            // Send initial game state
            ws.send(JSON.stringify({
              type: 'GAME_STATE',
              payload: {
                gameId,
                board: game.board,
                currentTurn: game.currentTurn,
                blackScore: game.blackScore,
                whiteScore: game.whiteScore,
                blackPlayer,
                whitePlayer,
                validMoves: game.validMoves,
                moves: game.moves.map((move, index) => ({
                  position: move[0],
                  player: move[1] as "black" | "white"
                })),
                status: game.status,
                winner: game.winner,
                chatMessages
              } as WSGameState
            }));
            break;
            
          case 'MAKE_MOVE':
            if (!userId) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Not authenticated' }
              }));
              return;
            }
            
            const moveGameId = data.payload.gameId;
            const row = data.payload.row;
            const col = data.payload.col;
            
            await handleGameMove(moveGameId, userId, row, col);
            break;
            
          case 'SEND_CHAT':
            if (!userId) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Not authenticated' }
              }));
              return;
            }
            
            const chatGameId = data.payload.gameId;
            const chatMessage = data.payload.message;
            
            // Store the message
            const newMessage = await storage.createChatMessage({
              gameId: chatGameId,
              userId,
              message: chatMessage
            });
            
            // Get user data
            const chatUser = await storage.getUser(userId);
            
            if (!chatUser) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'User not found' }
              }));
              return;
            }
            
            // Broadcast to all clients in the game
            broadcastToGame(chatGameId, {
              type: 'CHAT_MESSAGE',
              payload: {
                message: newMessage,
                user: chatUser
              }
            });
            break;
            
          case 'RESIGN':
            if (!userId) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Not authenticated' }
              }));
              return;
            }
            
            const resignGameId = data.payload.gameId;
            const game2 = await storage.getGame(resignGameId);
            
            if (!game2) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Game not found' }
              }));
              return;
            }
            
            // Check if user is a player in this game
            if (game2.blackPlayerId !== userId && game2.whitePlayerId !== userId) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'You are not a player in this game' }
              }));
              return;
            }
            
            // Determine winner
            const winner = game2.blackPlayerId === userId ? "white" : "black";
            
            // Get players
            const blackPlayer2 = await storage.getUser(game2.blackPlayerId);
            const whitePlayer2 = await storage.getUser(game2.whitePlayerId);
            
            if (!blackPlayer2 || !whitePlayer2) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Player data not found' }
              }));
              return;
            }
            
            // Calculate rating changes
            const winResult = winner === "black" ? 1 : 0;
            const blackRatingChange = storage.calculateRatingChange(blackPlayer2.rating, whitePlayer2.rating, winResult);
            const whiteRatingChange = storage.calculateRatingChange(whitePlayer2.rating, blackPlayer2.rating, 1 - winResult);
            
            // Update player ratings
            await storage.updateUserRating(blackPlayer2.id, blackPlayer2.rating + blackRatingChange);
            await storage.updateUserRating(whitePlayer2.id, whitePlayer2.rating + whiteRatingChange);
            
            // Update player stats
            await storage.updateUserStats(blackPlayer2.id, winner === "black", false);
            await storage.updateUserStats(whitePlayer2.id, winner === "white", false);
            
            // Complete the game
            await storage.completeGame(
              resignGameId,
              winner,
              game2.blackScore,
              game2.whiteScore,
              blackRatingChange,
              whiteRatingChange
            );
            
            // Get updated players
            const updatedBlackPlayer = await storage.getUser(game2.blackPlayerId);
            const updatedWhitePlayer = await storage.getUser(game2.whitePlayerId);
            
            if (!updatedBlackPlayer || !updatedWhitePlayer) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Failed to get updated players' }
              }));
              return;
            }
            
            // Broadcast game over
            broadcastToGame(resignGameId, {
              type: 'GAME_OVER',
              payload: {
                gameId: resignGameId,
                board: game2.board,
                blackScore: game2.blackScore,
                whiteScore: game2.whiteScore,
                winner,
                blackRatingChange,
                whiteRatingChange,
                blackPlayer: updatedBlackPlayer,
                whitePlayer: updatedWhitePlayer,
                resigned: true,
                resignedBy: userId === game2.blackPlayerId ? "black" : "white"
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'ERROR',
          payload: { message: 'Invalid message format' }
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (userId) {
        wsClients.delete(userId);
        
        // Remove from all game rooms
        for (const [gameId, clients] of activeGames.entries()) {
          clients.delete(ws);
          if (clients.size === 0) {
            activeGames.delete(gameId);
          }
        }
      }
    });
  });
  
  // API routes
  // User routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with this firebaseUid already exists
      if (userData.firebaseUid) {
        const existingUser = await storage.getUserByFirebaseUid(userData.firebaseUid);
        if (existingUser) {
          return res.status(200).json(existingUser);
        }
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
  
  app.get('/api/users/me', async (req: Request, res: Response) => {
    try {
      const firebaseUid = req.query.firebaseUid as string;
      if (!firebaseUid) {
        return res.status(400).json({ message: 'Firebase UID is required' });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/leaderboard', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topUsers = await storage.getTopRatedUsers(limit);
      res.status(200).json(topUsers);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Game routes
  app.post('/api/games', async (req: Request, res: Response) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      
      // Check if both players exist
      const blackPlayer = await storage.getUser(gameData.blackPlayerId);
      const whitePlayer = await storage.getUser(gameData.whitePlayerId);
      
      if (!blackPlayer || !whitePlayer) {
        return res.status(400).json({ message: 'One or both players not found' });
      }
      
      // Check if either player is already in an active game
      const blackActiveGame = await storage.getActiveGameByPlayerId(gameData.blackPlayerId);
      const whiteActiveGame = await storage.getActiveGameByPlayerId(gameData.whitePlayerId);
      
      if (blackActiveGame || whiteActiveGame) {
        return res.status(400).json({ message: 'One or both players already in an active game' });
      }
      
      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
  
  app.get('/api/games/:id', async (req: Request, res: Response) => {
    try {
      const gameId = parseInt(req.params.id);
      if (isNaN(gameId)) {
        return res.status(400).json({ message: 'Invalid game ID' });
      }
      
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.status(200).json(game);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/users/:id/games', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const games = await storage.getGameHistory(userId, limit);
      
      res.status(200).json(games);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/users/:id/active-game', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const game = await storage.getActiveGameByPlayerId(userId);
      if (!game) {
        return res.status(404).json({ message: 'No active game found' });
      }
      
      res.status(200).json(game);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Game invitation routes
  app.post('/api/invitations', async (req: Request, res: Response) => {
    try {
      const invitationData = insertGameInvitationSchema.parse(req.body);
      
      // Check if both users exist
      const sender = await storage.getUser(invitationData.senderId);
      const receiver = await storage.getUser(invitationData.receiverId);
      
      if (!sender || !receiver) {
        return res.status(400).json({ message: 'One or both users not found' });
      }
      
      const invitation = await storage.createGameInvitation(invitationData);
      res.status(201).json(invitation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
  
  app.get('/api/users/:id/invitations', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const invitations = await storage.getGameInvitationsByUser(userId);
      res.status(200).json(invitations);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.patch('/api/invitations/:id', async (req: Request, res: Response) => {
    try {
      const invitationId = parseInt(req.params.id);
      if (isNaN(invitationId)) {
        return res.status(400).json({ message: 'Invalid invitation ID' });
      }
      
      const { status } = req.body;
      if (!status || !['accepted', 'declined', 'expired'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const invitation = await storage.updateGameInvitationStatus(invitationId, status);
      if (!invitation) {
        return res.status(404).json({ message: 'Invitation not found' });
      }
      
      // If accepted, create a new game
      if (status === 'accepted') {
        const newGame = await storage.createGame({
          blackPlayerId: invitation.senderId,
          whitePlayerId: invitation.receiverId,
          status: 'active',
          winner: null,
          blackScore: 2,
          whiteScore: 2,
          currentTurn: 'black',
          board: Array(8).fill(null).map(() => Array(8).fill('empty')),
          moves: [],
          validMoves: []
        });
        
        res.status(200).json({ invitation, game: newGame });
      } else {
        res.status(200).json({ invitation });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  return httpServer;
}
