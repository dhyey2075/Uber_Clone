import React, { createContext, useEffect, useState } from 'react';
import { io as socketIoClient } from 'socket.io-client';

// Create the SocketContext
export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = socketIoClient('http://localhost:4000', {
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