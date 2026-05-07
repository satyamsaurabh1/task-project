const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getAllowedOrigins } = require('./corsOrigins');
const User = require('../models/User');

let io;

/**
 * Initializes the Socket.IO server with production-grade configuration.
 * Includes explicit CORS, ping/pong timeouts, and JWT middleware.
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: getAllowedOrigins(),
            methods: ["GET", "POST"],
            credentials: true,
        },
        // Heartbeat configuration for instant disconnect detection
        pingTimeout: 30000,
        pingInterval: 10000,
        // Allow fallback if WebSocket fails
        transports: ['websocket', 'polling'],
        allowEIO3: true
    });

    console.log('[WS] Socket.IO Server Initialized');

    // Authentication Middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
        
        if (!token) {
            console.warn(`[WS] Connection rejected: No token from ${socket.id}`);
            return next(new Error('auth_required'));
        }

        try {
            const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
            const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('name email role');

            if (!user) {
                console.warn(`[WS] Connection rejected: User not found for token`);
                return next(new Error('user_not_found'));
            }

            // Attach user data to socket for handlers to use
            socket.data.user = {
                _id: user._id,
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role
            };
            
            console.log(`[WS] Authenticated: ${user.name} (${socket.id})`);
            next();
        } catch (err) {
            console.error(`[WS] Auth Error: ${err.message}`);
            next(new Error('invalid_token'));
        }
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};

module.exports = { initSocket, getIO };
