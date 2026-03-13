const Task = require('../models/Task');
const { validateProjectAccess } = require('../utils/accessControl');

const createTask = async (projectId, payload, user) => {
    await validateProjectAccess(projectId, user);

    const task = await Task.create({
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        dueDate: payload.dueDate || null,
        projectId,
        assignedTo: payload.assignedTo || null
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
    await validateProjectAccess(projectId, user);

    const task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    task.title = payload.title ?? task.title;
    task.description = payload.description ?? task.description;
    task.status = payload.status ?? task.status;
    task.priority = payload.priority ?? task.priority;
    task.dueDate = payload.dueDate === '' ? null : (payload.dueDate ?? task.dueDate);
    task.assignedTo = payload.assignedTo === '' ? null : (payload.assignedTo ?? task.assignedTo);

    await task.save();

    return Task.findById(task._id)
        .populate('assignedTo', 'name email role');
};

const deleteTask = async (projectId, taskId, user) => {
    await validateProjectAccess(projectId, user);

    const task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    await task.deleteOne();
};

module.exports = {
    createTask,
    deleteTask,
    getTaskById,
    getTasksByProject,
    updateTask
};
