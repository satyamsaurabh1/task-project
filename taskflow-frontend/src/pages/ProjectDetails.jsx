import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle, Users, Wifi, WifiOff, Layout, MessageSquare, ShieldCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import KanbanColumn from '../components/KanbanColumn';
import Loader from '../components/Loader';
import ChatSection from '../components/ChatSection';
import TeamSection from '../components/TeamSection';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [onlineCount, setOnlineCount] = useState(1);
    const [activeTab, setActiveTab] = useState('board');
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        const loadProject = async () => {
            try {
                const [projectData, taskData] = await Promise.all([
                    projectService.getProjectById(id),
                    taskService.getTasksByProject(id)
                ]);
                setProject(projectData);
                setTasks(taskData);
            } catch (error) {
                console.error('Project Load Error:', error);
                if (error.response?.status === 403 || error.response?.status === 404) {
                    toast.error('Project not found or access denied');
                    navigate('/');
                } else {
                    toast.error('Failed to load project details');
                }
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [id, navigate]);

    useEffect(() => {
        if (!socket || !id) return;
        socket.emit('join:project', id);
        return () => {
            socket.emit('leave:project', id);
        };
    }, [socket, id]);

    useEffect(() => {
        if (!socket) return;

        const onTaskCreated = (task) => {
            const currentProjectId = id;
            const taskProjectId = task.projectId?._id || task.projectId?.id || task.projectId;
            if (String(taskProjectId) !== String(currentProjectId)) return;
            
            setTasks((prev) => {
                if (prev.some((t) => t._id === task._id)) return prev;
                return [...prev, task];
            });
            if (task.createdBy?._id !== user?._id && task.createdBy?.id !== user?.id) {
                toast(`📋 New task: "${task.title}"`, { icon: '🆕' });
            }
        };

        const onTaskUpdated = (task) => {
            setTasks((prev) =>
                prev.map((t) => (t._id === task._id ? task : t))
            );
        };

        const onTaskDeleted = ({ _id }) => {
            setTasks((prev) => prev.filter((t) => t._id !== _id));
        };

        const onProjectUpdated = (updatedProject) => {
            if (String(updatedProject._id || updatedProject.id) === String(id)) {
                setProject(updatedProject);
                const currentUserId = user?._id || user?.id;
                const isOwner = String(updatedProject.createdBy?._id || updatedProject.createdBy?.id || updatedProject.createdBy) === String(currentUserId);
                const isMember = updatedProject.members?.some(m => String(m._id || m.id || m) === String(currentUserId));
                
                if (!isOwner && !isMember && user?.role !== 'admin') {
                    toast.error('You no longer have access to this project');
                    navigate('/');
                }
            }
        };

        const onRoomUsers = ({ count }) => setOnlineCount(count);

        socket.on('task:created', onTaskCreated);
        socket.on('task:updated', onTaskUpdated);
        socket.on('task:deleted', onTaskDeleted);
        socket.on('project:updated', onProjectUpdated);
        socket.on('room:users', onRoomUsers);

        return () => {
            socket.off('task:created', onTaskCreated);
            socket.off('task:updated', onTaskUpdated);
            socket.off('task:deleted', onTaskDeleted);
            socket.off('project:updated', onProjectUpdated);
            socket.off('room:users', onRoomUsers);
        };
    }, [socket, id, user, navigate]);

    const handleDeleteTask = async (taskId) => {
        try {
            await taskService.deleteTask(id, taskId);
            setTasks((current) => current.filter((task) => task._id !== taskId));
            toast.success('Task deleted');
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const handleStatusChange = async (taskId, status) => {
        try {
            const updatedTask = await taskService.updateTask(id, taskId, { status });
            setTasks((current) => current.map((task) => (task._id === taskId ? updatedTask : task)));
        } catch {
            toast.error('Failed to update task status');
        }
    };

    const handleDrop = (taskId, status) => {
        handleStatusChange(taskId, status);
    };

    const columns = [
        { key: 'pending', title: 'Pending' },
        { key: 'in-progress', title: 'In Progress' },
        { key: 'completed', title: 'Completed' }
    ];

    return (
        <AppShell
            title={project?.title || 'Project details'}
            subtitle={project?.description || 'Collaborate and track progress in real-time.'}
            actions={(
                <>
                    <div className={`ws-badge ${isConnected ? 'ws-badge--live' : 'ws-badge--offline'}`}>
                        {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
                        {isConnected ? 'Live' : 'Offline'}
                    </div>
                    <div className="ws-badge ws-badge--users">
                        <Users size={13} />
                        {onlineCount} online
                    </div>
                    <Link to={`/projects/${id}/create-task`} className="primary-button button-link">
                        <PlusCircle size={18} />
                        Add task
                    </Link>
                </>
            )}
        >
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
                    onClick={() => setActiveTab('board')}
                >
                    <Layout size={18} />
                    Board
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <MessageSquare size={18} />
                    Chat
                    <span className="live-indicator-dot"></span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
                    onClick={() => setActiveTab('team')}
                >
                    <ShieldCheck size={18} />
                    Team
                </button>
            </div>

            <div className="tab-content-area">
                {loading ? <Loader label="Initializing workspace" /> : (
                    <>
                        {activeTab === 'board' && (
                            <section className="kanban-grid fade-in">
                                {columns.map((column) => (
                                    <KanbanColumn
                                        key={column.key}
                                        title={column.title}
                                        status={column.key}
                                        projectId={id}
                                        tasks={tasks.filter((task) => task.status === column.key)}
                                        onDelete={handleDeleteTask}
                                        onStatusChange={handleStatusChange}
                                        onDrop={handleDrop}
                                    />
                                ))}
                            </section>
                        )}

                        {activeTab === 'chat' && (
                            <div className="fade-in">
                                <ChatSection 
                                    projectId={id}
                                    projectTitle={project?.title}
                                    currentUser={user}
                                />
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="fade-in">
                                <TeamSection 
                                    project={project}
                                    onUpdate={(updated) => setProject(updated)}
                                    currentUser={user}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppShell>
    );
};

export default ProjectDetails;
