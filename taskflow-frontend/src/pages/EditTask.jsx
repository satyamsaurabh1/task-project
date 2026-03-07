import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

const EditTask = () => {
    const { id, taskId } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: '',
        priority: '',
        dueDate: ''
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await api.get(`/projects/${id}/tasks`);
                const task = res.data.find(t => t._id === taskId);
                if (task) {
                    setFormData({
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
                    });
                }
                setLoading(false);
            } catch (err) {
                toast.error('Failed to load task');
                setLoading(false);
            }
        };
        fetchTask();
    }, [id, taskId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/projects/${id}/tasks/${taskId}`, formData);
            toast.success('Task updated!');
            navigate(`/projects/${id}`);
        } catch (err) {
            toast.error('Failed to update task');
        }
    };

    if (loading) return <div className="main-content">Loading...</div>;

    return (
        <div className="main-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link to={`/projects/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none', color: 'var(--text-muted)' }}>
                <ChevronLeft size={20} /> Back to Project
            </Link>
            <div className="auth-card" style={{ maxWidth: 'none' }}>
                <h1 className="auth-title" style={{ textAlign: 'left' }}>Edit Task</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Task Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '80px' }}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Status</label>
                            <select
                                className="form-input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Priority</label>
                            <select
                                className="form-input"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Update Task</button>
                </form>
            </div>
        </div>
    );
};

export default EditTask;
