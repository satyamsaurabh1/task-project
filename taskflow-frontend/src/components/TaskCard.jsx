import { Link } from 'react-router-dom';
import { Trash2, Edit3, User, Paperclip } from 'lucide-react';
import DeadlineCountdown from './DeadlineCountdown';

const TaskCard = ({ task, projectId, onDelete, onStatusChange, dragHandlers = {} }) => {
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

    return (
        <div
            className={`task-card ${isOverdue ? 'task-card--overdue' : ''}`}
            draggable
            {...dragHandlers}
            id={`task-card-${task._id}`}
        >
            <div className="task-card-top">
                <h4>{task.title}</h4>
                <div className="task-card-actions">
                    <Link to={`/projects/${projectId}/tasks/${task._id}/edit`} className="icon-button" title="Edit">
                        <Edit3 size={14} />
                    </Link>
                    <button className="icon-button" onClick={() => onDelete(task._id)} title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <p>{task.description?.slice(0, 80)}{task.description?.length > 80 ? '…' : ''}</p>

            <div className="task-meta">
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>

                {task.deadline && <DeadlineCountdown deadline={task.deadline} compact />}

                {isOverdue && <span className="badge badge-overdue">OVERDUE</span>}

                {task.assignedTo && (
                    <span className="task-inline">
                        <User size={12} />
                        {task.assignedTo.name || 'Assigned'}
                    </span>
                )}

                {task.attachments?.length > 0 && (
                    <span className="task-inline">
                        <Paperclip size={12} />
                        {task.attachments.length}
                    </span>
                )}
            </div>

            <select
                className="status-select"
                value={task.status}
                onChange={(e) => onStatusChange(task._id, e.target.value)}
                id={`status-select-${task._id}`}
            >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>
        </div>
    );
};

export default TaskCard;
