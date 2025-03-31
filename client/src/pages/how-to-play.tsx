import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Info, Shield, Award, Zap } from "lucide-react";

export default function HowToPlay() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-md">
          <CardHeader className="bg-[#1A237E] text-white">
            <CardTitle className="flex items-center text-2xl">
              <HelpCircle className="h-6 w-6 mr-2" />
              How to Play Riverthello <span className="ml-1">🌊</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="rules" className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="rules" className="flex-1">
                    <Info className="h-4 w-4 mr-2" />
                    Basic Rules
                  </TabsTrigger>
                  <TabsTrigger value="strategy" className="flex-1">
                    <Shield className="h-4 w-4 mr-2" />
                    Strategy
                  </TabsTrigger>
                  <TabsTrigger value="ranking" className="flex-1">
                    <Award className="h-4 w-4 mr-2" />
                    Ranking System
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="rules" className="p-6">
                <h2 className="text-xl font-poppins font-semibold mb-4">Rules of Riverthello 🌊</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">Game Setup</h3>
                    <p className="text-gray-700 mb-2">
                      Riverthello is played on an 8×8 board with 64 squares. The game starts with four discs placed in the center:
                    </p>
                    <ul className="list-disc pl-8 mb-2 text-gray-700">
                      <li>Two black discs placed diagonally</li>
                      <li>Two white discs placed diagonally</li>
                    </ul>
                    <p className="text-gray-700">
                      Black always makes the first move.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">Game Objective</h3>
                    <p className="text-gray-700">
                      The objective is to have the majority of your colored discs on the board when the game ends. The game ends when neither player can make a valid move.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">Making Moves</h3>
                    <p className="text-gray-700 mb-2">
                      On your turn:
                    </p>
                    <ol className="list-decimal pl-8 mb-2 text-gray-700">
                      <li>You must place a disc of your color on an empty square.</li>
                      <li>The disc must be placed so that it "outflanks" at least one of your opponent's discs.</li>
                      <li>Outflanking means that your disc, along with another disc of your color, traps one or more of your opponent's discs in a straight line (horizontally, vertically, or diagonally).</li>
                      <li>All of your opponent's discs that are outflanked are flipped to your color.</li>
                    </ol>
                    <p className="text-gray-700">
                      If you cannot make a valid move that outflanks at least one opponent disc, your turn is skipped, and your opponent plays again. If neither player can make a valid move, the game ends.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">Example Move</h3>
                    <p className="text-gray-700 mb-2">
                      Imagine a situation where:
                    </p>
                    <ul className="list-disc pl-8 mb-2 text-gray-700">
                      <li>A black disc is at position D3</li>
                      <li>A white disc is at position D4</li>
                      <li>If black plays at position D5, it outflanks the white disc at D4</li>
                      <li>The white disc at D4 is then flipped to black</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">Game End</h3>
                    <p className="text-gray-700">
                      The game ends when neither player can make a legal move. This usually happens when the board is full, but can also happen earlier. The player with the most discs of their color on the board wins. If both players have the same number of discs, the game is a draw.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="strategy" className="p-6">
                <h2 className="text-xl font-poppins font-semibold mb-4">Riverthello Strategy Tips</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#FFC107]" />
                      Control the Corners
                    </h3>
                    <p className="text-gray-700">
                      Corners are the most strategically valuable squares on the board because once you place a disc in a corner, it can never be flipped. Try to secure the corners (A1, A8, H1, H8) whenever possible, and be careful not to give your opponent easy access to them.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#FFC107]" />
                      Avoid the X-squares
                    </h3>
                    <p className="text-gray-700">
                      The squares diagonally adjacent to corners (B2, B7, G2, G7) are known as "X-squares." Playing on these squares often gives your opponent the opportunity to take the corner. Avoid these squares unless you're certain your opponent can't capitalize on the corner.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#FFC107]" />
                      Edge Control
                    </h3>
                    <p className="text-gray-700">
                      The edges of the board are also valuable territory because they limit the directions in which your discs can be outflanked. Try to build stable disc formations along the edges, but be cautious about playing too close to corners if you don't control them.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#FFC107]" />
                      Mobility Over Quantity
                    </h3>
                    <p className="text-gray-700">
                      In the early and middle game, it's often better to have fewer discs but more possible moves (mobility) than to have many discs but limited options. Don't be discouraged if your opponent has more discs than you early on — this can change quickly in the endgame.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#FFC107]" />
                      Parity
                    </h3>
                    <p className="text-gray-700">
                      Pay attention to "parity" — whether the number of empty squares in a region is odd or even. If you make the last move in a region, you often gain an advantage. Plan moves to ensure you'll have the last move in important areas.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#FFC107]" />
                      Balanced Development
                    </h3>
                    <p className="text-gray-700">
                      Try to develop your position across the entire board rather than concentrating in one area. This gives you more options and makes it harder for your opponent to trap you.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#FFC107]" />
                      Think Ahead
                    </h3>
                    <p className="text-gray-700">
                      Try to think several moves ahead. Consider what moves your move enables for your opponent, and what subsequent opportunities those moves create for you.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ranking" className="p-6">
                <h2 className="text-xl font-poppins font-semibold mb-4">Understanding the Rating System</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">ELO Rating System</h3>
                    <p className="text-gray-700">
                      Riverthello uses the ELO rating system, similar to the one used in chess. Each player starts with a base rating of 1200 points. After each game, ratings are adjusted based on the game result and the difference between the players' ratings.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">How Ratings Change</h3>
                    <p className="text-gray-700 mb-2">
                      When you win against a higher-rated player, you gain more rating points. If you lose against a lower-rated player, you lose more points. The specific amount depends on the rating difference:
                    </p>
                    <ul className="list-disc pl-8 mb-2 text-gray-700">
                      <li>Beating a much stronger player can earn you 20-32 points</li>
                      <li>Beating a similar-rated player typically earns 15-16 points</li>
                      <li>Beating a much weaker player might only earn 1-5 points</li>
                    </ul>
                    <p className="text-gray-700">
                      The same principles apply in reverse for losses. Draws result in smaller rating changes.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">Ranking Tiers</h3>
                    <p className="text-gray-700 mb-2">
                      Your rating determines your ranking tier:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#FFC107] mr-2"></span>
                          <span className="font-medium">Master (2000+)</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-5">
                          Elite players with exceptional skill
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                          <span className="font-medium">Expert (1800-1999)</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-5">
                          Very strong players with deep strategy knowledge
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 rounded-full bg-green-600 mr-2"></span>
                          <span className="font-medium">Skilled (1600-1799)</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-5">
                          Players with good strategic understanding
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                          <span className="font-medium">Intermediate (1400-1599)</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-5">
                          Players with solid grasp of game basics
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                          <span className="font-medium">Beginner (below 1400)</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-5">
                          New players still learning the game
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-medium text-lg mb-2">Leaderboard & Rankings</h3>
                    <p className="text-gray-700">
                      The global leaderboard ranks all players based on their rating. Your position on the leaderboard reflects your standing in the Riverthello community. As you win games and improve your rating, you'll climb up the rankings.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
