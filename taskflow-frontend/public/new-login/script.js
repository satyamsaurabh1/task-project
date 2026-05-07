/* ============================================================
   TASKFLOW — PREMIUM ANIMATED LOGIN v2   |   script.js
   Person-at-Desk Character Edition
   ============================================================ */

/* ── DOM REFS ─────────────────────────────────────────── */
const personSVG    = document.getElementById('personSVG');
const headGroup    = document.getElementById('headGroup');
const eyesGroup    = document.getElementById('eyesGroup');
const leftIris     = document.getElementById('leftIris');
const rightIris    = document.getElementById('rightIris');
const leftPupil    = document.getElementById('leftPupil');
const rightPupil   = document.getElementById('rightPupil');
const leftLid      = document.getElementById('leftLid');
const rightLid     = document.getElementById('rightLid');
const leftBrow     = document.getElementById('leftBrow');
const rightBrow    = document.getElementById('rightBrow');
const mouth        = document.getElementById('mouth');
const leftArm      = document.getElementById('leftArm');
const rightArm     = document.getElementById('rightArm');

const emailInput   = document.getElementById('emailInput');
const passInput    = document.getElementById('passInput');
const submitBtn    = document.getElementById('submitBtn');
const loginForm    = document.getElementById('loginForm');
const eyeToggle    = document.getElementById('eyeToggle');
const eyeOpen      = document.getElementById('eyeOpen');
const eyeClosed    = document.getElementById('eyeClosed');
const loginCard    = document.getElementById('loginCard');
const toastEl      = document.getElementById('toast');

/* ── STATE ────────────────────────────────────────────── */
let mode = 'idle'; // idle | email | shy | wave | celebrate | error

// Smooth eye tracking with lerp
const EASE = 0.12;
let targetLIX = 233, targetLIY = 195;
let targetRIX = 267, targetRIY = 195;
let curLIX = 233, curLIY = 195;
let curRIX = 267, curRIY = 195;

let targetLPX = 233, targetLPY = 195;
let targetRPX = 267, targetRPY = 195;
let curLPX = 233, curLPY = 195;
let curRPX = 267, curRPY = 195;

// Head tracking
let targetHeadX = 0, targetHeadY = 0;
let curHeadX = 0, curHeadY = 0;

/* ── 1. PARTICLE SYSTEM ──────────────────────────────── */
(() => {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const HUES = [260, 200, 290, 180, 240, 320];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class P {
    constructor(init) { this.reset(init); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 2 + 0.4;
      this.speed = Math.random() * 0.4 + 0.1;
      this.drift = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.hue = HUES[Math.floor(Math.random() * HUES.length)];
      this.life = 1;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.life -= 0.0008;
      if (this.y < -10 || this.life <= 0) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha * this.life;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue},80%,70%)`;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 90; i++) particles.push(new P(true));

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();

/* ── 2. EYE & HEAD TRACKING ──────────────────────────── */
document.addEventListener('mousemove', e => {
  if (mode === 'shy' || mode === 'celebrate') return;

  const rect = personSVG.getBoundingClientRect();
  const svgCX = rect.left + rect.width * 0.5;
  const svgCY = rect.top + rect.height * 0.38; // head center

  const dx = e.clientX - svgCX;
  const dy = e.clientY - svgCY;
  const angle = Math.atan2(dy, dx);
  const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 600);
  const norm = dist / 600;

  // Eye movement
  const eyeRange = 5;
  const px = Math.cos(angle) * eyeRange * norm;
  const py = Math.sin(angle) * eyeRange * norm;

  targetLIX = 233 + px;  targetLIY = 195 + py;
  targetRIX = 267 + px;  targetRIY = 195 + py;
  targetLPX = 233 + px * 0.7;  targetLPY = 195 + py * 0.7;
  targetRPX = 267 + px * 0.7;  targetRPY = 195 + py * 0.7;

  // Head rotation
  targetHeadX = (dx / window.innerWidth) * 8;
  targetHeadY = (dy / window.innerHeight) * 4;
});

/* Smooth lerp animation loop */
(function pupilLoop() {
  if (mode !== 'shy') {
    curLIX += (targetLIX - curLIX) * EASE;
    curLIY += (targetLIY - curLIY) * EASE;
    curRIX += (targetRIX - curRIX) * EASE;
    curRIY += (targetRIY - curRIY) * EASE;
    curLPX += (targetLPX - curLPX) * EASE;
    curLPY += (targetLPY - curLPY) * EASE;
    curRPX += (targetRPX - curRPX) * EASE;
    curRPY += (targetRPY - curRPY) * EASE;

    leftIris.setAttribute('cx', curLIX.toFixed(2));
    leftIris.setAttribute('cy', curLIY.toFixed(2));
    rightIris.setAttribute('cx', curRIX.toFixed(2));
    rightIris.setAttribute('cy', curRIY.toFixed(2));
    leftPupil.setAttribute('cx', curLPX.toFixed(2));
    leftPupil.setAttribute('cy', curLPY.toFixed(2));
    rightPupil.setAttribute('cx', curRPX.toFixed(2));
    rightPupil.setAttribute('cy', curRPY.toFixed(2));
  }

  // Smooth head tilt
  curHeadX += (targetHeadX - curHeadX) * 0.06;
  curHeadY += (targetHeadY - curHeadY) * 0.06;
  if (headGroup && mode !== 'shy') {
    headGroup.setAttribute('transform', `translate(${curHeadX.toFixed(2)}, ${curHeadY.toFixed(2)})`);
  }

  requestAnimationFrame(pupilLoop);
})();

/* ── 3. MODE MANAGEMENT ──────────────────────────────── */
function setMode(newMode) {
  if (mode === newMode) return;
  mode = newMode;

  // Reset states
  animateLids(0);
  resetArms();
  resetMouth();
  resetBrows();

  switch (mode) {
    case 'idle':
      break;

    case 'email':
      // Look at laptop screen
      lookAtLaptop();
      break;

    case 'shy':
      // Close eyes / cover with hands
      animateLids(1);
      shyArms();
      shyBrows();
      break;

    case 'wave':
      // Smile wide
      smileMouth();
      happyBrows();
      break;

    case 'celebrate':
      animateLids(0);
      celebrateMouth();
      happyBrows();
      launchConfetti();
      break;

    case 'error':
      sadMouth();
      sadBrows();
      shakeCard();
      break;
  }
}

/* ── 4. CHARACTER ANIMATIONS ─────────────────────────── */

function lookAtLaptop() {
  // Eyes look down at laptop
  targetLIX = 233; targetLIY = 200;
  targetRIX = 267; targetRIY = 200;
  targetLPX = 233; targetLPY = 200;
  targetRPX = 267; targetRPY = 200;
  targetHeadX = 0; targetHeadY = 3;
}

function animateLids(to) {
  const steps = 10;
  const fromL = parseFloat(leftLid.getAttribute('opacity')) || 0;
  const fromR = parseFloat(rightLid.getAttribute('opacity')) || 0;
  let step = 0;
  const iv = setInterval(() => {
    step++;
    const t = step / steps;
    leftLid.setAttribute('opacity', (fromL + (to - fromL) * t).toFixed(3));
    rightLid.setAttribute('opacity', (fromR + (to - fromR) * t).toFixed(3));
    if (step >= steps) clearInterval(iv);
  }, 20);
}

function shyArms() {
  // Move hands up to cover eyes
  if (leftArm) leftArm.setAttribute('d', 'M225 260 Q210 230 220 195');
  if (rightArm) rightArm.setAttribute('d', 'M275 260 Q290 230 280 195');
}

function resetArms() {
  if (leftArm) leftArm.setAttribute('d', 'M225 260 Q200 290 195 315');
  if (rightArm) rightArm.setAttribute('d', 'M275 260 Q300 290 305 315');
}

function resetMouth() {
  mouth.setAttribute('d', 'M238 218 Q250 228 262 218');
}

function smileMouth() {
  mouth.setAttribute('d', 'M235 216 Q250 234 265 216');
}

function celebrateMouth() {
  mouth.setAttribute('d', 'M234 214 Q250 240 266 214');
}

function sadMouth() {
  mouth.setAttribute('d', 'M238 226 Q250 218 262 226');
}

function resetBrows() {
  leftBrow.setAttribute('d', 'M222 178 Q230 173 240 176');
  rightBrow.setAttribute('d', 'M260 176 Q270 173 278 178');
}

function happyBrows() {
  leftBrow.setAttribute('d', 'M222 174 Q230 168 240 172');
  rightBrow.setAttribute('d', 'M260 172 Q270 168 278 174');
}

function shyBrows() {
  leftBrow.setAttribute('d', 'M224 180 Q230 178 238 180');
  rightBrow.setAttribute('d', 'M262 180 Q270 178 276 180');
}

function sadBrows() {
  leftBrow.setAttribute('d', 'M224 174 Q230 178 240 180');
  rightBrow.setAttribute('d', 'M260 180 Q270 178 276 174');
}

function shakeCard() {
  loginCard.classList.add('shake');
  setTimeout(() => loginCard.classList.remove('shake'), 600);
}

/* ── 5. AUTO BLINK ────────────────────────────────────── */
setInterval(() => {
  if (mode === 'shy' || mode === 'celebrate') return;
  animateLids(1);
  setTimeout(() => animateLids(0), 150);
}, 4000 + Math.random() * 2000);

/* ── 6. CONFETTI ──────────────────────────────────────── */
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#7c3aed','#22d3ee','#ec4899','#f59e0b','#10b981','#6366f1','#fff'];
  const pieces = [];

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -16 - 5,
      r: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.25 + Math.random() * 0.15,
      alpha: 1,
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rot += p.rotSpeed;
      p.alpha -= 0.008;

      if (p.alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });

    frame++;
    if (frame < 150) {
      requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }
  draw();
}

/* ── 7. TOAST SYSTEM ──────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'info') {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = 'toast show ' + type;
  toastTimer = setTimeout(() => {
    toastEl.className = 'toast';
  }, 3000);
}

/* ── 8. INPUT INTERACTIONS ────────────────────────────── */
emailInput.addEventListener('focus', () => setMode('email'));
emailInput.addEventListener('blur', () => { if (mode === 'email') setMode('idle'); });

passInput.addEventListener('focus', () => setMode('shy'));
passInput.addEventListener('blur', () => { if (mode === 'shy') setMode('idle'); });

/* ── 9. BUTTON HOVER ──────────────────────────────────── */
submitBtn.addEventListener('mouseenter', () => {
  if (mode !== 'celebrate' && mode !== 'shy') setMode('wave');
});
submitBtn.addEventListener('mouseleave', () => {
  if (mode === 'wave') setMode('idle');
});

/* ── 10. EYE TOGGLE ───────────────────────────────────── */
eyeToggle.addEventListener('click', () => {
  const isHidden = passInput.type === 'password';
  passInput.type = isHidden ? 'text' : 'password';
  eyeOpen.style.display = isHidden ? 'none' : 'block';
  eyeClosed.style.display = isHidden ? 'block' : 'none';
});

/* ── 11. FORM VALIDATION & SUBMIT ─────────────────────── */
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const pass  = passInput.value;

  if (!email) {
    setMode('error');
    showToast('Please enter your email address', 'error');
    emailInput.focus();
    setTimeout(() => setMode('idle'), 1200);
    return;
  }
  if (!isValidEmail(email)) {
    setMode('error');
    showToast('Please enter a valid email', 'error');
    emailInput.focus();
    setTimeout(() => setMode('idle'), 1200);
    return;
  }
  if (!pass || pass.length < 6) {
    setMode('error');
    showToast('Password must be at least 6 characters', 'error');
    passInput.focus();
    setTimeout(() => setMode('idle'), 1200);
    return;
  }

  // Simulate login
  submitBtn.querySelector('.btn-text').textContent = 'Signing in…';
  submitBtn.disabled = true;

  setMode('celebrate');
  showToast('🎉 Welcome back! Redirecting…', 'success');

  setTimeout(() => {
    submitBtn.querySelector('.btn-text').textContent = 'Sign In';
    submitBtn.disabled = false;
    setMode('idle');
  }, 3000);
});

/* ── 12. SOCIAL BUTTONS ───────────────────────────────── */
document.getElementById('googleBtn').addEventListener('click', () => {
  showToast('🔧 Configure Google Client ID in config.js', 'info');
  smileMouth();
  setTimeout(resetMouth, 1500);
});

document.getElementById('githubBtn').addEventListener('click', () => {
  showToast('🔧 Configure GitHub Client ID in config.js', 'info');
  smileMouth();
  setTimeout(resetMouth, 1500);
});

document.getElementById('forgotLink').addEventListener('click', e => {
  e.preventDefault();
  showToast('📧 Password reset link sent!', 'success');
});

document.getElementById('signupLink').addEventListener('click', e => {
  e.preventDefault();
  showToast('✨ Redirecting to sign up…', 'info');
});

/* ── 13. CARD SHAKE ANIMATION ─────────────────────────── */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shakeKF {
    0%,100%{transform:translateX(0)}
    15%{transform:translateX(-8px)}
    30%{transform:translateX(8px)}
    45%{transform:translateX(-5px)}
    60%{transform:translateX(5px)}
    75%{transform:translateX(-2px)}
    90%{transform:translateX(2px)}
  }
  .shake { animation: shakeKF 0.55s ease both !important; }
`;
document.head.appendChild(shakeStyle);

/* ── 14. PARALLAX ON CARD ─────────────────────────────── */
document.addEventListener('mousemove', e => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  if (loginCard) {
    loginCard.style.transform = `translateY(${-6 + dy * -4}px) rotateX(${dy * -2}deg) rotateY(${dx * 2}deg)`;
  }
});

console.log('✨ TaskFlow Premium Login v2 loaded');
