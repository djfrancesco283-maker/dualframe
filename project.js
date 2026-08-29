(function () {
  const lightbox=document.getElementById('lightbox');
  if(!lightbox) return;
  const image=lightbox.querySelector('#lightbox-img');
  const closeButton=lightbox.querySelector('.lightbox-close');
  let previousFocus=null;
  const close=()=>{if(!lightbox.classList.contains('open'))return;lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open');if(previousFocus)previousFocus.focus();};
  const open=trigger=>{const source=trigger.dataset.lightboxSrc,preview=trigger.querySelector('img');if(!source||!image||!closeButton)return;previousFocus=trigger;image.src=source;image.alt=preview?preview.alt:'Anteprima progetto';lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.classList.add('lightbox-open');closeButton.focus();};
  document.querySelectorAll('.js-lightbox-trigger').forEach(trigger=>trigger.addEventListener('click',()=>open(trigger)));
  closeButton.addEventListener('click',close);
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)close();});
  document.addEventListener('keydown',event=>{if(!lightbox.classList.contains('open'))return;if(event.key==='Escape')close();if(event.key==='Tab'){event.preventDefault();closeButton.focus();}});
})();

