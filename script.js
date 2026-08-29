/* DUALFRAME — interactions */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const navbar = document.getElementById('navbar');
if (navbar) {
  const updateNavbar = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });
}

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const setMenuState = (open) => {
  if (!hamburger || !mobileMenu) return;
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
};
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => setMenuState(!mobileMenu.classList.contains('open')));
  document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => setMenuState(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenuState(false); });
}

const revealEls = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.children);
    const delay = Math.max(0, siblings.indexOf(entry.target)) * 80;
    window.setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObserver.unobserve(entry.target);
  }), { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
}

const statNums = document.querySelectorAll('.stat-num');
if (statNums.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
  const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = Number.parseInt(el.dataset.target, 10), start = performance.now();
    const animate = now => {
      const progress = Math.min((now - start) / 1800, 1);
      el.textContent = Math.round((1 - Math.pow(1 - progress, 4)) * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    countObserver.unobserve(el);
  }), { threshold: 0.5 });
  statNums.forEach(el => countObserver.observe(el));
} else {
  statNums.forEach(el => { el.textContent = el.dataset.target || el.textContent; });
}

if (hasFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('.work-item').forEach(item => {
    const image = item.querySelector('.work-img');
    if (!image) return;
    item.addEventListener('pointermove', event => {
      const rect = item.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      image.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    });
    item.addEventListener('pointerleave', () => { image.style.transform = ''; });
  });
}

document.querySelectorAll('.package-cta').forEach(button => button.addEventListener('click', () => {
  const select = document.getElementById('service');
  if (select && button.dataset.package) select.value = button.dataset.package;
}));

document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
  const selector = anchor.getAttribute('href');
  if (!selector || selector === '#') return;
  const target = document.querySelector(selector);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}));

window.addEventListener('load', () => document.querySelectorAll('#hero .reveal').forEach((el,index) => {
  window.setTimeout(() => el.classList.add('visible'), prefersReducedMotion ? 0 : 200 + index * 150);
}));

