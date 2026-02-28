const Task = require('../models/Task');

const createTask = async (taskData) => {
    return await Task.create(taskData);
};

const getTasksByProject = async (projectId) => {
    return await Task.find({ projectId }).populate('assignedTo', 'name email');
};

const getTaskById = async (taskId) => {
    return await Task.findById(taskId).populate('assignedTo', 'name email');
};

const updateTask = async (taskId, updateData) => {
    return await Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
        runValidators: true
    });
};

const deleteTask = async (taskId) => {
    return await Task.findByIdAndDelete(taskId);
};

module.exports = {
    createTask,
    getTasksByProject,
    getTaskById,
    updateTask,
    deleteTask
};
