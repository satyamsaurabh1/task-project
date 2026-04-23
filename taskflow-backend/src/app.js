const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dmRoutes = require('./routes/dmRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { getAllowedOrigins } = require('./config/corsOrigins');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { sanitizeRequest } = require('./utils/sanitize');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true
}));
app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
    standardHeaders: true,
    legacyHeaders: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeRequest);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
    res.json({ message: 'TaskFlow backend is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
