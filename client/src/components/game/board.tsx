import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { makeMove } from "@/lib/websocket";
import { isMobile } from "@/lib/utils";
import { type GameBoard, type GamePiece } from "@shared/schema";

interface GameBoardProps {
  board: GameBoard;
  validMoves: { row: number, col: number }[];
  currentTurn: "black" | "white";
  gameId: number;
  isActive: boolean;
}

export default function GameBoard({ board, validMoves, currentTurn, gameId, isActive }: GameBoardProps) {
  const { user } = useAuth();
  const [isMobileView, setIsMobileView] = useState(isMobile());

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!isActive) return;
    
    // Check if the move is valid
    const isValid = validMoves.some(move => move.row === row && move.col === col);
    if (!isValid) return;
    
    // Make the move via WebSocket
    makeMove(gameId, row, col);
  };

  const isValidMovePosition = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  return (
    <div className="w-full max-w-md lg:max-w-lg mb-4">
      <div className="bg-[#4CAF50] bg-opacity-10 rounded-lg shadow-lg p-4 sm:p-6 relative">
        {/* Turn Indicator (visible on small screens) */}
        {isMobileView && isActive && (
          <div className="lg:hidden mb-4 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-[#1A237E] text-white">
              <span className="font-poppins font-medium">{currentTurn === "black" ? "Black" : "White"}'s Turn</span>
            </div>
          </div>
        )}
        
        {/* Game Grid */}
        <div className="w-full aspect-square bg-[#4CAF50] bg-opacity-20 rounded-md overflow-hidden">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                    game-cell border border-green-700 bg-[#4CAF50] bg-opacity-10 flex items-center justify-center
                    ${cell !== "empty" ? "occupied" : ""}
                    ${isValidMovePosition(rowIndex, colIndex) ? "valid-move" : ""}
                  `}
                >
                  {cell !== "empty" && (
                    <div 
                      className={`
                        game-piece w-4/5 h-4/5 rounded-full 
                        ${cell === "black" 
                          ? "bg-black shadow-md" 
                          : "bg-white border border-gray-300 shadow-md"}
                      `}
                    ></div>
                  )}
                </div>
              ))
            ))}
          </div>
        </div>
        
        {/* Game Coordinates */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-8 w-full flex justify-around px-2 text-xs font-mono opacity-70">
            <span>A</span>
            <span>B</span>
            <span>C</span>
            <span>D</span>
            <span>E</span>
            <span>F</span>
            <span>G</span>
            <span>H</span>
          </div>
          <div className="absolute left-0 top-8 h-full flex flex-col justify-around py-2 text-xs font-mono opacity-70">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
          </div>
        </div>
      </div>
      
      {/* Game Legend */}
      <div className="flex justify-center space-x-4 mt-2 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#4CAF50] bg-opacity-30 mr-1"></div>
          <span>Valid Move</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-black mr-1"></div>
          <span>Black</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-1"></div>
          <span>White</span>
        </div>
      </div>
    </div>
  );
}
