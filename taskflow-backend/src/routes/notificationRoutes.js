const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

const router = express.Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
    const notifications = await notificationService.getNotificationsForUser(req.user._id);
    const unreadCount = await notificationService.getUnreadCount(req.user._id);
    res.json({ notifications, unreadCount });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.json(notification);
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user._id);
    res.json({ message: 'All notifications marked as read' });
}));

module.exports = router;
