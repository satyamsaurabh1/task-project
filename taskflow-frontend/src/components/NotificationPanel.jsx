import { useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Clock, AlertTriangle, MessageSquare, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';

const iconMap = {
    deadline_overdue: <AlertTriangle size={16} style={{ color: '#ef4444' }} />,
    deadline_reminder: <Clock size={16} style={{ color: '#f59e0b' }} />,
    task_assigned: <UserPlus size={16} style={{ color: '#10b981' }} />,
    task_updated: <Check size={16} style={{ color: '#06b6d4' }} />,
    mention: <MessageSquare size={16} style={{ color: '#8b5cf6' }} />,
    dm: <MessageSquare size={16} style={{ color: '#06b6d4' }} />,
    project_invite: <UserPlus size={16} style={{ color: '#10b981' }} />,
};

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationPanel = ({ onClose }) => {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const navigate = useNavigate();
    const panelRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const handleNotifClick = (notif) => {
        if (!notif.read) markRead(notif._id);
        if (notif.link) navigate(notif.link);
        onClose();
    };

    return (
        <div className="notif-overlay">
            <div className="notif-panel" ref={panelRef} role="dialog" aria-label="Notifications">
                <div className="notif-header">
                    <div className="notif-header-left">
                        <Bell size={18} />
                        <span>Notifications</span>
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {unreadCount > 0 && (
                            <button className="icon-button" onClick={markAllRead} title="Mark all read">
                                <CheckCheck size={16} />
                            </button>
                        )}
                        <button className="icon-button" onClick={onClose}>
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="notif-list" id="notification-list">
                    {notifications.length === 0 ? (
                        <div className="notif-empty">
                            <Bell size={32} opacity={0.3} />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n._id}
                                className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                                onClick={() => handleNotifClick(n)}
                                id={`notif-${n._id}`}
                            >
                                <div className="notif-icon">{iconMap[n.type] || <Bell size={16} />}</div>
                                <div className="notif-content">
                                    <p className="notif-title">{n.title}</p>
                                    <p className="notif-msg">{n.message}</p>
                                    <span className="notif-time">{timeAgo(n.createdAt)}</span>
                                </div>
                                {!n.read && <div className="notif-dot" />}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;
