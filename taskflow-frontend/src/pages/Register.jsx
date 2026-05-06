import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useAsyncAction from '../hooks/useAsyncAction';
import { validateRegisterForm } from '../utils/validation';

const AnimatedGrid = () => (
    <div className="tf-grid" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid-reg" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(194,164,120,0.07)" strokeWidth="0.5"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-reg)" />
        </svg>
    </div>
);

const FloatingOrbs = () => (
    <div className="tf-orbs" aria-hidden="true">
        <div className="tf-orb tf-orb--1" />
        <div className="tf-orb tf-orb--2" />
        <div className="tf-orb tf-orb--3" />
    </div>
);

const Particles = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);
        const particles = Array.from({ length: 45 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 1.2 + 0.3, dx: (Math.random() - 0.5) * 0.25,
            dy: (Math.random() - 0.5) * 0.25, opacity: Math.random() * 0.4 + 0.1,
        }));
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.dx; p.y += p.dy;
                if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(194,164,120,${p.opacity})`; ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={canvasRef} className="tf-particles" aria-hidden="true" />;
};

const CursorGlow = () => {
    const ref = useRef(null);
    useEffect(() => {
        const move = (e) => { if (ref.current) { ref.current.style.left = e.clientX + 'px'; ref.current.style.top = e.clientY + 'px'; } };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);
    return <div className="tf-cursor-glow" ref={ref} />;
};

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { loading, run } = useAsyncAction();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState('');
    const [parallax, setParallax] = useState({ x: 0, y: 0 });
    const [strength, setStrength] = useState(0);

    const handleMouseMove = useCallback((e) => {
        setParallax({ x: (e.clientX / window.innerWidth - 0.5) * 18, y: (e.clientY / window.innerHeight - 0.5) * 12 });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    const calcStrength = (pw) => {
        let s = 0;
        if (pw.length >= 8)  s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };

    const handleChange = (e) => {
        setFormData(cur => ({ ...cur, [e.target.name]: e.target.value }));
        if (e.target.name === 'password') setStrength(calcStrength(e.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const msg = validateRegisterForm(formData);
        if (msg) { toast.error(msg); return; }
        try {
            await run(() => register({ name: formData.name, email: formData.email, password: formData.password, role: 'team_member' }));
            toast.success('Account created — welcome to TaskFlow');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', '#e05c5c', '#d4a853', '#8ab4a0', '#C2A478'];

    return (
        <div className="tf-page" onMouseMove={handleMouseMove}>
            <CursorGlow />

            <nav className="tf-nav">
                <div className="tf-nav__logo">
                    <span className="tf-logo-mark">⬡</span>
                    <span className="tf-logo-text">TaskFlow</span>
                </div>
                <div className="tf-nav__links">
                    <a href="#about"    className="tf-nav__link">About</a>
                    <a href="#features" className="tf-nav__link">Features</a>
                    <a href="#contact"  className="tf-nav__link">Contact</a>
                </div>
            </nav>

            <main className="tf-split">
                {/* ═══ LEFT — Hero ═══ */}
                <section className="tf-hero" aria-label="Hero section">
                    <AnimatedGrid />
                    <FloatingOrbs />
                    <Particles />
                    <span className="tf-vert-text" aria-hidden="true">TaskFlow</span>

                    <div
                        className="tf-hero__content"
                        style={{ transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4}px)`, transition: 'transform 0.1s ease-out' }}
                    >
                        <p className="tf-eyebrow">
                            <span className="tf-eyebrow__line" />
                            Join the Executive Network
                        </p>
                        <h1 className="tf-headline">
                            <em>Begin Your</em><br />
                            <em>Journey.</em>
                        </h1>
                        <p className="tf-subtext">
                            Join thousands of senior directors<br />
                            who trust TaskFlow to deliver results.
                        </p>
                        <div className="tf-stats">
                            <div className="tf-stat">
                                <span className="tf-stat__num">14k+</span>
                                <span className="tf-stat__label">Active teams</span>
                            </div>
                            <div className="tf-stat__divider" />
                            <div className="tf-stat">
                                <span className="tf-stat__num">99.9%</span>
                                <span className="tf-stat__label">Uptime SLA</span>
                            </div>
                            <div className="tf-stat__divider" />
                            <div className="tf-stat">
                                <span className="tf-stat__num">Free</span>
                                <span className="tf-stat__label">14-day trial</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ RIGHT — Register Card ═══ */}
                <section className="tf-panel" aria-label="Register panel">
                    <div
                        className="tf-card tf-card--register"
                        style={{ transform: `translate(${-parallax.x * 0.2}px, ${-parallax.y * 0.2}px)`, transition: 'transform 0.1s ease-out' }}
                    >
                        <div className="tf-card__glow" aria-hidden="true" />

                        <div className="tf-card__header">
                            <div className="tf-card__badge">Create Account</div>
                            <h2 className="tf-card__title">Start commanding</h2>
                            <p className="tf-card__subtitle">Your premium workspace awaits.</p>
                        </div>

                        <form className="tf-form" onSubmit={handleSubmit} noValidate>
                            {/* Full Name */}
                            <div className={`tf-field ${focused === 'name' ? 'tf-field--focused' : ''} ${formData.name ? 'tf-field--filled' : ''}`}>
                                <label htmlFor="tf-name" className="tf-field__label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    Full name
                                </label>
                                <input id="tf-name" className="tf-field__input" name="name" type="text"
                                    value={formData.name} onChange={handleChange}
                                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                                    placeholder="Your full name" autoComplete="name" />
                                <div className="tf-field__border" />
                            </div>

                            {/* Email */}
                            <div className={`tf-field ${focused === 'email' ? 'tf-field--focused' : ''} ${formData.email ? 'tf-field--filled' : ''}`}>
                                <label htmlFor="tf-email-reg" className="tf-field__label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                    Email address
                                </label>
                                <input id="tf-email-reg" className="tf-field__input" name="email" type="email"
                                    value={formData.email} onChange={handleChange}
                                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                    placeholder="you@company.com" autoComplete="email" />
                                <div className="tf-field__border" />
                            </div>

                            {/* Password */}
                            <div className={`tf-field ${focused === 'password' ? 'tf-field--focused' : ''} ${formData.password ? 'tf-field--filled' : ''}`}>
                                <label htmlFor="tf-pass-reg" className="tf-field__label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    Password
                                </label>
                                <div className="tf-field__input-wrap">
                                    <input id="tf-pass-reg" className="tf-field__input" name="password"
                                        type={showPass ? 'text' : 'password'} value={formData.password}
                                        onChange={handleChange} onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                                        placeholder="Create a strong password" autoComplete="new-password" />
                                    <button type="button" className="tf-field__toggle"
                                        onClick={() => setShowPass(s => !s)} aria-label={showPass ? 'Hide' : 'Show'}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            {showPass
                                                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                                            }
                                        </svg>
                                    </button>
                                </div>
                                <div className="tf-field__border" />
                                {formData.password && (
                                    <div className="tf-strength">
                                        <div className="tf-strength__bars">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="tf-strength__bar"
                                                    style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.08)' }} />
                                            ))}
                                        </div>
                                        <span className="tf-strength__label" style={{ color: strengthColors[strength] }}>
                                            {strengthLabels[strength]}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className={`tf-field ${focused === 'confirmPassword' ? 'tf-field--focused' : ''} ${formData.confirmPassword ? 'tf-field--filled' : ''}`}>
                                <label htmlFor="tf-confirm-pass" className="tf-field__label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    Confirm password
                                </label>
                                <input id="tf-confirm-pass" className="tf-field__input" name="confirmPassword"
                                    type="password" value={formData.confirmPassword} onChange={handleChange}
                                    onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused('')}
                                    placeholder="Repeat your password" autoComplete="new-password" />
                                <div className="tf-field__border" />
                            </div>

                            <button id="tf-register-btn" className="tf-btn-primary" type="submit" disabled={loading}>
                                <span className="tf-btn-primary__text">
                                    {loading ? 'Creating your workspace…' : 'Create Account'}
                                </span>
                                <span className="tf-btn-primary__arrow" aria-hidden="true">
                                    {loading ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tf-spinner">
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    )}
                                </span>
                                <span className="tf-btn-primary__glow" aria-hidden="true" />
                            </button>
                        </form>

                        <div className="tf-card__footer">
                            <div className="tf-divider"><span /><span className="tf-divider__text">or</span><span /></div>
                            <p className="tf-card__switch">
                                Already have an account?{' '}
                                <Link to="/login" className="tf-link">Sign in</Link>
                            </p>
                        </div>

                        <div className="tf-trust">
                            <span className="tf-trust__item">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                SOC 2 Certified
                            </span>
                            <span className="tf-trust__dot" />
                            <span className="tf-trust__item">No credit card required</span>
                            <span className="tf-trust__dot" />
                            <span className="tf-trust__item">Cancel anytime</span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="tf-footer">
                <span>© 2025 TaskFlow Inc. All rights reserved.</span>
                <span className="tf-footer__divider">·</span>
                <a href="#privacy" className="tf-footer__link">Privacy</a>
                <span className="tf-footer__divider">·</span>
                <a href="#terms" className="tf-footer__link">Terms</a>
            </footer>
        </div>
    );
};

export default Register;
