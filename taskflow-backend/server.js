require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { registerSocketHandlers } = require('./src/sockets/socketHandler');
const { startDeadlineChecker } = require('./src/jobs/deadlineChecker');

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        const httpServer = http.createServer(app);
        const io = initSocket(httpServer);
        registerSocketHandlers(io);
        startDeadlineChecker(io);

        httpServer.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
                process.exit(1);
            } else {
                console.error(`❌ Server error: ${error.message}`);
            }
        });

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            console.log(`📡 WebSocket server ready on ws://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(`❌ Failed to start server: ${error.message}`);
        process.exit(1);
    });

