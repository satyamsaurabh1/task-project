import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = () => {
    const { initializing, user } = useAuth();
    const location = useLocation();

    if (initializing) {
        return <Loader fullScreen label="Restoring your workspace" />;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
