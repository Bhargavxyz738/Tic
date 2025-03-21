import { useState, useEffect, useRef, useCallback } from 'react';
import { WsMessage } from '@shared/schema';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, ((data: any) => void)[]>>(new Map());

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        setReconnectCount(prev => prev + 1);
      }, 2000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data);
        const { type, payload } = message;
        
        // Call all registered handlers for this message type
        const handlers = messageHandlersRef.current.get(type) || [];
        handlers.forEach(handler => handler(payload));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, []);

  // Send message to server
  const sendMessage = useCallback((type: string, payload?: any) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return false;
    }

    const message: WsMessage = { type };
    if (payload !== undefined) {
      message.payload = payload;
    }

    socketRef.current.send(JSON.stringify(message));
    return true;
  }, []);

  // Register a message handler
  const addMessageHandler = useCallback((type: string, handler: (data: any) => void) => {
    const handlers = messageHandlersRef.current.get(type) || [];
    handlers.push(handler);
    messageHandlersRef.current.set(type, handlers);
    
    // Return function to remove this handler
    return () => {
      const updatedHandlers = messageHandlersRef.current.get(type) || [];
      messageHandlersRef.current.set(
        type,
        updatedHandlers.filter(h => h !== handler)
      );
    };
  }, []);

  // Connect on mount and when reconnectCount changes
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect, reconnectCount]);

  return {
    isConnected,
    sendMessage,
    addMessageHandler
  };
}
