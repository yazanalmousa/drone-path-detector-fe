// hooks/useSocket.ts
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { socketService } from "../services/socket";

export const useSocket = (url: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);

  useEffect(() => {
    console.log("🚀 Initializing socket connection to:", url);

    // Connect to socket
    socketRef.current = socketService.connect(url);

    if (socketRef.current) {
      // Track connection status
      const handleConnect = () => {
        console.log("✅ Socket connected in hook");
        setIsConnected(true);
        setReconnectCount(0);
      };

      const handleDisconnect = (reason: string) => {
        console.log("❌ Socket disconnected in hook:", reason);
        setIsConnected(false);
      };

      const handleReconnect = () => {
        console.log("🔄 Socket reconnected in hook");
        setIsConnected(true);
        setReconnectCount((prev) => prev + 1);
      };

      // Add event listeners
      socketRef.current.on("connect", handleConnect);
      socketRef.current.on("disconnect", handleDisconnect);
      socketRef.current.on("reconnect", handleReconnect);

      // Set initial connection state
      setIsConnected(socketRef.current.connected);

      // Cleanup function
      return () => {
        if (socketRef.current) {
          socketRef.current.off("connect", handleConnect);
          socketRef.current.off("disconnect", handleDisconnect);
          socketRef.current.off("reconnect", handleReconnect);
        }
      };
    }

    // Don't disconnect on unmount - keep persistent connection
    // return () => {
    //   socketService.disconnect();
    // };
  }, [url]);

  // Periodic connection check
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current && !socketRef.current.connected) {
        console.log(
          "🔍 Connection check: Socket disconnected, attempting to reconnect..."
        );
        socketService.ensureConnection();
        socketRef.current = socketService.getSocket();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    reconnectCount,
    ensureConnection: () => socketService.ensureConnection(),
  };
};
