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
    // FOR DEMO: Allowing all users to see all projects so you can test collaboration easily.
    const query = {}; 
    /*
    const query = user.role === USER_ROLES.ADMIN
        ? {}
        : {
            $or: [
                { createdBy: user._id },
                { members: user._id }
            ]
        };
    */

    console.log(`[PROJECTS] Fetching for user: ${user.email}, query:`, JSON.stringify(query));
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

const addMember = async (projectId, memberId, user) => {
    const project = await validateProjectAccess(projectId, user, true);

    if (String(project.createdBy) === String(memberId)) {
        throw new ApiError(400, 'Owner is already a member');
    }

    if (project.members.includes(memberId)) {
        throw new ApiError(400, 'User is already a member');
    }

    project.members.push(memberId);
    await project.save();

    return Project.findById(projectId)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
};

const removeMember = async (projectId, memberId, user) => {
    const project = await validateProjectAccess(projectId, user, true);

    project.members = project.members.filter((m) => String(m) !== String(memberId));
    await project.save();

    return Project.findById(projectId)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
};

const Message = require('../models/Message');

const getProjectMessages = async (projectId, user) => {
    await validateProjectAccess(projectId, user);

    return Message.find({ projectId })
        .populate('sender', 'name email role')
        .sort({ createdAt: 1 })
        .limit(100);
};

module.exports = {
    addMember,
    createProject,
    deleteProject,
    getDashboardStats,
    getProjectById,
    getProjectMessages,
    getProjectsForUser,
    removeMember,
    updateProject
};
