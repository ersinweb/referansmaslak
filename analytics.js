/* Referans Maslak – ziyaretçi ölçümü + KVKK çerez onayı
 * - Google Analytics (G-W1SLE5PTYP) sayfa başlığında yüklenir; burada sadece onay ve olay takibi var.
 * - Microsoft Clarity yalnızca ziyaretçi "Kabul et" derse yüklenir.
 * - Tıklama olayları: phone_click, email_click, directions_click, sahibinden_click, social_click, language_switch
 */
(function () {
  'use strict';

  // Clarity proje kodu (clarity.microsoft.com → Settings → Overview → Project ID). Boşsa Clarity yüklenmez.
  var CLARITY_ID = '';

  var KEY = 'rm_consent'; // 'granted' | 'denied'

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function lang() { return store('language') === 'en' ? 'en' : 'tr'; }
  function track(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); }

  /* ---------- Clarity ---------- */
  var clarityLoaded = false;
  function loadClarity() {
    if (clarityLoaded || !CLARITY_ID) return;
    clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  }

  function applyConsent(state) {
    store(KEY, state);
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: state });
    }
    if (state === 'granted') loadClarity();
  }

  /* ---------- Çerez bandı ---------- */
  var TEXT = {
    tr: {
      msg: 'Sitemizi geliştirmek için anonim ziyaret istatistikleri tutan çerezler kullanıyoruz. Kişisel bilgilerinizi toplamıyoruz.',
      yes: 'Kabul et', no: 'Reddet', prefs: 'Çerez tercihleri'
    },
    en: {
      msg: 'We use cookies that keep anonymous visit statistics to improve our site. We do not collect your personal details.',
      yes: 'Accept', no: 'Decline', prefs: 'Cookie preferences'
    }
  };

  function injectStyles() {
    var css =
      '#rm-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:560px;margin:0 auto;' +
      'background:#fff;color:#333;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:16px 18px;' +
      'font-family:Arial,sans-serif;font-size:14px;line-height:1.45;display:flex;flex-wrap:wrap;align-items:center;gap:12px;box-sizing:border-box}' +
      '#rm-consent p{margin:0;flex:1 1 260px}' +
      '#rm-consent .rm-btns{display:flex;gap:8px;flex:0 0 auto}' +
      '#rm-consent button{font:inherit;font-weight:bold;border-radius:6px;padding:8px 14px;cursor:pointer;border:1px solid #2c3e50;min-width:92px}' +
      '#rm-consent .rm-yes{background:#2c3e50;color:#fff}' +
      '#rm-consent .rm-no{background:transparent;color:#2c3e50}' +
      'body.dark-mode #rm-consent{background:#1e1e1e;color:#e0e0e0;box-shadow:0 6px 24px rgba(0,0,0,.6)}' +
      'body.dark-mode #rm-consent button{border-color:#3498db}' +
      'body.dark-mode #rm-consent .rm-yes{background:#3498db;color:#fff}' +
      'body.dark-mode #rm-consent .rm-no{color:#e0e0e0}' +
      '.rm-prefs-link{background:none;border:0;padding:0;margin-left:6px;color:inherit;font:inherit;text-decoration:underline;cursor:pointer}' +
      '@media (max-width:480px){#rm-consent{left:10px;right:10px;bottom:10px;padding:14px}#rm-consent .rm-btns{width:100%}#rm-consent button{flex:1}}';
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  var banner = null;
  function fillBanner() {
    if (!banner) return;
    var t = TEXT[lang()];
    banner.querySelector('p').textContent = t.msg;
    banner.querySelector('.rm-yes').textContent = t.yes;
    banner.querySelector('.rm-no').textContent = t.no;
  }

  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.id = 'rm-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = '<p></p><div class="rm-btns"><button type="button" class="rm-no"></button><button type="button" class="rm-yes"></button></div>';
    fillBanner();
    banner.querySelector('.rm-yes').addEventListener('click', function () { applyConsent('granted'); hideBanner(); });
    banner.querySelector('.rm-no').addEventListener('click', function () { applyConsent('denied'); hideBanner(); });
    document.body.appendChild(banner);
  }

  function hideBanner() { if (banner) { banner.remove(); banner = null; } }

  function addPrefsLink() {
    var host = document.querySelector('.copyright');
    if (!host) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rm-prefs-link';
    b.textContent = TEXT[lang()].prefs;
    b.addEventListener('click', showBanner);
    host.appendChild(document.createTextNode(' · '));
    host.appendChild(b);
    return b;
  }

  /* ---------- Tıklama takibi ---------- */
  function where(a) {
    if (a.closest('footer')) return 'footer';
    if (a.closest('.action-button, .action-buttons, header, .top-bar')) return 'header';
    return 'page';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var p = { link_location: where(a), page_path: location.pathname, site_language: lang() };
    if (href.indexOf('tel:') === 0) track('phone_click', p);
    else if (href.indexOf('mailto:') === 0) track('email_click', p);
    else if (/maps\.app\.goo\.gl|google\.[a-z.]+\/maps|maps\.apple\.com/.test(href)) track('directions_click', p);
    else if (href.indexOf('sahibinden.com') !== -1) track('sahibinden_click', p);
    else if (/instagram\.com|linkedin\.com/.test(href)) { p.network = /instagram/.test(href) ? 'instagram' : 'linkedin'; track('social_click', p); }
  }, true);

  /* ---------- Başlat ---------- */
  function init() {
    injectStyles();
    var prefs = addPrefsLink();

    var langToggle = document.getElementById('languageMenuToggle');
    if (langToggle) {
      langToggle.addEventListener('change', function () {
        var l = this.checked ? 'en' : 'tr';
        track('language_switch', { language: l, page_path: location.pathname });
        // sayfa kendi dilini localStorage'a yazdıktan sonra bant metnini güncelle
        setTimeout(function () { fillBanner(); if (prefs) prefs.textContent = TEXT[lang()].prefs; }, 0);
      });
    }

    var state = store(KEY);
    if (state === 'granted') loadClarity();
    else if (state !== 'denied') showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
