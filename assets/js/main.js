/* Akwaaba Guide - main.js (about 3 KB, no dependencies)
   Everything here is progressive enhancement: content is fully readable and crawlable without JS. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Today's date in the hero kicker (static text stays for crawlers) ---- */
  var today = $('[data-today]');
  if (today) {
    var d = new Date();
    today.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    today.setAttribute('datetime', d.toISOString().slice(0, 10));
  }

  /* ---- One throttled scroll handler: progress bar, header, back-to-top, parallax ---- */
  var header = $('#siteHeader');
  var bar = $('#progress');
  var toTop = $('#backToTop');
  var hero = $('[data-parallax]');
  var lastY = window.scrollY, ticking = false;

  function update() {
    var y = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (header) {
      header.classList.toggle('scrolled', y > 8);
      var menuOpen = doc.classList.contains('menu-open');
      header.classList.toggle('hide', !menuOpen && y > 420 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove('hide');
    }
    if (toTop) toTop.classList.toggle('show', y > 700);
    if (hero && !reduce && y < window.innerHeight * 1.2) hero.style.setProperty('--py', (y * 0.06).toFixed(1) + 'px');
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- Scroll reveal ---- */
  var targets = $$('.reveal, .reveal-img');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Mobile menu ---- */
  var menuBtn = $('#menuBtn');
  var menu = $('#menu');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      var use = $('use', menuBtn);
      if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
    }
    if (menu) menu.setAttribute('aria-hidden', String(!open));
    if (open && header) header.classList.remove('hide');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 992px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---- Search dialog (native <dialog>) ---- */
  var dlg = $('#searchDialog');
  var openSearch = $('#openSearch');
  if (dlg && openSearch && typeof dlg.showModal === 'function') {
    openSearch.addEventListener('click', function (e) {
      e.preventDefault();
      dlg.showModal();
      var input = $('#dialogSearch');
      if (input) input.focus();
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---- Latest guides filter ---- */
  var tabs = $$('.tab');
  var posts = $$('#postList .post');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var f = tab.getAttribute('data-filter');
      tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      posts.forEach(function (p) {
        var show = f === 'all' || p.getAttribute('data-cat') === f;
        p.classList.toggle('is-hidden', !show);
        p.classList.add('in');
        if (show) { p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
      });
    });
  });

  /* ---- Newsletter (connect "action" to your email provider) ---- */
  var form = $('#newsletterForm');
  var msg = $('#newsMsg');
  if (form && msg) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('#newsEmail').value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      msg.className = 'form-msg ' + (ok ? 'ok' : 'err');
      msg.textContent = ok ? 'Thank you. Please check your inbox to confirm.' : 'Please enter a valid email address.';
      if (ok) form.reset();
      // TODO: POST "email" to Mailchimp / Brevo / your own API here.
    });
  }
})();
