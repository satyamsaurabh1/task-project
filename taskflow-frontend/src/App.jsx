import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CreateProject from './pages/CreateProject';
import CreateTask from './pages/CreateTask';
import Dashboard from './pages/Dashboard';
import EditTask from './pages/EditTask';
import Login from './pages/Login';
import ProfilePage from './pages/ProfilePage';
import ProjectDetails from './pages/ProjectDetails';
import Register from './pages/Register';

const App = () => (
    <AuthProvider>
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                }
            }}
        />
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/create-project" element={<CreateProject />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/projects/:id/create-task" element={<CreateTask />} />
                <Route path="/projects/:id/tasks/:taskId/edit" element={<EditTask />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
);

export default App;
