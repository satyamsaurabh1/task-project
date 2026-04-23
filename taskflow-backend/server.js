require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { registerSocketHandlers } = require('./src/sockets/socketHandler');
const { startDeadlineChecker } = require('./src/jobs/deadlineChecker');

// 1. UNCAUGHT EXCEPTION HANDLER
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
let httpServer;

// 2. CONNECT DATABASE & START SERVER
connectDB()
    .then(() => {
        httpServer = http.createServer(app);
        
        // Initialize WebSockets
        const io = initSocket(httpServer);
        registerSocketHandlers(io);
        startDeadlineChecker(io);

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
            if (process.env.NODE_ENV === 'development') {
                console.log(`📡 WebSocket server ready on ws://localhost:${PORT}`);
            }
        });

        // Handle Server Errors
        httpServer.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use.`);
                process.exit(1);
            } else {
                console.error(`❌ Server error: ${error.message}`);
            }
        });
    })
    .catch((error) => {
        console.error(`❌ Failed to start database: ${error.message}`);
        process.exit(1);
    });

// 3. UNHANDLED REJECTION HANDLER
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    if (httpServer) {
        httpServer.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// 4. SIGTERM HANDLER (for Render/Heroku deployments)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    if (httpServer) {
        httpServer.close(() => {
            console.log('💥 Process terminated!');
        });
    }
});

