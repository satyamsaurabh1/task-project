const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/apiError');
const { PERMISSIONS, ROLE_PERMISSIONS, USER_ROLES, normalizeUserRole } = require('../utils/constants');

/**
 * Validates if a user has access to a project and returns it.
 * Centralizes membership logic to ensure consistency.
 */
const normalizeId = (value) => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value.toString === 'function') {
        return value.toString();
    }

    return String(value);
};

const hasPermission = (user, permission) => {
    const permissions = ROLE_PERMISSIONS[normalizeUserRole(user.role)] || [];
    return permissions.includes(permission);
};

const isProjectOwner = (project, user) => {
    const userIdString = normalizeId(user._id || user.id);
    const ownerIdString = normalizeId(project.createdBy);
    return ownerIdString === userIdString;
};

const isProjectMember = (project, user) => {
    const userIdString = normalizeId(user._id || user.id);
    return project.members.some((memberId) => normalizeId(memberId) === userIdString);
};

const canAccessProject = (project, user) => {
    if (user.role === USER_ROLES.ADMIN) {
        return true;
    }

    return isProjectOwner(project, user) || isProjectMember(project, user);
};

const validateProjectAccess = async (projectId, user) => {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    if (!canAccessProject(project, user)) {
        throw new ApiError(403, 'You do not have access to this project');
    }

    return project;
};

const ensureProjectPermission = async (projectId, user, permission) => {
    const project = await validateProjectAccess(projectId, user);

    if (normalizeUserRole(user.role) === USER_ROLES.ADMIN) {
        return project;
    }

    const isOwner = isProjectOwner(project, user);

    if (
        (permission === PERMISSIONS.TASKS_CREATE_ASSIGNED ||
            permission === PERMISSIONS.TASKS_EDIT_ASSIGNED ||
            permission === PERMISSIONS.TASKS_DELETE_ASSIGNED) &&
        hasPermission(user, permission) &&
        canAccessProject(project, user)
    ) {
        return project;
    }

    if (
        (permission === PERMISSIONS.PROJECTS_EDIT_ASSIGNED ||
            permission === PERMISSIONS.PROJECTS_DELETE_ASSIGNED ||
            permission === PERMISSIONS.PROJECT_MEMBERS_MANAGE_ASSIGNED ||
            permission === PERMISSIONS.PROJECTS_EDIT_ALL ||
            permission === PERMISSIONS.PROJECTS_DELETE_ALL ||
            permission === PERMISSIONS.PROJECT_MEMBERS_MANAGE_ALL) &&
        hasPermission(user, permission) &&
        isOwner
    ) {
        return project;
    }

    throw new ApiError(403, 'You do not have permission to perform this action on this project');
};

const ensureTaskPermission = async (projectId, taskId, user, permission) => {
    const project = await validateProjectAccess(projectId, user);
    const task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    if (normalizeUserRole(user.role) === USER_ROLES.ADMIN) {
        return { project, task };
    }

    const isAssignedProjectUser = canAccessProject(project, user);
    const isTaskOwner = normalizeId(task.createdBy) === normalizeId(user._id || user.id);

    if (
        (permission === PERMISSIONS.TASKS_EDIT_ASSIGNED || permission === PERMISSIONS.TASKS_DELETE_ASSIGNED) &&
        hasPermission(user, permission) &&
        isAssignedProjectUser
    ) {
        return { project, task };
    }

    if (permission === PERMISSIONS.TASKS_EDIT_OWN && hasPermission(user, permission) && isTaskOwner) {
        return { project, task };
    }

    if (
        permission === PERMISSIONS.TASKS_EDIT_ASSIGNED &&
        hasPermission(user, PERMISSIONS.TASKS_EDIT_OWN) &&
        isTaskOwner
    ) {
        return { project, task };
    }

    if (
        (permission === PERMISSIONS.TASKS_EDIT_ALL || permission === PERMISSIONS.TASKS_DELETE_ALL) &&
        hasPermission(user, permission)
    ) {
        return { project, task };
    }

    throw new ApiError(403, 'You do not have permission to perform this action on this task');
};

module.exports = {
    ensureProjectPermission,
    ensureTaskPermission,
    hasPermission,
    isProjectMember,
    isProjectOwner,
    validateProjectAccess
};
