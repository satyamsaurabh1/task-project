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

export {
    createProject,
    getDashboardStats,
    getProjectById,
    getProjects,
};
