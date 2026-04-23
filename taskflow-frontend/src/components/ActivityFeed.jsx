import { Clock, PlusCircle, Edit3, Trash2, UserPlus, Upload } from 'lucide-react';

const iconMap = {
    'created task': <PlusCircle size={14} />,
    'updated task': <Edit3 size={14} />,
    'deleted task': <Trash2 size={14} />,
    'added member': <UserPlus size={14} />,
    'uploaded file': <Upload size={14} />,
    'changed status': <Edit3 size={14} />,
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

const ActivityFeed = ({ activities = [] }) => {
    if (activities.length === 0) {
        return (
            <div className="activity-feed-empty">
                <Clock size={24} opacity={0.3} />
                <p>No recent activity</p>
            </div>
        );
    }

    return (
        <div className="activity-feed" id="activity-feed">
            {activities.slice(0, 20).map((activity, i) => (
                <div key={activity._id || i} className="activity-item">
                    <div className="activity-icon">
                        {iconMap[activity.action] || <Clock size={14} />}
                    </div>
                    <div className="activity-content">
                        <span className="activity-user">{activity.userName || 'Someone'}</span>
                        <span className="activity-action"> {activity.action}</span>
                        {activity.field && <span className="activity-field"> ({activity.field})</span>}
                        {activity.newValue && (
                            <span className="activity-value"> → {activity.newValue}</span>
                        )}
                        <span className="activity-time">{timeAgo(activity.timestamp)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
