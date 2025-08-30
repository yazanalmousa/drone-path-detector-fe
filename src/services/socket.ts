import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private url: string = "";
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(url: string): Socket {
    this.url = url;

    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      forceNew: false,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Connected to server:", this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);

      if (reason === "io server disconnect") {
        setTimeout(() => this.reconnect(), 1000);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.reconnect(), 2000 * this.reconnectAttempts);
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
      this.reconnectAttempts = 0;
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection error:", error);
    });

    this.socket.onAny((eventName, ...args) => {
      console.log("📥 Received event:", eventName, args);
    });
  }

  private reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connect(this.url);
  }

  disconnect(): void {
    if (this.socket) {
      console.log("🔌 Manually disconnecting socket");
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  ensureConnection(): void {
    if (!this.socket || !this.socket.connected) {
      console.log("🔄 Ensuring connection...");
      this.reconnect();
    }
  }
}

export const socketService = new SocketService();
