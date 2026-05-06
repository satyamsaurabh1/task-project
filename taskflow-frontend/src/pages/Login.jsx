import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useAsyncAction from '../hooks/useAsyncAction';
import { validateLoginForm } from '../utils/validation';

/* ─── Cursor Glow ─────────────────────────────────────────────── */
const CursorGlow = () => {
    const glowRef = useRef(null);
    useEffect(() => {
        const move = (e) => {
            if (!glowRef.current) return;
            glowRef.current.style.left = e.clientX + 'px';
            glowRef.current.style.top  = e.clientY + 'px';
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);
    return <div className="tf-cursor-glow" ref={glowRef} />;
};

/* ─── Animated Grid ───────────────────────────────────────────── */
const AnimatedGrid = () => (
    <div className="tf-grid" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(194,164,120,0.07)" strokeWidth="0.5"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    </div>
);

/* ─── Floating Orbs ───────────────────────────────────────────── */
const FloatingOrbs = () => (
    <div className="tf-orbs" aria-hidden="true">
        <div className="tf-orb tf-orb--1" />
        <div className="tf-orb tf-orb--2" />
        <div className="tf-orb tf-orb--3" />
    </div>
);

/* ─── Particles ───────────────────────────────────────────────── */
const Particles = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        const resize = () => {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles = Array.from({ length: 55 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.2 + 0.3,
            dx: (Math.random() - 0.5) * 0.25,
            dy: (Math.random() - 0.5) * 0.25,
            opacity: Math.random() * 0.4 + 0.1,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(194,164,120,${p.opacity})`;
                ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);
    return <canvas ref={canvasRef} className="tf-particles" aria-hidden="true" />;
};

/* ─── Analytics Visualization (faint background) ─────────────── */
const AnalyticsViz = () => (
    <svg className="tf-analytics-viz" viewBox="0 0 400 180" fill="none" aria-hidden="true">
        <polyline points="0,140 50,110 100,120 150,70 200,85 250,45 300,60 350,20 400,35"
            stroke="rgba(194,164,120,0.18)" strokeWidth="1.5" fill="none" />
        <polyline points="0,160 50,145 100,155 150,120 200,130 250,100 300,115 350,85 400,95"
            stroke="rgba(194,164,120,0.09)" strokeWidth="1" fill="none" />
        {[0,50,100,150,200,250,300,350,400].map((x, i) => (
            <circle key={i} cx={x} cy={[140,110,120,70,85,45,60,20,35][i]}
                r="2.5" fill="rgba(194,164,120,0.25)" />
        ))}
    </svg>
);

/* ─── Main Login Component ────────────────────────────────────── */
const Login = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { login } = useAuth();
    const { loading, run } = useAsyncAction();
    const [formData, setFormData]   = useState({ email: '', password: '' });
    const [showPass, setShowPass]   = useState(false);
    const [focused, setFocused]     = useState('');
    const [parallax, setParallax]   = useState({ x: 0, y: 0 });

    /* Parallax on mouse move */
    const handleMouseMove = useCallback((e) => {
        const { innerWidth: W, innerHeight: H } = window;
        setParallax({
            x: (e.clientX / W - 0.5) * 18,
            y: (e.clientY / H - 0.5) * 12,
        });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    const handleChange = (e) =>
        setFormData(cur => ({ ...cur, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const msg = validateLoginForm(formData);
        if (msg) { toast.error(msg); return; }
        try {
            await run(() => login(formData));
            toast.success('Welcome back');
            navigate(location.state?.from?.pathname || '/', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="tf-page" onMouseMove={handleMouseMove}>
            <CursorGlow />

            {/* ── Top Nav ── */}
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

            {/* ── Split Layout ── */}
            <main className="tf-split">

                {/* ═══ LEFT — Hero ═══ */}
                <section className="tf-hero" aria-label="Hero section">
                    <AnimatedGrid />
                    <FloatingOrbs />
                    <Particles />
                    <AnalyticsViz />

                    {/* Vertical brand text */}
                    <span className="tf-vert-text" aria-hidden="true">TaskFlow</span>

                    <div
                        className="tf-hero__content"
                        style={{
                            transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.4}px)`,
                            transition: 'transform 0.1s ease-out',
                        }}
                    >
                        <p className="tf-eyebrow">
                            <span className="tf-eyebrow__line" />
                            Premium Project Intelligence
                        </p>

                        <h1 className="tf-headline">
                            <em>Mastering</em><br />
                            <em>Complexity.</em>
                        </h1>

                        <p className="tf-subtext">
                            Command your projects with precision,<br />
                            clarity, and executive control.
                        </p>

                        <div className="tf-stats">
                            <div className="tf-stat">
                                <span className="tf-stat__num">98%</span>
                                <span className="tf-stat__label">On-time delivery</span>
                            </div>
                            <div className="tf-stat__divider" />
                            <div className="tf-stat">
                                <span className="tf-stat__num">4.2x</span>
                                <span className="tf-stat__label">Team velocity</span>
                            </div>
                            <div className="tf-stat__divider" />
                            <div className="tf-stat">
                                <span className="tf-stat__num">500+</span>
                                <span className="tf-stat__label">Enterprise clients</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ RIGHT — Login Card ═══ */}
                <section className="tf-panel" aria-label="Login panel">
                    <div
                        className="tf-card"
                        style={{
                            transform: `translate(${-parallax.x * 0.2}px, ${-parallax.y * 0.2}px)`,
                            transition: 'transform 0.1s ease-out',
                        }}
                    >
                        {/* Card glow backdrop */}
                        <div className="tf-card__glow" aria-hidden="true" />

                        <div className="tf-card__header">
                            <div className="tf-card__badge">Secure Access</div>
                            <h2 className="tf-card__title">Welcome back</h2>
                            <p className="tf-card__subtitle">
                                Enter your credentials to access your executive workspace.
                            </p>
                        </div>

                        <form className="tf-form" onSubmit={handleSubmit} noValidate>
                            {/* Email */}
                            <div className={`tf-field ${focused === 'email' ? 'tf-field--focused' : ''} ${formData.email ? 'tf-field--filled' : ''}`}>
                                <label htmlFor="tf-email" className="tf-field__label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                    Email address
                                </label>
                                <input
                                    id="tf-email"
                                    className="tf-field__input"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused('')}
                                    placeholder="you@company.com"
                                    autoComplete="email"
                                />
                                <div className="tf-field__border" />
                            </div>

                            {/* Password */}
                            <div className={`tf-field ${focused === 'password' ? 'tf-field--focused' : ''} ${formData.password ? 'tf-field--filled' : ''}`}>
                                <label htmlFor="tf-password" className="tf-field__label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    Password
                                </label>
                                <div className="tf-field__input-wrap">
                                    <input
                                        id="tf-password"
                                        className="tf-field__input"
                                        name="password"
                                        type={showPass ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused('')}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="tf-field__toggle"
                                        onClick={() => setShowPass(s => !s)}
                                        aria-label={showPass ? 'Hide password' : 'Show password'}
                                    >
                                        {showPass ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <div className="tf-field__border" />
                            </div>

                            <div className="tf-form__row">
                                <a href="#forgot" className="tf-link tf-link--sm">Forgot password?</a>
                            </div>

                            <button
                                id="tf-submit-btn"
                                className="tf-btn-primary"
                                type="submit"
                                disabled={loading}
                            >
                                <span className="tf-btn-primary__text">
                                    {loading ? 'Authenticating…' : 'Enter Dashboard'}
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
                            <div className="tf-divider">
                                <span />
                                <span className="tf-divider__text">or</span>
                                <span />
                            </div>
                            <p className="tf-card__switch">
                                New to TaskFlow?{' '}
                                <Link to="/register" className="tf-link">
                                    Create an account
                                </Link>
                            </p>
                        </div>

                        {/* Trust badges */}
                        <div className="tf-trust">
                            <span className="tf-trust__item">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                SOC 2 Certified
                            </span>
                            <span className="tf-trust__dot" />
                            <span className="tf-trust__item">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                256-bit Encryption
                            </span>
                            <span className="tf-trust__dot" />
                            <span className="tf-trust__item">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                99.9% Uptime
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Footer ── */}
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

export default Login;
