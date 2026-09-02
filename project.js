/* DUALFRAME — project image lightbox */
(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const image = lightbox.querySelector('#lightbox-img');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const triggers = Array.from(document.querySelectorAll('.js-lightbox-trigger'));
  if (!image || !closeButton || !triggers.length) return;

  let previousFocus = null;

  const isOpen = () => lightbox.classList.contains('open');

  const close = () => {
    if (!isOpen()) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    // Drop the decoded full-size bitmap once the overlay is gone.
    image.removeAttribute('src');
    image.alt = '';
    if (previousFocus) previousFocus.focus();
    previousFocus = null;
  };

  const open = trigger => {
    const source = trigger.dataset.lightboxSrc;
    if (!source) return;
    const preview = trigger.querySelector('img');
    previousFocus = trigger;
    image.src = source;
    image.alt = preview && preview.alt ? preview.alt : 'Anteprima del progetto';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  };

  triggers.forEach(trigger => trigger.addEventListener('click', () => open(trigger)));
  closeButton.addEventListener('click', close);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });

  document.addEventListener('keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    // The dialog holds a single control, so the trap is simply "stay here".
    if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });
})();
