/* Canadian Shield — site behaviour */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqSmall = window.matchMedia('(max-width: 860px)');

  /* ---------- header shadow once scrolled ---------- */
  var hdr = document.getElementById('hdr');
  var onScroll = function () {
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile drawer ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var dclose = document.getElementById('drawer-close');
  function openDrawer() {
    drawer.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger && drawer) {
    burger.addEventListener('click', openDrawer);
    if (dclose) dclose.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  }

  /* ---------- scroll reveals ---------- */
  var revealTargets = [
    '.band-head', '.intro-grid', '.perf-grid > *', '.warr-grid', '.offer-cell',
    '.rev-title', '.rev', '.proc-copy', '.open-copy', '.open-compare',
    '.pin-media', '.pin-panel'
  ];
  var toReveal = [];
  revealTargets.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { toReveal.push(el); });
  });
  toReveal.forEach(function (el, i) {
    el.classList.add('rv');
    if (el.classList.contains('offer-cell') || el.classList.contains('rev')) {
      var sibs = Array.prototype.indexOf.call(el.parentElement.children, el);
      if (sibs === 1) el.classList.add('r1');
      if (sibs === 2) el.classList.add('r2');
    }
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    toReveal.forEach(function (el) { io.observe(el); });

    /* process: draws the spine, then steps in sequence */
    var proc = document.querySelector('.process');
    if (proc) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { proc.classList.add('in'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.2 }).observe(proc);
    }
  } else {
    toReveal.forEach(function (el) { el.classList.add('in'); });
    var p = document.querySelector('.process');
    if (p) p.classList.add('in');
  }

  /* ---------- pinned collection crossfade (windows / doors) ---------- */
  function wirePinned(section) {
    var stack  = section.querySelector('.pin-stack');
    var panels = section.querySelectorAll('.pin-panel');
    if (!stack || !panels.length) return;
    var figs = stack.querySelectorAll('figure');
    var counter = document.getElementById(panels[0].dataset.target);

    var show = function (i) {
      figs.forEach(function (f) { f.classList.toggle('on', +f.dataset.i === i); });
      if (counter) counter.textContent = '0' + (i + 1);
    };

    if ('IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) show(+e.target.dataset.i);
        });
      }, { threshold: 0.55, rootMargin: '-10% 0px -10% 0px' });
      panels.forEach(function (p) { pio.observe(p); });
    }

    /* on small screens the image is not pinned, so let taps drive it too */
    stack.addEventListener('click', function () {
      var current = 0;
      figs.forEach(function (f, i) { if (f.classList.contains('on')) current = i; });
      show((current + 1) % figs.length);
    });
  }
  document.querySelectorAll('.pin').forEach(wirePinned);

  /* ---------- hero parallax + warranty wordmark drift ---------- */
  var heroMedia = document.querySelector('.hero-media');
  var warrWord  = document.getElementById('warrword');

  function frame() {
    var vh = window.innerHeight;

    if (heroMedia) {
      var hr = heroMedia.getBoundingClientRect();
      if (hr.bottom > 0) {
        heroMedia.style.transform = 'translate3d(0,' + (-hr.top * 0.16).toFixed(2) + 'px,0)';
      }
    }
    if (warrWord) {
      var wr = warrWord.parentElement.getBoundingClientRect();
      if (wr.bottom > -200 && wr.top < vh + 200) {
        var prog = (vh - wr.top) / (vh + wr.height);
        warrWord.style.transform = 'translate3d(' + (-prog * 14).toFixed(2) + 'vw,0,0)';
      }
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) {
    setTimeout(function () {
      var img = heroMedia && heroMedia.querySelector('img');
      if (img) { img.style.animation = 'none'; img.style.transform = 'scale(1.06)'; }
      requestAnimationFrame(frame);
    }, 3000);
  }

  /* ---------- before / after ---------- */
  var ba = document.getElementById('ba');
  if (ba) {
    var drag = false;
    var set = function (x) {
      var r = ba.getBoundingClientRect();
      ba.style.setProperty('--x', Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)) + '%');
    };
    ba.addEventListener('pointerdown', function (e) {
      drag = true; ba.setPointerCapture(e.pointerId); set(e.clientX);
    });
    ba.addEventListener('pointermove', function (e) { if (drag) set(e.clientX); });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      ba.addEventListener(t, function () { drag = false; });
    });
    ba.style.setProperty('--x', '48%');
  }

  /* ---------- form ---------- */
  var form = document.querySelector('.quote-form form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = form.querySelector('button span');
      if (b) b.textContent = 'Request sent';
    });
  }
})();
