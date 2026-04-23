const express = require('express');
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { USER_ROLES } = require('../utils/constants');
const { projectIdParamValidation, taskIdParamsValidation, taskValidation, updateTaskValidation } = require('../utils/validators');

const router = express.Router({ mergeParams: true });

router.use(protect, authorize(USER_ROLES.ADMIN, USER_ROLES.USER));

router.route('/')
    .get(projectIdParamValidation, validate, asyncHandler(taskController.getTasks))
    .post(taskValidation, validate, asyncHandler(taskController.createTask));

router.route('/:taskId')
    .get(taskIdParamsValidation, validate, asyncHandler(taskController.getTask))
    .put(updateTaskValidation, validate, asyncHandler(taskController.updateTask))
    .delete(taskIdParamsValidation, validate, asyncHandler(taskController.deleteTask));

module.exports = router;
