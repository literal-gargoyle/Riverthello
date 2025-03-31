import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import LeaderboardItem from "@/components/leaderboard/leaderboard-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type User } from "@shared/schema";
import { Trophy, Award, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Leaderboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Fetch leaderboard data
  const { data: topPlayers, isLoading } = useQuery<User[]>({
    queryKey: ['/api/leaderboard', 100], // Get top 100 players
    enabled: true,
  });

  // Create game invitation
  const createInvitation = useMutation({
    mutationFn: (receiverId: number) => {
      if (!user) throw new Error("You must be logged in to invite players");
      return apiRequest("POST", "/api/invitations", {
        senderId: user.id,
        receiverId
      });
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "Your game invitation has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send invitation: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  const handleInvitePlayer = (playerId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to invite players to a game.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (playerId === user.id) {
      toast({
        title: "Invalid Invitation",
        description: "You cannot invite yourself to a game.",
        variant: "destructive",
      });
      return;
    }

    createInvitation.mutate(playerId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="bg-[#1A237E] text-white">
            <CardTitle className="flex items-center text-2xl">
              <Trophy className="h-6 w-6 mr-2 text-[#FFC107]" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="top" className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="top" className="flex-1">
                    <Trophy className="h-4 w-4 mr-2" />
                    Top Players
                  </TabsTrigger>
                  {user && (
                    <TabsTrigger value="you" className="flex-1">
                      <Award className="h-4 w-4 mr-2" />
                      Your Ranking
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="top" className="p-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4">Loading leaderboard...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-100 rounded-lg px-4 py-3 mb-4 flex items-center">
                      <div className="w-12 font-bold text-center">#</div>
                      <div className="flex-grow">Player</div>
                      <div className="w-20 text-center">Rating</div>
                      <div className="w-24 text-center">Win Rate</div>
                      <div className="w-24"></div>
                    </div>
                    
                    <div className="space-y-2">
                      {topPlayers?.map((player, index) => (
                        <LeaderboardItem
                          key={player.id}
                          player={player}
                          rank={index + 1}
                          isCurrentUser={user?.id === player.id}
                          onInvite={() => handleInvitePlayer(player.id)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              {user && (
                <TabsContent value="you" className="p-4">
                  {!isLoading && topPlayers ? (
                    <>
                      <div className="bg-gray-100 rounded-lg px-4 py-3 mb-4">
                        <h3 className="font-medium">Your Ranking</h3>
                      </div>
                      
                      {topPlayers.findIndex(p => p.id === user.id) > -1 ? (
                        <LeaderboardItem
                          player={user}
                          rank={topPlayers.findIndex(p => p.id === user.id) + 1}
                          isCurrentUser={true}
                          showExtendedInfo={true}
                        />
                      ) : (
                        <div className="text-center py-4">
                          <p>You are not yet ranked on the leaderboard. Play more games to get ranked!</p>
                        </div>
                      )}
                      
                      <div className="bg-gray-100 rounded-lg px-4 py-3 mt-6 mb-4">
                        <h3 className="font-medium">Players Near Your Rank</h3>
                      </div>
                      
                      {(() => {
                        const userIndex = topPlayers.findIndex(p => p.id === user.id);
                        if (userIndex === -1) return null;
                        
                        const start = Math.max(0, userIndex - 2);
                        const end = Math.min(topPlayers.length, userIndex + 3);
                        const nearbyPlayers = topPlayers.slice(start, end).filter(p => p.id !== user.id);
                        
                        return (
                          <div className="space-y-2">
                            {nearbyPlayers.map((player, idx) => (
                              <LeaderboardItem
                                key={player.id}
                                player={player}
                                rank={start + idx + (idx >= userIndex - start ? 1 : 0)}
                                isCurrentUser={false}
                                onInvite={() => handleInvitePlayer(player.id)}
                              />
                            ))}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4">Loading your ranking...</p>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
