/* Warszawska Kwiaciarnia – poziomy animacji (prototyp).
   data-motion na <html>: 1 = spokojny (lekkie animacje), 2 = kwitnący (wejście z logo, ornamenty roślinne
   w tle sekcji pojawiające się przy przewijaniu, wejścia z rozmyciem, karty oferty jedna po drugiej),
   3 = pełnia (więcej ornamentów, które bardzo powoli dryfują, parallaksa, licznik oceny, rozkwitające okazje).
   Ornamenty: grafiki z domeny publicznej (Wikimedia Commons) w assets/img/ornaments, malowane kolorem wariantu.
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

  /* ---------- 2. Ornamenty roślinne w tle (poziomy 2 i 3) ----------
     kind 'band' = poziomy pas u góry (lub dołu) sekcji; 'corner' = pionowa ozdoba w rogu.
     lvl '3' = tylko na poziomie 3 (sterowane w CSS). Pliki: assets/img/ornaments/. */
  var ORN = 'assets/img/ornaments/';
  var PLACES = [
    { sel: '.hero',         kind: 'corner', file: 'rose-stem.svg', pos: 'bl', w: 64,  h: 330, op: .2,  lvl: '2', cls: 'orn--hero' },
    { sel: '#oferta',       kind: 'band',   file: 'band-blossoms.svg',                 op: .2,  lvl: '2' },
    { sel: '#galeria',      kind: 'band',   file: 'band-mums.svg',                     op: .18, lvl: '3' },
    { sel: '#sluby-eventy', kind: 'band',   file: 'band-poppies.svg',                  op: .18, lvl: '3' },
    { sel: '#o-nas',        kind: 'corner', file: 'tulip.svg',     pos: 'br', w: 60,  h: 280, op: .2,  lvl: '2' },
    { sel: '#opinie',       kind: 'band',   file: 'band-poppies.svg',                  op: .2,  lvl: '2' },
    { sel: '#kontakt',      kind: 'band',   file: 'band-blossoms.svg',                 op: .18, lvl: '2' },
    { sel: '#kontakt',      kind: 'corner', file: 'rose-stem.svg', pos: 'br', w: 56,  h: 290, op: .16, lvl: '3' },
    { sel: '#faq',          kind: 'band',   file: 'band-mums.svg',                     op: .18, lvl: '3' },
    { sel: '.cta-band',     kind: 'band',   file: 'band-blossoms.svg', bottom: true,   op: .22, lvl: '3' },
    { sel: '.site-footer',  kind: 'band',   file: 'tailpiece.svg',                     op: .16, lvl: '3' }
  ];
  var ornDone = false;
  var ornObserver = null;

  function buildOrn(p) {
    var el = doc.createElement('span');
    var cls = 'orn orn--' + p.kind;
    if (p.kind === 'corner') cls += ' orn--' + p.pos;
    if (p.bottom) cls += ' orn--bottom';
    if (p.cls) cls += ' ' + p.cls;
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-level', p.lvl);
    el.style.setProperty('--op', String(p.op));
    if (p.w) el.style.setProperty('--w', p.w + 'px');
    if (p.h) el.style.setProperty('--h', p.h + 'px');
    var img = doc.createElement('span');
    img.className = 'orn__img';
    // adres bezwzględny: url() w zmiennej CSS bywa liczony względem arkusza, nie dokumentu
    var abs; try { abs = new URL(ORN + p.file, doc.baseURI).href; } catch (e) { abs = ORN + p.file; }
    img.style.setProperty('--img', 'url("' + abs + '")');
    el.appendChild(img);
    return el;
  }

  function ornaments() {
    if (ornDone) return;
    ornDone = true;
    if ('IntersectionObserver' in window) {
      ornObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); ornObserver.unobserve(e.target); } });
      }, { threshold: .1 });
    }
    PLACES.forEach(function (p) {
      var host = doc.querySelector(p.sel);
      if (!host) return;
      var el = buildOrn(p);
      host.appendChild(el);
      if (ornObserver) ornObserver.observe(el); else el.classList.add('is-visible');
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

  /* ---------- 6. Przełącznik poziomów ---------- */
  function apply() {
    staggerCards(level !== '1');
    if (level !== '1') ornaments();
    if (level === '3') { parallax(true); armCounter(); }
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
