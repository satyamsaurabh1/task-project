const { body, param } = require('express-validator');
const { TASK_PRIORITIES, TASK_STATUSES, USER_ROLES } = require('./constants');

const mongoIdField = (field, location = 'body') => {
    const validator = location === 'param' ? param(field) : body(field);
    return validator.isMongoId().withMessage(`${field} must be a valid Mongo ObjectId`);
};

const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email must be valid')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(Object.values(USER_ROLES))
        .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`)
];

const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email must be valid')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required'),
    body('members')
        .optional()
        .isArray()
        .withMessage('Members must be an array'),
    body('members.*')
        .optional()
        .isMongoId()
        .withMessage('Each member must be a valid Mongo ObjectId')
];

const updateProjectValidation = [
    param('projectId')
        .isMongoId()
        .withMessage('Project id must be a valid Mongo ObjectId'),
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Project title cannot be empty'),
    body('description')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Project description cannot be empty'),
    body('members')
        .optional()
        .isArray()
        .withMessage('Members must be an array'),
    body('members.*')
        .optional()
        .isMongoId()
        .withMessage('Each member must be a valid Mongo ObjectId')
];

const taskValidation = [
    param('projectId')
        .isMongoId()
        .withMessage('Project id must be a valid Mongo ObjectId'),
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Task description is required'),
    body('status')
        .optional()
        .isIn(TASK_STATUSES)
        .withMessage(`Task status must be one of: ${TASK_STATUSES.join(', ')}`),
    body('priority')
        .optional()
        .isIn(TASK_PRIORITIES)
        .withMessage(`Task priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
    body('dueDate')
        .optional({ values: 'falsy' })
        .isISO8601()
        .withMessage('Due date must be a valid ISO date'),
    body('assignedTo')
        .optional({ values: 'falsy' })
        .isMongoId()
        .withMessage('assignedTo must be a valid Mongo ObjectId')
];

const updateTaskValidation = [
    param('projectId')
        .isMongoId()
        .withMessage('Project id must be a valid Mongo ObjectId'),
    param('taskId')
        .isMongoId()
        .withMessage('Task id must be a valid Mongo ObjectId'),
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Task title cannot be empty'),
    body('description')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Task description cannot be empty'),
    body('status')
        .optional()
        .isIn(TASK_STATUSES)
        .withMessage(`Task status must be one of: ${TASK_STATUSES.join(', ')}`),
    body('priority')
        .optional()
        .isIn(TASK_PRIORITIES)
        .withMessage(`Task priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
    body('dueDate')
        .optional({ values: 'falsy' })
        .isISO8601()
        .withMessage('Due date must be a valid ISO date'),
    body('assignedTo')
        .optional({ values: 'falsy' })
        .isMongoId()
        .withMessage('assignedTo must be a valid Mongo ObjectId')
];

const projectIdParamValidation = [
    param('projectId')
        .isMongoId()
        .withMessage('Project id must be a valid Mongo ObjectId')
];

const memberAssignmentValidation = [
    body('userId')
        .notEmpty()
        .withMessage('userId is required')
        .isMongoId()
        .withMessage('userId must be a valid Mongo ObjectId')
];

const userIdParamValidation = [
    param('userId')
        .isMongoId()
        .withMessage('User id must be a valid Mongo ObjectId')
];

const updateUserRoleValidation = [
    ...userIdParamValidation,
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(Object.values(USER_ROLES))
        .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`)
];

const taskIdParamsValidation = [
    param('projectId')
        .isMongoId()
        .withMessage('Project id must be a valid Mongo ObjectId'),
    param('taskId')
        .isMongoId()
        .withMessage('Task id must be a valid Mongo ObjectId')
];

module.exports = {
    loginValidation,
    memberAssignmentValidation,
    projectIdParamValidation,
    projectValidation,
    registerValidation,
    taskIdParamsValidation,
    taskValidation,
    updateUserRoleValidation,
    updateProjectValidation,
    updateTaskValidation,
    userIdParamValidation
};
