const express = require('express');
const projectController = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
    memberAssignmentValidation,
    projectIdParamValidation,
    projectValidation,
    userIdParamValidation,
    updateProjectValidation
} = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.get('/stats/overview', asyncHandler(projectController.getDashboardStats));
router.route('/')
    .get(asyncHandler(projectController.getProjects))
    .post(projectValidation, validate, asyncHandler(projectController.createProject));

router.route('/:projectId')
    .get(projectIdParamValidation, validate, asyncHandler(projectController.getProject))
    .put(updateProjectValidation, validate, asyncHandler(projectController.updateProject))
    .delete(projectIdParamValidation, validate, asyncHandler(projectController.deleteProject));

router.post('/:projectId/members', [...projectIdParamValidation, ...memberAssignmentValidation], validate, asyncHandler(projectController.addMember));
router.delete('/:projectId/members/:userId', [...projectIdParamValidation, ...userIdParamValidation], validate, asyncHandler(projectController.removeMember));

router.get('/:projectId/messages', projectIdParamValidation, validate, asyncHandler(projectController.getProjectMessages));

module.exports = router;
