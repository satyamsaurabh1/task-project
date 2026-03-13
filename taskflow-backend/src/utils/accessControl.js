const Project = require('../models/Project');
const ApiError = require('../utils/apiError');
const { USER_ROLES } = require('../utils/constants');

/**
 * Validates if a user has access to a project and returns it.
 * Centralizes membership logic to ensure consistency.
 */
const validateProjectAccess = async (projectId, user, requireOwner = false) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    if (user.role === USER_ROLES.ADMIN) {
        return project;
    }

    const userIdString = String(user._id);
    const ownerIdString = String(project.createdBy);
    const isOwner = ownerIdString === userIdString;
    const isMember = project.members.some((memberId) => String(memberId) === userIdString);

    if (requireOwner && !isOwner) {
        console.warn(`Access Denied: User ${userIdString} is not owner of project ${projectId}. Owner is ${ownerIdString}`);
        throw new ApiError(403, 'Only the project owner can perform this action');
    }

    if (!isOwner && !isMember) {
        console.warn(`Access Denied: User ${userIdString} has no access to project ${projectId}. Members: [${project.members.join(', ')}]`);
        throw new ApiError(403, 'You do not have access to this project');
    }

    return project;
};

module.exports = {
    validateProjectAccess
};
