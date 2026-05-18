import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });
    return () => socketRef.current?.disconnect();
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);