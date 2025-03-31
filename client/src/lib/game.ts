import type { GameBoard, GamePiece } from "@shared/schema";

// Create a new game board
export function createNewBoard(): GameBoard {
  const board: GameBoard = Array(8).fill(null).map(() => Array(8).fill("empty"));
  
  // Place the initial 4 pieces in the center
  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";
  
  return board;
}

// Check if a move is valid
export function isValidMove(board: GameBoard, row: number, col: number, player: "black" | "white"): boolean {
  // Cell must be empty
  if (board[row][col] !== "empty") return false;
  
  const opponent = player === "black" ? "white" : "black";
  
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
    
    // Look for opponent's pieces in this direction
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (board[r][c] === opponent) {
        foundOpponent = true;
      } else if (board[r][c] === player && foundOpponent) {
        // Found a valid move
        return true;
      } else {
        // Empty cell or player's piece without opponent pieces in between
        break;
      }
      
      r += dir.dr;
      c += dir.dc;
    }
  }
  
  return false;
}

// Get all valid moves for a player
export function getValidMoves(board: GameBoard, player: "black" | "white"): { row: number; col: number }[] {
  const validMoves: { row: number; col: number }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(board, row, col, player)) {
        validMoves.push({ row, col });
      }
    }
  }
  
  return validMoves;
}

// Make a move and update the board
export function makeMove(board: GameBoard, row: number, col: number, player: "black" | "white"): GameBoard {
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

// Calculate scores from the board
export function calculateScores(board: GameBoard): { blackScore: number; whiteScore: number } {
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

// Check if the game is over
export function isGameOver(board: GameBoard): boolean {
  // If there are no valid moves for either player, the game is over
  return getValidMoves(board, "black").length === 0 && 
         getValidMoves(board, "white").length === 0;
}

// Convert board position to notation
export function positionToNotation(row: number, col: number): string {
  return `${String.fromCharCode(97 + col)}${row + 1}`;
}

// Convert notation to board position
export function notationToPosition(notation: string): { row: number; col: number } {
  const col = notation.charCodeAt(0) - 97;
  const row = parseInt(notation.slice(1)) - 1;
  return { row, col };
}
