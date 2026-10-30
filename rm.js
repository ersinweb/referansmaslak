/* Referans Maslak — ortak site davranışları (2026-10 yeni tasarım)
 * Tema (varsayılan koyu), menü, TR/EN, rastgele fotoğraflar ve galeri.
 *
 * FOTOĞRAF EKLEMEK: Görseli "Gorsel (52).jpg" gibi numarayla klasöre koyun ve
 * numarasını aşağıdaki POOL listesine ekleyin. Dikey/yatay yerleşimi kod kendisi belirler.
 * KAPAK FOTOĞRAFLARI: hero/hero-1.jpg … hero/hero-7.jpg. Aynı adla değiştirilebilir.
 */
(function () {
  'use strict';

  var POOL = [1,2,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,
              31,32,33,34,35,36,38,39,42,43,44,45,46,47,48,49,50];
  // hero-1 … hero-8 dosyalarının galerideki karşılıkları (aynı foto iki kez görünmesin diye)
  var HERO_MAP = [11, 14, 15, 22, 26, 34, 36];

  var used = {};
  if (window.RM_HERO_INDEX) used[HERO_MAP[window.RM_HERO_INDEX - 1]] = true;

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pick(n) {
    var free = POOL.filter(function (x) { return !used[x]; });
    var out = shuffle(free).slice(0, n);
    out.forEach(function (x) { used[x] = true; });
    return out;
  }
  function src(n) { return 'Gorsel (' + n + ').jpg'; }
  function altText(n) {
    return (document.documentElement.lang === 'en' ? 'Maslak residence and city view ' : 'Maslak residence ve şehir manzarası ') + n + ' – Referans Maslak';
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  }

  ready(function () {
    var html = document.documentElement;
    var body = document.body;

    /* ---------- Sağ tık / F12 engeli (eski sitedeki gibi) ---------- */
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) e.preventDefault();
      if (e.key === 'F12') e.preventDefault();
    });

    /* ---------- Logo ---------- */
    var logo = document.getElementById('logoLink');
    if (logo) logo.addEventListener('click', function (e) {
      var onHome = /(^\/$|index\.html$)/.test(location.pathname);
      if (onHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });

    /* ---------- Yan menü ---------- */
    var hamburgerBtn = document.getElementById('hamburgerBtn');
    var sidebar = document.getElementById('sidebarMenu');
    var overlay = document.getElementById('menuOverlay');
    function setMenu(open) {
      if (!sidebar) return;
      sidebar.classList.toggle('open', open);
      overlay.classList.toggle('active', open);
      var icon = hamburgerBtn && hamburgerBtn.querySelector('i');
      if (icon) { icon.classList.toggle('fa-bars', !open); icon.classList.toggle('fa-times', open); }
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', function () { setMenu(!sidebar.classList.contains('open')); });
    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    /* ---------- Tema: varsayılan koyu; 'darkMode' = 'disabled' ise açık ---------- */
    var darkToggle = document.getElementById('darkModeToggle');
    function applyDark(on) {
      html.classList.toggle('dark', on);
      body.classList.toggle('dark-mode', on);   // çerez bandı stili bu sınıfı kullanıyor
      if (darkToggle) darkToggle.checked = on;
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', on ? '#0B0E13' : '#F5F6F8');
      var tb = document.getElementById('themeBtn');
      if (tb) tb.setAttribute('aria-label', on ? 'Açık temaya geç / Light mode' : 'Koyu temaya geç / Dark mode');
    }
    applyDark(store('darkMode') !== 'disabled');
    if (darkToggle) darkToggle.addEventListener('change', function () {
      store('darkMode', this.checked ? 'enabled' : 'disabled');
      applyDark(this.checked);
    });
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn && darkToggle) themeBtn.addEventListener('click', function () {
      darkToggle.checked = !darkToggle.checked;
      darkToggle.dispatchEvent(new Event('change'));
    });

    /* ---------- Dil ---------- */
    var langToggle = document.getElementById('languageMenuToggle');
    var enOnly = body.getAttribute('data-lang-mode') === 'en-only';
    var trPageOf = body.getAttribute('data-tr-page');

    function applyLang(lang) {
      var isEn = lang === 'en';
      document.querySelectorAll('[data-tr][data-en]').forEach(function (el) {
        var v = el.getAttribute('data-' + lang);
        if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v;
      });
      var call = document.querySelector('.call-text');
      var dir = document.querySelector('.direction-text');
      if (call) call.textContent = isEn ? 'CALL' : 'ARA';
      if (dir) dir.textContent = isEn ? 'DIRECTIONS' : 'KONUM';
      var cTr = document.getElementById('content-tr');
      var cEn = document.getElementById('content-en');
      if (cTr) cTr.classList.toggle('active', !isEn);
      if (cEn) cEn.classList.toggle('active', isEn);
      body.classList.toggle('lang-en-active', isEn);
      html.lang = isEn ? 'en' : 'tr';
      var lb = document.getElementById('langBtn');
      if (lb) lb.textContent = isEn ? 'TR' : 'EN';
      if (langToggle) langToggle.checked = isEn;
    }

    if (enOnly) {
      applyLang('en');
      if (langToggle) langToggle.addEventListener('change', function () {
        if (!this.checked) { store('language', 'tr'); window.location.href = trPageOf || 'index.html'; }
      });
    } else {
      if (store('language') === 'en') applyLang('en');
      if (langToggle) langToggle.addEventListener('change', function () {
        var lang = this.checked ? 'en' : 'tr';
        store('language', lang);
        applyLang(lang);
      });
    }
    var langBtn = document.getElementById('langBtn');
    if (langBtn && langToggle) langBtn.addEventListener('click', function () {
      langToggle.checked = !langToggle.checked;
      langToggle.dispatchEvent(new Event('change'));
    });

    /* ---------- Rastgele foto alanları: <div data-rm-photos="3"> ---------- */
    document.querySelectorAll('[data-rm-photos]').forEach(function (box) {
      var n = parseInt(box.getAttribute('data-rm-photos'), 10) || 3;
      pick(n).forEach(function (num) {
        var img = new Image();
        img.loading = 'lazy'; img.decoding = 'async';
        img.src = src(num); img.alt = altText(num);
        box.appendChild(img);
      });
    });
    document.querySelectorAll('img[data-rm-photo]').forEach(function (img) {
      var num = pick(1)[0];
      img.src = src(num); img.alt = altText(num);
    });

    /* ---------- Galeri: rastgele seçim + dikey/yatay yerleşim ---------- */
    var gallery = document.getElementById('galleryContainer');
    if (gallery) buildGallery(gallery, parseInt(gallery.getAttribute('data-count'), 10) || 18);
  });

  function buildGallery(gallery, count) {
    Promise.all(pick(count).map(loadImage)).then(function (images) {
      var loaded = images.filter(function (x) { return x !== null; });
      var portrait = loaded.filter(function (x) { return x.isPortrait; });
      var landscape = loaded.filter(function (x) { return !x.isPortrait; });
      var ratio = function (x) { return x.img.naturalWidth / x.img.naturalHeight; };
      var wide = landscape.filter(function (x) { return Math.abs(ratio(x) - 16 / 9) < 0.2; });
      var other = landscape.filter(function (x) { return Math.abs(ratio(x) - 16 / 9) >= 0.2; });
      var largeCount = Math.floor(other.length / 2);
      shuffle(portrait); shuffle(wide); shuffle(other);

      var main = [], fillers = [];
      function make(x, cls) {
        var d = document.createElement('div');
        d.className = 'gallery-item' + (cls ? ' ' + cls : '');
        d.appendChild(x.img);
        return d;
      }
      wide.forEach(function (x) { main.push(make(x, 'img-wide')); });
      other.slice(0, largeCount).forEach(function (x) { main.push(make(x, 'img-large')); });
      other.slice(largeCount).forEach(function (x) { main.push(make(x, '')); });
      portrait.forEach(function (x) { main.push(make(x, 'img-tall')); });
      shuffle(main).forEach(function (el) { gallery.appendChild(el); });

      // Ana fotolar yerleştikten sonra kalan boş hücreler havuzdan tek kare fotoğraflarla doldurulur
      function ensureFillers(n) {
        if (fillers.length >= n) return Promise.resolve();
        return Promise.all(pick(n - fillers.length).map(loadImage)).then(function (more) {
          more.filter(function (x) { return x !== null; }).forEach(function (x) {
            var el = make(x, ''); fillers.push(el); gallery.appendChild(el);
          });
        });
      }

      var lastCols = 0, t = null;
      function cols() { return getComputedStyle(gallery).gridTemplateColumns.split(' ').length; }
      function layout() {
        lastCols = cols();
        var res = place(main, lastCols);
        var holes = [];
        for (var r = 0; r <= res.maxRow; r++)
          for (var c = 0; c < lastCols; c++) if (!res.occupied[c + ',' + r]) holes.push({ r: r, c: c });
        ensureFillers(holes.length).then(function () {
          fillers.forEach(function (el, i) {
            var h = holes[i];
            el.hidden = !h;
            if (h) { el.style.gridColumn = (h.c + 1) + ' / span 1'; el.style.gridRow = (h.r + 1) + ' / span 1'; }
          });
        });
      }
      requestAnimationFrame(layout);
      window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(function () { if (cols() !== lastCols) layout(); }, 150);
      });
    });
  }

  // Boşluk bırakmadan yerleştirme (eski sitedeki mantık): her foto sığdığı ilk yere
  function place(items, colCount) {
    var occupied = {}, maxRow = 0;
    items.forEach(function (item) {
      var colSpan = (item.classList.contains('img-wide') || item.classList.contains('img-large')) ? 2 : 1;
      var rowSpan = (item.classList.contains('img-tall') || item.classList.contains('img-large')) ? 2 : 1;
      colSpan = Math.min(colSpan, colCount);
      for (var row = 0, placed = false; !placed; row++) {
        for (var col = 0; col + colSpan <= colCount; col++) {
          var ok = true;
          for (var r = row; r < row + rowSpan && ok; r++)
            for (var c = col; c < col + colSpan && ok; c++)
              if (occupied[c + ',' + r]) ok = false;
          if (ok) {
            item.style.gridColumn = (col + 1) + ' / span ' + colSpan;
            item.style.gridRow = (row + 1) + ' / span ' + rowSpan;
            for (var r2 = row; r2 < row + rowSpan; r2++)
              for (var c2 = col; c2 < col + colSpan; c2++) occupied[c2 + ',' + r2] = true;
            if (row + rowSpan - 1 > maxRow) maxRow = row + rowSpan - 1;
            placed = true; break;
          }
        }
      }
    });
    return { occupied: occupied, maxRow: maxRow };
  }

  function loadImage(num) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.decoding = 'async';
      img.alt = altText(num);
      img.onload = function () { resolve({ img: img, isPortrait: img.naturalHeight > img.naturalWidth }); };
      img.onerror = function () { resolve(null); };
      img.src = src(num);
    });
  }
})();
