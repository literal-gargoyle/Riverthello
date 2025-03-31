import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { type User, type GameInvitation, type Game } from "@shared/schema";
import { Shield, Trophy, Users, History, Award, AlertCircle } from "lucide-react";
import { getRatingInfo, formatDate } from "@/lib/utils";

export default function Home() {
  const [location, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedOpponent, setSelectedOpponent] = useState<number | null>(null);

  // Fetch top players
  const { data: topPlayers } = useQuery<User[]>({
    queryKey: ['/api/leaderboard', 5],
    enabled: true,
  });

  // Fetch active game if any
  const { data: activeGame, isLoading: activeGameLoading } = useQuery<Game>({
    queryKey: ['/api/users', user?.id, 'active-game'],
    enabled: !!user,
  });

  // Fetch pending invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery<GameInvitation[]>({
    queryKey: ['/api/users', user?.id, 'invitations'],
    enabled: !!user,
  });

  // Create a new game invitation
  const createInvitation = useMutation({
    mutationFn: (receiverId: number) => {
      return apiRequest("POST", "/api/invitations", {
        senderId: user?.id,
        receiverId
      });
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "Your game invitation has been sent successfully.",
      });
      setSelectedOpponent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send invitation: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  // Respond to an invitation
  const respondToInvitation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: 'accepted' | 'declined' }) => {
      return apiRequest("PATCH", `/api/invitations/${id}`, { status });
    },
    onSuccess: (data: any, variables) => {
      if (variables.status === 'accepted' && data.game) {
        navigate(`/game/${data.game.id}`);
      } else {
        toast({
          title: variables.status === 'accepted' ? "Invitation accepted" : "Invitation declined",
          description: variables.status === 'accepted' 
            ? "The game is starting now."
            : "The invitation has been declined.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to respond to invitation: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (activeGame) {
      toast({
        title: "Active game found",
        description: "You have an ongoing game. You can resume it from here.",
      });
    }
  }, [activeGame]);

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-3xl font-bold">Riverthello <span className="ml-1">🌊</span></CardTitle>
              <CardDescription className="text-gray-100">
                A competitive multiplayer strategy game
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-poppins font-semibold mb-4">Welcome to Riverthello <span className="ml-1">🌊</span></h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Challenge players from around the world, improve your skills, and climb the leaderboard in this classic strategy game.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <Trophy className="h-12 w-12 mx-auto mb-2 text-[#FFC107]" />
                  <h3 className="font-poppins font-semibold mb-1">Competitive Gameplay</h3>
                  <p className="text-sm text-gray-600">Earn ratings and climb the global leaderboard</p>
                </div>
                <div className="text-center p-4">
                  <Users className="h-12 w-12 mx-auto mb-2 text-[#1A237E]" />
                  <h3 className="font-poppins font-semibold mb-1">Real-Time Multiplayer</h3>
                  <p className="text-sm text-gray-600">Play against friends or random opponents online</p>
                </div>
                <div className="text-center p-4">
                  <History className="h-12 w-12 mx-auto mb-2 text-[#4CAF50]" />
                  <h3 className="font-poppins font-semibold mb-1">Game History</h3>
                  <p className="text-sm text-gray-600">Track your progress and review past games</p>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => navigate("/login")} 
                  className="bg-[#1A237E] hover:bg-[#1A237E]/90 text-white px-8 py-2 rounded font-medium"
                >
                  Sign In to Play
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="bg-white shadow-md mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Welcome, {user.displayName}</CardTitle>
              <CardDescription>
                Rating: {user.rating} • Games Played: {user.gamesPlayed}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGameLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-sm">Checking for active games...</p>
                </div>
              ) : activeGame ? (
                <div className="bg-[#1A237E]/10 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-poppins font-semibold">Active Game</h3>
                      <p className="text-sm text-gray-600">Game #{activeGame.id}</p>
                    </div>
                    <Button 
                      onClick={() => navigate(`/game/${activeGame.id}`)}
                      className="bg-[#1A237E] hover:bg-[#1A237E]/90"
                    >
                      Resume Game
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Button 
                  onClick={() => navigate("/how-to-play")}
                  className="bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white h-auto py-3"
                >
                  <div className="text-center w-full">
                    <span className="block text-lg font-medium">How to Play</span>
                    <span className="block text-xs mt-1">Learn the rules</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => navigate("/leaderboard")}
                  className="bg-[#FFC107] hover:bg-[#FFC107]/90 text-white h-auto py-3"
                >
                  <div className="text-center w-full">
                    <span className="block text-lg font-medium">Leaderboard</span>
                    <span className="block text-xs mt-1">See top players</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => navigate("/history")}
                  className="bg-[#1A237E] hover:bg-[#1A237E]/90 text-white h-auto py-3"
                >
                  <div className="text-center w-full">
                    <span className="block text-lg font-medium">Game History</span>
                    <span className="block text-xs mt-1">Review past games</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setSelectedOpponent(0)}
                  className="bg-gray-700 hover:bg-gray-800 text-white h-auto py-3"
                >
                  <div className="text-center w-full">
                    <span className="block text-lg font-medium">Find Match</span>
                    <span className="block text-xs mt-1">Play against someone</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {invitations && invitations.length > 0 && (
            <Card className="bg-white shadow-md mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-[#FFC107]" />
                  Game Invitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitations.map(invitation => (
                    <div key={invitation.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <div>
                        <p className="font-medium">
                          {invitation.senderId === user.id ? 'Sent to Player #' + invitation.receiverId : 'From Player #' + invitation.senderId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(invitation.createdAt)}
                        </p>
                      </div>
                      {invitation.receiverId === user.id && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => respondToInvitation.mutate({ id: invitation.id, status: 'accepted' })}
                            className="bg-[#4CAF50] hover:bg-[#4CAF50]/90"
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => respondToInvitation.mutate({ id: invitation.id, status: 'declined' })}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      {invitation.senderId === user.id && (
                        <div className="text-sm text-gray-500 italic">
                          Waiting for response...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="bg-white shadow-md mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <Trophy className="h-5 w-5 mr-2 text-[#FFC107]" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!topPlayers ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPlayers.map((player, index) => {
                    const ratingInfo = getRatingInfo(player.rating);
                    return (
                      <div key={player.id} className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center font-poppins font-bold text-accent">
                          {index + 1}
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                          {player.photoURL ? (
                            <img src={player.photoURL} alt={player.displayName || 'Player'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1A237E] text-white">
                              {(player.displayName || player.username || 'P').charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-2 flex-grow">
                          <div className="font-medium text-sm">{player.displayName || player.username}</div>
                          <div className="text-xs text-gray-600">{player.rating} Points</div>
                        </div>
                        <div className={`text-xs ${ratingInfo.badgeColor} px-2 py-0.5 rounded`}>
                          <i className={ratingInfo.iconClass + " mr-1"}></i>
                          {ratingInfo.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => navigate("/leaderboard")} className="text-[#1A237E]">
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <Award className="h-5 w-5 mr-2 text-[#4CAF50]" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Rating</span>
                  <span>{user.rating}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Games Played</span>
                  <span>{user.gamesPlayed}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Games Won</span>
                  <span>{user.gamesWon}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Games Lost</span>
                  <span>{user.gamesLost}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Games Tied</span>
                  <span>{user.gamesTied}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Win Rate</p>
                    <p className="text-sm text-gray-500">
                      {user.gamesPlayed > 0 
                        ? `${Math.round((user.gamesWon / user.gamesPlayed) * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                  <div>
                    {getRatingInfo(user.rating).title}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Find Match Dialog */}
      {selectedOpponent !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="font-poppins font-bold text-xl mb-4">Find a Match</h2>
            <p className="mb-4 text-gray-700">
              Choose how you want to start a new game.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  navigate('/leaderboard');
                }}
                className="w-full bg-[#1A237E] hover:bg-[#1A237E]/90 text-white justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Find a specific player
              </Button>
              
              <Button 
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Random matchmaking will be available in a future update.",
                  });
                }}
                className="w-full bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white justify-start"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Random competitive match
              </Button>
              
              <Button 
                onClick={() => {
                  setSelectedOpponent(null);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 justify-start"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
