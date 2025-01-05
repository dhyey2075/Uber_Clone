import React, { createContext, useEffect, useState } from 'react';
import { io as socketIoClient } from 'socket.io-client';

// Create the SocketContext
export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = socketIoClient('https://uber-backend-10c0.onrender.com/', {
      transports: ['websocket'],
    });
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};