const Task = require('../models/Task');
const ApiError = require('../utils/apiError');
const { PERMISSIONS } = require('../utils/constants');
const { ensureProjectPermission, ensureTaskPermission, validateProjectAccess } = require('../utils/accessControl');

const createTask = async (projectId, payload, user) => {
    await ensureProjectPermission(projectId, user, PERMISSIONS.TASKS_CREATE_ASSIGNED);

    const task = await Task.create({
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        dueDate: payload.dueDate || null,
        deadline: payload.deadline || null,
        projectId,
        assignedTo: payload.assignedTo || null,
        createdBy: user._id,
        activityLog: [{
            user: user._id,
            userName: user.name,
            action: 'created task',
            timestamp: new Date()
        }]
    });

    return Task.findById(task._id)
        .populate('assignedTo', 'name email role');
};

const getTasksByProject = async (projectId, user) => {
    await validateProjectAccess(projectId, user);

    return Task.find({ projectId })
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 });
};

const getTaskById = async (projectId, taskId, user) => {
    await validateProjectAccess(projectId, user);

    const task = await Task.findOne({ _id: taskId, projectId })
        .populate('assignedTo', 'name email role');

    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    return task;
};

const updateTask = async (projectId, taskId, payload, user) => {
    const { task } = await ensureTaskPermission(projectId, taskId, user, PERMISSIONS.TASKS_EDIT_ASSIGNED);

    // Track changes for activity log
    const changes = [];
    if (payload.title && payload.title !== task.title) changes.push({ field: 'title', oldValue: task.title, newValue: payload.title });
    if (payload.status && payload.status !== task.status) changes.push({ field: 'status', oldValue: task.status, newValue: payload.status });
    if (payload.priority && payload.priority !== task.priority) changes.push({ field: 'priority', oldValue: task.priority, newValue: payload.priority });

    task.title = payload.title ?? task.title;
    task.description = payload.description ?? task.description;
    task.status = payload.status ?? task.status;
    task.priority = payload.priority ?? task.priority;
    task.dueDate = payload.dueDate === '' ? null : (payload.dueDate ?? task.dueDate);
    task.deadline = payload.deadline === '' ? null : (payload.deadline ?? task.deadline);
    task.assignedTo = payload.assignedTo === '' ? null : (payload.assignedTo ?? task.assignedTo);

    // Reset reminder flags when deadline changes
    if (payload.deadline && payload.deadline !== task.deadline) {
        task.reminderSent = false;
        task.overdueSent = false;
    }

    // Log activity
    changes.forEach(c => {
        task.activityLog.push({
            user: user._id,
            userName: user.name,
            action: 'changed ' + c.field,
            field: c.field,
            oldValue: c.oldValue,
            newValue: c.newValue,
            timestamp: new Date()
        });
    });

    await task.save();

    return Task.findById(task._id)
        .populate('assignedTo', 'name email role');
};

const deleteTask = async (projectId, taskId, user) => {
    const { task } = await ensureTaskPermission(projectId, taskId, user, PERMISSIONS.TASKS_DELETE_ASSIGNED);

    await task.deleteOne();
};

module.exports = {
    createTask,
    deleteTask,
    getTaskById,
    getTasksByProject,
    updateTask
};
