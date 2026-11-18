// Page behavior: theme, the before/after workday, scroll reveals,
// nav scroll-spy, homelab diagram linking, and the copy-email button.
// The terminal lives in ./terminal.js and is initialized from here.

import { initTerminal } from './terminal.js';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- theme ----------
   The inline script in <head> picks the theme before first paint: a saved
   choice if there is one, otherwise the system setting. Only an explicit
   choice (the toggle, or `theme` in the terminal) is saved. */

const THEME_COLORS = { dark: '#0b0c0b', light: '#f4f1ea' };
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeToggle = document.getElementById('theme-toggle');
const systemDark = matchMedia('(prefers-color-scheme: dark)');

const getTheme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

function hasSavedTheme() {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark';
  } catch {
    return false;
  }
}

function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  root.dataset.theme = next;
  if (themeMeta) themeMeta.content = THEME_COLORS[next];
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} theme`);
  }
  return next;
}

function setTheme(theme) {
  const next = applyTheme(theme);
  try {
    localStorage.setItem('theme', next);
  } catch {
    // storage blocked (private mode, etc.) — the theme still applies for this visit
  }
  return next;
}

applyTheme(getTheme());

if (themeToggle) {
  themeToggle.hidden = false;
  themeToggle.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
}

// Follow the system while the visitor hasn't chosen for themselves.
systemDark.addEventListener('change', (e) => {
  if (!hasSavedTheme()) applyTheme(e.matches ? 'dark' : 'light');
});

/* ---------- the workday: before → after ----------
   Starts on "before", then flips to "after" once it has been seen.
   Touching the toggle cancels the automatic flip. */

const day = document.getElementById('day');

if (day) {
  const toggle = day.querySelector('.day-toggle');
  const buttons = [...toggle.querySelectorAll('button')];
  let flipTimer;

  const setDay = (state) => {
    day.dataset.state = state;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.state === state)));
  };

  toggle.hidden = false;
  for (const b of buttons) {
    b.addEventListener('click', () => {
      clearTimeout(flipTimer);
      flipTimer = null;
      setDay(b.dataset.state);
    });
  }

  if (reduceMotion) {
    setDay('after');
  } else {
    setDay('before');
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      seen.disconnect();
      flipTimer = setTimeout(() => setDay('after'), 2400);
    }, { threshold: 0.6 });
    seen.observe(day);
  }
}

/* ---------- scroll reveals ---------- */

if (!reduceMotion) {
  // Large top rootMargin counts anything above the viewport as "seen",
  // so nothing stays hidden if the page loads scrolled to an anchor.
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '600% 0px -6% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/* ---------- nav scroll-spy ---------- */

const navLinks = new Map(
  [...document.querySelectorAll('.nav-links a[href^="#"]')]
    .map((a) => [a.getAttribute('href').slice(1), a])
);

const spy = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    navLinks.forEach((l) => l.classList.remove('active'));
    navLinks.get(entry.target.id)?.classList.add('active');
  }
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

/* ---------- homelab: link the topology diagram to the systems list ----------
   Hovering or focusing a system traces its path in the diagram, and
   hovering a system in the diagram highlights its entry in the list. */

const labMap = document.getElementById('lab-map');
const projects = [...document.querySelectorAll('.project[data-sys]')];

function traceSystem(sys) {
  if (!labMap) return;
  if (sys) labMap.dataset.active = sys;
  else delete labMap.dataset.active;
  labMap.querySelectorAll('.sys').forEach((g) => g.classList.toggle('is-active', g.dataset.sys === sys));
  projects.forEach((p) => p.classList.toggle('is-active', p.dataset.sys === sys));
}

for (const p of projects) {
  p.addEventListener('pointerenter', () => traceSystem(p.dataset.sys));
  p.addEventListener('pointerleave', () => traceSystem(null));
  p.addEventListener('focus', () => traceSystem(p.dataset.sys));
  p.addEventListener('blur', () => traceSystem(null));
}

if (labMap) {
  labMap.querySelectorAll('.sys:not([data-sys="entry"])').forEach((g) => {
    g.addEventListener('pointerenter', () => traceSystem(g.dataset.sys));
    g.addEventListener('pointerleave', () => traceSystem(null));
  });
}

/* ---------- copy email ---------- */

const copyBtn = document.getElementById('copy-email');

if (copyBtn && navigator.clipboard) {
  copyBtn.hidden = false;
  let resetTimer;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.copy);
      copyBtn.textContent = 'copied ✓';
      copyBtn.classList.add('is-copied');
    } catch {
      copyBtn.textContent = 'press ctrl+c';
    }
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copyBtn.textContent = 'copy';
      copyBtn.classList.remove('is-copied');
    }, 1800);
  });
}

/* ---------- terminal ---------- */

initTerminal(
  document.getElementById('terminal'),
  document.getElementById('terminal-chips'),
  { reduceMotion, getTheme, setTheme, traceSystem }
);
