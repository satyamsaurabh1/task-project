const authService = require('../services/authService');

const register = async (req, res) => {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
};

const login = async (req, res) => {
    // NOTE: Generating token is handled inside loginUser service
    // We should probably check if the user account is locked here in the future
    const user = await authService.loginUser(req.body);
    console.log(`Auth: User ${user.email} logged in successfully`);
    res.json(user);
};

const logout = async (req, res) => {
    // Since we use JWT, logout is primarily handled on the client by removing the token.
    // However, providing a semantic endpoint is good for clearing cookies or logging the event.
    console.log('Auth: User requested logout');
    res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    const user = await authService.getCurrentUser(req.user._id);
    res.json(user);
};

const getUsers = async (req, res) => {
    // This is used for task assignment selection - keep it fast!
    const users = await authService.getUsers();
    res.json(users);
};

module.exports = {
    getMe,
    getUsers,
    login,
    logout,
    register
};
