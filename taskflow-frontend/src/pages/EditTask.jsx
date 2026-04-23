import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import FormField from '../components/FormField';
import Loader from '../components/Loader';
import useAsyncAction from '../hooks/useAsyncAction';
import { getUsers } from '../services/authService';
import { getTaskById, updateTask } from '../services/taskService';
import { validateTaskForm } from '../utils/validation';

const EditTask = () => {
    const { id, taskId } = useParams();
    const navigate = useNavigate();
    const { loading, run } = useAsyncAction();
    const [users, setUsers] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        deadline: '',
        assignedTo: ''
    });

    useEffect(() => {
        const loadTask = async () => {
            try {
                const [task, teamMembers] = await Promise.all([
                    getTaskById(id, taskId),
                    getUsers()
                ]);

                setUsers(teamMembers);
                setFormData({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                    deadline: task.deadline ? task.deadline.slice(0, 16) : '',
                    assignedTo: task.assignedTo?._id || ''
                });
            } catch {
                toast.error('Failed to load task');
            } finally {
                setFetching(false);
            }
        };

        loadTask();
    }, [id, taskId]);

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
            await run(() => updateTask(id, taskId, formData));
            toast.success('Task updated');
            navigate(`/projects/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update task');
        }
    };

    return (
        <AppShell
            title="Edit task"
            subtitle="Update status, ownership, and priority without leaving the workflow."
        >
            {fetching ? <Loader label="Loading task" /> : (
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

                            <FormField label="Deadline (with notifications)">
                                <input className="text-input" name="deadline" type="datetime-local" value={formData.deadline} onChange={handleChange} />
                            </FormField>
                        </div>

                        <div className="form-row">
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
                            {loading ? 'Saving changes...' : 'Update task'}
                        </button>
                    </form>
                </section>
            )}
        </AppShell>
    );
};

export default EditTask;
