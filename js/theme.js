// Light/dark toggle; remembers the viewer's choice when storage is available.
(function () {
  var root = document.documentElement, key = 'jvh-theme';
  try { var saved = localStorage.getItem(key); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    function current() {
      var t = root.getAttribute('data-theme');
      if (t) return t;
      return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function label() { btn.textContent = current() === 'dark' ? 'Light mode' : 'Dark mode'; }
    label();
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(key, next); } catch (e) {}
      label();
    });
  });
})();
