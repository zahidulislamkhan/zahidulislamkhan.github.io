/* Every page is built from assets/data.js. Pages carry <body data-page="…">
   and a #app mount; each route is guarded so nothing runs where it doesn't
   belong. Edit content in data.js — never in the markup. */
(function () {
  'use strict';
  var S = SITE, P = S.profile;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function yearOf(s) { var m = String(s).match(/(\d{4})/g); return m ? +m[m.length - 1] : 0; }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  }

  /* open a page on the entry a link pointed at */
  function gotoHash() {
    if (!location.hash) return;
    var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!t) return;
    for (var n = t; n; n = n.parentElement) {
      if (n.classList && n.classList.contains('fade-in')) n.classList.add('visible');
    }
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    t.classList.add('flash');
    setTimeout(function () { t.classList.remove('flash'); }, 2200);
  }
  function ext(u) { return u && u.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : ''; }

  function head(root, tag, title, intro) {
    var h = el('div');
    h.innerHTML = '<div class="section-tag">' + esc(tag) + '</div><h2>' + title + '</h2>' +
      (intro ? '<p class="page-intro">' + intro + '</p>' : '');
    root.appendChild(h);
    return h;
  }

  /* ── an expandable block appended to a card ───────────────────────── */
  function addExpand(card, label, build) {
    var btn = el('button', 'card-more');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<b>[+]</b>' + esc(label);
    var panel = null;
    btn.addEventListener('click', function () {
      if (panel) {
        panel.remove(); panel = null;
        btn.innerHTML = '<b>[+]</b>' + esc(label);
        btn.setAttribute('aria-expanded', 'false');
        return;
      }
      panel = el('div', 'card-detail');
      build(panel);
      card.appendChild(panel);
      btn.innerHTML = '<b>[−]</b>' + esc(label);
      btn.setAttribute('aria-expanded', 'true');
    });
    card.appendChild(btn);
  }

  /* ── bilateral timeline scaffold: entry N sits left when N is even ── */
  function entry(cls, yearLabels, card, i) {
    var row = el('div', cls.row);
    var axis = el('div', cls.axis);
    axis.innerHTML = yearLabels.map(function (y, n) {
      return '<div class="' + cls.year + '">' + esc(y) + '</div>' +
        (n === 0 ? '<div class="' + cls.dot + '"></div>' : '');
    }).join('');
    var side = el('div', i % 2 === 0 ? cls.left : cls.right);
    side.appendChild(card);
    var blank = el('div', cls.empty);
    if (i % 2 === 0) { row.appendChild(side); row.appendChild(axis); row.appendChild(blank); }
    else { row.appendChild(blank); row.appendChild(axis); row.appendChild(side); }
    return row;
  }

  var PUB = { row: 'pub-entry', axis: 'pub-entry-year', year: 'pub-entry-year-label',
              dot: 'pub-entry-dot', left: 'pub-entry-left', right: 'pub-entry-right', empty: 'pub-entry-empty' };
  var TL  = { row: 'timeline-item', axis: 'timeline-axis', year: 'timeline-axis-year',
              dot: 'timeline-axis-dot', left: 'timeline-left', right: 'timeline-right', empty: 'timeline-empty' };

  /* ── nav, lightbox, reveal ────────────────────────────────────────── */
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  [].forEach.call(document.querySelectorAll('.nav-links a'), function (a) {
    if ((a.getAttribute('href') || '').toLowerCase() === here) {
      a.classList.add('active'); a.setAttribute('aria-current', 'page');
    }
  });
  var toggle = document.getElementById('nav-toggle'), menu = document.getElementById('nav-links');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  var lb = document.getElementById('lightbox');
  window.closeLightbox = function () {
    if (!lb) return;
    lb.classList.remove('open'); document.body.style.overflow = '';
  };
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    window.closeLightbox();
    if (menu) menu.setAttribute('data-open', 'false');
  });
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.conf-card-photo img, .tv-photo, .dc-slide img');
    if (!img || !lb) return;
    e.preventDefault(); e.stopPropagation();
    var full = document.getElementById('lightbox-img');
    full.src = img.dataset.full || img.src; full.alt = img.alt || '';
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  });

  function reveal(scope) {
    var els = (scope || document).querySelectorAll('.fade-in');
    if (reduce || !('IntersectionObserver' in window)) {
      [].forEach.call(els, function (e) { e.classList.add('visible'); }); return;
    }
    var io = new IntersectionObserver(function (rows) {
      rows.forEach(function (r, i) {
        if (!r.isIntersecting) return;
        setTimeout(function () { r.target.classList.add('visible'); }, i * 70);
        io.unobserve(r.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    [].forEach.call(els, function (e) { io.observe(e); });
  }

  function onView(node, fn) {
    if (reduce || !('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (rows) {
      rows.forEach(function (r) { if (r.isIntersecting) { fn(); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(node);
  }

  /* ── routes ───────────────────────────────────────────────────────── */
  var routes = {};

  routes.home = function (root) {
    var words = P.name.split(' ');
    var last = words.pop();

    var hero = el('section', null); hero.id = 'hero';
    hero.innerHTML =
      '<div class="hero-photo-col">' +
        '<div class="hero-photo-frame"><img src="' + esc(P.photo) + '" alt="' + esc(P.name) + '" /></div>' +
        '<div class="hero-photo-caption">' + esc(P.name) + '<br>' + esc(P.location) + '</div>' +
      '</div>' +
      '<div>' +
        '<div class="hero-eyebrow">// ' + esc(P.role) + ' <span>▍</span></div>' +
        '<h1>' + words.map(esc).join('<br>') + '<br><em>' + esc(last) + '</em></h1>' +
        '<p class="hero-bio">' + esc(P.blurb) + '</p>' +
        '<div class="hero-actions">' +
          '<a href="research.html" class="btn-primary">View research →</a>' +
          '<a href="assets/cv.pdf" class="btn-ghost" target="_blank">Download CV</a>' +
        '</div>' +
      '</div>' +
      '<div class="hero-stats">' +
        S.heroStats.map(function (st) {
          var n = st.text != null
            ? '<div class="hero-stat-n" style="font-size:17px;padding-top:6px">' + esc(st.text) +
              '<span style="font-size:13px">' + esc(st.note || '') + '</span></div>'
            : '<div class="hero-stat-n">' + st.value +
              (st.suffix ? '<span>' + esc(st.suffix) + '</span>' : '') + '</div>';
          return '<div class="hero-stat">' + n +
            '<div class="hero-stat-l">' + esc(st.label) + '</div></div>';
        }).join('') +
      '</div>';
    root.appendChild(hero);

    /* recent activity — newest first, three shown */
    var feedItems = [];
    S.publications.forEach(function (p) {
      feedItems.push({ y: p.year, when: String(p.year), cat: 'Publication', tone: 'edu',
        t: p.title, s: p.journal, page: 'research.html' });
    });
    S.conferences.forEach(function (c) {
      feedItems.push({ y: yearOf(c.date), when: c.date, cat: 'Conference', tone: 'conf',
        t: c.title, s: c.venue, page: 'conferences.html' });
    });
    S.experience.forEach(function (r) {
      feedItems.push({ y: yearOf(r.date), when: r.date,
        cat: r.kind === 'edu' ? 'Education' : 'Role', tone: r.kind,
        t: r.role, s: r.org, key: r.role + ' ' + r.date, page: 'experience.html' });
    });
    S.volunteering.forEach(function (r) {
      feedItems.push({ y: yearOf(r.date), when: r.date, cat: 'Community', tone: r.kind,
        t: r.role, s: r.org, key: r.role + ' ' + r.date, page: 'volunteering.html' });
    });
    feedItems.sort(function (a, b) { return b.y - a.y; });

    var act = el('section', null); act.id = 'activity';
    head(act, 'Recent', 'Recent <em>updates</em>');
    var feed = el('div', 'feed fade-in');
    act.appendChild(feed);

    /* three at a time, until there is nothing left to show */
    var STEP = 3, shown = 0;
    var moreWrap = el('div', 'feed-more');
    var moreBtn = el('button', 'btn-ghost', 'See more');
    moreBtn.type = 'button';

    function showMore() {
      feedItems.slice(shown, shown + STEP).forEach(function (f) {
        feed.insertAdjacentHTML('beforeend',
          '<a class="feed-row" href="' + f.page + '#' + slug(f.key || f.t) + '">' +
          '<div class="feed-when">' + esc(f.when) + '</div>' +
          '<div><span class="timeline-badge ' + f.tone + ' feed-cat">' + esc(f.cat) + '</span></div>' +
          '<div><div class="feed-t">' + esc(f.t) + '</div>' +
          '<div class="feed-s">' + esc(f.s) + '</div></div>' +
          '<div class="feed-go">\u2192</div></a>');
      });
      shown = Math.min(shown + STEP, feedItems.length);
      var left = feedItems.length - shown;
      moreBtn.textContent = 'See more (' + left + ')';
      moreWrap.hidden = left === 0;
    }

    moreBtn.addEventListener('click', showMore);
    showMore();
    moreWrap.appendChild(moreBtn);
    act.appendChild(moreWrap);
    root.appendChild(act);

  };

  routes.research = function (root) {
    var sec = el('section', null); sec.id = 'research';
    head(sec, 'Research', 'Published <em>work</em>',
      'Search the titles, journals and tags, or open a paper for its keywords and DOI.');

    var pubs = S.publications.slice();
    var maxCit = Math.max.apply(null, pubs.map(function (p) { return p.cited; }));
    var years = pubs.map(function (p) { return p.year; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort().reverse();

    var bar = el('div', 'pub-filters');
    bar.innerHTML =
      '<label class="pub-search"><span>//&nbsp;Search</span>' +
      '<input id="pub-q" type="search" placeholder="quantile, Albania, machine learning…" ' +
      'aria-label="Search publications" /></label>' +
      '<select id="pub-year" aria-label="Filter by year"><option value="">All years</option>' +
      years.map(function (y) { return '<option>' + y + '</option>'; }).join('') + '</select>' +
      '<select id="pub-sort" aria-label="Sort publications">' +
      '<option value="year">Newest first</option><option value="cited">Most cited</option></select>';
    sec.appendChild(bar);

    var line = el('div', 'result-line');
    line.id = 'pub-result';
    sec.appendChild(line);

    var tl = el('div', 'pub-timeline');
    sec.appendChild(tl);
    root.appendChild(sec);

    function card(p) {
      var c = el('div', 'pub-card');
      c.id = slug(p.title);
      var body = el('div', 'pub-card-body');
      body.innerHTML =
        '<div class="pub-card-header"><div class="pub-title">' + esc(p.title) + '</div>' +
        '<span class="pub-year-badge">' + p.year + '</span></div>' +
        '<div class="pub-meta"><span class="pub-journal">' + esc(p.journal) + '</span>' +
        p.tags.map(function (t) { return '<span class="pub-tag">' + esc(t) + '</span>'; }).join('') + '</div>';
      c.appendChild(body);
      var cit = el('div', 'pub-cit');
      cit.innerHTML = '<span class="pub-cit-label">Cited by</span>' +
        '<div class="pub-cit-bar-wrap"><div class="pub-cit-bar" data-pct="' +
        Math.round((p.cited / maxCit) * 100) + '"></div></div>' +
        '<span class="pub-cit-count">' + p.cited + '</span>';
      c.appendChild(cit);
      addExpand(c, 'Details', function (box) {
        box.innerHTML = '<h5>KEYWORDS</h5><div class="pub-meta">' +
          p.tags.map(function (t) { return '<span class="pub-tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
          '<p>Published in <strong>' + esc(p.journal) + '</strong>, ' + p.year +
          '. Cited ' + p.cited + ' times according to Google Scholar.</p>' +
          '<a class="detail-link" href="' + esc(p.url) + '" target="_blank" rel="noopener">open paper ↗</a>';
      });
      return c;
    }

    function render() {
      var q = (document.getElementById('pub-q').value || '').toLowerCase().trim();
      var yr = document.getElementById('pub-year').value;
      var sort = document.getElementById('pub-sort').value;
      var rows = pubs.filter(function (p) {
        var hay = (p.title + ' ' + p.journal + ' ' + p.tags.join(' ')).toLowerCase();
        return (!q || hay.indexOf(q) !== -1) && (!yr || String(p.year) === yr);
      }).sort(function (a, b) {
        return sort === 'cited' ? b.cited - a.cited || b.year - a.year : b.year - a.year || b.cited - a.cited;
      });

      tl.textContent = '';
      tl.classList.toggle('ranked', sort === 'cited');
      if (!rows.length) {
        var none = el('div', 'empty-note', 'No publications match “' + q + '”.');
        tl.appendChild(none);
      } else {
        rows.forEach(function (p, i) { tl.appendChild(entry(PUB, [p.year], card(p), i)); });
      }

      var shown = rows.reduce(function (n, p) { return n + p.cited; }, 0);
      line.innerHTML = 'Showing <b>' + rows.length + '</b> of <b>' + pubs.length + '</b> papers' +
        '<span class="right"><b>' + shown + '</b> citations in view</span>';
      tl.querySelectorAll('.pub-cit-bar').forEach(function (b) { b.style.width = b.dataset.pct + '%'; });
    }

    ['pub-q', 'pub-year', 'pub-sort'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', render);
    });
    render();

    /* citations by year */
    var chart = el('div', 'cit-chart-wrap fade-in');
    var ys = Object.keys(S.citationsByYear);
    var max = Math.max.apply(null, ys.map(function (y) { return S.citationsByYear[y]; }));
    chart.innerHTML = '<div class="cit-chart-header">' +
      '<span class="cit-chart-title">// Citations by year</span>' +
      '<span class="cit-chart-total">' + P.stats.citations + ' total · Google Scholar</span></div>' +
      '<div class="cit-bars">' + ys.map(function (y) {
        var n = S.citationsByYear[y];
        return '<div class="cit-bar-col"><div class="cit-bar-fill" style="height:0" data-h="' +
          Math.round((n / max) * 100) + '%" title="' + n + ' citations in ' + y + '"></div>' +
          '<div class="cit-bar-year">' + y + '</div></div>';
      }).join('') + '</div>';
    sec.appendChild(chart);
    onView(chart, function () {
      chart.querySelectorAll('.cit-bar-fill').forEach(function (b) {
        b.style.transition = reduce ? 'none' : 'height 1s ease 0.3s';
        b.style.height = b.dataset.h;
      });
    });

    var tags = el('div', 'research-interests fade-in');
    tags.innerHTML = S.interests.map(function (t) {
      return '<span class="interest-tag">' + esc(t) + '</span>';
    }).join('');
    sec.appendChild(tags);
  };

  routes.conferences = function (root) {
    var sec = el('section', null); sec.id = 'conferences';
    head(sec, 'Conferences', 'Conference <em>presentations</em>',
      'Posters and talks at international meetings.');
    var tl = el('div', 'timeline fade-in');
    S.conferences.forEach(function (c, i) {
      var card = el('div', 'timeline-card conf-photo-card');
      card.id = slug(c.title);
      card.innerHTML =
        (c.poster ? '<div class="conf-card-photo"><img src="' + esc(c.poster) +
          '" alt="' + esc(c.title) + ' poster" /></div>' : '') +
        '<div class="conf-card-body"><div class="timeline-card-header"><div>' +
        '<div class="timeline-date">' + esc(c.date) + '</div>' +
        '<div class="timeline-role">' + esc(c.title) + '</div>' +
        '<div class="timeline-org">' + esc(c.venue) + '</div></div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;margin-top:4px">' +
        c.badges.map(function (b) { return '<span class="timeline-badge conf">' + esc(b) + '</span>'; }).join('') +
        '</div></div></div>';
      if (c.url) {
        addExpand(card, 'Abstract', function (box) {
          box.innerHTML = '<p>' + esc(c.venue) + '</p>' +
            '<a class="detail-link" href="' + esc(c.url) + '" target="_blank" rel="noopener">' +
            esc(c.linkText || 'Read abstract ↗') + '</a>';
        });
      }
      tl.appendChild(entry(TL, [String(yearOf(c.date))], card, i));
    });
    sec.appendChild(tl);
    root.appendChild(sec);
  };

  function logPage(root, key, tag, title, intro) {
    var sec = el('section', null); sec.id = key;
    head(sec, tag, title, intro);
    var tl = el('div', 'timeline fade-in');
    S[key].forEach(function (r, i) {
      var card = el('div', 'timeline-card');
      card.id = slug(r.role + ' ' + r.date);
      card.innerHTML =
        '<div class="timeline-card-header"><div>' +
        '<div class="timeline-date">' + esc(r.date) + '</div>' +
        '<div class="timeline-role">' + esc(r.role) + '</div>' +
        '<div class="timeline-org">' + esc(r.org) + '</div></div>' +
        '<span class="timeline-badge ' + esc(r.kind) + '">' + esc(r.badge) + '</span></div>' +
        (r.desc ? '<div class="timeline-desc">' + esc(r.desc) + '</div>' : '');
      var span = String(r.date).match(/(\d{4})/g) || [''];
      tl.appendChild(entry(TL, span.length > 1 ? [span[span.length - 1], span[0]] : [span[0]], card, i));
    });
    sec.appendChild(tl);
    root.appendChild(sec);
  }

  routes.experience = function (root) {
    logPage(root, 'experience', 'Experience', 'Background &amp; <em>education</em>',
      'Where I have studied and worked.');
  };
  routes.volunteering = function (root) {
    logPage(root, 'volunteering', 'Volunteering', 'Community &amp; <em>service</em>',
      'Volunteering and organising alongside the research.');
  };

  routes.about = function (root) {
    var sec = el('section', null); sec.id = 'about';
    head(sec, 'About', 'Bridging statistics<br>and <em>public health</em>');
    var grid = el('div', 'about-grid');
    var leftCol = el('div', 'fade-in');
    S.about.forEach(function (p) { leftCol.appendChild(el('p', null, p)); });
    var rightCol = el('div', 'fade-in');
    var sk = el('div', 'skills-grid');
    sk.innerHTML = S.skills.map(function (g) {
      return g.items.map(function (i) {
        return '<div class="skill-item"><div class="skill-item-label">' + esc(g.group) +
          '</div><div class="skill-item-val">' + esc(i) + '</div></div>';
      }).join('');
    }).join('');
    rightCol.appendChild(sk);
    grid.appendChild(leftCol); grid.appendChild(rightCol);
    sec.appendChild(grid);
    root.appendChild(sec);
  };

  routes.contact = function (root) {
    var sec = el('section', null); sec.id = 'contact';
    var grid = el('div', 'contact-grid');
    var leftCol = el('div', 'fade-in');
    leftCol.innerHTML = '<div class="section-tag">Contact</div>' +
      '<h2>Open to <em>collaboration</em></h2>' +
      '<p>I\'m always interested in collaborative research involving statistical methodologies, ' +
      'public health, or biomedical data science. Feel free to reach out via email or find me ' +
      'on any of the platforms below.</p>' +
      '<p style="font-family:var(--mono);font-size:13px;color:var(--muted);margin-top:1.5rem">// Best reached by email</p>';
    var rightCol = el('div', 'fade-in');
    var list = el('div', 'contact-links');
    list.innerHTML = S.links.map(function (l) {
      return '<a href="' + esc(l.url) + '" class="contact-link"' + ext(l.url) + '>' +
        '<span class="contact-link-label"><span class="contact-link-dot"></span>' + esc(l.label) + '</span>' +
        '<span class="contact-link-arrow">→</span></a>';
    }).join('');
    rightCol.appendChild(list);
    grid.appendChild(leftCol); grid.appendChild(rightCol);
    sec.appendChild(grid);
    root.appendChild(sec);
  };

  var root = document.getElementById('app');
  var name = document.body.dataset.page;
  if (root && routes[name]) routes[name](root);
  reveal();
  gotoHash();
  window.addEventListener('hashchange', gotoHash);

  /* ── hero stat counters ────────────────────────────────────────────── */
  if (!reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (rows) {
      rows.forEach(function (r) {
        if (!r.isIntersecting) return;
        cio.unobserve(r.target);
        var node = r.target.firstChild, end = parseInt(node.nodeValue, 10), t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var k = Math.min((ts - t0) / 1000, 1);
          node.nodeValue = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    [].forEach.call(document.querySelectorAll('.hero-stat-n'), function (e) {
      var n = e.firstChild;
      if (n && n.nodeType === 3 && !isNaN(parseInt(n.nodeValue, 10))) cio.observe(e);
    });
  }

  /* ── drawings carousel ─────────────────────────────────────────────── */
  (function () {
    var inner = document.getElementById('dc-inner'), dots = document.getElementById('dc-dots');
    var counter = document.getElementById('dc-counter'), track = document.getElementById('dc-track');
    if (!inner || !dots || !counter || !track) return;
    var slides = inner.querySelectorAll('.dc-slide'), total = slides.length, cur = 0;
    [].forEach.call(slides, function (_, i) {
      var d = el('button'); d.type = 'button';
      d.setAttribute('aria-label', 'Drawing ' + (i + 1));
      d.style.cssText = 'width:7px;height:7px;border-radius:50%;border:0;padding:0;cursor:pointer;transition:background .2s,transform .2s;';
      d.addEventListener('click', function () { go(i); });
      dots.appendChild(d);
    });
    function paint() {
      inner.style.transform = 'translateX(-' + (cur * 100) + '%)';
      [].forEach.call(dots.children, function (d, i) {
        d.style.background = i === cur ? 'var(--purple)' : 'var(--border2)';
        d.style.transform = i === cur ? 'scale(1.3)' : 'scale(1)';
      });
      counter.textContent = (cur + 1) + ' / ' + total;
    }
    function go(n) { cur = ((n % total) + total) % total; paint(); }
    window.dcMove = function (d) { go(cur + d); };
    var sx = 0;
    track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    });
    paint();
  })();
})();
