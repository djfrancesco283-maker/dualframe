/* ============================================
   DUALFRAME — JavaScript
   ============================================ */

// ─── Navbar scroll ───────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ─── Hamburger menu ──────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// ─── Reveal on scroll ────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay based on sibling index
      const siblings = Array.from(entry.target.parentElement.children);
      const idx = siblings.indexOf(entry.target);
      const delay = idx * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// ─── Counter animation ───────────────────────
const statNums = document.querySelectorAll('.stat-num');

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();

      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => countObserver.observe(el));

// ─── Work item hover cursor effect ───────────
document.querySelectorAll('.work-item').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    item.querySelector('.work-img').style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
  });

  item.addEventListener('mouseleave', () => {
    item.querySelector('.work-img').style.transform = '';
  });
});

// ─── Contact form ────────────────────────────
const form = document.getElementById('contactForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = form.querySelector('.btn-submit');
  const originalText = btn.textContent;

  btn.textContent = 'Invio in corso...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // Simulate async send
  setTimeout(() => {
    btn.textContent = 'Messaggio inviato!';
    btn.style.background = '#2ecc71';
    btn.style.color = '#000';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.background = '';
      btn.style.color = '';
      form.reset();
    }, 3000);
  }, 1200);
});

// ─── Smooth section links ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Initial reveal for hero ──────────────────
window.addEventListener('load', () => {
  const heroItems = document.querySelectorAll('#hero .reveal');
  heroItems.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + i * 150);
  });
});
