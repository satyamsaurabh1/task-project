const projectService = require('../services/projectService');

const createProject = async (req, res) => {
    const project = await projectService.createProject(req.body, req.user);
    res.status(201).json(project);
};

const getProjects = async (req, res) => {
    const projects = await projectService.getProjectsForUser(req.user);
    res.json(projects);
};

const getProject = async (req, res) => {
    const project = await projectService.getProjectById(req.params.id, req.user);
    res.json(project);
};

const updateProject = async (req, res) => {
    const project = await projectService.updateProject(req.params.id, req.body, req.user);
    res.json(project);
};

const deleteProject = async (req, res) => {
    await projectService.deleteProject(req.params.id, req.user);
    res.json({ message: 'Project deleted successfully' });
};

const getDashboardStats = async (req, res) => {
    const stats = await projectService.getDashboardStats(req.user);
    res.json(stats);
};

module.exports = {
    createProject,
    deleteProject,
    getDashboardStats,
    getProject,
    getProjects,
    updateProject
};
