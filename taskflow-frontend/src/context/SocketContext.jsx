import { createContext, useEffect, useState } from 'react';
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
            return undefined;
        }

        const s = socketService.connect(user.token);
        queueMicrotask(() => {
            setSocket(s);
            setIsConnected(s.connected);
        });

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            socketService.disconnect();
            queueMicrotask(() => {
                setSocket(null);
                setIsConnected(false);
            });
        };
    }, [user?.token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export { SocketContext };
