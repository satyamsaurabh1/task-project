import { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, FolderPlus } from 'lucide-react';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import * as projectService from '../services/projectService';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [projectResponse, statsResponse] = await Promise.all([
                    projectService.getProjects(),
                    projectService.getDashboardStats()
                ]);
                setProjects(projectResponse);
                setStats(statsResponse);
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const filteredProjects = projects.filter((project) => {
        const query = deferredSearch.toLowerCase().trim();

        if (!query) {
            return true;
        }

        return project.title.toLowerCase().includes(query)
            || project.description.toLowerCase().includes(query);
    });

    return (
        <AppShell
            title="Delivery overview"
            subtitle="Track projects, workload, and progress from a single operational view."
            actions={(
                <>
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
                    <section className="stats-grid">
                        <article className="stat-card">
                            <span>Total Projects</span>
                            <strong>{stats?.totalProjects ?? 0}</strong>
                        </article>
                        <article className="stat-card">
                            <span>Total Tasks</span>
                            <strong>{stats?.totalTasks ?? 0}</strong>
                        </article>
                        <article className="stat-card">
                            <span>Completed Tasks</span>
                            <strong>{stats?.completedTasks ?? 0}</strong>
                        </article>
                        <article className="stat-card">
                            <span>Pending Tasks</span>
                            <strong>{stats?.pendingTasks ?? 0}</strong>
                        </article>
                    </section>

                    <section className="panel">
                        <div className="panel-heading">
                            <div>
                                <p className="eyebrow">Projects</p>
                                <h2>Active workspaces</h2>
                            </div>
                        </div>

                        {filteredProjects.length ? (
                            <div className="project-grid">
                                {filteredProjects.map((project) => (
                                    <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
                                        <div className="project-card-top">
                                            <h3>{project.title}</h3>
                                            <ArrowRight size={18} />
                                        </div>
                                        <p>{project.description}</p>
                                        <div className="project-card-footer">
                                            <span>Owner: {project.createdBy?.name}</span>
                                            <span>{project.members?.length || 0} members</span>
                                        </div>
                                    </Link>
                                ))}
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
