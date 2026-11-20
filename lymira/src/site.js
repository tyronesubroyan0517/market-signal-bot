// Mobile menu toggle. Without JavaScript the menu simply stays open.
(function () {
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.menu-btn');
  if (!header || !btn) return;
  header.classList.add('has-js');
  btn.addEventListener('click', function () {
    var open = header.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
