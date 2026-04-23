const projectService = require('../services/projectService');
const { getIO } = require('../config/socket');

const createProject = async (req, res) => {
    const project = await projectService.createProject(req.body, req.user);
    res.status(201).json(project);
    // Broadcast to all users watching the projects room
    try {
        getIO().to('projects').emit('project:created', project);
    } catch { /* socket not ready */ }
};

const getProjects = async (req, res) => {
    const projects = await projectService.getProjectsForUser(req.user);
    res.json(projects);
};

const getProject = async (req, res) => {
    const project = await projectService.getProjectById(req.params.projectId, req.user);
    res.json(project);
};

const updateProject = async (req, res) => {
    const project = await projectService.updateProject(req.params.projectId, req.body, req.user);
    res.json(project);
    try {
        getIO().to('projects').emit('project:updated', project);
    } catch { /* socket not ready */ }
};

const deleteProject = async (req, res) => {
    await projectService.deleteProject(req.params.projectId, req.user);
    res.json({ message: 'Project deleted successfully' });
    try {
        getIO().to('projects').emit('project:deleted', { _id: req.params.projectId });
    } catch { /* socket not ready */ }
};

const getDashboardStats = async (req, res) => {
    const stats = await projectService.getDashboardStats(req.user);
    res.json(stats);
};

const addMember = async (req, res) => {
    const project = await projectService.addMember(req.params.projectId, req.body.userId, req.user);
    res.json(project);
    try {
        getIO().to(`project:${req.params.projectId}`).emit('project:updated', project);
        // Also broadcast the update to the global projects room so the dashboard updates
        getIO().to('projects').emit('project:updated', project);
    } catch { /* socket not ready */ }
};

const removeMember = async (req, res) => {
    const project = await projectService.removeMember(req.params.projectId, req.params.userId, req.user);
    res.json(project);
    try {
        getIO().to(`project:${req.params.projectId}`).emit('project:updated', project);
        getIO().to('projects').emit('project:updated', project);
    } catch { /* socket not ready */ }
};

const getProjectMessages = async (req, res) => {
    const messages = await projectService.getProjectMessages(req.params.projectId, req.user);
    res.json(messages);
};

module.exports = {
    addMember,
    createProject,
    deleteProject,
    getDashboardStats,
    getProject,
    getProjects,
    getProjectMessages,
    removeMember,
    updateProject
};
