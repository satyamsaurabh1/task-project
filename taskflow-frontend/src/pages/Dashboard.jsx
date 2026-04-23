import { useDeferredValue, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    ArrowRight, FolderPlus, Wifi, WifiOff, Zap, 
    AlertTriangle, Bell, Clock, MessageSquare, UserPlus, Check 
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import GamificationBadge from '../components/GamificationBadge';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';
import { useSocket } from '../context/SocketContext';
import useAuth from '../hooks/useAuth';
import { generateSuggestions } from '../utils/aiSuggestions';
import { useNotifications } from '../context/NotificationContext';

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const EMPTY_STATS = {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
};

const toArray = (value) => Array.isArray(value) ? value : [];
const toSearchableText = (value) => String(value ?? '').toLowerCase();

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const { notifications, markRead } = useNotifications();
    const dashboardStats = stats || EMPTY_STATS;

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [projectResponse, statsResponse] = await Promise.all([
                    projectService.getProjects(),
                    projectService.getDashboardStats()
                ]);
                const nextProjects = toArray(projectResponse);
                setProjects(nextProjects);
                setStats(statsResponse || EMPTY_STATS);

                // Load all tasks for charts and suggestions
                const tasks = [];
                for (const p of nextProjects.slice(0, 10)) {
                    try {
                        const ts = await taskService.getTasksByProject(p._id);
                        toArray(ts).forEach(t => tasks.push({ ...t, projectTitle: p.title }));
                    } catch { /* skip */ }
                }
                setAllTasks(tasks);
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;
        const onProjectCreated = (project) => {
            const currentUserId = user?._id || user?.id;
            const projectOwnerId = project.createdBy?._id || project.createdBy?.id || project.createdBy;
            const isMember =
                String(projectOwnerId) === String(currentUserId) ||
                project.members?.some((m) => String(m._id || m.id || m) === String(currentUserId)) ||
                user?.role === 'admin';
            if (!isMember) return;
            setProjects((prev) => {
                const projectId = project._id || project.id;
                if (prev.some((p) => (p._id || p.id) === projectId)) return prev;
                return [project, ...prev];
            });
            setStats((prev) => prev ? { ...prev, totalProjects: (prev.totalProjects || 0) + 1 } : prev);
            toast.success(`📁 New project: "${project.title}"`, { id: project._id || project.id });
        };
        const onProjectUpdated = (project) => {
            setProjects((prev) => prev.map((p) => (p._id === project._id ? project : p)));
        };
        const onProjectDeleted = ({ _id }) => {
            setProjects((prev) => prev.filter((p) => p._id !== _id));
            setStats((prev) => prev ? { ...prev, totalProjects: Math.max(0, (prev.totalProjects || 1) - 1) } : prev);
        };
        socket.on('project:created', onProjectCreated);
        socket.on('project:updated', onProjectUpdated);
        socket.on('project:deleted', onProjectDeleted);
        return () => {
            socket.off('project:created', onProjectCreated);
            socket.off('project:updated', onProjectUpdated);
            socket.off('project:deleted', onProjectDeleted);
        };
    }, [socket, user]);

    const suggestions = useMemo(() => generateSuggestions(allTasks, dashboardStats), [allTasks, dashboardStats]);

    const overdueTasks = allTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed');

    const pieData = [
        { name: 'Completed', value: dashboardStats.completedTasks || 0 },
        { name: 'Pending', value: dashboardStats.pendingTasks || 0 },
        { name: 'Overdue', value: overdueTasks.length },
    ].filter(d => d.value > 0);

    const priorityData = [
        { name: 'High', count: allTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length, fill: '#ef4444' },
        { name: 'Medium', count: allTasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length, fill: '#f59e0b' },
        { name: 'Low', count: allTasks.filter(t => t.priority === 'low' && t.status !== 'completed').length, fill: '#06b6d4' },
    ];

    const filteredProjects = projects.filter((project) => {
        const query = deferredSearch.toLowerCase().trim();
        if (!query) return true;
        return toSearchableText(project.title).includes(query) || toSearchableText(project.description).includes(query);
    });

    const getProjectProgress = (project) => {
        const projectTasks = allTasks.filter(t => String(t.projectId) === String(project._id) || String(t.projectId?._id) === String(project._id));
        if (projectTasks.length === 0) return 0;
        return Math.round((projectTasks.filter(t => t.status === 'completed').length / projectTasks.length) * 100);
    };

    return (
        <AppShell
            title="Delivery overview"
            subtitle="Track projects, workload, and progress from a single operational view."
            actions={(
                <>
                    <div className={`ws-badge ${isConnected ? 'ws-badge--live' : 'ws-badge--offline'}`}>
                        {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
                        {isConnected ? 'Live' : 'Offline'}
                    </div>
                    <input
                        className="text-input search-input"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search projects"
                    />
                    <Link to="/create-project" className="primary-button button-link">
                        <FolderPlus size={18} />
                        New project
                    </Link>
                </>
            )}
        >
            {loading ? <Loader label="Loading dashboard" /> : (
                <>
                    {/* Stats Grid */}
                    <section className="stats-grid">
                        <article className="stat-card">
                            <span>Total Projects</span>
                            <strong>{dashboardStats.totalProjects}</strong>
                        </article>
                        <article className="stat-card">
                            <span>Total Tasks</span>
                            <strong>{dashboardStats.totalTasks}</strong>
                        </article>
                        <article className="stat-card">
                            <span>Completed</span>
                            <strong>{dashboardStats.completedTasks}</strong>
                        </article>
                        <article className="stat-card stat-card--danger">
                            <span><AlertTriangle size={13} style={{ display: 'inline', marginRight: 4 }} />Overdue</span>
                            <strong>{overdueTasks.length}</strong>
                        </article>
                    </section>

                    {/* AI Suggestions & Notifications Grid */}
                    <div className="dashboard-insights-grid">
                        {/* AI Suggestions */}
                        {suggestions.length > 0 && (
                            <section className="suggestions-panel fade-in">
                                <div className="suggestions-header">
                                    <Zap size={16} />
                                    <span>Smart Insights</span>
                                </div>
                                <div className="suggestions-list">
                                    {suggestions.slice(0, 4).map((s, i) => (
                                        <div key={i} className={`suggestion-item suggestion-item--${s.type}`}>
                                            <span className="suggestion-icon">{s.icon}</span>
                                            <div>
                                                <strong>{s.title}</strong>
                                                <p>{s.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Recent Notifications */}
                        <section className="dashboard-notif-panel fade-in">
                            <div className="suggestions-header" style={{ color: 'var(--accent)' }}>
                                <Bell size={16} />
                                <span>Recent Notifications</span>
                            </div>
                            <div className="dashboard-notif-list">
                                {notifications.length === 0 ? (
                                    <div className="activity-feed-empty">
                                        <p>No recent activity</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map(n => (
                                        <div 
                                            key={n._id} 
                                            className={`dashboard-notif-item ${!n.read ? 'dashboard-notif-item--unread' : ''}`}
                                            onClick={() => {
                                                if (!n.read) markRead(n._id);
                                                window.location.href = n.link || '#';
                                            }}
                                        >
                                            <div className="dashboard-notif-icon">
                                                {n.type === 'dm' || n.type === 'mention' ? <MessageSquare size={14} /> :
                                                 n.type === 'deadline_overdue' ? <AlertTriangle size={14} /> :
                                                 n.type === 'deadline_reminder' ? <Clock size={14} /> :
                                                 n.type === 'task_assigned' ? <UserPlus size={14} /> :
                                                 <Check size={14} />}
                                            </div>
                                            <div className="dashboard-notif-content">
                                                <p><strong>{n.title}</strong></p>
                                                <p className="dashboard-notif-msg">{n.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Charts */}
                    {(pieData.length > 0 || priorityData.some(d => d.count > 0)) && (
                        <section className="charts-row">
                            {pieData.length > 0 && (
                                <div className="chart-card">
                                    <h3>Task Status</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4} strokeWidth={0}>
                                                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12, color: '#f8fafc' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-legend">
                                        {pieData.map((d, i) => (
                                            <span key={d.name}><span className="legend-dot" style={{ background: CHART_COLORS[i] }} />{d.name}: {d.value}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {priorityData.some(d => d.count > 0) && (
                                <div className="chart-card">
                                    <h3>Active by Priority</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={priorityData} barSize={36}>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12, color: '#f8fafc' }} />
                                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                                {priorityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Gamification */}
                    <GamificationBadge stats={dashboardStats} />

                    {/* Projects */}
                    <section className="panel">
                        <div className="panel-heading">
                            <div>
                                <p className="eyebrow">Projects</p>
                                <h2>Active workspaces</h2>
                            </div>
                        </div>
                        {filteredProjects.length ? (
                            <div className="project-grid">
                                {filteredProjects.map((project) => {
                                    const progress = getProjectProgress(project);
                                    return (
                                        <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
                                            <div className="project-card-top">
                                                <h3>{project.title || 'Untitled project'}</h3>
                                                <ArrowRight size={18} />
                                            </div>
                                            <p>{project.description || 'No description yet.'}</p>
                                            <div className="project-progress-bar">
                                                <div className="project-progress-fill" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="project-card-footer">
                                                <span>Owner: {project.createdBy?.name || 'Unknown'}</span>
                                                <span>{project.members?.length || 0} members · {progress}%</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                title="No matching projects"
                                description="Create a workspace or adjust the current search filter."
                                action={<Link to="/create-project" className="primary-button button-link">Create project</Link>}
                            />
                        )}
                    </section>
                </>
            )}
        </AppShell>
    );
};

export default Dashboard;
