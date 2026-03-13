import api from './api';

const getTasksByProject = async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/tasks`);
    return data;
};

const getTaskById = async (projectId, taskId) => {
    const { data } = await api.get(`/projects/${projectId}/tasks/${taskId}`);
    return data;
};

const createTask = async (projectId, payload) => {
    const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
    return data;
};

const updateTask = async (projectId, taskId, payload) => {
    const { data } = await api.put(`/projects/${projectId}/tasks/${taskId}`, payload);
    return data;
};

const deleteTask = async (projectId, taskId) => {
    const { data } = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return data;
};

export {
    createTask,
    deleteTask,
    getTaskById,
    getTasksByProject,
    updateTask,
};
