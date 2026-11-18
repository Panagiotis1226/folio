// Page behavior: theme toggle, scroll reveals, nav scroll-spy,
// homelab diagram linking, and the copy-email button.
// The terminal lives in ./terminal.js and is initialized from here.

import { initTerminal } from './terminal.js';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- theme ----------
   Dark is the default; the choice is remembered when storage is available.
   (The inline script in <head> restores it before first paint.) */

const THEME_COLORS = { dark: '#0b0c0b', light: '#f4f1ea' };
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeToggle = document.getElementById('theme-toggle');

const getTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

function setTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  root.dataset.theme = next;
  if (themeMeta) themeMeta.content = THEME_COLORS[next];
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} theme`);
  }
  try {
    localStorage.setItem('theme', next);
  } catch {
    // storage blocked (private mode, etc.) — the theme still applies for this visit
  }
  return next;
}

if (themeToggle) {
  themeToggle.hidden = false;
  themeToggle.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
}
if (themeMeta) themeMeta.content = THEME_COLORS[getTheme()];

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

/* ---------- homelab: link the topology diagram to the project cards ----------
   Hovering or focusing a card traces that system's path in the diagram,
   and hovering a system in the diagram highlights its card. */

const labMap = document.getElementById('lab-map');
const projectCards = [...document.querySelectorAll('.project[data-sys]')];

function traceSystem(sys) {
  if (!labMap) return;
  if (sys) labMap.dataset.active = sys;
  else delete labMap.dataset.active;
  labMap.querySelectorAll('.sys').forEach((g) => g.classList.toggle('is-active', g.dataset.sys === sys));
  projectCards.forEach((card) => card.classList.toggle('is-active', card.dataset.sys === sys));
}

for (const card of projectCards) {
  card.addEventListener('pointerenter', () => traceSystem(card.dataset.sys));
  card.addEventListener('pointerleave', () => traceSystem(null));
  card.addEventListener('focus', () => traceSystem(card.dataset.sys));
  card.addEventListener('blur', () => traceSystem(null));
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
