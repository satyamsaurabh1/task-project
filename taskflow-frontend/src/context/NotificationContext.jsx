import { createContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [panelOpen, setPanelOpen] = useState(false);
    const { user } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!user?.token) return;
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {/* silent */}
    }, [user?.token]);

    useEffect(() => {
        if (!user?.token) {
            return undefined;
        }

        let isCancelled = false;

        const loadNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                if (isCancelled) {
                    return;
                }

                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } catch {
                // Silent on bootstrapping notifications.
            }
        };

        loadNotifications();

        return () => {
            isCancelled = true;
        };
    }, [user?.token]);

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {/* silent */}
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {/* silent */}
    };

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, panelOpen, setPanelOpen,
            markRead, markAllRead, fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export { NotificationContext };
