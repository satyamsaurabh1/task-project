const User = require('../models/User');
const { generateToken } = require('../utils/token');

const registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        };
    } else {
        throw new Error('Invalid user data');
    }
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const getUserProfile = async (id) => {
    const user = await User.findById(id);
    if (user) {
        return user;
    } else {
        throw new Error('User not found');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};
