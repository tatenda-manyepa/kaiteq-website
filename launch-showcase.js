(() => {
  const root = document.querySelector('.launch-showcase');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-slide]')];
  const panels = [...root.querySelectorAll('[data-panel]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, paused = false, visible = false, timer;
  function show(n) {
    current = n;
    panels.forEach((panel, i) => panel.hidden = i !== n);
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === n)));
  }
  function update() {
    clearInterval(timer);
    if (!paused && !reduced.matches && visible && !document.hidden)
      timer = setInterval(() => show((current + 1) % panels.length), 3000);
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => {
    paused = true;
    show(i);
    update();
  }));
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }, {threshold: .15}).observe(root);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
})();
