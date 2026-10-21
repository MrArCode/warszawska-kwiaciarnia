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
    lotus: { vb: '0 0 120 124', d: [
      'M60 94 C 49 74.2, 49.9 45.2, 60 28 C 70.1 45.2, 71 74.2, 60 94 Z',
      'M60 94 C 44.4 81.3, 36 57.2, 39.2 39.9 C 53.2 50.6, 63.1 74.2, 60 94 Z',
      'M60 94 C 56.9 74.2, 66.8 50.6, 80.8 39.9 C 84 57.2, 75.6 81.3, 60 94 Z',
      'M60 94 C 43.6 89.6, 29.7 73.7, 27.3 58.9 C 41.8 62.4, 56.8 77.3, 60 94 Z',
      'M60 94 C 63.2 77.3, 78.2 62.4, 92.7 58.9 C 90.3 73.7, 76.4 89.6, 60 94 Z',
      'M60 94 C 46.9 96.9, 32.7 89.9, 27.1 79.4 C 38.7 76.4, 53.4 82.3, 60 94 Z',
      'M60 94 C 66.6 82.3, 81.3 76.4, 92.9 79.4 C 87.3 89.9, 73.1 96.9, 60 94 Z',
      'M22 100 Q 60 114 98 100'
    ] },
    rose: { vb: '0 0 100 124', d: [
      'M51.2 34 L 51.2 34.2 L 51.2 34.3 L 51.2 34.5 L 51.1 34.7 L 51 34.8 L 50.9 35 L 50.8 35.2 L 50.7 35.3 L 50.5 35.4 L 50.3 35.5 L 50.1 35.5 L 49.9 35.6 L 49.7 35.6 L 49.5 35.6 L 49.2 35.5 L 49 35.4 L 48.8 35.3 L 48.6 35.2 L 48.4 35 L 48.3 34.8 L 48.1 34.5 L 48 34.3 L 48 34 L 47.9 33.7 L 47.9 33.4 L 48 33.2 L 48.1 32.9 L 48.2 32.6 L 48.4 32.3 L 48.6 32.1 L 48.8 31.8 L 49.1 31.6 L 49.4 31.5 L 49.8 31.4 L 50.1 31.3 L 50.5 31.3 L 50.9 31.3 L 51.3 31.4 L 51.7 31.6 L 52 31.7 L 52.4 32 L 52.7 32.3 L 53 32.6 L 53.2 33 L 53.4 33.5 L 53.5 33.9 L 53.5 34.4 L 53.5 34.9 L 53.5 35.4 L 53.3 35.9 L 53.1 36.4 L 52.8 36.9 L 52.4 37.3 L 52 37.7 L 51.5 38 L 51 38.3 L 50.4 38.5 L 49.8 38.6 L 49.2 38.6 L 48.5 38.6 L 47.9 38.4 L 47.2 38.2 L 46.6 37.9 L 46 37.4 L 45.5 36.9 L 45 36.4 L 44.6 35.7 L 44.3 35 L 44.1 34.2 L 44 33.4 L 44 32.5 L 44.1 31.7 L 44.3 30.8 L 44.7 30 L 45.2 29.2 L 45.8 28.5 L 46.5 27.8 L 47.3 27.2 L 48.2 26.7 L 49.2 26.4 L 50.2 26.2 L 51.3 26.1 L 52.4 26.2 L 53.6 26.4 L 54.7 26.8 L 55.7 27.4 L 56.7 28.1 L 57.7 28.9 L 58.5 29.9 L 59.2 31 L 59.7 32.3 L 60.1 33.6 L 60.3 35 L 60.3 36.4 L 60.1 37.9 L 59.7 39.3 L 59.1 40.8 L 58.3 42.1 L 57.3 43.4 L 56.1 44.5 L 54.7 45.5 L 53.2 46.3 L 51.5 46.9 L 49.7 47.3 L 47.9 47.5 L 46 47.4 L 44.1 47 L 42.2 46.3 L 40.3 45.4 L 38.6 44.2 L 37 42.8 L 35.6 41.1 L 34.5 39.2 L 33.5 37.1 L 32.8 34.9 L 32.5 32.5 L 32.4 30.1 L 32.7 27.6 L 33.4 25.1 L 34.4 22.7',
      'M50.7 17 C 61.9 16, 63.5 17.1, 65.9 28',
      'M66.4 29.5 C 70.8 39.8, 70.3 41.6, 60.6 47.3',
      'M59.4 48.2 C 50.9 55.6, 49.1 55.6, 40.6 48.2',
      'M39.4 47.3 C 29.7 41.6, 29.2 39.8, 33.6 29.5',
      'M34.1 28 C 36.5 17.1, 38.1 16, 49.3 17',
      'M61.9 12 C 73.4 14.2, 74.7 15.8, 74.1 27.5',
      'M74.6 29.6 C 80.1 40, 79.6 41.9, 70.1 48.8',
      'M68.8 50.5 C 64 61.3, 62.3 62.1, 51 59',
      'M48.8 59 C 37.5 62, 35.7 61.1, 31.1 50.3',
      'M29.7 48.6 C 20.3 41.6, 19.9 39.7, 25.4 29.4',
      'M25.9 27.3 C 25.5 15.5, 26.8 14, 38.3 11.9',
      'M40.3 11 C 49.2 3.3, 51.1 3.4, 60 11.1',
      'M50 60 C 51 76 49 96 50 120',
      'M50 86 C 45.2 94.9, 35.4 98.4, 25.9 95.7 C 30.9 87.3, 40.3 82.9, 50 86 Z',
      'M50 100 C 58.7 96.5, 67.7 99.9, 72.8 107.4 C 64.3 110.4, 55 107.9, 50 100 Z',
      'M50 86 L 29.3 94.4',
      'M50 100 L 69.6 106.4'
    ] },
    tulip: { vb: '0 0 100 126', d: [
      'M33 36 C 29 54 36 70 50 70 C 64 70 71 54 67 36',
      'M33 36 C 36 38 40 40 43 40 C 46 35 48 30 50 27 C 52 30 54 35 57 40 C 60 40 64 38 67 36',
      'M43 40 C 41 52 44 64 50 70',
      'M57 40 C 59 52 56 64 50 70',
      'M50 70 C 50 88 49 104 50 122',
      'M50 112 C 38 106 26 94 22 72 C 34 84 44 98 50 112',
      'M50 120 C 60 112 70 102 76 86 C 68 100 58 110 50 120'
    ] },
    branch: { vb: '0 0 120 160', d: [
      'M14 150 Q 40 70 104 14',
      'M23.3 125 C 12.6 120.7, 7.3 109.9, 8.7 98.8 C 18.8 103.4, 25.2 113.6, 23.3 125 Z',
      'M33 104.2 C 40 96, 51 94.5, 60.3 98.9 C 53.3 106.6, 42.5 109.2, 33 104.2 Z',
      'M44.2 84.2 C 35.7 79.2, 32.6 69.4, 35.3 60.3 C 43.3 65.5, 47.4 74.9, 44.2 84.2 Z',
      'M56.9 65.3 C 63.8 59.3, 73.1 59.5, 80.3 64.5 C 73.5 69.9, 64.2 70.7, 56.9 65.3 Z',
      'M71.1 47.2 C 64.8 42.1, 63.5 33.7, 66.9 26.5 C 72.8 31.7, 75 40, 71.1 47.2 Z',
      'M86.8 30.2 C 93 26.1, 100.5 27.4, 105.7 32.4 C 99.5 36, 91.9 35.5, 86.8 30.2 Z'
    ] },
    daisy: { vb: '0 0 100 100', d: [
      'M50 41 C 42.5 31.1, 43.1 18.6, 50 8 C 56.9 18.6, 57.5 31.1, 50 41 Z',
      'M56.4 43.6 C 58.1 31.3, 67.4 22.9, 79.7 20.3 C 77.1 32.6, 68.7 41.9, 56.4 43.6 Z',
      'M59 50 C 68.9 42.5, 81.4 43.1, 92 50 C 81.4 56.9, 68.9 57.5, 59 50 Z',
      'M56.4 56.4 C 68.7 58.1, 77.1 67.4, 79.7 79.7 C 67.4 77.1, 58.1 68.7, 56.4 56.4 Z',
      'M50 59 C 57.5 68.9, 56.9 81.4, 50 92 C 43.1 81.4, 42.5 68.9, 50 59 Z',
      'M43.6 56.4 C 41.9 68.7, 32.6 77.1, 20.3 79.7 C 22.9 67.4, 31.3 58.1, 43.6 56.4 Z',
      'M41 50 C 31.1 57.5, 18.6 56.9, 8 50 C 18.6 43.1, 31.1 42.5, 41 50 Z',
      'M43.6 43.6 C 31.3 41.9, 22.9 32.6, 20.3 20.3 C 32.6 22.9, 41.9 31.3, 43.6 43.6 Z',
      'M50 41 C 55 41 59 45 59 50 C 59 55 55 59 50 59 C 45 59 41 55 41 50 C 41 45 45 41 50 41 Z',
      'M50 46 C 52.2 46 54 47.8 54 50 C 54 52.2 52.2 54 50 54 C 47.8 54 46 52.2 46 50 C 46 47.8 47.8 46 50 46 Z'
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
    m.d.forEach(function (d, i) {
      var path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('pathLength', '100');
      path.style.setProperty('--i', String(i)); // kolejność rysowania kresek
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
