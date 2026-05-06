const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { generateAccessToken } = require('../utils/jwt');
const { ROLE_PERMISSIONS, USER_ROLES, normalizeUserRole } = require('../utils/constants');

const formatAuthResponse = (user) => {
    const normalizedRole = normalizeUserRole(user.role);

    return ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: normalizedRole,
    permissions: ROLE_PERMISSIONS[normalizedRole] || [],
    token: generateAccessToken({ id: user._id, role: normalizedRole })
});
};

const registerUser = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, 'A user with this email already exists');
    }

    const safeRole = role === USER_ROLES.TEAM_MEMBER ? role : USER_ROLES.TEAM_MEMBER;
    const user = await User.create({ name, email, password, role: safeRole });
    return formatAuthResponse(user);
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, 'Invalid email or password');
    }

    return formatAuthResponse(user);
};

const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select('-password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return {
        ...user.toObject(),
        role: normalizeUserRole(user.role),
        permissions: ROLE_PERMISSIONS[normalizeUserRole(user.role)] || []
    };
};

const getUsers = async () => {
    const users = await User.find({}, 'name email role createdAt').sort({ name: 1 });

    return users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeUserRole(user.role),
        createdAt: user.createdAt
    }));
};

const updateUserRole = async (userId, role) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.role = role;
    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeUserRole(user.role),
        permissions: ROLE_PERMISSIONS[normalizeUserRole(user.role)] || []
    };
};

module.exports = {
    getCurrentUser,
    getUsers,
    loginUser,
    registerUser,
    updateUserRole
};
