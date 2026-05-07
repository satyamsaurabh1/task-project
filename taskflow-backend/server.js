require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { registerSocketHandlers } = require('./src/sockets/socketHandler');
const { startDeadlineChecker } = require('./src/jobs/deadlineChecker');
const bootstrapRootAdmin = require('./src/utils/bootstrapRootAdmin');

// 1. UNCAUGHT EXCEPTION HANDLER
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

// Cloud Run provides the PORT environment variable.
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Essential for Cloud Run

const httpServer = http.createServer(app);

// Initialize WebSockets immediately
const io = initSocket(httpServer);
registerSocketHandlers(io);
startDeadlineChecker(io);

// 2. START SERVER IMMEDIATELY
// We start listening before the DB connection to satisfy Cloud Run's health checks.
httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Server listening on ${HOST}:${PORT}`);
    console.log(`📡 WebSocket server ready`);
    
    // 3. CONNECT DATABASE IN BACKGROUND
    connectDB()
        .then(async () => {
            console.log('✅ Database connected successfully');
            await bootstrapRootAdmin();
        })
        .catch((error) => {
            console.error(`❌ Database connection failed: ${error.message}`);
            // In a production app, you might want to retry here
        });
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

// 4. UNHANDLED REJECTION HANDLER
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    httpServer.close(() => {
        process.exit(1);
    });
});

// 5. SIGTERM HANDLER
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    httpServer.close(() => {
        console.log('💥 Process terminated!');
    });
});
