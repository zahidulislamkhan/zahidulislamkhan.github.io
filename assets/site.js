/* Shared behaviour for every page. Everything is guarded, so each block
   simply does nothing on pages that lack its markup. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Top bar: mark the current page, and the small-screen menu ─────── */
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  [].slice.call(document.querySelectorAll('.nav-links a')).forEach(function (a) {
    var target = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (target === here) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });

  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-links');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      menu.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ── Reveal on scroll ──────────────────────────────────────────────── */
  var fades = [].slice.call(document.querySelectorAll('.fade-in'));
  if (fades.length && !reduce && 'IntersectionObserver' in window) {
    var fadeIO = new IntersectionObserver(function (es) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('visible'); }, i * 80);
        fadeIO.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fades.forEach(function (el) { fadeIO.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Citation bars inside publication cards ────────────────────────── */
  var tls = [].slice.call(document.querySelectorAll('.pub-timeline'));
  if (tls.length) {
    var fill = function (root) {
      root.querySelectorAll('.pub-cit-bar').forEach(function (b) { b.style.width = b.dataset.pct + '%'; });
    };
    if ('IntersectionObserver' in window) {
      var barIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { fill(e.target); barIO.unobserve(e.target); } });
      }, { threshold: 0.2 });
      tls.forEach(function (el) { barIO.observe(el); });
    } else { tls.forEach(fill); }
  }

  /* ── Citations-by-year chart ───────────────────────────────────────── */
  var CITS = { 2021: 1, 2022: 1, 2023: 9, 2024: 21, 2025: 34, 2026: 31 };
  var chartEl = document.getElementById('cit-bars');
  if (chartEl) {
    var max = Math.max.apply(null, Object.keys(CITS).map(function (y) { return CITS[y]; }));
    Object.keys(CITS).forEach(function (year) {
      var count = CITS[year];
      var pct = Math.round((count / max) * 100);
      var col = document.createElement('div');
      col.className = 'cit-bar-col';
      col.innerHTML =
        '<div class="cit-bar-fill" style="height:' + (reduce ? pct + '%' : '0') +
        ';transition:height 1s ease 0.4s" data-h="' + pct + '%" title="' +
        count + ' citations in ' + year + '"></div>' +
        '<div class="cit-bar-year">' + year + '</div>';
      chartEl.appendChild(col);
    });
    if (!reduce && 'IntersectionObserver' in window) {
      var chartIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll('.cit-bar-fill').forEach(function (b) { b.style.height = b.dataset.h; });
          chartIO.unobserve(e.target);
        });
      }, { threshold: 0.3 });
      chartIO.observe(chartEl);
    }
  }

  /* ── Lightbox (conference posters, drawings, travel photos) ────────── */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');

  window.openLightbox = function (src, alt) {
    if (!lb) return;
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeLightbox = function () {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.closeLightbox(); });
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.conf-card-photo img, .tv-photo');
    if (!img) return;
    e.preventDefault(); e.stopPropagation();
    window.openLightbox(img.dataset.full || img.src, img.alt);
  });

  /* ── Drawings carousel ─────────────────────────────────────────────── */
  (function () {
    var inner = document.getElementById('dc-inner');
    var dotsEl = document.getElementById('dc-dots');
    var counter = document.getElementById('dc-counter');
    var track = document.getElementById('dc-track');
    if (!inner || !dotsEl || !counter || !track) return;

    var slides = inner.querySelectorAll('.dc-slide');
    var total = slides.length, cur = 0;

    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Drawing ' + (i + 1));
      d.style.cssText = 'width:7px;height:7px;border-radius:50%;cursor:pointer;border:0;padding:0;transition:background .2s,transform .2s;';
      d.addEventListener('click', function () { goTo(i); });
      dotsEl.appendChild(d);
    });

    function paint() {
      inner.style.transform = 'translateX(-' + (cur * 100) + '%)';
      dotsEl.querySelectorAll('button').forEach(function (d, i) {
        d.style.background = i === cur ? 'var(--purple)' : 'var(--border2)';
        d.style.transform = i === cur ? 'scale(1.3)' : 'scale(1)';
      });
      counter.textContent = total > 1 ? (cur + 1) + ' / ' + total : '';
    }
    function goTo(n) { cur = ((n % total) + total) % total; paint(); }
    window.dcMove = function (dir) { goTo(cur + dir); };

    var startX = 0;
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
    });
    paint();
  })();

  /* ── Home hero: live quantile regression ───────────────────────────── */
  var cv = document.getElementById('q-canvas');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d');
    var A = '27,77,228';
    var PAD = { l: 16, r: 16, t: 34, b: 30 };

    function mulberry32(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    var rnd = mulberry32(20260917), pts = [];
    for (var i = 0; i < 170; i++) {
      var x = rnd();
      var g = (rnd() + rnd() + rnd() - 1.5) / 1.5;
      var sd = 0.06 + 0.26 * x;               // spread widens with education
      pts.push({
        x: x,
        y: Math.max(0.05, Math.min(0.95, 0.24 + 0.40 * x + g * sd)),
        ph: rnd() * 6.283,
        sp: 0.5 + rnd()
      });
    }
    var TAUS = [
      { a: 0.14, b: 0.16, w: 1, o: 0.45 },
      { a: 0.24, b: 0.40, w: 2, o: 1 },
      { a: 0.34, b: 0.60, w: 1, o: 0.45 }
    ];

    var W = 0, H = 0;
    function fit() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var box = cv.getBoundingClientRect();
      if (!box.width || !box.height) return false;
      W = box.width; H = box.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }
    function X(v) { return PAD.l + v * (W - PAD.l - PAD.r); }
    function Y(v) { return H - PAD.b - v * (H - PAD.t - PAD.b); }

    function draw(t) {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.moveTo(X(0), Y(TAUS[2].a));
      ctx.lineTo(X(1), Y(TAUS[2].a + TAUS[2].b));
      ctx.lineTo(X(1), Y(TAUS[0].a + TAUS[0].b));
      ctx.lineTo(X(0), Y(TAUS[0].a));
      ctx.closePath();
      ctx.fillStyle = 'rgba(' + A + ',0.09)';
      ctx.fill();

      for (var j = 0; j < pts.length; j++) {
        var p = pts[j];
        var dy = reduce ? 0 : Math.sin(t * 0.0007 * p.sp + p.ph) * (H * 0.012);
        ctx.beginPath();
        ctx.arc(X(p.x), Y(p.y) + dy, 1.9, 0, 6.283);
        ctx.fillStyle = 'rgba(' + A + ',0.30)';
        ctx.fill();
      }
      for (var k = 0; k < TAUS.length; k++) {
        var q = TAUS[k];
        ctx.beginPath();
        ctx.moveTo(X(0), Y(q.a));
        ctx.lineTo(X(1), Y(q.a + q.b));
        ctx.strokeStyle = 'rgba(' + A + ',' + q.o + ')';
        ctx.lineWidth = q.w;
        ctx.stroke();
      }
    }

    var raf = null, live = false;
    function loop(ts) { draw(ts); raf = requestAnimationFrame(loop); }
    function play() { if (!live && !reduce) { live = true; raf = requestAnimationFrame(loop); } }
    function pause() { if (live) { cancelAnimationFrame(raf); live = false; } }

    if (fit()) draw(0);
    window.addEventListener('resize', function () { if (fit()) draw(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? play() : pause(); });
      }, { threshold: 0.05 }).observe(cv);
    } else { play(); }
  }

  /* ── Research: re-order publications with a FLIP transition ────────── */
  var tl = document.querySelector('.pub-timeline');
  var sortBtns = [].slice.call(document.querySelectorAll('.pub-sort-btn'));
  if (tl && sortBtns.length) {
    var entries = [].slice.call(tl.querySelectorAll('.pub-entry'));
    entries.forEach(function (en) {
      var c = en.querySelector('.pub-cit-count');
      var y = en.querySelector('.pub-year-badge');
      en.dataset.cited = c ? parseInt(c.textContent, 10) || 0 : 0;
      en.dataset.year = y ? parseInt(y.textContent, 10) || 0 : 0;
    });

    // slots are [side, year axis, side]; the card lives in one of the two sides
    function place(entry, onLeft) {
      var a = entry.children[0], b = entry.children[2];
      var card = entry.querySelector('.pub-card');
      if (!card) return;
      if (onLeft) {
        a.appendChild(card); b.textContent = '';
        a.className = 'pub-entry-left'; b.className = 'pub-entry-empty';
      } else {
        b.appendChild(card); a.textContent = '';
        b.className = 'pub-entry-right'; a.className = 'pub-entry-empty';
      }
    }

    sortBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.key;
        sortBtns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === btn)); });
        tl.classList.toggle('ranked', key === 'cited');

        var first = new Map();
        entries.forEach(function (en) { first.set(en, en.getBoundingClientRect().top); });
        entries.sort(function (m, n) {
          var d = Number(n.dataset[key]) - Number(m.dataset[key]);
          return d || Number(n.dataset.cited) - Number(m.dataset.cited);
        });
        entries.forEach(function (en, i) { tl.appendChild(en); place(en, i % 2 === 0); });

        if (reduce) return;
        entries.forEach(function (en) {
          var delta = first.get(en) - en.getBoundingClientRect().top;
          if (!delta) return;
          en.animate(
            [{ transform: 'translateY(' + delta + 'px)' }, { transform: 'none' }],
            { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)' }
          );
        });
      });
    });
  }

  /* ── Hero stats count up once, when first reached ──────────────────── */
  if (!reduce && 'IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (rows) {
      rows.forEach(function (row) {
        if (!row.isIntersecting) return;
        countIO.unobserve(row.target);
        var node = row.target.firstChild, end = parseInt(node.nodeValue, 10), t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var k = Math.min((ts - t0) / 1000, 1);
          node.nodeValue = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });

    [].slice.call(document.querySelectorAll('.hero-stat-n')).forEach(function (el) {
      var node = el.firstChild;
      if (node && node.nodeType === 3 && !isNaN(parseInt(node.nodeValue, 10))) countIO.observe(el);
    });
  }
})();
