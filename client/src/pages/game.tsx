import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import GameBoard from "@/components/game/board";
import PlayerCard from "@/components/game/player-card";
import MoveHistory from "@/components/game/move-history";
import GameChat from "@/components/game/game-chat";
import VictoryModal from "@/components/game/victory-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  addMessageHandler, 
  removeMessageHandler, 
  joinGame as joinWebSocketGame,
  resignGame
} from "@/lib/websocket";
import { type Game, type User, type WSMessage, type WSGameState, type ChatMessage } from "@shared/schema";

export default function Game() {
  const params = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [gameId] = useState<number>(parseInt(params.id));
  const [gameState, setGameState] = useState<WSGameState | null>(null);
  const [chatMessages, setChatMessages] = useState<(ChatMessage & { user: User })[]>([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  
  // Fetch initial game data
  const { data: initialGame, isLoading, error } = useQuery<Game>({
    queryKey: ['/api/games', gameId],
    enabled: !!gameId,
  });

  // WebSocket message handler
  const handleWebSocketMessage = (message: WSMessage) => {
    console.log("WebSocket message:", message);

    switch (message.type) {
      case "GAME_STATE":
        setGameState(message.payload);
        break;
      case "GAME_UPDATED":
        setGameState(message.payload);
        break;
      case "GAME_OVER":
        setGameState({
          ...message.payload,
          status: "completed",
        });
        setGameResult(message.payload);
        setShowVictoryModal(true);
        break;
      case "CHAT_MESSAGE":
        setChatMessages(prev => [...prev, {
          ...message.payload.message,
          user: message.payload.user
        }]);
        break;
      case "ERROR":
        toast({
          title: "Error",
          description: message.payload.message,
          variant: "destructive",
        });
        break;
    }
  };

  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    if (!user || !gameId) return;
    
    // Add message handler for WebSocket
    addMessageHandler(handleWebSocketMessage);
    
    // Join the game room
    joinWebSocketGame(gameId);
    
    // Clean up when component unmounts
    return () => {
      removeMessageHandler(handleWebSocketMessage);
    };
  }, [user, gameId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this game.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Handle resign
  const handleResign = () => {
    if (confirm("Are you sure you want to resign? This will count as a loss.")) {
      resignGame(gameId);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Game</h2>
            <p className="text-gray-600 mb-4">
              There was a problem loading this game. It may not exist or you may not have permission to view it.
            </p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4">Connecting to game...</p>
      </div>
    );
  }

  const isPlayerInGame = user && (
    gameState.blackPlayer.id === user.id || 
    gameState.whitePlayer.id === user.id
  );

  const isPlayerTurn = user && (
    (gameState.currentTurn === "black" && gameState.blackPlayer.id === user.id) ||
    (gameState.currentTurn === "white" && gameState.whitePlayer.id === user.id)
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="lg:flex">
        {/* Game Section */}
        <div className="lg:w-3/4 lg:pr-6">
          {/* Game Status Banner */}
          <div className="bg-[#1A237E] text-white rounded-lg shadow-md mb-6 p-4 font-poppins">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  {gameState.status === "active" 
                    ? "Game in Progress" 
                    : gameState.status === "completed"
                      ? "Game Completed"
                      : "Game Abandoned"}
                </h2>
                <p className="text-sm text-gray-200">Match #{gameState.gameId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {gameState.status === "active" 
                    ? `${gameState.currentTurn === "black" ? "Black" : "White"}'s Turn` 
                    : `Winner: ${gameState.winner === "draw" 
                        ? "Draw" 
                        : gameState.winner === "black" 
                          ? "Black" 
                          : "White"}`}
                </p>
                <p className="text-sm text-gray-200">Ranked Match</p>
              </div>
            </div>
          </div>
          
          {/* Game Board Container */}
          <div className="flex flex-col lg:flex-row">
            {/* Player Info Cards */}
            <div className="flex flex-col lg:w-1/4 space-y-4 mb-4 lg:mb-0">
              <PlayerCard 
                player={gameState.blackPlayer}
                score={gameState.blackScore}
                color="black"
                isCurrentTurn={gameState.currentTurn === "black" && gameState.status === "active"}
              />
              
              <div className="relative">
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-10 border-l-2 border-dashed border-gray-400 opacity-30"></div>
              </div>
              
              <PlayerCard 
                player={gameState.whitePlayer}
                score={gameState.whiteScore}
                color="white"
                isCurrentTurn={gameState.currentTurn === "white" && gameState.status === "active"}
              />

              {/* Game Controls (Mobile Only) */}
              <div className="lg:hidden bg-white rounded-lg shadow-md p-4">
                <div className="flex space-x-2">
                  {isPlayerInGame && gameState.status === "active" && (
                    <Button 
                      onClick={handleResign}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md text-sm"
                    >
                      <i className="ri-flag-line mr-1"></i> Resign
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Game Board */}
            <div className="lg:w-3/4 lg:pl-4 flex flex-col items-center">
              <GameBoard 
                board={gameState.board}
                validMoves={isPlayerTurn ? gameState.validMoves : []}
                currentTurn={gameState.currentTurn}
                gameId={gameState.gameId}
                isActive={gameState.status === "active"}
              />
              
              {/* Move History */}
              <MoveHistory moves={gameState.moves} />
            </div>
          </div>
          
          {/* Game Controls (Desktop Only) */}
          {isPlayerInGame && gameState.status === "active" && (
            <div className="hidden lg:flex mt-6 space-x-4">
              <Button 
                onClick={handleResign}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
              >
                <i className="ri-flag-line mr-2"></i> Resign
              </Button>
            </div>
          )}
        </div>
        
        {/* Sidebar Section */}
        <div className="lg:w-1/4 lg:pl-6 mt-6 lg:mt-0">
          {/* Chat Box */}
          <GameChat 
            gameId={gameState.gameId}
            messages={chatMessages}
            currentUser={user!}
            isActive={gameState.status === "active"}
          />
          
          {/* Quick Match Button */}
          <div className="mt-6">
            <Button 
              onClick={() => navigate("/")}
              className="w-full bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white px-4 py-3 rounded-md font-poppins font-medium text-center"
            >
              <i className="ri-home-4-line mr-2 text-lg"></i> Back to Home
            </Button>
          </div>
        </div>
      </div>
      
      {/* Victory Modal */}
      {showVictoryModal && gameResult && (
        <VictoryModal 
          result={gameResult}
          currentUser={user!}
          onClose={() => setShowVictoryModal(false)}
          onPlayAgain={() => {
            setShowVictoryModal(false);
            // Will implement play again functionality in a future update
            toast({
              title: "Coming Soon",
              description: "Play again functionality will be available in a future update.",
            });
          }}
          onBackToLobby={() => {
            setShowVictoryModal(false);
            navigate("/");
          }}
        />
      )}
    </div>
  );
}
