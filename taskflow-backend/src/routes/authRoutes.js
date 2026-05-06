const express = require('express');
const authController = require('../controllers/authController');
const { authorize, protect, requirePermission } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { PERMISSIONS, USER_ROLES } = require('../utils/constants');
const { loginValidation, registerValidation, updateUserRoleValidation } = require('../utils/validators');

const router = express.Router();

router.post('/register', registerValidation, validate, asyncHandler(authController.register));
router.post('/login', loginValidation, validate, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', protect, asyncHandler(authController.getMe));
router.get(
    '/users',
    protect,
    requirePermission(PERMISSIONS.USERS_VIEW),
    asyncHandler(authController.getUsers)
);
router.patch(
    '/users/:userId/role',
    protect,
    authorize(USER_ROLES.ADMIN),
    requirePermission(PERMISSIONS.USERS_MANAGE_ROLES),
    updateUserRoleValidation,
    validate,
    asyncHandler(authController.updateUserRole)
);

module.exports = router;
