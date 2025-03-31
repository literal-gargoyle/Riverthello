import { type WSMessage, type WSGameState } from "@shared/schema";

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000;

type MessageHandler = (message: WSMessage) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = (event: CloseEvent) => void;

const messageHandlers: MessageHandler[] = [];
const errorHandlers: ErrorHandler[] = [];
const closeHandlers: CloseHandler[] = [];

// Initialize WebSocket connection
export function initWebSocket(userId: number) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    // Already connected
    return;
  }
  
  // Determine WebSocket protocol based on page protocol
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  // Create new WebSocket
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log("WebSocket connection established");
    reconnectAttempts = 0;
    
    // Authenticate with user ID
    sendMessage({
      type: "AUTH",
      payload: { userId }
    });
  };
  
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data) as WSMessage;
      messageHandlers.forEach(handler => handler(message));
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };
  
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    errorHandlers.forEach(handler => handler(error));
  };
  
  socket.onclose = (event) => {
    console.log("WebSocket connection closed:", event.code, event.reason);
    closeHandlers.forEach(handler => handler(event));
    
    // Attempt to reconnect if not closed intentionally
    if (event.code !== 1000 && event.code !== 1001) {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
        setTimeout(() => initWebSocket(userId), reconnectDelay);
      } else {
        console.error("Max reconnect attempts reached");
      }
    }
  };
}

// Close WebSocket connection
export function closeWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

// Send WebSocket message
export function sendMessage(message: WSMessage) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not connected");
  }
}

// Add message handler
export function addMessageHandler(handler: MessageHandler) {
  messageHandlers.push(handler);
}

// Remove message handler
export function removeMessageHandler(handler: MessageHandler) {
  const index = messageHandlers.indexOf(handler);
  if (index !== -1) {
    messageHandlers.splice(index, 1);
  }
}

// Add error handler
export function addErrorHandler(handler: ErrorHandler) {
  errorHandlers.push(handler);
}

// Remove error handler
export function removeErrorHandler(handler: ErrorHandler) {
  const index = errorHandlers.indexOf(handler);
  if (index !== -1) {
    errorHandlers.splice(index, 1);
  }
}

// Add close handler
export function addCloseHandler(handler: CloseHandler) {
  closeHandlers.push(handler);
}

// Remove close handler
export function removeCloseHandler(handler: CloseHandler) {
  const index = closeHandlers.indexOf(handler);
  if (index !== -1) {
    closeHandlers.splice(index, 1);
  }
}

// Join a game via WebSocket
export function joinGame(gameId: number) {
  sendMessage({
    type: "JOIN_GAME",
    payload: { gameId }
  });
}

// Make a move in a game
export function makeMove(gameId: number, row: number, col: number) {
  sendMessage({
    type: "MAKE_MOVE",
    payload: { gameId, row, col }
  });
}

// Send a chat message
export function sendChatMessage(gameId: number, message: string) {
  sendMessage({
    type: "SEND_CHAT",
    payload: { gameId, message }
  });
}

// Resign from a game
export function resignGame(gameId: number) {
  sendMessage({
    type: "RESIGN",
    payload: { gameId }
  });
}
