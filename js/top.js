// "Back to top" button: appears once the reader nears the bottom of a long page.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/></svg><span>Top</span>';
    document.body.appendChild(btn);

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function update() {
      var doc = document.documentElement;
      var long = doc.scrollHeight > window.innerHeight * 1.6;
      var nearBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - Math.max(320, window.innerHeight * 0.4);
      btn.classList.toggle('show', long && nearBottom);
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      // Move keyboard focus to the page heading so tabbing continues from the top.
      var h = document.querySelector('main h1');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    });
  });
})();
