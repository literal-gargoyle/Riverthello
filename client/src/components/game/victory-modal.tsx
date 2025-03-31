import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type User } from "@shared/schema";

interface VictoryModalProps {
  result: {
    gameId: number;
    winner: "black" | "white" | "draw" | null;
    blackScore: number;
    whiteScore: number;
    blackRatingChange: number;
    whiteRatingChange: number;
    blackPlayer: User;
    whitePlayer: User;
    resigned?: boolean;
    resignedBy?: "black" | "white";
  };
  currentUser: User;
  onClose: () => void;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export default function VictoryModal({ result, currentUser, onClose, onPlayAgain, onBackToLobby }: VictoryModalProps) {
  // Determine if the current user won
  const isBlackPlayer = result.blackPlayer.id === currentUser.id;
  const isWhitePlayer = result.whitePlayer.id === currentUser.id;
  const isWinner = 
    (isBlackPlayer && result.winner === "black") || 
    (isWhitePlayer && result.winner === "white");
  const isDraw = result.winner === "draw";
  
  // Determine what to show in the modal
  const ratingChange = isBlackPlayer ? result.blackRatingChange : result.whiteRatingChange;
  const newRating = currentUser.rating + (ratingChange || 0);
  
  // Get opponent information
  const opponent = isBlackPlayer ? result.whitePlayer : result.blackPlayer;
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-transform duration-300 scale-100">
        <div className="text-center">
          <div className="mb-4 text-center">
            {isWinner ? (
              <i className="ri-trophy-fill text-5xl text-[#4CAF50]"></i>
            ) : isDraw ? (
              <i className="ri-scales-3-fill text-5xl text-[#FFC107]"></i>
            ) : (
              <i className="ri-emotion-sad-fill text-5xl text-red-500"></i>
            )}
          </div>
          
          <h2 className="font-poppins font-bold text-2xl mb-2 text-[#1A237E]">
            {isWinner ? "Victory!" : isDraw ? "Draw!" : "Defeat!"}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {isWinner 
              ? `Congratulations, you won the game against ${opponent.displayName || opponent.username || "your opponent"}!`
              : isDraw
                ? "The game ended in a draw!"
                : `You lost the game against ${opponent.displayName || opponent.username || "your opponent"}.`}
            {result.resigned && (
              <span className="block mt-1 italic">
                {result.resignedBy === "black" ? "Black" : "White"} resigned.
              </span>
            )}
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Final Score:</span>
              <span className="font-poppins font-bold">{result.blackScore} - {result.whiteScore}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Rating Change:</span>
              <span className={`font-poppins font-bold ${
                ratingChange > 0 ? 'text-[#4CAF50]' : ratingChange < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {ratingChange > 0 ? "+" : ""}{ratingChange} points
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">New Rating:</span>
              <span className="font-poppins font-bold">{newRating}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={onPlayAgain} 
              className="flex-1 bg-[#1A237E] text-white px-4 py-3 rounded-md font-medium hover:bg-opacity-90"
            >
              Play Again
            </Button>
            <Button 
              onClick={onBackToLobby} 
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-md font-medium hover:bg-gray-300"
            >
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
