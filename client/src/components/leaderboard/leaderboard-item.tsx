import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type User } from "@shared/schema";
import { getRatingInfo, getRankColor } from "@/lib/utils";

interface LeaderboardItemProps {
  player: User;
  rank: number;
  isCurrentUser: boolean;
  showExtendedInfo?: boolean;
  onInvite?: () => void;
}

export default function LeaderboardItem({ player, rank, isCurrentUser, showExtendedInfo = false, onInvite }: LeaderboardItemProps) {
  const { title, badgeColor, iconClass } = getRatingInfo(player.rating);
  const rankColor = getRankColor(rank);
  const winRate = player.gamesPlayed > 0 
    ? Math.round((player.gamesWon / player.gamesPlayed) * 100)
    : 0;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 ${isCurrentUser ? 'border-l-4 border-[#1A237E]' : ''}`}>
      <div className="flex items-center">
        <div className={`w-12 font-poppins font-bold ${rankColor} text-center`}>
          {rank}
        </div>
        
        <div className="flex items-center flex-grow">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
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
            <div className="font-medium text-sm">
              {player.displayName || player.username}
              {isCurrentUser && <span className="ml-2 text-xs text-[#1A237E]">(You)</span>}
            </div>
            {showExtendedInfo && (
              <div className="text-xs text-gray-500 mt-1">
                Joined {new Date(player.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-20 text-center font-medium">
          {player.rating}
        </div>
        
        <div className="w-24 text-center text-sm">
          {winRate}%
        </div>
        
        <div className="w-24 text-right">
          {onInvite && !isCurrentUser && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs py-1 h-auto"
              onClick={onInvite}
            >
              Invite
            </Button>
          )}
          {(!onInvite || isCurrentUser) && (
            <span className={`text-xs px-2 py-1 rounded ${badgeColor}`}>
              <i className={iconClass + " mr-1"}></i>
              {title}
            </span>
          )}
        </div>
      </div>
      
      {showExtendedInfo && (
        <div className="mt-3 pt-3 border-t text-sm grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="font-medium">{player.gamesPlayed}</div>
            <div className="text-xs text-gray-500">Games</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{player.gamesWon}</div>
            <div className="text-xs text-gray-500">Wins</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{player.gamesLost}</div>
            <div className="text-xs text-gray-500">Losses</div>
          </div>
        </div>
      )}
    </div>
  );
}
