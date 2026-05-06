/* =====================================================
   TASKFLOW LOGIN PAGE — INTERACTIVE JAVASCRIPT
   ===================================================== */

'use strict';

/* ── DOM REFERENCES ────────────────────────────────── */
const emailInput    = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn      = document.getElementById('loginBtn');
const loginForm     = document.getElementById('loginForm');
const togglePwd     = document.getElementById('togglePassword');
const eyeOpen       = document.getElementById('eyeOpen');
const eyeClosed     = document.getElementById('eyeClosed');
const speechBubble  = document.getElementById('speechBubble');
const speechText    = document.getElementById('speechText');
const toast         = document.getElementById('toast');
const pageWrapper   = document.getElementById('pageWrapper');
const loginCard     = document.getElementById('loginCard');
const mascot        = document.getElementById('mascot');

/* Pupil / eyelid / mouth / shy / wave references */
const leftPupil       = document.getElementById('leftPupil');
const rightPupil      = document.getElementById('rightPupil');
const leftEyelid      = document.getElementById('leftEyelid');
const rightEyelid     = document.getElementById('rightEyelid');
const shyHands        = document.getElementById('shyHands');
const waveHand        = document.getElementById('waveHand');
const normalSmile     = document.getElementById('normalSmile');
const celebrateSmile  = document.getElementById('celebrateSmile');
const celebrateMouth  = document.getElementById('celebrateMouth');
const celebrateTongue = document.getElementById('celebrateTongue');
const celebrateStars  = document.getElementById('celebrateStars');

/* ── STATE ─────────────────────────────────────────── */
let mascotMode = 'idle'; // idle | email | shy | wave | celebrate
let toastTimer = null;

/* ══════════════════════════════════════════════════════
   1. PARTICLE CANVAS
   ══════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x     = Math.random() * W;
      this.y     = init ? Math.random() * H : H + 10;
      this.r     = Math.random() * 1.8 + 0.4;
      this.speed = Math.random() * 0.4 + 0.15;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.15;
      const hues = [260, 200, 290, 180, 240];
      this.hue   = hues[Math.floor(Math.random() * hues.length)];
    }
    update() {
      this.y     -= this.speed;
      this.x     += this.drift;
      this.alpha -= 0.0008;
      if (this.y < -10 || this.alpha <= 0) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue},80%,70%)`;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════════════════════════════
   2. MOUSE PARALLAX
   ══════════════════════════════════════════════════════ */
document.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  /* Card subtle tilt */
  loginCard.style.transform = `perspective(900px) rotateY(${dx * 3}deg) rotateX(${-dy * 2}deg)`;

  /* Mascot eye tracking */
  if (mascotMode !== 'shy' && mascotMode !== 'celebrate') {
    movePupils(e.clientX, e.clientY);
  }
});

document.addEventListener('mouseleave', () => {
  loginCard.style.transform = '';
});

/* ── Pupil tracking ─────────────────────────────────── */
function movePupils(mx, my) {
  const svgEl    = mascot;
  const rect     = svgEl.getBoundingClientRect();
  const svgCx    = rect.left + rect.width  / 2;
  const svgCy    = rect.top  + rect.height / 2;

  const angle = Math.atan2(my - svgCy, mx - svgCx);
  const dist  = 5;
  const px    = Math.cos(angle) * dist;
  const py    = Math.sin(angle) * dist;

  leftPupil.setAttribute('cx',  78 + px);
  leftPupil.setAttribute('cy',  100 + py);
  rightPupil.setAttribute('cx', 122 + px);
  rightPupil.setAttribute('cy', 100 + py);
}

/* ══════════════════════════════════════════════════════
   3. MASCOT STATES
   ══════════════════════════════════════════════════════ */
function setMascotMode(mode, message) {
  mascotMode = mode;

  /* Reset all overlays */
  shyHands.setAttribute('opacity', '0');
  waveHand.setAttribute('opacity', '0');
  leftEyelid.setAttribute('opacity',  '0');
  rightEyelid.setAttribute('opacity', '0');
  celebrateSmile.setAttribute('opacity', '0');
  celebrateMouth.setAttribute('opacity', '0');
  celebrateTongue.setAttribute('opacity', '0');
  celebrateStars.setAttribute('opacity', '0');
  normalSmile.setAttribute('opacity', '1');

  if (mode === 'shy') {
    shyHands.setAttribute('opacity', '1');
    animateShyEyelids();
  } else if (mode === 'wave') {
    waveHand.setAttribute('opacity', '1');
  } else if (mode === 'celebrate') {
    normalSmile.setAttribute('opacity', '0');
    celebrateSmile.setAttribute('opacity', '1');
    celebrateMouth.setAttribute('opacity', '1');
    celebrateTongue.setAttribute('opacity', '1');
    celebrateStars.setAttribute('opacity', '1');
    burstConfetti();
  }

  if (message) showSpeech(message);
}

function animateShyEyelids() {
  let op = 0;
  const interval = setInterval(() => {
    op = Math.min(op + 0.12, 1);
    leftEyelid.setAttribute('opacity',  op);
    rightEyelid.setAttribute('opacity', op);
    if (op >= 1) clearInterval(interval);
  }, 16);
}

/* ══════════════════════════════════════════════════════
   4. SPEECH BUBBLE
   ══════════════════════════════════════════════════════ */
const speechMessages = {
  idle:      'Hey there! 👋 Welcome back!',
  email:     'I see you typing… 📧',
  shy:       "Oops! I'll look away 🙈",
  wave:      "Let's go! Click to sign in! 🚀",
  celebrate: "Yay! Logging you in! 🎉",
  forgot:    "Don't worry, we've got you! 💌",
  google:    "Smart choice! Google it is 😄",
  github:    "Coding pro detected! 👨‍💻",
  signup:    "Great! Let's create your account ✨",
  error:     "Hmm, check your details! 🤔",
};

function showSpeech(text) {
  speechText.textContent = text;
  speechBubble.style.animation = 'none';
  void speechBubble.offsetWidth; // reflow
  speechBubble.style.animation = 'bubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both';
}

/* ══════════════════════════════════════════════════════
   5. INPUT INTERACTIONS
   ══════════════════════════════════════════════════════ */
emailInput.addEventListener('focus', () => {
  setMascotMode('email', speechMessages.email);
});

emailInput.addEventListener('blur', () => {
  if (mascotMode === 'email') setMascotMode('idle', speechMessages.idle);
});

passwordInput.addEventListener('focus', () => {
  setMascotMode('shy', speechMessages.shy);
});

passwordInput.addEventListener('blur', () => {
  setMascotMode('idle', speechMessages.idle);
});

/* ══════════════════════════════════════════════════════
   6. LOGIN BUTTON HOVER
   ══════════════════════════════════════════════════════ */
loginBtn.addEventListener('mouseenter', () => {
  if (mascotMode !== 'celebrate') {
    setMascotMode('wave', speechMessages.wave);
  }
});

loginBtn.addEventListener('mouseleave', () => {
  if (mascotMode === 'wave') {
    setMascotMode('idle', speechMessages.idle);
  }
});

/* ══════════════════════════════════════════════════════
   7. SOCIAL BUTTONS
   ══════════════════════════════════════════════════════ */
document.getElementById('googleBtn').addEventListener('click', () => {
  showSpeech(speechMessages.google);
  setMascotMode('idle', 'Redirecting to Google...');
  loginBtn.classList.add('loading');
  
  sessionStorage.setItem('oauth_provider', 'google');
  
  // Google OAuth URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CONFIG.google.clientId}&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.github.redirectUri)}&response_type=code&scope=email%20profile`;
  
  window.location.href = authUrl;
});

document.getElementById('githubBtn').addEventListener('click', () => {
  showSpeech(speechMessages.github);
  setMascotMode('idle', 'Redirecting to GitHub...');
  loginBtn.classList.add('loading');
  
  sessionStorage.setItem('oauth_provider', 'github');
  
  // GitHub OAuth URL
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${OAUTH_CONFIG.github.clientId}&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.github.redirectUri)}&scope=${encodeURIComponent(OAUTH_CONFIG.github.scope)}`;
  
  window.location.href = authUrl;
});
document.getElementById('forgotLink').addEventListener('click', (e) => {
  e.preventDefault();
  showSpeech(speechMessages.forgot);
  showToast('📧 Password reset link sent!', 'success');
});
document.getElementById('signupLink').addEventListener('click', (e) => {
  e.preventDefault();
  showSpeech(speechMessages.signup);
  showToast('✨ Redirecting to signup…', 'info');
});

/* ══════════════════════════════════════════════════════
   8. PASSWORD TOGGLE
   ══════════════════════════════════════════════════════ */
togglePwd.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  eyeOpen.style.display   = isHidden ? 'none'  : 'block';
  eyeClosed.style.display = isHidden ? 'block' : 'none';
});

/* ══════════════════════════════════════════════════════
   9. FORM VALIDATION & SUBMISSION
   ══════════════════════════════════════════════════════ */
function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function setError(groupId, errorId, msg) {
  const grp = document.getElementById(groupId);
  const err = document.getElementById(errorId);
  grp.classList.add('has-error');
  err.textContent = msg;
}

function clearError(groupId, errorId) {
  const grp = document.getElementById(groupId);
  const err = document.getElementById(errorId);
  grp.classList.remove('has-error');
  err.textContent = '';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = emailInput.value.trim();
  const password = passwordInput.value;
  let valid = true;

  clearError('emailGroup',    'emailError');
  clearError('passwordGroup', 'passwordError');

  if (!email) {
    setError('emailGroup', 'emailError', 'Email is required.');
    valid = false;
  } else if (!validateEmail(email)) {
    setError('emailGroup', 'emailError', 'Please enter a valid email address.');
    valid = false;
  }

  if (!password) {
    setError('passwordGroup', 'passwordError', 'Password is required.');
    valid = false;
  } else if (password.length < 6) {
    setError('passwordGroup', 'passwordError', 'Password must be at least 6 characters.');
    valid = false;
  }

  if (!valid) {
    showSpeech(speechMessages.error);
    shakeCard();
    return;
  }

  /* Simulate async login */
  loginBtn.classList.add('loading');
  setMascotMode('idle', 'Checking your details… 🔍');

  await new Promise(r => setTimeout(r, 2000));

  loginBtn.classList.remove('loading');
  setMascotMode('celebrate', speechMessages.celebrate);
  showToast('🎉 Login successful! Redirecting…', 'success');

  /* Reset after demo */
  setTimeout(() => {
    setMascotMode('idle', speechMessages.idle);
    loginForm.reset();
  }, 4000);
});

/* ── Card shake on error ─────────────────────────────── */
function shakeCard() {
  loginCard.style.animation = 'none';
  loginCard.style.transform = '';
  loginCard.classList.add('shake');
  setTimeout(() => loginCard.classList.remove('shake'), 600);
}

/* Inject shake keyframe */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    15%{transform:translateX(-8px)}
    30%{transform:translateX(8px)}
    45%{transform:translateX(-6px)}
    60%{transform:translateX(6px)}
    75%{transform:translateX(-3px)}
    90%{transform:translateX(3px)}
  }
  .shake{animation:shake 0.55s cubic-bezier(0.36,0.07,0.19,0.97) both !important;}
`;
document.head.appendChild(shakeStyle);

/* ══════════════════════════════════════════════════════
   10. CONFETTI BURST
   ══════════════════════════════════════════════════════ */
function burstConfetti() {
  const colors = ['#a78bfa','#22d3ee','#f472b6','#fbbf24','#34d399','#60a5fa'];
  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:999;pointer-events:none';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const pieces = Array.from({length: 80}, () => ({
    x:   canvas.width  * 0.75,
    y:   canvas.height * 0.5,
    vx:  (Math.random() - 0.5) * 14,
    vy:  (Math.random() - 0.8) * 14,
    r:   Math.random() * 7 + 3,
    col: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    rv:  (Math.random() - 0.5) * 8,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  let frame = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.35;
      p.rot += p.rv;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.col;
      ctx.globalAlpha = Math.max(0, 1 - frame / 100);
      if (p.shape === 'rect') {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(drawConfetti);
    else canvas.remove();
  }
  drawConfetti();
}

/* ══════════════════════════════════════════════════════
   11. TOAST NOTIFICATION
   ══════════════════════════════════════════════════════ */
function showToast(msg, type = 'info') {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ══════════════════════════════════════════════════════
   12. MASCOT CLICK — EASTER EGG
   ══════════════════════════════════════════════════════ */
const easterEggs = [
  "Psst… I know your password 👀",
  "Click me again, I dare you 😏",
  "Why are you poking me?! 😤",
  "Okay okay, I'll help you sign in 😄",
  "Best app ever? Agreed ✨",
];
let eggIdx = 0;
mascot.addEventListener('click', () => {
  showSpeech(easterEggs[eggIdx % easterEggs.length]);
  eggIdx++;
});

/* ══════════════════════════════════════════════════════
   13. INIT SPEECH BUBBLE & OAUTH RETURN
   ══════════════════════════════════════════════════════ */
setTimeout(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('loggedIn') === '1') {
    const provider = params.get('provider') || 'OAuth';
    const user = JSON.parse(sessionStorage.getItem('oauth_user') || '{}');
    const name = user.name ? user.name.split(' ')[0] : 'there';
    
    setMascotMode('celebrate', `Welcome back, ${name}! 🎉`);
    showToast(`Successfully logged in via ${provider}!`, 'success');
    
    // Clear URL params without reloading
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    showSpeech(speechMessages.idle);
  }
}, 600);
