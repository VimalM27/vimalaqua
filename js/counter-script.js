
document.addEventListener('DOMContentLoaded', function () {

  function animateCount(el) {
    const originalText = el.textContent.trim();
    const match = originalText.match(/^([\d,]+)(.*)$/); // splits number from suffix (e.g. "+")

    if (!match) return; // skip if no number found

    const target = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = match[2] || '';
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }

    el.textContent = '0' + suffix; // reset to 0 before animating
    requestAnimationFrame(update);
  }

  const statSection = document.querySelector('.stats');
  if (!statSection) return;

  const statNumbers = statSection.querySelectorAll('.stat-box h2');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statNumbers.forEach(animateCount);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statSection);

});