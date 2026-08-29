(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const hero = document.getElementById('hero');

  if (hero && !reduceMotion && 'IntersectionObserver' in window) {
    let tx=0,ty=0,cx=0,cy=0,targetScroll=0,currentScroll=0,frame=null,inView=false;
    if (!coarse) {
      hero.addEventListener('pointermove', event => {
        const rect=hero.getBoundingClientRect();
        tx=(((event.clientX-rect.left)/rect.width)-.5)*26;
        ty=(((event.clientY-rect.top)/rect.height)-.5)*20;
      }, { passive:true });
      hero.addEventListener('pointerleave', () => { tx=0; ty=0; });
    }
    const animate=() => {
      if (!inView || document.hidden) { frame=null; return; }
      const rect=hero.getBoundingClientRect();
      targetScroll=Math.max(-120,Math.min(120,-rect.top*.18));
      cx+=(tx-cx)*.075; cy+=(ty-cy)*.075; currentScroll+=(targetScroll-currentScroll)*.06;
      hero.style.setProperty('--mx',`${cx.toFixed(2)}px`);
      hero.style.setProperty('--my',`${cy.toFixed(2)}px`);
      hero.style.setProperty('--sy',`${currentScroll.toFixed(2)}px`);
      frame=requestAnimationFrame(animate);
    };
    const start=() => { if (inView && !document.hidden && frame===null) frame=requestAnimationFrame(animate); };
    new IntersectionObserver(([entry]) => {
      inView=entry.isIntersecting;
      if (inView) start(); else if (frame!==null) { cancelAnimationFrame(frame); frame=null; }
    }).observe(hero);
    document.addEventListener('visibilitychange', start);
  }

  if (!reduceMotion && !coarse) {
    document.querySelectorAll('.service-card,.pricing-card,.team-card').forEach(card => {
      let tx=0,ty=0,cx=0,cy=0,active=false,frame=null;
      const animate=() => {
        cx+=(tx-cx)*.14; cy+=(ty-cy)*.14;
        card.style.transform=`translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`;
        if(active||Math.abs(cx)>.05||Math.abs(cy)>.05) frame=requestAnimationFrame(animate); else frame=null;
      };
      const start=() => { if(frame===null) frame=requestAnimationFrame(animate); };
      card.addEventListener('pointerenter',()=>{active=true;start();});
      card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect();tx=(((event.clientX-r.left)/r.width)-.5)*10;ty=(((event.clientY-r.top)/r.height)-.5)*8;});
      card.addEventListener('pointerleave',()=>{active=false;tx=0;ty=0;start();});
    });
  }
})();

