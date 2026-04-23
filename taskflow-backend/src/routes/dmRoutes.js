const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const dmService = require('../services/dmService');
const { getIO } = require('../config/socket');
const notificationService = require('../services/notificationService');

const router = express.Router();
router.use(protect);

// Get all DM threads for the logged-in user
router.get('/', asyncHandler(async (req, res) => {
    const threads = await dmService.getUserThreads(req.user._id);
    res.json(threads);
}));

// Get thread with a specific user
router.get('/:userId', asyncHandler(async (req, res) => {
    const thread = await dmService.getThread(req.user._id, req.params.userId);
    await dmService.markThreadRead(req.user._id, req.params.userId);
    res.json(thread);
}));

// Send a message
router.post('/:userId', asyncHandler(async (req, res) => {
    const { text } = req.body;
    const message = await dmService.sendMessage(req.user._id, req.params.userId, text);

    const payload = {
        ...message.toObject?.() || message,
        sender: { _id: req.user._id, name: req.user.name, email: req.user.email }
    };

    // Emit real-time to recipient
    try {
        const io = getIO();
        io.to(`user:${req.params.userId}`).emit('dm:received', {
            fromUserId: req.user._id,
            message: payload
        });
    } catch { /* socket not ready */ }

    // Create notification for recipient
    await notificationService.createNotification({
        userId: req.params.userId,
        type: 'dm',
        title: `New message from ${req.user.name}`,
        message: text?.slice(0, 80) || 'Sent an attachment',
        fromUser: req.user._id,
        link: `/dm/${req.user._id}`
    });

    res.status(201).json(payload);
}));

module.exports = router;
