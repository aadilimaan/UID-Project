/* ══════════════════════════════════════════════════════
   GPU ARENA — script.js
   Features: navbar, smooth scroll, scroll animations,
   active link tracking, dark/light toggle, form
   validation, back-to-top button, hamburger menu.
══════════════════════════════════════════════════════ */

'use strict';

// ── DOM REFERENCES ────────────────────────────────────
const navbar     = document.getElementById('navbar');
const navLinks   = document.querySelectorAll('.nav-link');
const hamburger  = document.getElementById('hamburger');
const navMenu    = document.getElementById('navLinks');
const themeToggle= document.getElementById('themeToggle');
const sunIcon    = document.getElementById('sunIcon');
const moonIcon   = document.getElementById('moonIcon');
const backToTop  = document.getElementById('backToTop');
const gpuForm    = document.getElementById('gpuForm');
const successMsg = document.getElementById('successMsg');
const fadeEls    = document.querySelectorAll('.fade-in');

// ── NAVBAR — scroll behaviour ─────────────────────────
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // back-to-top visibility
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  // active nav link
  highlightActiveLink();
});

// ── ACTIVE NAV LINK on scroll ────────────────────────
const sections = document.querySelectorAll('section[id]');

function highlightActiveLink() {
  const scrollY = window.scrollY + 120; // offset for fixed navbar

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ── SMOOTH SCROLL for nav links ───────────────────────
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = navbar.offsetHeight;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      // close mobile menu
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
});

// ── HAMBURGER MENU ────────────────────────────────────
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

// close menu on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
  }
});

// ── DARK / LIGHT THEME TOGGLE ────────────────────────
// Persist preference
const savedTheme = localStorage.getItem('gpuArenaTheme');
if (savedTheme === 'light') applyLight();
else applyDark();

themeToggle.addEventListener('click', () => {
  if (document.body.classList.contains('dark-mode')) {
    applyLight();
    localStorage.setItem('gpuArenaTheme', 'light');
  } else {
    applyDark();
    localStorage.setItem('gpuArenaTheme', 'dark');
  }
});

function applyDark() {
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
  sunIcon.style.display  = 'inline';
  moonIcon.style.display = 'none';
}
function applyLight() {
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
  sunIcon.style.display  = 'none';
  moonIcon.style.display = 'inline';
}

// ── SCROLL FADE-IN ANIMATIONS ────────────────────────
const observer = new IntersectionObserver(
  entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings within the same parent
        const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
        let delay = 0;
        siblings.forEach(sib => {
          if (!sib.classList.contains('visible')) {
            sib.style.transitionDelay = `${delay}ms`;
            delay += 80;
          }
        });
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

fadeEls.forEach(el => observer.observe(el));

// ── BACK TO TOP ───────────────────────────────────────
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── FORM VALIDATION ───────────────────────────────────
/**
 * Validate a single field.
 * Returns true if valid, false otherwise.
 */
function validateField(id, errorId, rules) {
  const el    = document.getElementById(id);
  const errEl = document.getElementById(errorId);
  const group = el.closest('.form-group');
  let msg     = '';

  const val = el.value.trim();

  if (rules.required && !val) {
    msg = 'This field is required.';
  } else if (rules.minLen && val.length < rules.minLen) {
    msg = `Please enter at least ${rules.minLen} characters.`;
  } else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    msg = 'Please enter a valid email address.';
  } else if (rules.notDefault && val === '') {
    msg = 'Please select an option.';
  }

  if (msg) {
    errEl.textContent = msg;
    group.classList.add('has-error');
    return false;
  } else {
    errEl.textContent = '';
    group.classList.remove('has-error');
    return true;
  }
}

// Real-time validation on blur
const fieldRules = [
  { id: 'name',    errId: 'nameError',    rules: { required: true, minLen: 2 } },
  { id: 'email',   errId: 'emailError',   rules: { required: true, email: true } },
  { id: 'gpu',     errId: 'gpuError',     rules: { required: true, notDefault: true } },
  { id: 'message', errId: 'messageError', rules: { required: true, minLen: 10 } },
];

fieldRules.forEach(({ id, errId, rules }) => {
  const el = document.getElementById(id);
  el.addEventListener('blur', () => validateField(id, errId, rules));
  el.addEventListener('input', () => {
    if (el.closest('.form-group').classList.contains('has-error')) {
      validateField(id, errId, rules);
    }
  });
});

// Submit handler
if (gpuForm) {
  gpuForm.addEventListener('submit', e => {
    e.preventDefault();

    let allValid = true;
    fieldRules.forEach(({ id, errId, rules }) => {
      if (!validateField(id, errId, rules)) allValid = false;
    });

    if (!allValid) {
      // Shake the first errored field
      const firstError = gpuForm.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) {
        firstError.classList.add('shake');
        firstError.addEventListener('animationend', () => firstError.classList.remove('shake'), { once: true });
        firstError.focus();
      }
      return;
    }

    // Simulate async submission
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      gpuForm.style.display = 'none';
      successMsg.classList.add('show');
    }, 1200);
  });
}

/** Called by "Send Another" button in success message */
function resetForm() {
  gpuForm.reset();
  gpuForm.style.display = 'flex';
  successMsg.classList.remove('show');

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';

  // Clear any lingering error states
  fieldRules.forEach(({ id, errId }) => {
    document.getElementById(errId).textContent = '';
    document.getElementById(id).closest('.form-group').classList.remove('has-error');
  });
}

// ── SHAKE KEYFRAME (injected via JS) ─────────────────
const shakeCSS = document.createElement('style');
shakeCSS.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%    {transform:translateX(-6px)}
    40%    {transform:translateX(6px)}
    60%    {transform:translateX(-4px)}
    80%    {transform:translateX(4px)}
  }
  .shake { animation: shake .4s ease; }
`;
document.head.appendChild(shakeCSS);

// ── INITIAL CALL ──────────────────────────────────────
highlightActiveLink();
