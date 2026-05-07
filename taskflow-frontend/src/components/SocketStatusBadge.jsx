import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import './SocketStatusBadge.css';

const SocketStatusBadge = ({ showLabel = true }) => {
    const { connectionState } = useSocket();

    const getStatusConfig = () => {
        switch (connectionState) {
            case 'live':
                return {
                    class: 'ws-live',
                    icon: <Wifi size={14} />,
                    label: 'Live',
                    pulse: true
                };
            case 'reconnecting':
                return {
                    class: 'ws-reconnecting',
                    icon: <RefreshCw size={14} className="spin" />,
                    label: 'Connecting...',
                    pulse: false
                };
            default:
                return {
                    class: 'ws-offline',
                    icon: <WifiOff size={14} />,
                    label: 'Offline',
                    pulse: false
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`ws-status-badge ${config.class}`}>
            <div className="ws-status-icon-wrapper">
                {config.icon}
                {config.pulse && <span className="ws-pulse-ring" />}
            </div>
            {showLabel && <span className="ws-status-label">{config.label}</span>}
        </div>
    );
};

export default SocketStatusBadge;
