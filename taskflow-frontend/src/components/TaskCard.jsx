import { Link } from 'react-router-dom';
import { CalendarDays, Pencil, Trash2, User2 } from 'lucide-react';
import { formatDate, timeAgo } from '../utils/formatters';

const TaskCard = ({ projectId, task, onDelete, onStatusChange }) => {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('taskId', task._id);
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
    };

    return (
        <article
            className="task-card"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="task-card-top">
                <div>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                </div>
                <div className="task-card-actions">
                    <Link to={`/projects/${projectId}/tasks/${task._id}/edit`} className="icon-button">
                        <Pencil size={16} />
                    </Link>
                    <button type="button" className="icon-button" onClick={() => onDelete(task._id)}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="task-meta">
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                <span className="task-inline">
                    <CalendarDays size={14} />
                    {formatDate(task.dueDate)}
                </span>
                <span className="task-inline">
                    <User2 size={14} />
                    {task.assignedTo?.name || 'Unassigned'}
                </span>
                <span className="task-created">
                    {timeAgo(task.createdAt)}
                </span>
            </div>

            <select
                className="status-select"
                value={task.status}
                onChange={(event) => onStatusChange(task._id, event.target.value)}
            >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>
        </article>
    );
};

export default TaskCard;
