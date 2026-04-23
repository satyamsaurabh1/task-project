import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

let socket = null;
let activeToken = null;

export const connect = (token) => {
    if (socket && activeToken === token) return socket;

    if (socket) {
        socket.disconnect();
        socket = null;
    }

    activeToken = token;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[WS] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('[WS] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
        console.warn('[WS] Connection error:', err.message);
    });

    return socket;
};

export const disconnect = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    activeToken = null;
};

export const getSocket = () => socket;
