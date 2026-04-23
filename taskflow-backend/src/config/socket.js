const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getAllowedOrigins } = require('./corsOrigins');
const User = require('../models/User');

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: getAllowedOrigins(),
            credentials: true,
        },
    });

    // JWT authentication middleware for every socket connection
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('name email role');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.data.user = {
                _id: user._id,
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role
            };
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};

module.exports = { initSocket, getIO };
