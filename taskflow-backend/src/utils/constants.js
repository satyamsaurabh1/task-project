const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    TEAM_MEMBER: 'team_member'
};

const LEGACY_USER_ROLE = 'user';

const TASK_STATUSES = ['pending', 'in-progress', 'completed'];
const TASK_PRIORITIES = ['low', 'medium', 'high'];

const PERMISSIONS = {
    USERS_VIEW: 'users:view',
    USERS_MANAGE_ROLES: 'users:manage_roles',
    PROJECTS_CREATE: 'projects:create',
    PROJECTS_VIEW_ALL: 'projects:view_all',
    PROJECTS_VIEW_ASSIGNED: 'projects:view_assigned',
    PROJECTS_EDIT_ALL: 'projects:edit_all',
    PROJECTS_EDIT_ASSIGNED: 'projects:edit_assigned',
    PROJECTS_DELETE_ALL: 'projects:delete_all',
    PROJECTS_DELETE_ASSIGNED: 'projects:delete_assigned',
    PROJECT_MEMBERS_MANAGE_ALL: 'project_members:manage_all',
    PROJECT_MEMBERS_MANAGE_ASSIGNED: 'project_members:manage_assigned',
    TASKS_CREATE_ALL: 'tasks:create_all',
    TASKS_CREATE_ASSIGNED: 'tasks:create_assigned',
    TASKS_EDIT_ALL: 'tasks:edit_all',
    TASKS_EDIT_ASSIGNED: 'tasks:edit_assigned',
    TASKS_EDIT_OWN: 'tasks:edit_own',
    TASKS_DELETE_ALL: 'tasks:delete_all',
    TASKS_DELETE_ASSIGNED: 'tasks:delete_assigned'
};

const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
    [USER_ROLES.MANAGER]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.PROJECTS_CREATE,
        PERMISSIONS.PROJECTS_VIEW_ASSIGNED,
        PERMISSIONS.PROJECTS_EDIT_ASSIGNED,
        PERMISSIONS.PROJECTS_DELETE_ASSIGNED,
        PERMISSIONS.PROJECT_MEMBERS_MANAGE_ASSIGNED,
        PERMISSIONS.TASKS_CREATE_ASSIGNED,
        PERMISSIONS.TASKS_EDIT_ASSIGNED,
        PERMISSIONS.TASKS_DELETE_ASSIGNED
    ],
    [USER_ROLES.TEAM_MEMBER]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.PROJECTS_VIEW_ASSIGNED,
        PERMISSIONS.TASKS_CREATE_ASSIGNED,
        PERMISSIONS.TASKS_EDIT_OWN
    ],
    [LEGACY_USER_ROLE]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.PROJECTS_VIEW_ASSIGNED,
        PERMISSIONS.TASKS_CREATE_ASSIGNED,
        PERMISSIONS.TASKS_EDIT_OWN
    ]
};

const normalizeUserRole = (role) => {
    if (role === LEGACY_USER_ROLE) {
        return USER_ROLES.TEAM_MEMBER;
    }

    return role;
};

module.exports = {
    LEGACY_USER_ROLE,
    normalizeUserRole,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    USER_ROLES,
    TASK_STATUSES,
    TASK_PRIORITIES
};
