/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useSocket = () => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    // Connection event
    socketRef.current.on("connect", () => {
      setConnected(true);
      console.log("✅ Connected to server:", socketRef.current.id);
    });

    // Disconnection event
    socketRef.current.on("disconnect", () => {
      setConnected(false);
      console.log("❌ Disconnected from server");
    });

    // Server welcome message
    socketRef.current.on("connected", (data) => {
      console.log("📨 Server message:", data.message);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
  };
};
