import { io } from 'socket.io-client';

/**
 * PRODUCTION ARCHITECTURE: SOCKET SERVICE SINGLETON
 * 
 * This service handles the low-level Socket.IO connection.
 * It is designed to be resilient, auto-reconnecting, and sync with the API port.
 */

// Derive the socket URL dynamically from the browser context or environment
// If VITE_API_URL is 'http://localhost:5001/api', SOCKET_URL becomes 'http://localhost:5001'
const getSocketUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    
    // If VITE_API_URL is '/api' (relative), return empty string for same-origin
    if (envUrl === '/api') return '';
    
    if (envUrl && envUrl.startsWith('http')) {
        return envUrl.replace('/api', '');
    }
    
    // Fallback for local development if VITE_API_URL is not set
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `${window.location.protocol}//${window.location.hostname}:5001`;
    }

    // Default to same origin in production
    return '';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
    constructor() {
        this.socket = null;
        this.token = null;
    }

    /**
     * Establishes a connection with the backend.
     * Uses WebSocket as primary transport with Polling as fallback.
     */
    connect(token) {
        if (!token) return null;

        // Prevent redundant connections if already active with same token
        if (this.socket?.connected && this.token === token) {
            return this.socket;
        }

        this.token = token;
        
        console.log(`[SOCKET] Attempting connection to: ${SOCKET_URL}`);

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        // Debugging Listeners
        this.socket.on('connect', () => {
            console.log('%c[SOCKET] Connected successfully!', 'color: #10b981; font-weight: bold');
        });

        this.socket.on('connect_error', (err) => {
            console.error('%c[SOCKET] Connection Error:', 'color: #ef4444', err.message);
            // This error often happens if the backend port is wrong or CORS is blocked
        });

        this.socket.on('disconnect', (reason) => {
            console.warn(`[SOCKET] Disconnected: ${reason}`);
            if (reason === 'io server disconnect') {
                this.socket.connect();
            }
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.token = null;
    }

    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();
export default socketService;
