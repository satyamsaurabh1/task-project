const taskService = require('../services/taskService');
const { getIO } = require('../config/socket');

const createTask = async (req, res) => {
    const task = await taskService.createTask(req.params.projectId, req.body, req.user);
    res.status(201).json(task);
    try {
        getIO().to(`project:${req.params.projectId}`).emit('task:created', task);
    } catch { /* socket not ready */ }
};

const getTasks = async (req, res) => {
    const tasks = await taskService.getTasksByProject(req.params.projectId, req.user);
    res.json(tasks);
};

const getTask = async (req, res) => {
    const task = await taskService.getTaskById(req.params.projectId, req.params.taskId, req.user);
    res.json(task);
};

const updateTask = async (req, res) => {
    const task = await taskService.updateTask(req.params.projectId, req.params.taskId, req.body, req.user);
    res.json(task);
    try {
        getIO().to(`project:${req.params.projectId}`).emit('task:updated', task);
    } catch { /* socket not ready */ }
};

const deleteTask = async (req, res) => {
    await taskService.deleteTask(req.params.projectId, req.params.taskId, req.user);
    res.json({ message: 'Task deleted successfully' });
    try {
        getIO().to(`project:${req.params.projectId}`).emit('task:deleted', {
            _id: req.params.taskId,
            projectId: req.params.projectId,
        });
    } catch { /* socket not ready */ }
};

module.exports = {
    createTask,
    deleteTask,
    getTask,
    getTasks,
    updateTask
};
