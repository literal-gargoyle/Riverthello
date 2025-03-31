import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendChatMessage } from "@/lib/websocket";
import { formatDate } from "@/lib/utils";
import { type User, type ChatMessage } from "@shared/schema";

interface GameChatProps {
  gameId: number;
  messages: (ChatMessage & { user: User })[];
  currentUser: User;
  isActive: boolean;
}

export default function GameChat({ gameId, messages, currentUser, isActive }: GameChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendChatMessage(gameId, newMessage.trim());
    setNewMessage("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="font-poppins font-semibold text-lg mb-3 flex items-center">
        <i className="ri-chat-1-line mr-2"></i> Game Chat
      </h2>
      <ScrollArea 
        className="bg-[#F5F5F5] rounded p-3 mb-3 h-[300px]"
        ref={scrollAreaRef as any}
      >
        <div className="space-y-3">
          {/* System message - game start */}
          <div className="text-center text-xs text-gray-500 italic">
            Game started
          </div>
          
          {/* Chat messages */}
          {messages.map((msg, index) => {
            const isCurrentUser = msg.user.id === currentUser.id;
            
            return (
              <div key={msg.id || index} className={`flex ${isCurrentUser ? 'justify-end' : ''}`}>
                {!isCurrentUser && (
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    {msg.user.photoURL ? (
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={msg.user.photoURL} alt={msg.user.displayName || 'User'} />
                        <AvatarFallback>{(msg.user.displayName || msg.user.username || 'U')[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-xs">
                        {(msg.user.displayName || msg.user.username || 'U')[0]}
                      </div>
                    )}
                  </div>
                )}
                <div className={`${isCurrentUser ? 'mr-2 bg-[#1A237E] text-white' : 'ml-2 bg-gray-100'} rounded-lg p-2 text-sm max-w-[85%]`}>
                  <div className={`font-medium text-xs ${isCurrentUser ? 'text-gray-200' : 'text-[#1A237E]'}`}>
                    {msg.user.displayName || msg.user.username}
                  </div>
                  <p>{msg.message}</p>
                </div>
                {isCurrentUser && (
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    {msg.user.photoURL ? (
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={msg.user.photoURL} alt={msg.user.displayName || 'User'} />
                        <AvatarFallback>{(msg.user.displayName || msg.user.username || 'U')[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-xs">
                        {(msg.user.displayName || msg.user.username || 'U')[0]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-4">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="flex">
        <Input
          type="text"
          className="flex-grow border border-gray-200 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:border-[#1A237E]"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!isActive}
        />
        <Button
          type="submit"
          className="bg-[#1A237E] text-white px-4 py-2 rounded-r-md hover:bg-opacity-90"
          disabled={!isActive || !newMessage.trim()}
        >
          <i className="ri-send-plane-fill"></i>
        </Button>
      </form>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>Please keep conversations respectful and game-related.</p>
      </div>
    </div>
  );
}
