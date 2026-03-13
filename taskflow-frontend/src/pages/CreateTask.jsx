import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import FormField from '../components/FormField';
import useAsyncAction from '../hooks/useAsyncAction';
import { getUsers } from '../services/authService';
import { createTask } from '../services/taskService';
import { validateTaskForm } from '../utils/validation';

const initialState = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
};

const CreateTask = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, run } = useAsyncAction();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setUsers(await getUsers());
            } catch {
                toast.error('Failed to load users');
            }
        };

        loadUsers();
    }, []);

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const message = validateTaskForm(formData);

        if (message) {
            toast.error(message);
            return;
        }

        try {
            await run(() => createTask(id, formData));
            toast.success('Task created');
            navigate(`/projects/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        }
    };

    return (
        <AppShell
            title="Create task"
            subtitle="Add actionable work with priority, owner, and delivery date."
        >
            <section className="form-panel">
                <form className="form-stack" onSubmit={handleSubmit}>
                    <FormField label="Task title">
                        <input className="text-input" name="title" value={formData.title} onChange={handleChange} />
                    </FormField>

                    <FormField label="Description">
                        <textarea className="text-input textarea-input" name="description" value={formData.description} onChange={handleChange} />
                    </FormField>

                    <div className="form-row">
                        <FormField label="Status">
                            <select className="text-input" name="status" value={formData.status} onChange={handleChange}>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </FormField>

                        <FormField label="Priority">
                            <select className="text-input" name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </FormField>
                    </div>

                    <div className="form-row">
                        <FormField label="Due date">
                            <input className="text-input" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
                        </FormField>

                        <FormField label="Assign to">
                            <select className="text-input" name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
                                <option value="">Unassigned</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>{user.name}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>

                    <button className="primary-button" type="submit" disabled={loading}>
                        {loading ? 'Creating task...' : 'Create task'}
                    </button>
                </form>
            </section>
        </AppShell>
    );
};

export default CreateTask;
