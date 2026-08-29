(function () {
  document.querySelectorAll('form[data-ajax-form]').forEach(form => form.addEventListener('submit', async event => {
    event.preventDefault();
    if(!form.reportValidity()) return;
    const action=form.getAttribute('action'),button=form.querySelector('[type="submit"]');
    const status=document.getElementById(form.getAttribute('aria-describedby')||'');
    if(!action||!button)return;
    const original=button.textContent;button.disabled=true;button.textContent='Invio in corso…';
    if(status){status.textContent='Invio del messaggio in corso.';status.className='form-status';}
    try{
      const response=await fetch(action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('submit_failed');
      form.reset();button.textContent='Messaggio inviato';
      if(status){status.textContent='Grazie. Il messaggio è stato inviato correttamente.';status.className='form-status form-status--success';}
    }catch(error){
      button.textContent='Invio non riuscito';
      if(status){status.textContent='Si è verificato un errore. Riprova oppure scrivi a info@dualframe.it.';status.className='form-status form-status--error';}
    }finally{window.setTimeout(()=>{button.disabled=false;button.textContent=original;},2500);}
  }));
})();

