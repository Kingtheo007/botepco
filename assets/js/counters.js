// counters.js — animates statistics from 0 to the real value in data-count
// when they scroll into view. The real number is already in the HTML, so
// no-JS visitors and screen readers always get the final figure. Skipped
// entirely when the visitor prefers reduced motion.

export default function initCounters() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const format = new Intl.NumberFormat('en-BW');

  document.querySelectorAll('[data-count]').forEach((element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target) || reduceMotion) return;

    const finalText = format.format(target);
    const spoken = document.createElement('span');
    spoken.className = 'visually-hidden';
    spoken.textContent = finalText;

    const shown = document.createElement('span');
    shown.setAttribute('aria-hidden', 'true');
    shown.textContent = format.format(0);

    element.replaceChildren(spoken, shown);

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      animate(shown, target, format);
    }, { threshold: 0.4 });

    observer.observe(element);
  });
}

function animate(node, target, format) {
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-count')) || 0;
  const start = performance.now();

  const frame = (now) => {
    const progress = duration ? Math.min(1, (now - start) / duration) : 1;
    const eased = 1 - (1 - progress) ** 3;
    node.textContent = format.format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}
