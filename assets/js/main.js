/* Warszawska Kwiaciarnia – skrypty strony.
   Bez zależności, bez builda. Każdy blok działa niezależnie: jeśli elementu nie ma w HTML, blok się pomija.
   Strona działa też bez JS (treść jest w HTML); skrypt tylko ją wzbogaca. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Przełącznik motywów (tylko na czas prototypu) ----------
     Wariant zapisuje się w localStorage i w adresie (?theme=raspberry),
     więc można wysłać właścicielce link do konkretnego wariantu.
     Przed wdrożeniem: usunąć ten blok, przełącznik w HTML i skrypt w <head>. */
  var THEMES = ['pastel', 'raspberry', 'dusty'];
  var THEME_NAMES = { pastel: 'Pudrowy róż', raspberry: 'Malinowy', dusty: 'Stary róż' };
  var THEME_KEY = 'wk-theme';
  var heroImg = doc.querySelector('.hero__img');
  var reviewLabel = doc.querySelector('[data-review-label]');
  var reviewMode = new URLSearchParams(location.search).get('review') === '1';

  function readTheme() {
    var fromUrl = new URLSearchParams(location.search).get('theme');
    if (THEMES.indexOf(fromUrl) !== -1) return fromUrl;
    try { var saved = localStorage.getItem(THEME_KEY); if (THEMES.indexOf(saved) !== -1) return saved; } catch (e) {}
    var current = root.getAttribute('data-theme');
    return THEMES.indexOf(current) !== -1 ? current : THEMES[0];
  }

  function applyTheme(theme, updateUrl) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}

    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) {
      var bg = getComputedStyle(root).getPropertyValue('--header-bg').trim();
      if (bg) meta.setAttribute('content', bg);
    }
    doc.querySelectorAll('[data-set-theme]').forEach(function (btn) {
      var on = btn.getAttribute('data-set-theme') === theme;
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
    });
    if (heroImg) {
      var src = heroImg.getAttribute('data-src-' + theme);
      var alt = heroImg.getAttribute('data-alt-' + theme);
      if (src && heroImg.getAttribute('src') !== src) heroImg.setAttribute('src', src);
      if (alt) heroImg.setAttribute('alt', alt);
    }
    if (reviewLabel && reviewMode) {
      reviewLabel.textContent = 'Wersja: ' + THEME_NAMES[theme] + ' · ' + (THEMES.indexOf(theme) + 1) + '/3';
      reviewLabel.hidden = false;
    }
    if (updateUrl && history.replaceState) {
      var url = new URL(location.href);
      url.searchParams.set('theme', theme);
      history.replaceState(null, '', url);
    }
  }

  applyTheme(readTheme(), false);

  doc.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-set-theme]');
    if (!btn) return;
    applyTheme(btn.getAttribute('data-set-theme'), true);
  });
  // strzałki w grupie radio
  var switcher = doc.querySelector('.theme-switch');
  if (switcher) {
    switcher.addEventListener('keydown', function (ev) {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].indexOf(ev.key) === -1) return;
      ev.preventDefault();
      var dir = (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') ? 1 : -1;
      var i = THEMES.indexOf(root.getAttribute('data-theme'));
      var next = THEMES[(i + dir + THEMES.length) % THEMES.length];
      applyTheme(next, true);
      var target = switcher.querySelector('[data-set-theme="' + next + '"]');
      if (target) target.focus();
    });
  }

  /* ---------- 2. Nagłówek: cień po przewinięciu, aktywna sekcja w menu ---------- */
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.site-nav a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var sections = navLinks.map(function (a) { return doc.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 3. Animacje wejścia (szanują prefers-reduced-motion) ---------- */
  var revealEls = doc.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px 120px 0px', threshold: 0 }); // start zanim element wjedzie w okno
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- 4. Oferta: podpowiedź „przesuń →” znika po pierwszym przewinięciu ---------- */
  var offerGrid = doc.querySelector('.offer__grid');
  var offerHint = doc.querySelector('.offer__hint');
  if (offerGrid && offerHint) {
    offerGrid.addEventListener('scroll', function () { offerHint.classList.add('is-hidden'); }, { passive: true, once: true });
  }

  /* ---------- 5. Galeria: „Pokaż więcej” na telefonie + lightbox ---------- */
  var galleryGrid = doc.getElementById('gallery-grid');
  var moreBtn = doc.querySelector('[data-gallery-more]');
  if (galleryGrid && moreBtn) {
    moreBtn.addEventListener('click', function () {
      galleryGrid.classList.add('is-expanded');
      moreBtn.setAttribute('aria-expanded', 'true');
      moreBtn.hidden = true;
      var ninth = galleryGrid.querySelector('li:nth-child(9) a');
      if (ninth) ninth.focus();
    });
  }

  var lightbox = doc.getElementById('lightbox');
  var galleryLinks = Array.prototype.slice.call(doc.querySelectorAll('[data-lightbox]'));
  if (lightbox && galleryLinks.length && typeof lightbox.showModal === 'function') {
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox__caption');
    var lbCounter = lightbox.querySelector('.lightbox__counter');
    var current = 0;
    var opener = null;

    var show = function (i) {
      current = (i + galleryLinks.length) % galleryLinks.length;
      var link = galleryLinks[current];
      var thumb = link.querySelector('img');
      lbImg.src = link.getAttribute('href');
      lbImg.alt = (thumb && thumb.alt) || link.getAttribute('data-caption') || '';
      if (lbCaption) lbCaption.textContent = link.getAttribute('data-caption') || '';
      if (lbCounter) lbCounter.textContent = (current + 1) + ' / ' + galleryLinks.length;
      [current + 1, current - 1].forEach(function (n) {
        var l = galleryLinks[(n + galleryLinks.length) % galleryLinks.length];
        var pre = new Image(); pre.src = l.getAttribute('href');
      });
    };

    galleryLinks.forEach(function (link, i) {
      link.addEventListener('click', function (ev) {
        ev.preventDefault();
        opener = link;
        show(i);
        doc.body.classList.add('has-dialog');
        lightbox.showModal();
      });
    });
    lightbox.addEventListener('close', function () {
      doc.body.classList.remove('has-dialog');
      if (opener) opener.focus();
    });
    lightbox.addEventListener('click', function (ev) {
      var action = ev.target.closest('[data-lb]');
      if (action) {
        var what = action.getAttribute('data-lb');
        if (what === 'close') lightbox.close();
        if (what === 'next') show(current + 1);
        if (what === 'prev') show(current - 1);
        return;
      }
      if (ev.target === lightbox) lightbox.close(); // klik w tło
    });
    lightbox.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') show(current + 1);
      if (ev.key === 'ArrowLeft') show(current - 1);
    });
    var touchX = null;
    lightbox.addEventListener('touchstart', function (ev) { touchX = ev.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (ev) {
      if (touchX === null) return;
      var dx = ev.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- 6. Godziny otwarcia: badge w nagłówku i chip „dziś” w tabeli ----------
     Godziny w atrybucie data-hours (JSON: {"1":[9,20], … "0":[10,16]}), 0 = niedziela.
     Czas liczony dla strefy Europe/Warsaw. Wyjątki świąteczne: do uzupełnienia po potwierdzeniu. */
  var badge = doc.querySelector('[data-open-status]');
  var hoursTable = doc.querySelector('[data-hours-table]');
  var hours = null;
  try { hours = badge ? JSON.parse(badge.getAttribute('data-hours')) : null; } catch (e) {}

  var nowInWarsaw = function () {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var map = {}; parts.forEach(function (p) { map[p.type] = p.value; });
      var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(map.weekday);
      var h = parseInt(map.hour, 10) % 24, m = parseInt(map.minute, 10);
      if (wd < 0 || isNaN(h) || isNaN(m)) throw new Error('tz');
      return { day: wd, time: h + m / 60 };
    } catch (e) {
      var d = new Date(); return { day: d.getDay(), time: d.getHours() + d.getMinutes() / 60 };
    }
  };
  var fmt = function (h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + ':' + (m < 10 ? '0' : '') + m; };

  if (badge && hours) {
    var textEl = badge.querySelector('.hours-badge__text') || badge;
    var renderBadge = function () {
      var now = nowInWarsaw();
      var today = hours[String(now.day)];
      var full, short, open = false;
      if (today && now.time >= today[0] && now.time < today[1]) {
        open = true;
        if (today[1] - now.time <= 1) { full = 'Zamykamy o ' + fmt(today[1]); short = 'Do ' + fmt(today[1]); }
        else { full = 'Dziś otwarte do ' + fmt(today[1]); short = 'Dziś do ' + fmt(today[1]); }
      } else if (today && now.time < today[0]) {
        full = 'Otwieramy o ' + fmt(today[0]); short = full;
      } else {
        var next = (now.day + 1) % 7, n = 1;
        while (!hours[String(next)] && n < 7) { next = (next + 1) % 7; n++; }
        var nh = hours[String(next)];
        var DAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sb'];
        full = nh ? (n === 1 ? 'Jutro od ' + fmt(nh[0]) : 'Otwieramy w ' + DAYS[next] + ' od ' + fmt(nh[0])) : 'Zamknięte';
        short = full;
      }
      textEl.textContent = full;
      badge.setAttribute('data-short', short);
      badge.classList.toggle('is-open', open);
      badge.classList.toggle('is-closed', !open);
    };
    renderBadge();
    setInterval(renderBadge, 60 * 1000);
  }

  if (hoursTable) {
    var today = nowInWarsaw().day;
    var row = hoursTable.querySelector('tr[data-day="' + today + '"]');
    if (row) {
      row.classList.add('is-today');
      row.setAttribute('aria-current', 'date');
      var th = row.querySelector('th');
      if (th && !th.querySelector('.chip')) {
        var chip = doc.createElement('span');
        chip.className = 'chip';
        chip.textContent = 'dziś';
        th.appendChild(chip);
      }
    }
  }

  /* ---------- 7. Mapa ładowana dopiero po kliknięciu (prywatność + szybkość) ---------- */
  var mapBox = doc.querySelector('[data-map]');
  if (mapBox) {
    var mapBtn = mapBox.querySelector('[data-map-load]');
    var src = mapBox.getAttribute('data-map');
    if (mapBtn && src) {
      mapBtn.addEventListener('click', function () {
        var iframe = doc.createElement('iframe');
        iframe.src = src;
        iframe.title = 'Mapa dojazdu do kwiaciarni';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');
        mapBox.innerHTML = '';
        mapBox.appendChild(iframe);
        mapBox.classList.add('is-loaded');
        iframe.focus();
      });
    }
  }

  /* ---------- 8. Drobiazgi ---------- */
  doc.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
