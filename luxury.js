(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  // Smooth hero parallax for glow/logomark.
  const hero = document.getElementById("hero");
  if (hero && !reduceMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScroll = 0;
    let currentScroll = 0;

    const onPointerMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = px * 26;
      targetY = py * 20;
    };

    if (!isCoarsePointer) {
      hero.addEventListener("pointermove", onPointerMove);
      hero.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
      });
    }

    const updateParallax = () => {
      const heroRect = hero.getBoundingClientRect();
      const inView = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
      if (inView) {
        targetScroll = Math.max(-120, Math.min(120, -heroRect.top * 0.18));
      }

      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;
      currentScroll += (targetScroll - currentScroll) * 0.06;

      hero.style.setProperty("--mx", `${currentX.toFixed(2)}px`);
      hero.style.setProperty("--my", `${currentY.toFixed(2)}px`);
      hero.style.setProperty("--sy", `${currentScroll.toFixed(2)}px`);
      requestAnimationFrame(updateParallax);
    };

    requestAnimationFrame(updateParallax);
  }

  // Magnetic hover for selected cards.
  if (!reduceMotion && !isCoarsePointer) {
    const cards = document.querySelectorAll(".service-card, .pricing-card, .team-card");

    cards.forEach((card) => {
      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      let active = false;

      const animate = () => {
        cx += (tx - cx) * 0.14;
        cy += (ty - cy) * 0.14;
        card.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;

        if (active || Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) {
          requestAnimationFrame(animate);
        }
      };

      card.addEventListener("pointerenter", () => {
        active = true;
        requestAnimationFrame(animate);
      });

      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        tx = x * 10;
        ty = y * 8;
      });

      card.addEventListener("pointerleave", () => {
        active = false;
        tx = 0;
        ty = 0;
        requestAnimationFrame(animate);
      });
    });
  }
})();
