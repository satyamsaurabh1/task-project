import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const getTimeLeft = (deadline) => {
    const now = Date.now();
    const end = new Date(deadline).getTime();
    const diff = end - now;

    if (diff <= 0) return { overdue: true, text: 'OVERDUE', urgency: 'critical' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let urgency = 'normal';
    if (diff < 60 * 60 * 1000) urgency = 'critical';       // < 1 hour
    else if (diff < 24 * 60 * 60 * 1000) urgency = 'high'; // < 1 day
    else if (diff < 3 * 24 * 60 * 60 * 1000) urgency = 'medium'; // < 3 days

    let text = '';
    if (days > 0) text = `${days}d ${hours}h`;
    else if (hours > 0) text = `${hours}h ${mins}m`;
    else text = `${mins}m`;

    return { overdue: false, text, urgency };
};

const DeadlineCountdown = ({ deadline, compact = false }) => {
    const [state, setState] = useState(() => getTimeLeft(deadline));

    useEffect(() => {
        const interval = setInterval(() => {
            setState(getTimeLeft(deadline));
        }, 30000); // update every 30s
        return () => clearInterval(interval);
    }, [deadline]);

    const urgencyColors = {
        normal: '#10b981',
        medium: '#f59e0b',
        high: '#f97316',
        critical: '#ef4444',
    };

    const color = urgencyColors[state.urgency] || urgencyColors.normal;
    const Icon = state.overdue ? AlertTriangle : Clock;

    if (compact) {
        return (
            <span className={`deadline-badge deadline-badge--${state.urgency}`} title={`Deadline: ${new Date(deadline).toLocaleString()}`}>
                <Icon size={11} />
                {state.text}
            </span>
        );
    }

    return (
        <div className={`deadline-countdown deadline-countdown--${state.urgency}`} style={{ borderColor: color }}>
            <Icon size={14} style={{ color }} />
            <span style={{ color }}>
                {state.overdue ? 'OVERDUE' : `Due in ${state.text}`}
            </span>
        </div>
    );
};

export default DeadlineCountdown;
