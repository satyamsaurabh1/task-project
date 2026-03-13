import { ShieldCheck, UserRound, Mail, Fingerprint } from 'lucide-react';
import AppShell from '../components/AppShell';
import useAuth from '../hooks/useAuth';

const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <AppShell
            title="Profile"
            subtitle="Your authenticated account details and workspace role."
        >
            <section className="profile-grid">
                <article className="panel profile-hero-card">
                    <div className="profile-avatar">
                        <UserRound size={36} />
                    </div>
                    <div>
                        <h2>{user?.name}</h2>
                        <p>{user?.email}</p>
                    </div>
                </article>

                <article className="panel detail-list">
                    <div className="detail-row">
                        <Mail size={18} />
                        <div>
                            <span>Email</span>
                            <strong>{user?.email}</strong>
                        </div>
                    </div>
                    <div className="detail-row">
                        <ShieldCheck size={18} />
                        <div>
                            <span>Role</span>
                            <strong>{user?.role}</strong>
                        </div>
                    </div>
                    <div className="detail-row">
                        <Fingerprint size={18} />
                        <div>
                            <span>User ID</span>
                            <strong>{user?._id}</strong>
                        </div>
                    </div>
                </article>
            </section>
        </AppShell>
    );
};

export default ProfilePage;
