const cron = require('node-cron');
const Task = require('../models/Task');
const Project = require('../models/Project');
const notificationService = require('../services/notificationService');

let io = null;

const setIO = (socketIO) => { io = socketIO; };

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

const checkDeadlines = async () => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // ── 1. Overdue tasks ─────────────────────────────────────────
    const overdueTasks = await Task.find({
        deadline: { $lt: now },
        status: { $ne: 'completed' },
        overdueSent: { $ne: true }
    }).populate('projectId', 'title members createdBy')
      .populate('assignedTo', 'name email');

    for (const task of overdueTasks) {
        const project = task.projectId;
        if (!project) continue;

        // Collect all users to notify (owner + members + assignee)
        const usersToNotify = new Set();
        if (project.createdBy) usersToNotify.add(String(project.createdBy));
        (project.members || []).forEach(m => usersToNotify.add(String(m._id || m)));
        if (task.assignedTo) usersToNotify.add(String(task.assignedTo._id || task.assignedTo));

        for (const userId of usersToNotify) {
            await notificationService.createNotification({
                userId,
                type: 'deadline_overdue',
                title: '⚠️ Task Overdue',
                message: `"${task.title}" in "${project.title}" is overdue!`,
                projectId: project._id,
                taskId: task._id,
                link: `/projects/${project._id}`
            });
            emitToUser(userId, 'deadline:overdue', {
                taskId: task._id,
                taskTitle: task.title,
                projectId: project._id,
                projectTitle: project.title
            });
            emitToUser(userId, 'notification:new', {
                type: 'deadline_overdue',
                title: '⚠️ Task Overdue',
                message: `"${task.title}" is overdue!`
            });
        }

        await Task.findByIdAndUpdate(task._id, { overdueSent: true });
        console.log(`[CRON] Overdue notification sent for task: ${task.title}`);
    }

    // ── 2. Reminder (1 hour before deadline) ─────────────────────
    const reminderTasks = await Task.find({
        deadline: { $gte: now, $lte: oneHourFromNow },
        status: { $ne: 'completed' },
        reminderSent: { $ne: true }
    }).populate('projectId', 'title members createdBy')
      .populate('assignedTo', 'name email');

    for (const task of reminderTasks) {
        const project = task.projectId;
        if (!project) continue;

        const usersToNotify = new Set();
        if (project.createdBy) usersToNotify.add(String(project.createdBy));
        (project.members || []).forEach(m => usersToNotify.add(String(m._id || m)));
        if (task.assignedTo) usersToNotify.add(String(task.assignedTo._id || task.assignedTo));

        for (const userId of usersToNotify) {
            await notificationService.createNotification({
                userId,
                type: 'deadline_reminder',
                title: '⏰ Deadline Approaching',
                message: `"${task.title}" in "${project.title}" is due in less than 1 hour!`,
                projectId: project._id,
                taskId: task._id,
                link: `/projects/${project._id}`
            });
            emitToUser(userId, 'deadline:reminder', {
                taskId: task._id,
                taskTitle: task.title,
                projectId: project._id,
                projectTitle: project.title,
                deadline: task.deadline
            });
            emitToUser(userId, 'notification:new', {
                type: 'deadline_reminder',
                title: '⏰ Deadline Approaching',
                message: `"${task.title}" is due in less than 1 hour!`
            });
        }

        await Task.findByIdAndUpdate(task._id, { reminderSent: true });
        console.log(`[CRON] Reminder notification sent for task: ${task.title}`);
    }
};

const startDeadlineChecker = (socketIO) => {
    setIO(socketIO);
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('[CRON] Running deadline check...');
        try {
            await checkDeadlines();
        } catch (error) {
            console.error('[CRON] Deadline check failed:', error.message);
        }
    });
    console.log('[CRON] Deadline checker started (every 5 min)');
};

module.exports = { startDeadlineChecker, checkDeadlines };
