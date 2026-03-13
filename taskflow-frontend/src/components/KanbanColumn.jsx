import EmptyState from './EmptyState';
import TaskCard from './TaskCard';

const KanbanColumn = ({ tasks, title, status, projectId, onDelete, onStatusChange, onDrop }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleLocalDrop = (e) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onDrop(taskId, status);
        }
    };

    return (
        <section
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={handleLocalDrop}
        >
            <div className="kanban-column-header">
                <h3>{title}</h3>
                <span>{tasks.length}</span>
            </div>

            <div className="kanban-column-body">
                {tasks.length ? tasks.map((task) => (
                    <TaskCard
                        key={task._id}
                        projectId={projectId}
                        task={task}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                    />
                )) : (
                    <EmptyState
                        title="No tasks here"
                        description="Move work into this stage or create a new task."
                    />
                )}
            </div>
        </section>
    );
};

export default KanbanColumn;
