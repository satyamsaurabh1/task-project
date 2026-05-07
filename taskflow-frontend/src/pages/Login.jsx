import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useAsyncAction from '../hooks/useAsyncAction';
import { validateLoginForm } from '../utils/validation';
import './LoginPremium.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { loading, run } = useAsyncAction();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [mode, setMode] = useState('idle');
    const canvasRef = useRef(null);
    const personRef = useRef(null);

    // Eye positions
    const [eyes, setEyes] = useState({ lix: 233, liy: 195, rix: 267, riy: 195 });
    const [headOff, setHeadOff] = useState({ x: 0, y: 0 });

    useEffect(() => { document.title = "TaskFlow — Welcome Back ✨"; }, []);

    /* ── Particles ── */
    useEffect(() => {
        const c = canvasRef.current; if (!c) return;
        const ctx = c.getContext('2d'); let raf;
        const HUES = [260, 200, 290, 180, 240, 320];
        let W, H, ps = [];
        const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
        resize(); window.addEventListener('resize', resize);
        class P {
            constructor(i) { this.reset(i); }
            reset(i) { this.x=Math.random()*W; this.y=i?Math.random()*H:H+10; this.r=Math.random()*2+.4; this.s=Math.random()*.4+.1; this.d=(Math.random()-.5)*.25; this.a=Math.random()*.5+.1; this.h=HUES[Math.floor(Math.random()*HUES.length)]; this.l=1; }
            update() { this.y-=this.s; this.x+=this.d; this.l-=.0008; if(this.y<-10||this.l<=0) this.reset(false); }
            draw() { ctx.save(); ctx.globalAlpha=this.a*this.l; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=`hsl(${this.h},80%,70%)`; ctx.fill(); ctx.restore(); }
        }
        for(let i=0;i<90;i++) ps.push(new P(true));
        const loop = () => { ctx.clearRect(0,0,W,H); ps.forEach(p=>{p.update();p.draw();}); raf=requestAnimationFrame(loop); };
        loop();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
    }, []);

    /* ── Eye/Head tracking ── */
    const onMove = useCallback(e => {
        if (mode === 'shy') return;
        const el = personRef.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width * .5, cy = r.top + r.height * .38;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const ang = Math.atan2(dy, dx);
        const norm = Math.min(Math.sqrt(dx*dx+dy*dy), 600) / 600;
        const range = 5;
        const px = Math.cos(ang) * range * norm, py = Math.sin(ang) * range * norm;
        setEyes({ lix: 233+px, liy: 195+py, rix: 267+px, riy: 195+py });
        setHeadOff({ x: (dx/window.innerWidth)*8, y: (dy/window.innerHeight)*4 });
    }, [mode]);

    const handleChange = e => setFormData(c => ({ ...c, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        const msg = validateLoginForm(formData);
        if (msg) { toast.error(msg); return; }
        try {
            setMode('celebrate');
            await run(() => login(formData));
            toast.success('Welcome back!');
            navigate(location.state?.from?.pathname || '/', { replace: true });
        } catch (err) {
            setMode('idle');
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    // Mouth path
    const mouthD = mode === 'celebrate' ? "M234 214 Q250 240 266 214"
                 : mode === 'wave' ? "M235 216 Q250 234 265 216"
                 : mode === 'error' ? "M238 226 Q250 218 262 226"
                 : "M238 218 Q250 228 262 218";

    return (
        <div className="pl-container" onMouseMove={onMove}>
            {/* Blobs */}
            <div className="pl-blobs"><div className="pl-blob pl-b1"/><div className="pl-blob pl-b2"/><div className="pl-blob pl-b3"/><div className="pl-blob pl-b4"/></div>
            <canvas ref={canvasRef} className="pl-particles"/>

            <div className="pl-page">
                {/* LEFT */}
                <div className="pl-hero">
                    <div className="pl-hero-inner">
                        <div className="pl-brand">
                            <div className="pl-brand-icon">
                                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                                    <rect x="2" y="2" width="12" height="12" rx="4" fill="white" opacity=".95"/>
                                    <rect x="18" y="2" width="12" height="12" rx="4" fill="white" opacity=".55"/>
                                    <rect x="2" y="18" width="12" height="12" rx="4" fill="white" opacity=".55"/>
                                    <rect x="18" y="18" width="12" height="12" rx="4" fill="white" opacity=".95"/>
                                </svg>
                            </div>
                            <span className="pl-brand-name">TaskFlow</span>
                        </div>

                        <div className="pl-char-wrap">
                            <div className="pl-badge pl-badge-1">📊 3 tasks done!</div>
                            <div className="pl-badge pl-badge-2">🚀 Sprint active</div>
                            <div className="pl-badge pl-badge-3">✅ All clear!</div>

                            <svg ref={personRef} className="pl-person" viewBox="0 0 500 460" fill="none">
                                {/* Desk */}
                                <rect x="80" y="340" width="340" height="12" rx="6" fill="#4338ca" opacity=".35"/>
                                <rect x="120" y="352" width="12" height="80" rx="4" fill="#4338ca" opacity=".25"/>
                                <rect x="368" y="352" width="12" height="80" rx="4" fill="#4338ca" opacity=".25"/>
                                {/* Chair */}
                                <rect x="195" y="360" width="110" height="10" rx="5" fill="#6366f1" opacity=".3"/>
                                <rect x="244" y="370" width="12" height="50" rx="4" fill="#6366f1" opacity=".2"/>
                                <ellipse cx="250" cy="425" rx="35" ry="6" fill="#6366f1" opacity=".15"/>
                                {/* Laptop */}
                                <rect x="160" y="310" width="180" height="30" rx="6" fill="#312e81"/>
                                <rect x="165" y="315" width="170" height="20" rx="4" fill="#1e1b4b"/>
                                <rect x="170" y="218" width="160" height="95" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2"/>
                                <rect x="178" y="226" width="144" height="79" rx="4" fill="#0f0a2a"/>
                                <rect x="186" y="234" width="50" height="5" rx="2" fill="#818cf8" opacity=".6"/>
                                <rect x="186" y="244" width="80" height="4" rx="2" fill="#a5b4fc" opacity=".3"/>
                                <rect x="186" y="253" width="65" height="4" rx="2" fill="#a5b4fc" opacity=".3"/>
                                <rect x="186" y="275" width="40" height="14" rx="4" fill="#7c3aed" opacity=".7"/>
                                <rect x="232" y="275" width="40" height="14" rx="4" fill="#22d3ee" opacity=".5"/>
                                {/* Body */}
                                <path d="M220 290 Q250 310 280 290 L275 250 Q250 260 225 250 Z" fill="#7c3aed"/>
                                <path d="M235 252 L250 262 L265 252" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                {/* Arms */}
                                <path d={mode==='shy'?"M225 260 Q210 230 220 195":"M225 260 Q200 290 195 315"} stroke="#c4b5fd" strokeWidth="14" strokeLinecap="round" fill="none"/>
                                <path d={mode==='shy'?"M275 260 Q290 230 280 195":"M275 260 Q300 290 305 315"} stroke="#c4b5fd" strokeWidth="14" strokeLinecap="round" fill="none"/>
                                {mode!=='shy' && <><circle cx="195" cy="318" r="8" fill="#ddd6fe"/><circle cx="305" cy="318" r="8" fill="#ddd6fe"/></>}
                                {/* Neck */}
                                <rect x="240" y="230" width="20" height="25" rx="8" fill="#ddd6fe"/>
                                {/* Head */}
                                <g transform={`translate(${headOff.x},${headOff.y})`} style={{transition:'transform .15s'}}>
                                    <ellipse cx="250" cy="195" rx="52" ry="56" fill="#ddd6fe"/>
                                    <path d="M198 190 Q200 140 250 130 Q300 140 302 190 Q300 165 280 158 Q260 150 240 158 Q220 165 200 190 Z" fill="#1e1b4b"/>
                                    <ellipse cx="198" cy="200" rx="8" ry="12" fill="#c4b5fd"/>
                                    <ellipse cx="302" cy="200" rx="8" ry="12" fill="#c4b5fd"/>
                                    {/* Brows */}
                                    <path d={mode==='wave'?"M222 174 Q230 168 240 172":"M222 178 Q230 173 240 176"} stroke="#312e81" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                                    <path d={mode==='wave'?"M260 172 Q270 168 278 174":"M260 176 Q270 173 278 178"} stroke="#312e81" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                                    {/* Eyes */}
                                    <ellipse cx="233" cy="195" rx="12" ry="11" fill="white"/>
                                    <circle cx={eyes.lix} cy={eyes.liy} r="6" fill="#312e81"/>
                                    <circle cx={eyes.lix} cy={eyes.liy} r="3" fill="#6366f1"/>
                                    <circle cx={eyes.lix+3} cy={eyes.liy-3} r="1.5" fill="white" opacity=".8"/>
                                    <ellipse cx="267" cy="195" rx="12" ry="11" fill="white"/>
                                    <circle cx={eyes.rix} cy={eyes.riy} r="6" fill="#312e81"/>
                                    <circle cx={eyes.rix} cy={eyes.riy} r="3" fill="#6366f1"/>
                                    <circle cx={eyes.rix+3} cy={eyes.riy-3} r="1.5" fill="white" opacity=".8"/>
                                    {/* Eyelids for shy */}
                                    {mode==='shy' && <><ellipse cx="233" cy="193" rx="14" ry="13" fill="#ddd6fe"/><ellipse cx="267" cy="193" rx="14" ry="13" fill="#ddd6fe"/></>}
                                    <path d="M248 205 Q250 210 252 205" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                    <path d={mouthD} stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                                    <circle cx="218" cy="212" r="8" fill="#f0abfc" opacity=".25"/>
                                    <circle cx="282" cy="212" r="8" fill="#f0abfc" opacity=".25"/>
                                    {/* Glasses */}
                                    <circle cx="233" cy="195" r="16" stroke="#6366f1" strokeWidth="2" fill="none" opacity=".5"/>
                                    <circle cx="267" cy="195" r="16" stroke="#6366f1" strokeWidth="2" fill="none" opacity=".5"/>
                                    <path d="M249 195 L251 195" stroke="#6366f1" strokeWidth="2" opacity=".5"/>
                                </g>
                                {/* Coffee */}
                                <rect x="345" y="310" width="22" height="28" rx="4" fill="#818cf8" opacity=".6"/>
                                <path d="M367 318 Q378 318 378 328 Q378 338 367 338" stroke="#818cf8" strokeWidth="2" fill="none" opacity=".5"/>
                                {/* Plant */}
                                <g opacity=".5">
                                    <rect x="100" y="310" width="18" height="28" rx="4" fill="#6366f1" opacity=".4"/>
                                    <path d="M109 310 Q105 290 95 285" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                    <path d="M109 310 Q113 288 122 282" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                    <path d="M109 310 Q108 295 109 280" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                </g>
                            </svg>
                        </div>

                        <div className="pl-hero-text">
                            <h2>Your workspace,<br/><span className="pl-grad">reimagined.</span></h2>
                            <p>Manage projects, collaborate with your team, and ship faster — all in one place.</p>
                        </div>
                        <div className="pl-trust">
                            <div className="pl-trust-item"><span className="pl-trust-num">50K+</span><span className="pl-trust-label">Teams</span></div>
                            <div className="pl-trust-sep"/>
                            <div className="pl-trust-item"><span className="pl-trust-num">2M+</span><span className="pl-trust-label">Tasks Done</span></div>
                            <div className="pl-trust-sep"/>
                            <div className="pl-trust-item"><span className="pl-trust-num">99.9%</span><span className="pl-trust-label">Uptime</span></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="pl-form-side">
                    <div className="pl-card">
                        <div className="pl-card-head">
                            <h1 className="pl-card-title">Welcome Back 👋</h1>
                            <p className="pl-card-sub">Sign in and pick up where you left off.</p>
                        </div>

                        <div className="pl-social-row">
                            <button type="button" className="pl-social-btn" onClick={()=>toast.error('Configure Google Client ID')}>
                                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google
                            </button>
                            <button type="button" className="pl-social-btn" onClick={()=>toast.error('Configure GitHub Client ID')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 00-3.8 23.38c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.28-1.23 3.28-1.23.66 1.66.24 2.88.12 3.18a4.65 4.65 0 011.23 3.22c0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0012 .3"/></svg>
                                GitHub
                            </button>
                        </div>

                        <div className="pl-divider">or continue with email</div>

                        <form className="pl-form" onSubmit={handleSubmit} noValidate>
                            <div className="pl-field">
                                <svg className="pl-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
                                <input type="email" name="email" className="pl-field-input" placeholder=" " value={formData.email} onChange={handleChange}
                                    onFocus={()=>setMode('email')} onBlur={()=>setMode('idle')}/>
                                <label className="pl-field-label">Email Address</label>
                                <div className="pl-field-glow"/>
                            </div>
                            <div className="pl-field">
                                <svg className="pl-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="3"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                                <input type={showPass?'text':'password'} name="password" className="pl-field-input" placeholder=" " value={formData.password} onChange={handleChange}
                                    onFocus={()=>setMode('shy')} onBlur={()=>setMode('idle')}/>
                                <label className="pl-field-label">Password</label>
                                <button type="button" className="pl-eye-btn" onClick={()=>setShowPass(!showPass)}>
                                    {showPass ? '👁️' : '🕶️'}
                                </button>
                                <div className="pl-field-glow"/>
                            </div>
                            <div className="pl-opts">
                                <label className="pl-check"><input type="checkbox"/><span className="pl-check-box"/>Remember me</label>
                                <a href="#" className="pl-forgot">Forgot password?</a>
                            </div>
                            <button type="submit" className="pl-btn" disabled={loading}
                                onMouseEnter={()=>{if(mode!=='shy')setMode('wave')}}
                                onMouseLeave={()=>{if(mode==='wave')setMode('idle')}}>
                                <span className="pl-shimmer"/>
                                <span>{loading?'Signing in…':'Sign In'}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </button>
                        </form>

                        <p className="pl-switch">Don't have an account? <Link to="/register" className="pl-switch-link">Create Account ✨</Link></p>
                        <div className="pl-badges">
                            <span className="pl-badge-item">🔒 SSL Secured</span><span className="pl-badge-dot"/>
                            <span className="pl-badge-item">🛡️ Privacy First</span><span className="pl-badge-dot"/>
                            <span className="pl-badge-item">⚡ Instant Access</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pl-footer">© 2025 TaskFlow Inc. All rights reserved.</div>
        </div>
    );
};

export default Login;
