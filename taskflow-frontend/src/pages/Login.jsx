import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import FormField from '../components/FormField';
import useAsyncAction from '../hooks/useAsyncAction';
import { validateLoginForm } from '../utils/validation';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { loading, run } = useAsyncAction();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const message = validateLoginForm(formData);

        if (message) {
            toast.error(message);
            return;
        }

        try {
            await run(() => login(formData));
            toast.success('Welcome back');
            navigate(location.state?.from?.pathname || '/', { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-page">
            <section className="auth-hero">
                <p className="eyebrow">MERN task management</p>
                <h1>Coordinate projects, ownership, and delivery in one workspace.</h1>
                <p className="auth-copy">
                    TaskFlow gives your team a clean operating layer for projects, deadlines, and role-aware collaboration.
                </p>
            </section>

            <section className="auth-panel">
                <div className="auth-card">
                    <h2>Sign in</h2>
                    <p>Use your workspace credentials to continue.</p>

                    <form className="form-stack" onSubmit={handleSubmit}>
                        <FormField label="Email">
                            <input
                                className="text-input"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@company.com"
                            />
                        </FormField>

                        <FormField label="Password">
                            <input
                                className="text-input"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                            />
                        </FormField>

                        <button className="primary-button" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Login'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        New to TaskFlow? <Link to="/register">Create an account</Link>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Login;
