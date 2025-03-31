import { useState } from "react";
import { positionToNotation } from "@/lib/game";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface MoveHistoryProps {
  moves: { position: string; player: "black" | "white" }[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Create paired moves for display (black and white together)
  const pairedMoves = moves.reduce<Array<{
    black?: { position: string; player: "black" | "white" };
    white?: { position: string; player: "black" | "white" };
    number: number;
  }>>((acc, move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isBlackMove = move.player === "black";
    
    if (isBlackMove) {
      acc.push({
        black: move,
        number: moveNumber
      });
    } else {
      // If this is a white move, add it to the previous pair if it exists
      // Otherwise, create a new pair with only the white move
      const lastPair = acc[acc.length - 1];
      if (lastPair && !lastPair.white && lastPair.number === moveNumber) {
        lastPair.white = move;
      } else {
        acc.push({
          white: move,
          number: moveNumber
        });
      }
    }
    
    return acc;
  }, []);

  // For limited display, show only the last 5 moves
  const displayMoves = expanded ? pairedMoves : pairedMoves.slice(-5);
  
  if (moves.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md lg:max-w-lg bg-white rounded-lg shadow-md p-4">
      <h3 className="font-poppins font-medium mb-2 flex items-center">
        <i className="ri-history-line mr-1"></i> Move History
      </h3>
      <ScrollArea className="max-h-32">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-1 px-2 text-left">#</th>
              <th className="py-1 px-2 text-left">Black</th>
              <th className="py-1 px-2 text-left">White</th>
            </tr>
          </thead>
          <tbody>
            {displayMoves.map((pair) => (
              <tr key={pair.number} className="border-b border-gray-200">
                <td className="py-1 px-2">{pair.number}</td>
                <td className="py-1 px-2">{pair.black ? pair.black.position : "-"}</td>
                <td className="py-1 px-2">{pair.white ? pair.white.position : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      
      {pairedMoves.length > 5 && (
        <div className="mt-2 text-center">
          <Button 
            variant="link" 
            size="sm" 
            className="text-sm text-[#1A237E]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "Show All Moves"}
          </Button>
        </div>
      )}
    </div>
  );
}
