import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textDecoration: 'none' }}>
                    Dashboard
                </Link>
            </aside>
            <main className="main-content">
                <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>
                <div className="auth-card" style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '50%' }}>
                            <User size={40} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem' }}>{user?.name}</h2>
                            <p style={{ color: 'var(--text-muted)' }}>{user?.role.toUpperCase()}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                            <Mail size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</p>
                                <p>{user?.email}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                            <Shield size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account ID</p>
                                <p style={{ fontSize: '0.875rem' }}>{user?._id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
