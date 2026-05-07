console.log('>>> [BOOT] Starting TaskFlow Server...');

require('dotenv').config();
const http = require('http');
const express = require('express');

// We use a small wrapper app to ensure the port opens INSTANTLY
const bootstrapApp = express();
const httpServer = http.createServer(bootstrapApp);

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

console.log(`>>> [BOOT] Attempting to listen on ${HOST}:${PORT}`);

// 1. OPEN PORT IMMEDIATELY (Passes Cloud Run health check)
httpServer.listen(PORT, HOST, () => {
    console.log(`>>> [SUCCESS] Port ${PORT} is open.`);

    // 2. LOAD REAL LOGIC IN BACKGROUND
    try {
        const app = require('./src/app');
        const { initSocket } = require('./src/config/socket');
        const { registerSocketHandlers } = require('./src/sockets/socketHandler');
        const connectDB = require('./src/config/db');

        // Connect real app to the already-running server
        httpServer.on('request', app);
        
        // Init Sockets
        const io = initSocket(httpServer);
        registerSocketHandlers(io);
        
        // Connect Database
        connectDB()
            .then(() => console.log('>>> [DB] Connected successfully'))
            .catch(err => console.error('>>> [DB] Connection failed:', err.message));

    } catch (err) {
        console.error('>>> [FATAL] Error during background load:', err);
    }
});

// Handle global crashes
process.on('uncaughtException', (err) => {
    console.error('>>> [UNCAUGHT EXCEPTION]', err);
});
