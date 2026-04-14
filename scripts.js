/* ============================================================
   SCRIPTS.JS — SHARED JAVASCRIPT
   Utilities used across all pages.
   ============================================================ */

/* ─── PARTICLES BACKGROUND ──────────────────────────────────── */
function initParticles(canvasId = 'particles-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const BLUE = '10,132,255';
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${BLUE},${p.a})`;
      ctx.fill();
    });
    // draw faint connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${BLUE},${0.08*(1-dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─── MOBILE NAV TOGGLE ─────────────────────────────────────── */
function initNav() {
  const btn = document.querySelector('.nav-menu-btn');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => links.classList.toggle('open'));
  // set active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

/* ─── STAT BAR ANIMATION ────────────────────────────────────── */
function animateStatBars(container = document) {
  const bars = container.querySelectorAll('.stat-bar-fill');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const val = e.target.dataset.value;
        e.target.style.width = val + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => io.observe(b));
}

/* ─── CARD TILT EFFECT ──────────────────────────────────────── */
function initCardTilt(selector = '.base-card') {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top  - r.height/2;
      const rx = -(y / r.height) * 8;
      const ry =  (x / r.width)  * 8;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─── MODAL ─────────────────────────────────────────────────── */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => animateStatBars(overlay), 100);
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}
// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});
// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

/* ─── STAGGER FADE IN ───────────────────────────────────────── */
function staggerFadeIn(selector, delayStep = 0.08) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i*delayStep}s, transform 0.5s ease ${i*delayStep}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

/* ─── AUDIO ENGINE ──────────────────────────────────────────── */
let currentAudio = null;
function playSound(src, btnEl) {
  if (!src) { showToast('No audio file set for this item.'); return; }
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  currentAudio = new Audio(src);
  currentAudio.volume = 0.8;
  currentAudio.play().catch(() => showToast('Audio failed to load.'));
  if (btnEl) btnEl.classList.add('playing');
  currentAudio.addEventListener('ended', () => {
    if (btnEl) btnEl.classList.remove('playing');
    currentAudio = null;
  });
}
function stopSound(btnEl) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (btnEl) btnEl.classList.remove('playing');
}

/* ─── TOAST ─────────────────────────────────────────────────── */
function showToast(msg) {
  let t = document.getElementById('site-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'site-toast';
    t.style.cssText = `
      position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
      background:rgba(10,132,255,0.15);border:1px solid rgba(10,132,255,0.4);
      color:#f0f4ff;padding:10px 24px;border-radius:50px;font-family:var(--font-ui);
      font-size:.8rem;letter-spacing:.1em;z-index:9999;
      transition:opacity .3s;backdrop-filter:blur(10px);
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = '0', 2500);
}

/* ─── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initParticles();
  staggerFadeIn('.base-card', 0.07);
  initCardTilt();
  animateStatBars();
});
