import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Layout, Plus, ChevronLeft, Trash2, Edit } from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjectData = async () => {
        try {
            const [projRes, taskRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/projects/${id}/tasks`)
            ]);
            setProject(projRes.data);
            setTasks(taskRes.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load project details');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
            toast.success(`Task moved to ${newStatus}`);
            fetchProjectData();
        } catch (err) {
            toast.error('Failed to update task status');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/projects/${id}/tasks/${taskId}`);
            toast.success('Task deleted');
            fetchProjectData();
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    if (loading) return <div className="main-content">Loading project...</div>;
    if (!project) return <div className="main-content">Project not found</div>;

    const columns = [
        { id: 'pending', title: 'Pending' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'completed', title: 'Completed' }
    ];

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none' }}>
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
                <div style={{ padding: '1rem', background: '#334155', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Members</h3>
                    <p style={{ fontSize: '0.875rem' }}>{project.createdBy?.name} (Admin)</p>
                    {project.members?.map(m => (
                        <p key={m._id} style={{ fontSize: '0.875rem' }}>{m.name}</p>
                    ))}
                </div>
            </aside>
            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>{project.title}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{project.description}</p>
                    </div>
                    <Link to={`/projects/${id}/create-task`} className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} /> Add Task
                    </Link>
                </header>

                <div className="kanban-board">
                    {columns.map(col => (
                        <div key={col.id} className="kanban-column">
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                {col.title}
                                <span style={{ background: '#e2e8f0', padding: '0 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </h3>
                            <div className="tasks-container">
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <div key={task._id} className="task-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                            <h4 style={{ fontWeight: '600', fontSize: '0.925rem' }}>{task.title}</h4>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <Link to={`/projects/${id}/tasks/${task._id}/edit`} style={{ color: '#94a3b8' }}>
                                                    <Edit size={14} />
                                                </Link>
                                                <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{task.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '1rem',
                                                background: task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#f0fdf4',
                                                color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e',
                                                fontWeight: '600'
                                            }}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                                style={{ fontSize: '0.75rem', padding: '0.1rem', borderRadius: '0.25rem' }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                     