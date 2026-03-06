/* ============================================
   DUALFRAME — Custom Cursor
   dot: segue istantaneamente
   ring: segue con lerp (ritardo fluido)
   ============================================ */

(function () {

  // Attiva solo su dispositivi con mouse (pointer: fine)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  // ── Crea elementi ──
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'c-dot';
  ring.className = 'c-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // ── Stato ──
  let mX = -200, mY = -200; // posizione mouse (offscreen all'inizio)
  let rX = -200, rY = -200; // posizione ring (lerped)
  const LERP = 0.1;          // 0 = fermo, 1 = istantaneo — 0.1 = ritardo elegante

  // ── Tracking mouse ──
  document.addEventListener('mousemove', (e) => {
    mX = e.clientX;
    mY = e.clientY;
    dot.style.transform = `translate(${mX}px, ${mY}px)`;
  });

  // ── Visibilità ──
  document.addEventListener('mouseleave', () => {
    dot.classList.add('c--hidden');
    ring.classList.add('c--hidden');
  });

  document.addEventListener('mouseenter', () => {
    dot.classList.remove('c--hidden');
    ring.classList.remove('c--hidden');
  });

  // ── Hover states ──
  function bindHover(selector, cls) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add(cls));
      el.addEventListener('mouseleave', () => ring.classList.remove(cls));
    });
  }

  // Link e bottoni: ring si espande
  bindHover('a, button, label, [role="button"]', 'c--link');

  // Card progetto: ring si espande di più
  bindHover('.work-item', 'c--project');

  // ── Click feedback ──
  document.addEventListener('mousedown', () => ring.classList.add('c--press'));
  document.addEventListener('mouseup',   () => ring.classList.remove('c--press'));

  // ── Animazione ring con RAF + lerp ──
  function tick() {
    rX += (mX - rX) * LERP;
    rY += (mY - rY) * LERP;
    ring.style.transform = `translate(${rX}px, ${rY}px)`;
    requestAnimationFrame(tick);
  }

  tick();

})();
