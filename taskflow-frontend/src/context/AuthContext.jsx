import { createContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import { clearStoredUser, getStoredUser, setStoredUser } from '../utils/storage';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser());
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const bootstrapAuth = async () => {
            const storedUser = getStoredUser();

            if (!storedUser?.token) {
                setInitializing(false);
                return;
            }

            try {
                const profile = await authService.getProfile();
                const nextUser = { ...storedUser, ...profile };
                setStoredUser(nextUser);
                setUser(nextUser);
            } catch {
                clearStoredUser();
                setUser(null);
                toast.error('Your session expired. Please sign in again.');
            } finally {
                setInitializing(false);
            }
        };

        bootstrapAuth();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        setStoredUser(response);
        setUser(response);
        return response;
    };

    const register = async (payload) => {
        const response = await authService.register(payload);
        setStoredUser(response);
        setUser(response);
        return response;
    };

    const logout = () => {
        clearStoredUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                initializing,
                login,
                logout,
                register,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export {
    AuthProvider,
    AuthContext,
};
