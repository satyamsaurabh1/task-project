const USER_STORAGE_KEY = 'taskflow_user';

const getStoredUser = () => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

const setStoredUser = (user) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearStoredUser = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
};

export {
    USER_STORAGE_KEY,
    clearStoredUser,
    getStoredUser,
    setStoredUser,
};
