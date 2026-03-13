import axios from 'axios';
import { clearStoredUser, getStoredUser } from '../utils/storage';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const user = getStoredUser();

    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearStoredUser();
        }

        return Promise.reject(error);
    }
);

export default api;
