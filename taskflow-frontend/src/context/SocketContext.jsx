import { createContext, useContext, useEffect, useState } from 'react';
import * as socketService from '../services/socketService';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user?.token) {
            socketService.disconnect();
            setSocket(null);
            setIsConnected(false);
            return;
        }

        const s = socketService.connect(user.token);
        setSocket(s);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        // Sync initial state
        if (s.connected) setIsConnected(true);

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            socketService.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [user?.token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
