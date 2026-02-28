const Project = require('../models/Project');

const createProject = async (projectData, userId) => {
    const { title, description, members } = projectData;
    const project = await Project.create({
        title,
        description,
        createdBy: userId,
        members: members || []
    });
    return project;
};

const getProjects = async (userId) => {
    return await Project.find({
        $or: [
            { createdBy: userId },
            { members: userId }
        ]
    }).populate('createdBy', 'name email');
};

const getProjectById = async (projectId) => {
    return await Project.findById(projectId)
        .populate('createdBy', 'name email')
        .populate('members', 'name email');
};

const updateProject = async (projectId, updateData) => {
    return await Project.findByIdAndUpdate(projectId, updateData, {
        new: true,
        runValidators: true
    });
};

const deleteProject = async (projectId) => {
    return await Project.findByIdAndDelete(projectId);
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};
