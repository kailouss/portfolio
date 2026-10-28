(() => {
  const links = [...document.querySelectorAll('.section-rail a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let scrollFrame = 0;
  function cancelScroll() { cancelAnimationFrame(scrollFrame); scrollFrame = 0; }
  function updateActive() {
    let active = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= innerHeight * .38) active = index;
    });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) active = sections.length - 1;
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const target = hash === '#' ? document.querySelector('#home') : document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    cancelScroll();
    const start = scrollY;
    const destination = hash === '#' || hash === '#home' ? 0 : Math.min(document.documentElement.scrollHeight - innerHeight, scrollY + target.getBoundingClientRect().top - 36);
    history.pushState(null, '', hash);
    const keyboard = event.detail === 0;
    function finish() {
      if (keyboard) { target.tabIndex = -1; target.focus({preventScroll: true}); }
      updateActive();
    }
    if (document.documentElement.dataset.motion === 'off') {
      window.scrollTo({top: destination, behavior: 'instant'}); finish(); return;
    }
    const duration = Math.min(1200, Math.max(650, Math.abs(destination - start) * .3));
    const began = performance.now();
    function step(time) {
      const progress = Math.min(1, (time - began) / duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({top: start + (destination - start) * eased, behavior: 'instant'});
      if (progress < 1) scrollFrame = requestAnimationFrame(step);
      else { scrollFrame = 0; finish(); }
    }
    scrollFrame = requestAnimationFrame(step);
  });
  window.addEventListener('wheel', cancelScroll, {passive: true});
  window.addEventListener('touchstart', cancelScroll, {passive: true});
  window.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End','Escape',' '].includes(event.key)) cancelScroll();
  });
  window.addEventListener('scroll', updateActive, {passive: true});
  window.addEventListener('resize', updateActive);
  updateActive();
})();
