import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, UserRound, Mail, Fingerprint, Users, KeyRound } from 'lucide-react';
import AppShell from '../components/AppShell';
import useAuth from '../hooks/useAuth';
import { getUsers, updateUserRole } from '../services/authService';

const ROLE_LABELS = {
    admin: 'Root Admin',
    manager: 'Manager',
    team_member: 'Team Member'
};

const ROLE_HELP = [
    {
        role: 'admin',
        title: 'Root Admin',
        summary: 'Can view everything, create projects, delete projects, and assign roles to other users.'
    },
    {
        role: 'manager',
        title: 'Manager',
        summary: 'Can create projects and manage the projects and tasks they own or belong to.'
    },
    {
        role: 'team_member',
        title: 'Team Member',
        summary: 'Can join assigned projects, create tasks there, and edit only the tasks they created.'
    }
];

const ProfilePage = () => {
    const { user } = useAuth();
    const [workspaceUsers, setWorkspaceUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [savingUserId, setSavingUserId] = useState('');
    const canManageRoles = Boolean(user?.permissions?.includes('users:manage_roles'));
    const currentUserId = String(user?._id || user?.id || '');

    useEffect(() => {
        if (!canManageRoles) {
            return;
        }

        const loadUsers = async () => {
            setLoadingUsers(true);

            try {
                const users = await getUsers();
                setWorkspaceUsers(users.filter((member) => String(member._id || member.id) !== currentUserId));
            } catch {
                toast.error('Failed to load workspace users');
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, [canManageRoles, currentUserId]);

    const handleRoleChange = async (targetUserId, nextRole) => {
        setSavingUserId(targetUserId);

        try {
            const updatedUser = await updateUserRole(targetUserId, nextRole);
            setWorkspaceUsers((current) => current.map((member) => (
                member._id === targetUserId ? { ...member, role: updatedUser.role } : member
            )));
            toast.success(`${updatedUser.name} is now ${ROLE_LABELS[updatedUser.role] || updatedUser.role}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        } finally {
            setSavingUserId('');
        }
    };

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
                            <strong>{ROLE_LABELS[user?.role] || user?.role}</strong>
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

            {canManageRoles && (
                <section className="admin-section">
                    <article className="panel admin-role-guide">
                        <div className="admin-section-heading">
                            <KeyRound size={18} />
                            <div>
                                <h2>Root Admin Controls</h2>
                                <p>Use this account to assign roles and decide what each user can do in the workspace.</p>
                            </div>
                        </div>
                        <div className="role-guide-grid">
                            {ROLE_HELP.map((entry) => (
                                <div key={entry.role} className="role-guide-card">
                                    <strong>{entry.title}</strong>
                                    <p>{entry.summary}</p>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="panel admin-user-manager">
                        <div className="admin-section-heading">
                            <Users size={18} />
                            <div>
                                <h2>Assign User Roles</h2>
                                <p>The current root account stays admin. Change other users here.</p>
                            </div>
                        </div>

                        {loadingUsers ? (
                            <p className="admin-empty">Loading workspace users...</p>
                        ) : workspaceUsers.length === 0 ? (
                            <p className="admin-empty">No other users found yet.</p>
                        ) : (
                            <div className="admin-user-list">
                                {workspaceUsers.map((member) => (
                                    <div key={member._id} className="admin-user-item">
                                        <div>
                                            <strong>{member.name}</strong>
                                            <span>{member.email}</span>
                                        </div>
                                        <label className="role-select-wrap">
                                            <span>Role</span>
                                            <select
                                                className="text-input role-select"
                                                value={member.role}
                                                disabled={savingUserId === member._id}
                                                onChange={(event) => handleRoleChange(member._id, event.target.value)}
                                            >
                                                <option value="team_member">Team Member</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Root Admin</option>
                                            </select>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                </section>
            )}
        </AppShell>
    );
};

export default ProfilePage;
