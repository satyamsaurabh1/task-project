import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';
import AppShell from '../components/AppShell';
import KanbanColumn from '../components/KanbanColumn';
import Loader from '../components/Loader';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            try {
                const [projectData, taskData] = await Promise.all([
                    projectService.getProjectById(id),
                    taskService.getTasksByProject(id)
                ]);
                setProject(projectData);
                setTasks(taskData);
            } catch (error) {
                console.error('Project Load Error:', error);
                toast.error('Failed to load project. Please check if you have access.');
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [id]);

    const handleDeleteTask = async (taskId) => {
        try {
            await taskService.deleteTask(id, taskId);
            setTasks((current) => current.filter((task) => task._id !== taskId));
            toast.success('Task deleted');
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const handleStatusChange = async (taskId, status) => {
        try {
            const updatedTask = await taskService.updateTask(id, taskId, { status });
            setTasks((current) => current.map((task) => (task._id === taskId ? updatedTask : task)));
        } catch {
            toast.error('Failed to update task status');
        }
    };

    const handleDrop = (taskId, status) => {
        handleStatusChange(taskId, status);
    };

    const columns = [
        { key: 'pending', title: 'Pending' },
        { key: 'in-progress', title: 'In Progress' },
        { key: 'completed', title: 'Completed' }
    ];

    return (
        <AppShell
            title={project?.title || 'Project details'}
            subtitle={project?.description || 'View the project plan and task flow.'}
            actions={(
                <Link to={`/projects/${id}/create-task`} className="primary-button button-link">
                    <PlusCircle size={18} />
                    Add task
                </Link>
            )}
        >
            {loading ? <Loader label="Loading project board" /> : (
                <>
                    <section className="project-summary-grid">
                        <article className="panel summary-card">
                            <p className="eyebrow">Owner</p>
                            <h3>{project?.createdBy?.name}</h3>
                            <p>{project?.createdBy?.email}</p>
                        </article>
                        <article className="panel summary-card">
                            <p className="eyebrow">Members</p>
                            <h3>{(project?.members?.length || 0) + 1}</h3>
                            <p>{project?.members?.map((member) => member.name).join(', ') || 'Only owner assigned'}</p>
                        </article>
                    </section>

                    <section className="kanban-grid">
                        {columns.map((column) => (
                            <KanbanColumn
                                key={column.key}
                                title={column.title}
                                status={column.key}
                                projectId={id}
                                tasks={tasks.filter((task) => task.status === column.key)}
                                onDelete={handleDeleteTask}
                                onStatusChange={handleStatusChange}
                                onDrop={handleDrop}
                            />
                        ))}
                    </section>
                </>
            )}
        </AppShell>
    );
};

export default ProjectDetails;
