(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('entrance-pending');
      entry.target.classList.add('entrance-playing');
      observer.unobserve(entry.target);
    }
  }, {threshold: 0.08});

  function reveal(element, direction, delay = 0) {
    if (!element) return;
    element.dataset.entrance = direction;
    element.style.setProperty('--entrance-delay', `${delay}s`);
    if (document.documentElement.dataset.motion === 'off') return;
    element.classList.add('entrance-pending');
    observer.observe(element);
    element.addEventListener('focusin', () => {
      element.classList.remove('entrance-pending', 'entrance-playing');
      observer.unobserve(element);
    }, {once: true});
  }

  reveal(document.querySelector('header'), 'down');
  reveal(document.querySelector('.hero-copy'), 'left', .1);
  reveal(document.querySelector('.hero-visual'), 'right', .1);
  reveal(document.querySelector('.neural-hint'), 'up', .2);
  reveal(document.querySelector('.hero-foot'), 'up', .25);
  reveal(document.querySelector('#work .section-heading'), 'left');
  const carouselEntrances = [];
  document.querySelectorAll('.project-collection').forEach((collection, group) => {
    reveal(collection.querySelector('.collection-heading'), 'up');
    const track = collection.querySelector('.projects');
    const cards = [...track.querySelectorAll('.project')];
    let started = false, finishTimer;
    function finish() {
      clearTimeout(finishTimer);
      track.dataset.entranceState = 'complete';
      track.inert = false;
      for (const card of cards) {
        card.classList.remove('card-entering');
        card.querySelector('h3').classList.remove('card-title-entering');
      }
    }
    function start() {
      if (started) return;
      started = true;
      carouselObserver.unobserve(track);
      if (document.documentElement.dataset.motion === 'off') { finish(); return; }
      const bounds = track.getBoundingClientRect();
      const visible = cards.filter(card => {
        const rect = card.getBoundingClientRect();
        return rect.right > bounds.left && rect.left < bounds.right;
      });
      if (group) visible.reverse();
      track.dataset.entranceState = 'running';
      visible.forEach((card, index) => {
        card.style.setProperty('--entrance-delay', `${index * .2}s`);
        card.style.setProperty('--card-enter-x', group ? '45px' : '-45px');
        card.classList.add('card-entering');
        card.querySelector('h3').classList.add('card-title-entering');
      });
      finishTimer = setTimeout(finish, 850 + Math.max(0, visible.length - 1) * 200);
    }
    const carouselObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start();
    }, {threshold: .15});
    if (document.documentElement.dataset.motion === 'off') { started = true; finish(); }
    else {
      track.dataset.entranceState = 'pending';
      track.inert = true;
      carouselObserver.observe(track);
    }
    carouselEntrances.push(() => { started = true; carouselObserver.disconnect(); finish(); });
    reveal(collection.querySelector('.carousel-controls'), 'up', .2);
    reveal(collection.querySelector('.carousel-hint'), 'up');
  });
  reveal(document.querySelector('#about > div:first-child'), 'left');
  reveal(document.querySelector('.about-copy'), 'right');
  reveal(document.querySelector('#stack .section-heading'), 'left');
  for (const element of document.querySelectorAll('.stack-note,.stack-toolbar,#stack-count')) reveal(element, 'up');
  const logos = [...document.querySelectorAll('.stack-grid li')];
  const columns = innerWidth <= 760 ? 2 : innerWidth <= 900 ? 3 : 4;
  logos.forEach((logo, index) => {
    const delay = Math.floor(index / columns) * .15;
    for (const child of logo.children) reveal(child, 'scale', delay);
  });
  reveal(document.querySelector('.approach > .meta'), 'up');
  document.querySelectorAll('.approach-grid > div').forEach((step, index) => {
    reveal(step, 'up', index * .2);
  });
  reveal(document.querySelector('#contact'), 'up');
  reveal(document.querySelector('footer'), 'up', .2);

  function finishEntrances() {
    if (document.documentElement.dataset.motion !== 'off') return;
    observer.disconnect();
    carouselEntrances.forEach(finish => finish());
    document.querySelectorAll('.entrance-pending,.entrance-playing').forEach(element => {
      element.classList.remove('entrance-pending', 'entrance-playing');
    });
  }
  reducedMotion.addEventListener('change', finishEntrances);
  new MutationObserver(finishEntrances).observe(document.documentElement, {attributes: true, attributeFilter: ['data-motion']});
})();

