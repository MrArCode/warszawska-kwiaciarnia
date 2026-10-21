/* Warszawska Kwiaciarnia – poziomy animacji (prototyp).
   data-motion na <html>: 1 = spokojny (lekkie animacje), 2 = kwitnący (wejście z logo, płatki w hero,
   wejścia z rozmyciem, karty oferty jedna po drugiej), 3 = pełnia (płatki na całej stronie, parallaksa,
   licznik oceny, gałązki między sekcjami, rozkwitające okazje). Poziomy się sumują.
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

  /* ---------- 2. Płatki w hero (poziom 2) ---------- */
  function heroPetals(on) {
    var media = doc.querySelector('.hero__media');
    if (!media) return;
    var box = media.querySelector('.hero__petals');
    if (!on) { if (box) box.parentNode.removeChild(box); return; }
    if (box) return;
    box = doc.createElement('div');
    box.className = 'hero__petals';
    box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 8; i++) {
      var p = doc.createElement('span');
      p.className = 'petal';
      p.style.setProperty('--x', (4 + Math.random() * 92) + '%');
      p.style.setProperty('--s', (8 + Math.random() * 8) + 'px');
      p.style.setProperty('--d', (9 + Math.random() * 7) + 's');
      p.style.setProperty('--delay', (-Math.random() * 14) + 's');
      p.style.setProperty('--sway', (18 + Math.random() * 40) + 'px');
      box.appendChild(p);
    }
    media.appendChild(box);
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

  /* ---------- 4. Płatki na całej stronie (poziom 3) ---------- */
  var canvas = null, ctx = null, petals = [], raf = null, running = false;
  var W = 0, H = 0;
  var colors = { a: '#E9B9C6', p: '#B8456A' };

  function readColors() {
    var cs = getComputedStyle(root);
    colors.a = cs.getPropertyValue('--accent').trim() || colors.a;
    colors.p = cs.getPropertyValue('--primary').trim() || colors.p;
    petals.forEach(function (p) { p.color = p.kind === 'a' ? colors.a : colors.p; });
  }

  function resize() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function newPetal(spread) {
    var kind = Math.random() < .72 ? 'a' : 'p';
    return {
      kind: kind, color: kind === 'a' ? colors.a : colors.p,
      x: Math.random() * W, y: spread ? Math.random() * H : -20 - Math.random() * 60,
      s: 5 + Math.random() * 7, vy: .35 + Math.random() * .7,
      sway: Math.random() * Math.PI * 2, sv: .008 + Math.random() * .016, sa: .3 + Math.random() * .7,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - .5) * .025,
      alpha: .45 + Math.random() * .4
    };
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.sway += p.sv; p.x += Math.sin(p.sway) * p.sa; p.y += p.vy; p.rot += p.vr;
      if (p.y > H + 30 || p.x < -40 || p.x > W + 40) { petals[i] = p = newPetal(false); }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.ellipse(0, 0, p.s * .55, p.s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  }

  function startPetals() {
    if (running) return;
    if (!canvas) {
      canvas = doc.createElement('canvas');
      canvas.className = 'petals-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      window.addEventListener('resize', resize);
    }
    resize(); readColors();
    var n = Math.max(10, Math.min(28, Math.round(W / 50)));
    petals = [];
    for (var i = 0; i < n; i++) petals.push(newPetal(true));
    running = true;
    frame();
  }

  function stopPetals() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    if (canvas) { canvas.parentNode.removeChild(canvas); canvas = null; ctx = null; window.removeEventListener('resize', resize); }
  }

  doc.addEventListener('visibilitychange', function () {
    if (level !== '3' || !canvas) return;
    if (doc.hidden) { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }
    else if (!running) { running = true; frame(); }
  });

  /* ---------- 5. Parallaksa hero i plam w tle (poziom 3) ---------- */
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

  /* ---------- 6. Ocena nabija się licznikiem (poziom 3) ---------- */
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

  /* ---------- 7. Gałązki rysujące się między sekcjami (poziom 3) ---------- */
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

  /* ---------- 8. Przełącznik poziomów ---------- */
  function apply() {
    heroPetals(level === '2');
    staggerCards(level !== '1');
    if (level === '3') { startPetals(); parallax(true); sprigs(); armCounter(); }
    else { stopPetals(); parallax(false); }
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

  // zmiana odcienia różu → kolory płatków
  if ('MutationObserver' in window) {
    new MutationObserver(function () { if (canvas) readColors(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
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
