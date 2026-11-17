'use strict';
// Portfolio illustrations operate on explicit, bounded example data only.
document.addEventListener('DOMContentLoaded', function () {
  const motion = document.querySelector('.motion-toggle');
  if (motion) {
    motion.hidden = false;
    motion.closest('.visual').classList.add('motion-ready');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    function pause(value) {
      motion.closest('.visual').classList.toggle('motion-paused', value);
      motion.setAttribute('aria-pressed', String(value));
      motion.disabled = reduced.matches;
      motion.textContent = reduced.matches ? 'Reduced motion enabled' : value ? 'Resume motion' : 'Pause motion';
    }
    pause(reduced.matches);
    motion.addEventListener('click', function () { pause(motion.getAttribute('aria-pressed') !== 'true'); });
    reduced.addEventListener('change', function () { pause(reduced.matches); });
  }
  const metrics = {
    line: {label: 'Line-item first-pass approval', numerator: 20, denominator: 29, unit: 'dispositioned line items'},
    package: {label: 'Package first-pass approval', numerator: 8, denominator: 17, unit: 'packages'}
  };
  document.querySelectorAll('[data-metric]').forEach(function (button) {
    button.disabled = false;
    button.addEventListener('click', function () {
      const data = metrics[button.dataset.metric];
      const percent = Math.round(100 * data.numerator / data.denominator);
      document.querySelector('#metric-label').textContent = data.label;
      document.querySelector('#metric-value').innerHTML = percent + '<span>%</span>';
      document.querySelector('#metric-bar').style.width = (100 * data.numerator / data.denominator) + '%';
      const detail = data.numerator + ' first-pass approvals / ' + data.denominator + ' ' + data.unit;
      document.querySelector('#metric-detail').textContent = detail;
      document.querySelector('#metric-live').textContent = data.label + ': ' + percent + '%. ' + detail;
      document.querySelectorAll('[data-metric]').forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
    });
  });
  const access = document.querySelector('#access-day');
  if (access) {
    access.disabled = false;
    access.addEventListener('input', function () {
      const day = Number(access.value), margin = 30 - day;
      document.querySelector('#access-value').textContent = day;
      document.querySelector('#access-marker').textContent = 'Access · ' + day;
      document.querySelector('#access-marker').style.left = (day / 60 * 100) + '%';
      document.querySelector('#deadline-result').textContent = margin < 0
        ? 'Timing conflict: access arrives ' + (-margin) + ' days after the due date.'
        : margin === 0 ? 'Access and deadline coincide: 0 days remain for preparation.'
          : margin + ' calendar days remain after access. Preparation time is not modeled.';
    });
  }
  const opportunity = document.querySelector('#opportunity');
  if (opportunity) {
    opportunity.disabled = false;
    opportunity.addEventListener('change', function () {
      const assembly = opportunity.value === 'assembly';
      const result = document.querySelector('#opportunity-result');
      result.replaceChildren();
      const heading = document.createElement('h3');
      heading.textContent = assembly ? 'Traceable assembly' : 'Workshop fixture';
      const list = document.createElement('ul'); list.className = 'evidence-checks';
      const items = ['Present in example: controlled drawing', 'Present in example: inspection record'];
      if (assembly) items.push('Missing from example: material provenance', 'Missing from example: calibration evidence');
      items.forEach(function (text) { const li = document.createElement('li'); li.textContent = text; list.appendChild(li); });
      const note = document.createElement('p'); note.textContent = 'No acceptance decision is implied.';
      result.append(heading, list, note);
    });
  }
});
