const authService = require('../services/authService');

const register = async (req, res) => {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
};

const login = async (req, res) => {
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
    try {
        const user = await authService.getCurrentUser(req.user._id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('[AUTH] getMe Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUsers = async (req, res) => {
    // This is used for task assignment selection - keep it fast!
    const users = await authService.getUsers();
    res.json(users);
};

const updateUserRole = async (req, res) => {
    const user = await authService.updateUserRole(req.params.userId, req.body.role);
    res.json(user);
};

module.exports = {
    getMe,
    getUsers,
    login,
    logout,
    register,
    updateUserRole
};
