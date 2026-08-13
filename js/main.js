// Page behavior: scroll reveals + nav scroll-spy.
// The terminal lives in ./terminal.js and is initialized from here.

import { initTerminal } from './terminal.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  }, { threshold: 0.15, rootMargin: '600% 0px -8% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/* ---------- nav scroll-spy ---------- */

const navLinks = new Map(
  [...document.querySelectorAll('.nav-links a[href^="#"]')]
    .map((a) => [a.getAttribute('href').slice(1), a])
);

const spy = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const link = navLinks.get(entry.target.id);
    if (link && entry.isIntersecting) {
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    }
  }
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

/* ---------- terminal ---------- */

initTerminal(
  document.getElementById('terminal'),
  document.getElementById('terminal-chips'),
  { reduceMotion }
);
