import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Game, type User } from "@shared/schema";
import { formatDate, getRatingInfo, getWinnerName } from "@/lib/utils";
import { History as HistoryIcon, Trophy, User as UserIcon } from "lucide-react";

export default function History() {
  const [location, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [limit, setLimit] = useState(10);

  // Fetch user game history
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/users', user?.id, 'games', limit],
    enabled: !!user,
  });

  // Fetch players for each game
  const { data: players, isLoading: playersLoading } = useQuery<User[]>({
    queryKey: ['/api/leaderboard', 100], // This is a bit of a hack - using leaderboard to get all potential players
    enabled: !!games,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading || playersLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="w-8 h-8 border-4 border-[#1A237E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Loading game history...</p>
      </div>
    );
  }

  const getPlayerName = (playerId: number) => {
    const player = players?.find(p => p.id === playerId);
    return player?.displayName || player?.username || `Player #${playerId}`;
  };

  const getOpponentId = (game: Game) => {
    if (!user) return null;
    return game.blackPlayerId === user.id ? game.whitePlayerId : game.blackPlayerId;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-md">
          <CardHeader className="bg-[#1A237E] text-white">
            <CardTitle className="flex items-center text-2xl">
              <HistoryIcon className="h-6 w-6 mr-2" />
              Game History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {games && games.length > 0 ? (
              <div className="space-y-6">
                {games.map((game) => {
                  const playerIsBlack = game.blackPlayerId === user?.id;
                  const playerScore = playerIsBlack ? game.blackScore : game.whiteScore;
                  const opponentScore = playerIsBlack ? game.whiteScore : game.blackScore;
                  const ratingChange = playerIsBlack ? game.blackRatingChange : game.whiteRatingChange;
                  const isWinner = 
                    (playerIsBlack && game.winner === "black") || 
                    (!playerIsBlack && game.winner === "white");
                  const isDraw = game.winner === "draw";
                  
                  return (
                    <div 
                      key={game.id} 
                      className={`bg-gray-50 rounded-lg p-4 border-l-4 ${
                        isWinner ? 'border-[#4CAF50]' : 
                        isDraw ? 'border-[#FFC107]' : 
                        'border-red-500'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <div>
                          <h3 className="font-poppins font-medium">Game #{game.id}</h3>
                          <p className="text-sm text-gray-500">{formatDate(game.endedAt || game.startedAt)}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className={`text-sm px-2 py-1 rounded ${
                            isWinner ? 'bg-[#4CAF50] text-white' : 
                            isDraw ? 'bg-[#FFC107] text-white' : 
                            'bg-red-500 text-white'
                          }`}>
                            {isWinner ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex items-center mb-3 md:mb-0">
                          <div className="flex items-center mr-6">
                            <div className="w-8 h-8 rounded-full bg-black mr-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium text-sm">
                                {playerIsBlack ? user?.displayName : getPlayerName(game.blackPlayerId)}
                              </p>
                              <p className="text-xs text-gray-500">Black</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-300 mr-2 flex-shrink-0"></div>
                            <div>
                              <p className="font-medium text-sm">
                                {!playerIsBlack ? user?.displayName : getPlayerName(game.whitePlayerId)}
                              </p>
                              <p className="text-xs text-gray-500">White</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="text-center mr-4">
                            <p className="font-poppins font-bold text-lg">{playerScore} - {opponentScore}</p>
                            <p className="text-xs text-gray-500">Final Score</p>
                          </div>
                          
                          {ratingChange !== null && (
                            <div className="text-center">
                              <p className={`font-medium ${ratingChange > 0 ? 'text-[#4CAF50]' : ratingChange < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                {ratingChange > 0 ? '+' : ''}{ratingChange}
                              </p>
                              <p className="text-xs text-gray-500">Rating</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                        <Button 
                          onClick={() => navigate(`/game/${game.id}`)}
                          variant="outline" 
                          size="sm"
                        >
                          View Game
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {games.length >= limit && (
                  <div className="text-center mt-4">
                    <Button
                      onClick={() => setLimit(prev => prev + 10)}
                      variant="outline"
                    >
                      Load More Games
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-poppins font-medium mb-2">No Games Yet</h3>
                <p className="text-gray-500 mb-6">You haven't played any games yet. Start a new game to see your history here.</p>
                <Button onClick={() => navigate("/")}>Back to Home</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
