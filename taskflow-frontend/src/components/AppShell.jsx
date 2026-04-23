import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FolderOpen, User, LogOut,
    Bell, Sun, Moon, MessageSquare, Calendar, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import NotificationPanel from './NotificationPanel';

const AppShell = ({ title, subtitle, actions, children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount, setPanelOpen, panelOpen, fetchNotifications } = useNotifications();
    const { socket } = useSocket();

    // Real-time notification listeners
    useEffect(() => {
        if (!socket) return;
        const onNotification = (notif) => {
            const icon = notif.type === 'deadline_overdue' ? '⚠️' :
                         notif.type === 'deadline_reminder' ? '⏰' :
                         notif.type === 'mention' ? '💬' : '🔔';
            toast(`${icon} ${notif.title || 'New notification'}`, { duration: 5000 });
            fetchNotifications();
        };
        const onOverdue = (data) => toast.error(`⚠️ OVERDUE: "${data.taskTitle}"`, { duration: 8000 });
        const onReminder = (data) => toast(`⏰ Due soon: "${data.taskTitle}"`, { duration: 6000 });

        const onDmReceived = ({ fromUserId, message }) => {
            // Check if we're on the DM page for this specific user
            const isOnDmPageWithUser = window.location.pathname === `/dm/${fromUserId}`;
            if (!isOnDmPageWithUser) {
                const senderName = message.sender?.name || 'Someone';
                toast(`💬 Message from ${senderName}: ${message.text?.substring(0, 30)}${message.text?.length > 30 ? '...' : ''}`, {
                    duration: 4000,
                    style: {
                        background: '#1a1f2e',
                        color: '#fff',
                        border: '1px solid #30363d',
                    },
                    onClick: () => navigate(`/dm/${fromUserId}`)
                });
            }
        };

        socket.on('notification:new', onNotification);
        socket.on('deadline:overdue', onOverdue);
        socket.on('deadline:reminder', onReminder);
        socket.on('dm:received', onDmReceived);
        return () => {
            socket.off('notification:new', onNotification);
            socket.off('deadline:overdue', onOverdue);
            socket.off('deadline:reminder', onReminder);
            socket.off('dm:received', onDmReceived);
        };
    }, [socket, fetchNotifications, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? String(user.name).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand-mark">
                    <div className="brand-dot" />
                    <div>
                        <strong style={{ letterSpacing: '-0.02em', fontSize: '1.2rem' }}>TaskFlow</strong>
                    </div>
                </div>

                <nav className="nav-stack">
                    <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <Calendar size={18} />
                        Calendar
                    </NavLink>
                    <NavLink to="/dm" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <MessageSquare size={18} />
                        Conversation Place
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <User size={18} />
                        Profile
                    </NavLink>
                </nav>

                <div className="sidebar-panel">
                    <div className="sidebar-user">
                        <div className="user-avatar-sm">
                            {initials}
                        </div>
                        <div>
                            <strong>{user?.name}</strong>
                            <span>{user?.role}</span>
                        </div>
                    </div>
                    <div className="sidebar-actions-row">
                        <button
                            className="icon-button notification-btn"
                            onClick={() => setPanelOpen(true)}
                            aria-label="Notifications"
                            id="notification-bell-btn"
                        >
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>
                        <button
                            className="icon-button"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            id="theme-toggle-btn"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button
                            className="icon-button"
                            onClick={handleLogout}
                            aria-label="Logout"
                            id="logout-btn"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="workspace">
                <div className="page-header">
                    <div>
                        <h1>{title}</h1>
                        {subtitle && <p className="page-subtitle" style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '1rem' }}>{subtitle}</p>}
                    </div>
                    {actions && <div className="page-actions">{actions}</div>}
                </div>
                {children}
            </main>

            {panelOpen && <NotificationPanel onClose={() => setPanelOpen(false)} />}
        </div>
    );
};

export default AppShell;
