const taskService = require('../services/taskService');

const createTask = async (req, res) => {
    const task = await taskService.createTask(req.params.projectId, req.body, req.user);
    res.status(201).json(task);
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
};

const deleteTask = async (req, res) => {
    await taskService.deleteTask(req.params.projectId, req.params.taskId, req.user);
    res.json({ message: 'Task deleted successfully' });
};

module.exports = {
    createTask,
    deleteTask,
    getTask,
    getTasks,
    updateTask
};
