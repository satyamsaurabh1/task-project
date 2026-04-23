import api from './api';

const getDashboardStats = async () => {
    const { data } = await api.get('/projects/stats/overview');
    return data;
};

const getProjects = async () => {
    const { data } = await api.get('/projects');
    return data;
};

const getProjectById = async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}`);
    return data;
};

const createProject = async (payload) => {
    const { data } = await api.post('/projects', payload);
    return data;
};

const addMember = async (projectId, userId) => {
    const { data } = await api.post(`/projects/${projectId}/members`, { userId });
    return data;
};

const removeMember = async (projectId, userId) => {
    const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
    return data;
};

const getProjectMessages = async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/messages`);
    return data;
};

export {
    addMember,
    createProject,
    getDashboardStats,
    getProjectById,
    getProjectMessages,
    getProjects,
    removeMember,
};
