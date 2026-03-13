const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { sanitizeRequest } = require('./utils/sanitize');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((value) => value.trim()) : '*',
    credentials: true
}));
app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeRequest);

app.get('/api/health', (req, res) => {
    res.json({ message: 'TaskFlow backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
