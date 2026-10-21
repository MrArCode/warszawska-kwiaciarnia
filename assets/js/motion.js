/* Warszawska Kwiaciarnia – poziomy animacji (prototyp).
   data-motion na <html>: 1 = spokojny (lekkie animacje), 2 = kwitnący (wejście z logo, konturowe roślinki
   w tle rysujące się przy przewijaniu, wejścia z rozmyciem, karty oferty jedna po drugiej), 3 = pełnia
   (więcej i większe roślinki, które lekko się kołyszą, parallaksa, licznik oceny, gałązki między sekcjami,
   rozkwitające okazje). Poziomy się sumują.
   Przy prefers-reduced-motion skrypt w <head> wymusza poziom 1 i nic z tego pliku nie animuje.
   Przed wdrożeniem: zostawić jeden poziom (atrybut data-motion w HTML) i usunąć przełącznik. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var LEVELS = ['1', '2', '3'];
  var MOTION_KEY = 'wk-motion';
  var forced = root.hasAttribute('data-motion-forced');
  var level = LEVELS.indexOf(root.getAttribute('data-motion')) !== -1 ? root.getAttribute('data-motion') : '1';

  /* ---------- 1. Wejście z logo (poziomy 2 i 3) ---------- */
  var introTimer = null;

  function finishIntro() {
    var intro = doc.getElementById('intro');
    root.classList.remove('intro-pending');
    if (intro) intro.classList.add('is-done');
    doc.removeEventListener('click', finishIntro);
    doc.removeEventListener('keydown', finishIntro);
    if (introTimer) { clearTimeout(introTimer); introTimer = null; }
  }

  function playIntro(replay) {
    var intro = doc.getElementById('intro');
    if (!intro || level === '1') return;
    if (replay) { // świeża kopia elementu, żeby animacje CSS wystartowały od początku
      var fresh = intro.cloneNode(true);
      fresh.classList.remove('is-done');
      intro.parentNode.replaceChild(fresh, intro);
    }
    root.classList.add('intro-pending');
    try { sessionStorage.setItem('wk-intro', level); } catch (e) {}
    introTimer = setTimeout(finishIntro, level === '3' ? 3300 : 2700);
    // kliknięcie lub klawisz pomija wejście (nasłuch dopiero po chwili, żeby nie złapać kliknięcia w przełącznik)
    setTimeout(function () {
      doc.addEventListener('click', finishIntro);
      doc.addEventListener('keydown', finishIntro);
    }, 200);
  }

  /* ---------- 2. Konturowe roślinki w tle (poziomy 2 i 3) ----------
     Rysunki kreską, bardzo jasne, za treścią. Rysują się przy pierwszym pojawieniu w oknie.
     Wpisy z lvl '3' pokazują się tylko na poziomie 3 (sterowane w CSS). */
  var MOTIFS = {
    lotus: { vb: '0 0 120 120', d: [
      'M60 18 C 48 40 48 72 60 96 C 72 72 72 40 60 18 Z',
      'M60 96 C 44 86 34 68 36 42 C 50 52 58 72 60 96 Z',
      'M60 96 C 76 86 86 68 84 42 C 70 52 62 72 60 96 Z',
      'M60 96 C 40 94 22 80 16 58 C 34 62 50 76 60 96 Z',
      'M60 96 C 80 94 98 80 104 58 C 86 62 70 76 60 96 Z',
      'M30 104 Q 60 113 90 104'
    ] },
    rose: { vb: '0 0 100 120', d: [
      'M30 44 C 24 62 36 76 50 76 C 64 76 76 62 70 44',
      'M30 44 C 34 32 44 28 50 34 C 56 28 66 32 70 44',
      'M50 72 C 36 68 32 52 42 44 C 52 38 64 46 58 56 C 54 62 44 60 46 52 C 47 48 53 48 53 52',
      'M50 76 C 50 90 50 104 49 118',
      'M49 94 C 40 84 28 86 20 94 C 28 102 42 100 49 94 Z',
      'M50 106 C 58 98 70 100 78 106 C 70 112 58 112 50 106 Z'
    ] },
    tulip: { vb: '0 0 100 120', d: [
      'M34 38 C 30 58 38 72 50 72 C 62 72 70 58 66 38',
      'M34 38 C 38 30 46 28 50 38 C 54 28 62 30 66 38',
      'M50 38 C 46 48 46 62 50 72',
      'M50 72 C 51 88 50 104 50 118',
      'M50 100 C 42 88 30 82 24 62 C 36 72 46 86 50 100 Z',
      'M50 108 C 58 96 70 92 78 76 C 66 84 56 96 50 108 Z'
    ] },
    branch: { vb: '0 0 120 160', d: [
      'M18 152 C 40 112 62 72 102 12',
      'M44 108 C 32 100 28 88 32 76 C 42 84 46 96 44 108 Z',
      'M56 90 C 64 78 76 74 88 78 C 80 88 68 92 56 90 Z',
      'M66 70 C 58 60 56 48 62 38 C 70 46 72 58 66 70 Z',
      'M78 52 C 86 42 98 36 110 38 C 102 48 90 54 78 52 Z',
      'M34 130 C 24 124 18 112 20 100 C 30 106 36 118 34 130 Z'
    ] },
    daisy: { vb: '0 0 100 100', d: [
      'M50 40 C 45 30 45 14 50 8 C 55 14 55 30 50 40 Z',
      'M60 44 C 70 36 82 34 90 40 C 82 48 70 48 60 44 Z',
      'M60 56 C 70 64 82 66 90 60 C 82 52 70 52 60 56 Z',
      'M50 60 C 55 70 55 86 50 92 C 45 86 45 70 50 60 Z',
      'M40 56 C 30 64 18 66 10 60 C 18 52 30 52 40 56 Z',
      'M40 44 C 30 36 18 34 10 40 C 18 48 30 48 40 44 Z',
      'M50 58 C 46 58 42 54 42 50 C 42 46 46 42 50 42 C 54 42 58 46 58 50 C 58 54 54 58 50 58 Z'
    ] }
  };
  // sel = sekcja, m = motyw, pos = róg (tl/tr/bl/br), size w px, rot w stopniach, op = krycie, lvl = od którego poziomu
  var PLACES = [
    { sel: '.hero',          m: 'branch', pos: 'tl', size: 230, rot: -8,  op: .13, lvl: '2', cls: 'deco--hero' },
    { sel: '#oferta',        m: 'rose',   pos: 'tr', size: 170, rot: 10,  op: .18, lvl: '2' },
    { sel: '#oferta',        m: 'branch', pos: 'bl', size: 220, rot: 6,   op: .14, lvl: '3' },
    { sel: '#galeria',       m: 'lotus',  pos: 'bl', size: 170, rot: 0,   op: .16, lvl: '2' },
    { sel: '#galeria',       m: 'daisy',  pos: 'tr', size: 120, rot: 15,  op: .16, lvl: '3' },
    { sel: '#sluby-eventy',  m: 'tulip',  pos: 'tr', size: 160, rot: 12,  op: .18, lvl: '2' },
    { sel: '#sluby-eventy',  m: 'lotus',  pos: 'bl', size: 190, rot: 0,   op: .14, lvl: '3' },
    { sel: '#o-nas',         m: 'daisy',  pos: 'tl', size: 130, rot: -20, op: .18, lvl: '2' },
    { sel: '#o-nas',         m: 'tulip',  pos: 'br', size: 150, rot: -14, op: .16, lvl: '3' },
    { sel: '#opinie',        m: 'branch', pos: 'br', size: 210, rot: 14,  op: .15, lvl: '2' },
    { sel: '#opinie',        m: 'daisy',  pos: 'tl', size: 110, rot: 10,  op: .16, lvl: '3' },
    { sel: '#kontakt',       m: 'rose',   pos: 'bl', size: 160, rot: -10, op: .17, lvl: '2' },
    { sel: '#kontakt',       m: 'branch', pos: 'tr', size: 200, rot: -12, op: .13, lvl: '3' },
    { sel: '#faq',           m: 'lotus',  pos: 'br', size: 170, rot: 0,   op: .15, lvl: '3' },
    { sel: '.cta-band',      m: 'branch', pos: 'tr', size: 190, rot: 10,  op: .22, lvl: '3' },
    { sel: '.site-footer',   m: 'lotus',  pos: 'br', size: 180, rot: 0,   op: .14, lvl: '3' }
  ];
  var decosDone = false;
  var decoObserver = null;

  function buildDeco(p) {
    var m = MOTIFS[p.m];
    var svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'deco deco--' + p.pos + (p.cls ? ' ' + p.cls : ''));
    svg.setAttribute('viewBox', m.vb);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('data-level', p.lvl);
    svg.style.setProperty('--size', p.size + 'px');
    svg.style.setProperty('--rot', p.rot + 'deg');
    svg.style.setProperty('--op', String(p.op));
    m.d.forEach(function (d) {
      var path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('pathLength', '100');
      svg.appendChild(path);
    });
    return svg;
  }

  function decorations() {
    if (decosDone) return;
    decosDone = true;
    if ('IntersectionObserver' in window) {
      decoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); decoObserver.unobserve(e.target); } });
      }, { threshold: .15 });
    }
    PLACES.forEach(function (p) {
      var host = doc.querySelector(p.sel);
      if (!host) return;
      var svg = buildDeco(p);
      host.appendChild(svg);
      if (decoObserver) decoObserver.observe(svg); else svg.classList.add('is-visible');
    });
  }

  /* ---------- 3. Karty oferty wchodzą jedna po drugiej (poziomy 2 i 3) ---------- */
  function staggerCards(on) {
    var cards = doc.querySelectorAll('.offer__grid > li[data-reveal]');
    Array.prototype.forEach.call(cards, function (li, i) {
      if (!on || li.classList.contains('is-visible')) { li.style.transitionDelay = ''; return; }
      li.style.transitionDelay = (i * 90) + 'ms';
      li.addEventListener('transitionend', function clear() {
        li.style.transitionDelay = '';
        li.removeEventListener('transitionend', clear);
      });
    });
  }

  /* ---------- 4. Parallaksa hero i plam w tle (poziom 3) ---------- */
  var parallaxOn = false, ticking = false;
  var heroMedia = doc.querySelector('.hero__media');
  var offer = doc.querySelector('.offer');

  function parallaxFrame() {
    ticking = false;
    if (!parallaxOn) return;
    var y = window.scrollY || 0;
    var heroH = heroMedia ? heroMedia.offsetHeight || 800 : 800;
    if (heroMedia) heroMedia.style.transform = 'translate3d(0,' + Math.round(Math.min(y, heroH) * .18) + 'px,0) scale(1.08)';
    if (offer) offer.style.setProperty('--blob-y', Math.round(y * -.05) + 'px');
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(parallaxFrame); } }
  function parallax(on) {
    parallaxOn = on;
    if (on) { window.addEventListener('scroll', onScroll, { passive: true }); parallaxFrame(); }
    else {
      window.removeEventListener('scroll', onScroll);
      if (heroMedia) heroMedia.style.transform = '';
      if (offer) offer.style.removeProperty('--blob-y');
    }
  }

  /* ---------- 5. Ocena nabija się licznikiem (poziom 3) ---------- */
  var score = doc.querySelector('.rating-card__score');
  var scoreTarget = score ? parseFloat(score.textContent.replace(',', '.')) : 0;
  var scoreDone = false;
  function fmt(v) { return v.toFixed(1).replace('.', ','); }
  function armCounter() {
    if (!score || scoreDone || isNaN(scoreTarget) || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || scoreDone || level !== '3') return;
        scoreDone = true; io.disconnect();
        var t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / 1400);
          score.textContent = fmt(scoreTarget * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step); else score.textContent = fmt(scoreTarget);
        };
        score.textContent = fmt(0);
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    io.observe(score);
  }

  /* ---------- 6. Gałązki rysujące się między sekcjami (poziom 3) ---------- */
  var SPRIG = '<svg class="sprig" viewBox="0 0 120 36" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path pathLength="100" d="M4 31 C 32 30, 64 24, 116 5"/>' +
    '<path pathLength="100" d="M28 29 C 32 20, 41 16, 52 17 C 46 24, 38 28, 28 29 Z"/>' +
    '<path pathLength="100" d="M60 22 C 63 13, 72 9, 82 10 C 77 17, 69 21, 60 22 Z"/>' +
    '<path pathLength="100" d="M44 27 C 50 29, 55 32, 58 34 C 52 35, 46 33, 44 27 Z"/>' +
    '<path pathLength="100" d="M86 14 C 90 7, 98 4, 108 5 C 103 12, 95 15, 86 14 Z"/></svg>';
  var sprigsDone = false;
  function sprigs() {
    if (sprigsDone) return;
    sprigsDone = true;
    var sections = Array.prototype.slice.call(doc.querySelectorAll('main > .section')).slice(1);
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: .1 }) : null;
    sections.forEach(function (s) {
      var wrap = doc.createElement('div');
      wrap.className = 'sprig-wrap';
      wrap.innerHTML = SPRIG;
      s.insertBefore(wrap, s.firstChild);
      if (io) io.observe(wrap); else wrap.classList.add('is-visible');
    });
  }

  /* ---------- 7. Przełącznik poziomów ---------- */
  function apply() {
    staggerCards(level !== '1');
    if (level !== '1') decorations();
    if (level === '3') { parallax(true); sprigs(); armCounter(); }
    else { parallax(false); }
  }

  function setLevel(l, fromUser) {
    if (LEVELS.indexOf(l) === -1) return;
    if (forced) l = '1';
    level = l;
    root.setAttribute('data-motion', l);
    if (!forced) { try { localStorage.setItem(MOTION_KEY, l); } catch (e) {} }
    doc.querySelectorAll('[data-set-motion]').forEach(function (b) {
      var on = b.getAttribute('data-set-motion') === l;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (fromUser && history.replaceState) {
      var url = new URL(location.href);
      url.searchParams.set('motion', l);
      history.replaceState(null, '', url);
    }
    apply();
    if (fromUser) { finishIntro(); if (l !== '1') playIntro(true); }
  }

  doc.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-set-motion]');
    if (!b) return;
    setLevel(b.getAttribute('data-set-motion'), true);
  });

  var sw = doc.querySelector('.motion-switch');
  if (sw) {
    sw.addEventListener('keydown', function (ev) {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].indexOf(ev.key) === -1) return;
      ev.preventDefault();
      var dir = (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') ? 1 : -1;
      var next = LEVELS[(LEVELS.indexOf(level) + dir + LEVELS.length) % LEVELS.length];
      setLevel(next, true);
      var target = sw.querySelector('[data-set-motion="' + next + '"]');
      if (target) target.focus();
    });
  }

  if (forced) {
    doc.querySelectorAll('[data-set-motion]').forEach(function (b) {
      b.disabled = true;
      b.title = 'Animacje wyłączone w ustawieniach systemu (ograniczony ruch)';
    });
  }

  setLevel(level, false);
  if (root.classList.contains('intro-pending')) playIntro(false);
})();
