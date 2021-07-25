import { useEffect, useRef, useState } from "react";
import * as O from "fp-ts/lib/Option";
import { io, Socket } from "socket.io-client";

// const ENDPOINT = "http://localhost:4000/";

export const useSocket = () => {
  const socketRef = useRef<Socket>();
  const [socket, setSocket] = useState<O.Option<Socket>>(O.none);
  useEffect(() => {
    socketRef.current = io();
    setSocket(O.some(socketRef.current));
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return { socket };
};

// assume socket is stable
export const eqSocket = { equals: (a: Socket, b: Socket) => true };
