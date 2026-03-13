const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { generateAccessToken } = require('../utils/jwt');

const formatAuthResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateAccessToken({ id: user._id, role: user.role })
});

const registerUser = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, 'A user with this email already exists');
    }

    const user = await User.create({ name, email, password, role });
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

    return user;
};

const getUsers = async () => User.find({}, 'name email role createdAt').sort({ name: 1 });

module.exports = {
    getCurrentUser,
    getUsers,
    loginUser,
    registerUser
};
