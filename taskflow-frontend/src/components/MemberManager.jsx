import { useEffect, useState } from 'react';
import { UserPlus, X, Trash2, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import * as projectService from '../services/projectService';

const MemberManager = ({ project, onClose, onUpdate }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const allUsers = await authService.getUsers();
                setUsers(allUsers);
            } catch {
                toast.error('Failed to load users');
            }
        };
        loadUsers();
    }, []);

    const handleAddMember = async (userId) => {
        setLoading(true);
        try {
            const updatedProject = await projectService.addMember(project._id || project.id, userId);
            onUpdate(updatedProject);
            toast.success('Member added');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        setLoading(true);
        try {
            const updatedProject = await projectService.removeMember(project._id || project.id, userId);
            onUpdate(updatedProject);
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

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Manage Team</h2>
                    <button className="icon-button" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    <p className="modal-subtitle">Add or remove members for <strong>{project.title}</strong></p>
                    
                    <div className="search-wrap">
                        <Search size={16} className="search-icon" />
                        <input 
                            className="text-input" 
                            placeholder="Find people by name or email..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="user-list">
                        {filteredUsers.map(user => {
                            const member = isMember(user._id);
                            const isOwner = String(project.createdBy?._id || project.createdBy?.id || project.createdBy) === String(user._id);

                            return (
                                <div key={user._id} className="user-item">
                                    <div className="user-item-info">
                                        <div className="user-mini-avatar" style={{ background: '#1e293b' }}>
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <strong>{user.name} {isOwner && <span className="owner-badge">Owner</span>}</strong>
                                            <p>{user.email}</p>
                                        </div>
                                    </div>
                                    
                                    {isOwner ? (
                                        <div className="role-tag"><Shield size={12} /> Owner</div>
                                    ) : member ? (
                                        <button 
                                            className="remove-btn" 
                                            onClick={() => handleRemoveMember(user._id)}
                                            disabled={loading}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <button 
                                            className="add-btn" 
                                            onClick={() => handleAddMember(user._id)}
                                            disabled={loading}
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberManager;
