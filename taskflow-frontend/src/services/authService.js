import api from './api';

const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
};

const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
};

const getProfile = async () => {
    const { data } = await api.get('/auth/me');
    return data;
};

const getUsers = async () => {
    const { data } = await api.get('/auth/users');
    return data;
};

const updateUserRole = async (userId, role) => {
    const { data } = await api.patch(`/auth/users/${userId}/role`, { role });
    return data;
};

export {
    getProfile,
    getUsers,
    login,
    register,
    updateUserRole,
};
