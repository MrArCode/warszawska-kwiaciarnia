/* Warszawska Kwiaciarnia – drobne animacje.
   1. Wejście z logo (lotos rysuje się kreską, potem odsłania stronę) przy każdym otwarciu strony;
      kliknięcie lub klawisz je pomija, ?intro=0 w adresie je wyłącza.
      Przy włączonym w systemie ograniczeniu ruchu wejście się nie pokazuje (decyduje skrypt w <head>).
   2. Karty oferty pojawiają się jedna po drugiej.
   Reszta drobnych animacji (unoszenie kart, pulsująca kropka) jest w CSS. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var timer = null;

  function finishIntro() {
    var intro = doc.getElementById('intro');
    root.classList.remove('intro-pending');
    if (intro) intro.classList.add('is-done');
    doc.removeEventListener('click', finishIntro);
    doc.removeEventListener('keydown', finishIntro);
    if (timer) { clearTimeout(timer); timer = null; }
  }

  if (root.classList.contains('intro-pending')) {
    timer = setTimeout(finishIntro, 2700);
    // nasłuch dopiero po chwili, żeby pierwsze kliknięcie nie przerwało wejścia od razu
    setTimeout(function () {
      doc.addEventListener('click', finishIntro);
      doc.addEventListener('keydown', finishIntro);
    }, 200);
  }

  var cards = doc.querySelectorAll('.offer__grid > li[data-reveal]');
  Array.prototype.forEach.call(cards, function (li, i) {
    if (li.classList.contains('is-visible')) return;
    li.style.transitionDelay = (i * 90) + 'ms';
    li.addEventListener('transitionend', function clear() {
      li.style.transitionDelay = '';
      li.removeEventListener('transitionend', clear);
    });
  });
})();
