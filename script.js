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
  // Keep the closed menu out of the tab order: it is only moved off-screen with
  // a transform, so its links stay focusable otherwise.
  mobileMenu.querySelectorAll('a').forEach(link => {
    if (open) link.removeAttribute('tabindex');
    else link.setAttribute('tabindex', '-1');
  });
  document.body.classList.toggle('menu-open', open);
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
};
if (hamburger && mobileMenu) {
  setMenuState(false);
  hamburger.addEventListener('click', () => setMenuState(!mobileMenu.classList.contains('open')));
  document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => setMenuState(false)));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !mobileMenu.classList.contains('open')) return;
    setMenuState(false);
    hamburger.focus();
  });
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
  let target = null;
  try {
    target = document.querySelector(selector);
  } catch (error) {
    return; // not a valid selector (e.g. "#1"); let the browser handle it
  }
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  // scrollIntoView does not move focus, so keyboard and screen-reader users stay
  // stranded at the link. Send focus to the target without scrolling it twice.
  const hadTabIndex = target.hasAttribute('tabindex');
  if (!hadTabIndex) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  if (!hadTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  if (history.replaceState) history.replaceState(null, '', selector);
}));

window.addEventListener('load', () => document.querySelectorAll('#hero .reveal').forEach((el, index) => {
  window.setTimeout(() => el.classList.add('visible'), prefersReducedMotion ? 0 : 200 + index * 150);
}));
