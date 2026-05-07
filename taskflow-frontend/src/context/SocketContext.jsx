import { createContext, useEffect, useState, useContext, useCallback } from 'react';
import socketService from '../services/socketService';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connectionState, setConnectionState] = useState('offline'); // 'live', 'offline', 'reconnecting'

    const updateState = useCallback(() => {
        const s = socketService.getSocket();
        if (!s) {
            setConnectionState('offline');
            return;
        }

        if (s.connected) {
            setConnectionState('live');
        } else {
            setConnectionState(s.active ? 'reconnecting' : 'offline');
        }
    }, []);

    useEffect(() => {
        if (!user?.token) {
            socketService.disconnect();
            setSocket(null);
            setConnectionState('offline');
            return undefined;
        }

        const s = socketService.connect(user.token);
        setSocket(s);

        const onConnect = () => {
            setConnectionState('live');
            toast.success('Connected to real-time server', { id: 'ws-status' });
        };

        const onDisconnect = () => {
            setConnectionState('offline');
        };

        const onReconnectAttempt = () => {
            setConnectionState('reconnecting');
        };

        const onConnectError = (err) => {
            if (err.message === 'auth_required' || err.message === 'invalid_token') {
                toast.error('Session expired. Please log in again.');
            }
        };

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('reconnect_attempt', onReconnectAttempt);
        s.on('connect_error', onConnectError);

        // Sync initial state
        updateState();

        // Safety interval to keep UI in sync with underlying socket object
        const interval = setInterval(updateState, 3000);

        return () => {
            clearInterval(interval);
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('reconnect_attempt', onReconnectAttempt);
            s.off('connect_error', onConnectError);
        };
    }, [user?.token, updateState]);

    return (
        <SocketContext.Provider value={{ 
            socket, 
            connectionState, 
            isConnected: connectionState === 'live',
            isReconnecting: connectionState === 'reconnecting'
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};

export default SocketContext;
