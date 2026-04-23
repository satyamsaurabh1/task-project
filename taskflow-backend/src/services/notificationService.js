const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, projectId, taskId, fromUser, link }) => {
    const notification = await Notification.create({
        userId, type, title, message, projectId, taskId, fromUser, link
    });
    return notification;
};

const getNotificationsForUser = async (userId, limit = 50) => {
    return Notification.find({ userId })
        .populate('fromUser', 'name email')
        .populate('projectId', 'title')
        .populate('taskId', 'title')
        .sort({ createdAt: -1 })
        .limit(limit);
};

const getUnreadCount = async (userId) => {
    return Notification.countDocuments({ userId, read: false });
};

const markAsRead = async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true }
    );
};

const markAllRead = async (userId) => {
    return Notification.updateMany({ userId, read: false }, { read: true });
};

const deleteOldNotifications = async (userId) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return Notification.deleteMany({ userId, createdAt: { $lt: thirtyDaysAgo }, read: true });
};

module.exports = {
    createNotification,
    getNotificationsForUser,
    getUnreadCount,
    markAsRead,
    markAllRead,
    deleteOldNotifications
};
