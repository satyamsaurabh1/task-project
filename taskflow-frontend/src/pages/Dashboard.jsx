import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Layout, Plus, CheckCircle, Clock, List, User } from 'lucide-react';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, tasks: 0, completed: 0, pending: 0 });
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/projects');
                setProjects(res.data);

                // Fetch stats (simplified for now)
                let totalTasks = 0;
                let completedTasks = 0;
                for (const p of res.data) {
                    const taskRes = await api.get(`/projects/${p._id}/tasks`);
                    totalTasks += taskRes.data.length;
                    completedTasks += taskRes.data.filter(t => t.status === 'completed').length;
                }

                setStats({
                    total: res.data.length,
                    tasks: totalTasks,
                    completed: completedTasks,
                    pending: totalTasks - completedTasks
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2 className="auth-title" style={{ color: 'white', fontSize: '1.5rem', marginBottom: '2rem' }}>TaskFlow</h2>
                <nav>
                    <Link to="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: 'transparent' }}>
                        <Layout size={20} /> Dashboard
                    </Link>
                    <Link to="/profile" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white', background: 'transparent', textAlign: 'left' }}>
                        <User size={20} /> My Profile
                    </Link>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Logged in as:</p>
                    <p style={{ fontWeight: '600' }}>{user?.name}</p>
                    <button onClick={logout} className="btn" style={{ background: '#ef4444', color: 'white', marginTop: '1rem' }}>Logout</button>
                </div>
            </aside>
            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome back, {user?.name.split(' ')[0]}!</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="form-input"
                            style={{ width: '250px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Link to="/create-project" className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={20} /> New Project
                        </Link>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Projects</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.total}</h3>
                    </div>
                    <div className="stat-card">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Tasks</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.tasks}</h3>
                    </div>
                    <div className="stat-card">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Completed</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>{stats.completed}</h3>
                    </div>
                    <div className="stat-card">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)' }}>{stats.pending}</h3>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Projects</h2>
                <div className="project-grid">
        