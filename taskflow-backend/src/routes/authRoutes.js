const express = require('express');
const authController = require('../controllers/authController');
const { authorize, protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { USER_ROLES } = require('../utils/constants');
const { loginValidation, registerValidation } = require('../utils/validators');

const router = express.Router();

router.post('/register', registerValidation, validate, asyncHandler(authController.register));
router.post('/login', loginValidation, validate, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', protect, authorize(USER_ROLES.ADMIN, USER_ROLES.USER), asyncHandler(authController.getMe));
router.get('/users', protect, authorize(USER_ROLES.ADMIN, USER_ROLES.USER), asyncHandler(authController.getUsers));

module.exports = router;
