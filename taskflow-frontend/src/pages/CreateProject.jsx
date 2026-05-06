import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import FormField from '../components/FormField';
import useAuth from '../hooks/useAuth';
import useAsyncAction from '../hooks/useAsyncAction';
import { getUsers } from '../services/authService';
import { createProject } from '../services/projectService';
import { validateProjectForm } from '../utils/validation';

const CreateProject = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { loading, run } = useAsyncAction();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        members: []
    });
    const currentUserId = String(user?._id || user?.id || '');
    const canCreateProject = Boolean(user?.permissions?.includes('projects:create'));
    const availableMembers = users.filter((candidate) => String(candidate._id || candidate.id) !== currentUserId);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setUsers(await getUsers());
            } catch {
                toast.error('Failed to load members');
            }
        };

        loadUsers();
    }, []);

    const handleMemberSelection = (event) => {
        const selectedIds = Array.from(event.target.selectedOptions).map((option) => option.value);
        setFormData((current) => ({ ...current, members: selectedIds }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const message = validateProjectForm(formData);

        if (message) {
            toast.error(message);
            return;
        }

        if (!canCreateProject) {
            toast.error('Only admins and managers can create projects');
            return;
        }

        try {
            const project = await run(() => createProject(formData));
            toast.success('Project created');
            navigate(`/projects/${project._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
        }
    };

    return (
        <AppShell
            title="Create project"
            subtitle="Define a workspace, write context, and add collaborators from the start."
        >
            <section className="form-panel">
                <form className="form-stack" onSubmit={handleSubmit}>
                    <FormField label="Project title">
                        <input
                            className="text-input"
                            value={formData.title}
                            onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                        />
                    </FormField>

                    <FormField label="Description">
                        <textarea
                            className="text-input textarea-input"
                            value={formData.description}
                            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                        />
                    </FormField>

                    <FormField label="Project owner">
                        <div className="owner-display">
                            <strong>{user?.name || 'Current user'}</strong>
                            <span>{user?.email || 'This account will be the owner'}</span>
                            <small>The owner is assigned automatically from the logged-in account.</small>
                        </div>
                    </FormField>

                    <FormField label="Members">
                        <p className="field-note">
                            Add collaborators here. The project owner is added automatically and does not need to be selected.
                        </p>
                        <select
                            multiple
                            className="text-input select-multiple"
                            value={formData.members}
                            onChange={handleMemberSelection}
                        >
                            {availableMembers.map((member) => (
                                <option key={member._id} value={member._id}>
                                    {member.name} ({member.email})
                                </option>
                            ))}
                        </select>
                    </FormField>

                    {!canCreateProject && (
                        <div className="form-warning">
                            Your current role is <strong>{user?.role || 'team_member'}</strong>. Only admins and managers can create projects.
                        </div>
                    )}

                    <button className="primary-button" type="submit" disabled={loading || !canCreateProject}>
                        {loading ? 'Creating project...' : 'Create project'}
                    </button>
                </form>
            </section>
        </AppShell>
    );
};

export default CreateProject;
