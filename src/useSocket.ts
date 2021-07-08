import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const ENDPOINT = "http://localhost:4000/";

export const useSocket = () => {
  const socketRef = useRef<Socket>();
  useEffect(() => {
    socketRef.current = io(ENDPOINT);
    const socket = socketRef.current;

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socketRef };
};
