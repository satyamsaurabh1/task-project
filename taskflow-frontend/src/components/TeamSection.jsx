import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Search, Shield, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import * as projectService from '../services/projectService';
import { formatDate } from '../utils/formatters';

const TeamSection = ({ project, onUpdate, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const allUsers = await authService.getUsers();
                setUsers(allUsers);
            } catch {
                toast.error('Failed to load user directory');
            }
        };
        loadUsers();
    }, []);

    const handleAddMember = async (userId) => {
        setLoading(true);
        try {
            const updated = await projectService.addMember(project._id || project.id, userId);
            onUpdate(updated);
            toast.success('Member added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        setLoading(true);
        try {
            const updated = await projectService.removeMember(project._id || project.id, userId);
            onUpdate(updated);
            toast.success('Member removed');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    const isMember = (userId) => 
        project.members?.some(m => String(m._id || m.id || m) === String(userId)) ||
        String(project.createdBy?._id || project.createdBy?.id || project.createdBy) === String(userId);

    const isOwnerOrAdmin = currentUser?.role === 'admin' || 
        String(project.createdBy?._id || project.createdBy?.id || project.createdBy) === String(currentUser?._id || currentUser?.id);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="team-section-container">
            <div className="team-section-header">
                <div className="header-info">
                    <h2>Team Members</h2>
                    <p>Manage who has access to this project workspace.</p>
                </div>
                <div className="search-wrap-full">
                    <Search size={18} className="search-icon" />
                    <input 
                        className="text-input" 
                        placeholder="Search users to add..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="team-grid">
                {filteredUsers.length === 0 ? (
                    <div className="no-results">No users found matching your search.</div>
                ) : (
                    filteredUsers.map(user => {
                        const member = isMember(user._id);
                        const isOwner = String(project.createdBy?._id || project.createdBy?.id || project.createdBy) === String(user._id);
                        
                        return (
                            <div key={user._id} className={`team-card ${member ? 'is-member' : ''}`}>
                                <div className="team-card-avatar">
                                    {user.name[0].toUpperCase()}
                                </div>
                                <div className="team-card-content">
                                    <div className="user-primary">
                                        <h3>{user.name}</h3>
                                        {isOwner && <span className="badge-owner">Owner</span>}
                                        {member && !isOwner && <span className="badge-member">Member</span>}
                                    </div>
                                    <div className="user-secondary">
                                        <Mail size={14} /> {user.email}
                                    </div>
                                    <div className="user-tertiary">
                                        <Calendar size={14} /> Joined {formatDate(user.createdAt)}
                                    </div>
                                </div>
                                <div className="team-card-actions">
                                    {isOwner ? (
                                        <div className="role-tag"><Shield size={14} /> Owner</div>
                                    ) : member ? (
                                        isOwnerOrAdmin && (
                                            <button 
                                                className="btn-remove-member" 
                                                onClick={() => handleRemoveMember(user._id)}
                                                disabled={loading}
                                                title="Remove Access"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )
                                    ) : (
                                        isOwnerOrAdmin && (
                                            <button 
                                                className="btn-add-member" 
                                                onClick={() => handleAddMember(user._id)}
                                                disabled={loading}
                                                title="Grant Access"
                                            >
                                                <UserPlus size={18} />
                                                Invite
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TeamSection;
