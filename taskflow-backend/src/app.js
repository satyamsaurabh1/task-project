const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const hpp = require('hpp');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dmRoutes = require('./routes/dmRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { getAllowedOrigins } = require('./config/corsOrigins');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();

// 1. GLOBAL MIDDLEWARES
// Security Headers
app.use(helmet({ 
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

// CORS setup
app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Compression
app.use(compression());

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 2. ROUTES
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success',
        message: 'TaskFlow backend is healthy', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api', uploadRoutes);

// 3. ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

module.exports = app;
