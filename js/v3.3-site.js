// SafeWave v3.3 — presentation-only enhancements.
(() => {
  const revealTargets = document.querySelectorAll(
    '.v33-trust-strip article, .aurora-v2-genre, .aurora-v2-album, .aurora-v2-track'
  );

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach(el => el.classList.add('v33-visible'));
    return;
  }

  revealTargets.forEach(el => el.classList.add('v33-reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('v33-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  revealTargets.forEach(el => observer.observe(el));
})();
