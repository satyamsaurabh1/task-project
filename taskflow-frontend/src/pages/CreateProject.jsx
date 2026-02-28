import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

const CreateProject = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', { title, description });
            toast.success('Project created!');
            navigate('/');
        } catch (err) {
            toast.error('Failed to create project');
        }
    };

    return (
        <div className="main-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none', color: 'var(--text-muted)' }}>
                <ChevronLeft size={20} /> Back to Dashboard
            </Link>
            <div className="auth-card" style={{ maxWidth: 'none' }}>
                <h1 className="auth-title" style={{ textAlign: 'left' }}>Create New Project</h1>
                <p className="auth-subtitle" style={{ textAlign: 'left' }}>Set up a new workspace for your team</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Create Project</button>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;
