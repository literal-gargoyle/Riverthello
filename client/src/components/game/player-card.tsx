import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type User } from "@shared/schema";
import { getRatingInfo } from "@/lib/utils";

interface PlayerCardProps {
  player: User;
  score: number;
  color: "black" | "white";
  isCurrentTurn: boolean;
}

export default function PlayerCard({ player, score, color, isCurrentTurn }: PlayerCardProps) {
  const { title, badgeColor, iconClass } = getRatingInfo(player.rating);
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${isCurrentTurn ? 'border-[#4CAF50]' : 'border-gray-300 opacity-90'}`}>
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          {player.photoURL ? (
            <Avatar>
              <AvatarImage src={player.photoURL} alt={player.displayName || 'Player'} />
              <AvatarFallback>{(player.displayName || player.username || 'P')[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
              {(player.displayName || player.username || 'P')[0]}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-poppins font-medium">{player.displayName || player.username}</h3>
          <div className="flex items-center text-xs text-gray-500">
            <i className="ri-trophy-line mr-1"></i>
            <span>Rating: {player.rating}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-5 h-5 rounded-full ${color === "black" ? "bg-black" : "bg-white border border-gray-300"} mr-2`}></div>
          <span className="font-medium">{color === "black" ? "Black" : "White"}</span>
        </div>
        <div className={`text-lg font-poppins font-semibold ${isCurrentTurn ? 'current-turn' : ''}`}>{score}</div>
      </div>
    </div>
  );
}
