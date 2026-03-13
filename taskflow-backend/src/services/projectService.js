const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/apiError');
const { USER_ROLES } = require('../utils/constants');
const { validateProjectAccess } = require('../utils/accessControl');

const createProject = async (payload, user) => {
    const memberIds = [...new Set([...(payload.members || []), String(user._id)])];

    const project = await Project.create({
        title: payload.title,
        description: payload.description,
        createdBy: user._id,
        members: memberIds.filter((memberId) => memberId !== String(user._id))
    });

    return Project.findById(project._id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
};

const getProjectsForUser = async (user) => {
    const query = user.role === USER_ROLES.ADMIN
        ? {}
        : {
            $or: [
                { createdBy: user._id },
                { members: user._id }
            ]
        };

    return Project.find(query)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role')
        .sort({ updatedAt: -1 });
};

const getProjectById = async (projectId, user) => {
    await validateProjectAccess(projectId, user);

    return Project.findById(projectId)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
};

const updateProject = async (projectId, payload, user) => {
    const project = await validateProjectAccess(projectId, user, true);

    const nextMembers = payload.members
        ? [...new Set(payload.members.filter((memberId) => memberId !== String(project.createdBy)))]
        : project.members;

    project.title = payload.title ?? project.title;
    project.description = payload.description ?? project.description;
    project.members = nextMembers;

    await project.save();

    return Project.findById(project._id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
};

const deleteProject = async (projectId, user) => {
    await validateProjectAccess(projectId, user, true);

    await Task.deleteMany({ projectId });
    const project = await Project.findById(projectId);
    await project.deleteOne();
};

const getDashboardStats = async (user) => {
    const projects = await getProjectsForUser(user);
    const projectIds = projects.map((p) => p._id);

    const taskStats = await Task.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
            }
        }
    ]);

    const stats = taskStats[0] || { total: 0, completed: 0 };

    return {
        totalProjects: projects.length,
        totalTasks: stats.total,
        completedTasks: stats.completed,
        pendingTasks: stats.total - stats.completed
    };
};

module.exports = {
    createProject,
    deleteProject,
    getDashboardStats,
    getProjectById,
    getProjectsForUser,
    updateProject
};
