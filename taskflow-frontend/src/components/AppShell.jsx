import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, LogOut, PlusCircle, UserCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const AppShell = ({ title, subtitle, actions, children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <Link to="/" className="brand-mark">
                    <span className="brand-dot" />
                    <div>
                        <strong>TaskFlow</strong>
                        <small>Team Collaboration</small>
                    </div>
                </Link>

                <nav className="nav-stack">
                    <NavLink to="/" end className="nav-link">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>
                    <NavLink to="/create-project" className="nav-link">
                        <PlusCircle size={18} />
                        Create Project
                    </NavLink>
                    <NavLink to="/profile" className="nav-link">
                        <UserCircle2 size={18} />
                        Profile
                    </NavLink>
                </nav>

                <div className="sidebar-panel">
                    <div className="sidebar-user">
                        <FolderKanban size={20} />
                        <div>
                            <strong>{user?.name}</strong>
                            <span>{user?.role}</span>
                        </div>
                    </div>
                    <button type="button" className="ghost-button" onClick={handleLogout}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="workspace">
                <header className="page-header">
                    <div>
                        <p className="eyebrow">TaskFlow workspace</p>
                        <h1>{title}</h1>
                        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
                    </div>
                    {actions ? <div className="page-actions">{actions}</div> : null}
                </header>

                {children}
            </main>
        </div>
    );
};

export default AppShell;
