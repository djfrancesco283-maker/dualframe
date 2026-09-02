/* DUALFRAME — progressive-enhancement AJAX submit for the Formspree forms.
   Without JS the forms still post normally; this only avoids the redirect. */
(function () {
  const MESSAGES = {
    sending: 'Invio del messaggio in corso.',
    success: 'Grazie. Il messaggio è stato inviato correttamente. Ti rispondiamo al più presto.',
    error: 'Si è verificato un errore. Riprova oppure scrivi a info@dualframe.it.'
  };

  const setStatus = (node, text, variant) => {
    if (!node) return;
    node.textContent = text;
    node.className = variant ? `form-status form-status--${variant}` : 'form-status';
  };

  document.querySelectorAll('form[data-ajax-form]').forEach(form => {
    const action = form.getAttribute('action');
    const button = form.querySelector('[type="submit"]');
    const status = document.getElementById(form.getAttribute('aria-describedby') || '');
    if (!action || !button) return;

    const idleLabel = button.textContent;
    let inFlight = false;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (inFlight || !form.reportValidity()) return;

      inFlight = true;
      button.disabled = true;
      button.textContent = 'Invio in corso…';
      setStatus(status, MESSAGES.sending, null);

      try {
        const response = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
          // Formspree returns the field-level reason in the JSON body.
          let detail = '';
          try {
            const payload = await response.json();
            detail = Array.isArray(payload.errors)
              ? payload.errors.map(item => item.message).filter(Boolean).join(' ')
              : '';
          } catch (parseError) {
            detail = '';
          }
          throw new Error(detail);
        }

        form.reset();
        button.textContent = 'Messaggio inviato';
        setStatus(status, MESSAGES.success, 'success');
        // Leave the confirmation on screen; only the button returns to idle.
        window.setTimeout(() => { button.textContent = idleLabel; }, 4000);
      } catch (error) {
        button.textContent = idleLabel;
        setStatus(status, error.message ? `${MESSAGES.error} (${error.message})` : MESSAGES.error, 'error');
      } finally {
        inFlight = false;
        button.disabled = false;
      }
    });
  });
})();
