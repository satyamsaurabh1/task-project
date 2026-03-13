import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import FormField from '../components/FormField';
import useAsyncAction from '../hooks/useAsyncAction';
import { getUsers } from '../services/authService';
import { createProject } from '../services/projectService';
import { validateProjectForm } from '../utils/validation';

const CreateProject = () => {
    const navigate = useNavigate();
    const { loading, run } = useAsyncAction();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        members: []
    });

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

                    <FormField label="Members">
                        <select
                            multiple
                            className="text-input select-multiple"
                            value={formData.members}
                            onChange={handleMemberSelection}
                        >
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <button className="primary-button" type="submit" disabled={loading}>
                        {loading ? 'Creating project...' : 'Create project'}
                    </button>
                </form>
            </section>
        </AppShell>
    );
};

export default CreateProject;
