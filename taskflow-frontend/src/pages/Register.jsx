import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import FormField from '../components/FormField';
import useAsyncAction from '../hooks/useAsyncAction';
import { validateRegisterForm } from '../utils/validation';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { loading, run } = useAsyncAction();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (event) => {
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const message = validateRegisterForm(formData);

        if (message) {
            toast.error(message);
            return;
        }

        try {
            await run(() => register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'user'
            }));
            toast.success('Account created');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-page">
            <section className="auth-hero">
                <p className="eyebrow">Secure onboarding</p>
                <h1>Create a workspace account with strong authentication built in.</h1>
                <p className="auth-copy">
                    Registration uses validated email and strong password rules, then issues a JWT session for the app.
                </p>
            </section>

            <section className="auth-panel">
                <div className="auth-card">
                    <h2>Create account</h2>
                    <p>Start managing projects and team tasks.</p>

                    <form className="form-stack" onSubmit={handleSubmit}>
                        <FormField label="Full name">
                            <input className="text-input" name="name" value={formData.name} onChange={handleChange} />
                        </FormField>

                        <FormField label="Email">
                            <input className="text-input" name="email" type="email" value={formData.email} onChange={handleChange} />
                        </FormField>

                        <FormField label="Password">
                            <input className="text-input" name="password" type="password" value={formData.password} onChange={handleChange} />
                        </FormField>

                        <FormField label="Confirm password">
                            <input className="text-input" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                        </FormField>

                        <button className="primary-button" type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already registered? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Register;
