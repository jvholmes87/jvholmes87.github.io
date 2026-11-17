'use strict';
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    const controls = gallery.querySelector('.gallery-controls');
    const buttons = Array.from(controls.querySelectorAll('[data-view]'));
    const frames = Array.from(gallery.querySelectorAll('[data-frame]'));
    // If initialization fails, all source views remain readable in document order.
    function select(index) {
      frames.forEach(function (frame, i) { frame.hidden = i !== index; });
      buttons.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === index)); });
    }
    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () { select(index); });
    });
    select(0);
    controls.hidden = false;
  });
});
