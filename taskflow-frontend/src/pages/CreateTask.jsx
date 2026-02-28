import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

const CreateTask = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/projects/${id}/tasks`, formData);
            toast.success('Task created!');
            navigate(`/projects/${id}`);
        } catch (err) {
            toast.error('Failed to create task');
        }
    };

    return (
        <div className="main-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link to={`/projects/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none', color: 'var(--text-muted)' }}>
                <ChevronLeft size={20} /> Back to Project
            </Link>
            <div className="auth-card" style={{ maxWidth: 'none' }}>
                <h1 className="auth-title" style={{ textAlign: 'left' }}>Add New Task</h1>
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
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Create Task</button>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;
