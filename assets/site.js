/* Renders every page from assets/data.js. Each route is guarded, so a page
   only builds what its markup asks for via <body data-page="…">. */
(function () {
  'use strict';
  var S = SITE;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var P = S.profile;

  /* ── helpers ──────────────────────────────────────────────────────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function pid(i) { return '0x' + String(i).padStart(4, '0'); }
  function yearOf(s) { var m = String(s).match(/(\d{4})/g); return m ? +m[m.length - 1] : 0; }

  /* ── terminal window chrome ───────────────────────────────────────── */
  function term(o) {
    var t = el('div', 'term');
    t.appendChild(el('div', 'term-strip'));

    var bar = el('div', 'term-bar');
    bar.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>' +
      '<span class="term-title">' + o.title + '</span>' +
      '<span class="term-clock" data-clock></span>';
    t.appendChild(bar);

    if (o.meta) {
      var meta = el('div', 'term-meta');
      meta.innerHTML = '<span><b>' + esc(P.user) + '</b></span>' + o.meta +
        '<span class="path">' + esc(o.path || '~') + '</span>';
      t.appendChild(meta);
    }

    var body = el('div', 'term-body');
    t.appendChild(body);

    if (o.foot) {
      var foot = el('div', 'term-foot');
      foot.innerHTML = o.foot;
      t.appendChild(foot);
    }
    if (o.prompt !== false) {
      var pr = el('div', 'term-prompt');
      pr.innerHTML = '<span><span class="who">' + esc(P.user) + '@' + esc(P.host) + '</span>:' +
        '<span class="where">' + esc(o.path || '~') + '</span>$ ' + (o.hint || '') + '</span>' +
        '<span class="cursor"></span>';
      t.appendChild(pr);
    }
    t.bodyEl = body;
    return t;
  }

  function table(cols) {
    var wrap = el('div', 'tbl-wrap');
    var tb = el('table', 'tbl');
    tb.innerHTML = '<thead><tr>' + cols.map(function (c) {
      return '<th' + (c.num ? ' class="num"' : '') + '>' + esc(c.label) + '</th>';
    }).join('') + '</tr></thead><tbody></tbody>';
    wrap.appendChild(tb);
    wrap.body = tb.querySelector('tbody');
    return wrap;
  }

  /* one expandable row: `make` returns the <tr>, detail is built lazily */
  function expandable(tr, span, buildDetail) {
    var btn = el('button', 'expand', '[+]');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    var cell = el('td', 'num');
    cell.appendChild(btn);
    tr.appendChild(cell);

    var detail = null;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      if (open) {
        detail.remove(); detail = null;
        btn.textContent = '[+]'; btn.setAttribute('aria-expanded', 'false');
        tr.classList.remove('open');
        return;
      }
      detail = el('tr', 'detail');
      var td = el('td');
      td.colSpan = span;
      var inner = el('div', 'detail-in');
      buildDetail(inner);
      td.appendChild(inner);
      detail.appendChild(td);
      tr.parentNode.insertBefore(detail, tr.nextSibling);
      btn.textContent = '[-]'; btn.setAttribute('aria-expanded', 'true');
      tr.classList.add('open');
    });
  }

  function chips(list, tone) {
    var c = el('div', 'chips');
    list.forEach(function (x) { c.appendChild(el('span', 'chip ' + tone, x)); });
    return c;
  }

  function section(h, title, subtitle) {
    var head = el('div', 'phead');
    head.innerHTML = '<h1><span class="sig">$</span>' + title + '</h1>' +
      (subtitle ? '<p>' + subtitle + '</p>' : '');
    h.appendChild(head);
  }

  /* ── nav, clock, lightbox ─────────────────────────────────────────── */
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  [].forEach.call(document.querySelectorAll('.nav-links a'), function (a) {
    if ((a.getAttribute('href') || '').toLowerCase() === here) {
      a.classList.add('active'); a.setAttribute('aria-current', 'page');
    }
  });

  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-links');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  function tickClocks() {
    var now = new Date();
    var s = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(function (n) { return String(n).padStart(2, '0'); }).join(':');
    [].forEach.call(document.querySelectorAll('[data-clock]'), function (c) { c.textContent = s; });
  }

  var lb = document.getElementById('lightbox');
  window.closeLightbox = function () {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { window.closeLightbox(); if (menu) menu.setAttribute('data-open', 'false'); }
  });
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.poster, .tv-photo, .dc-slide img');
    if (!img || !lb) return;
    e.preventDefault(); e.stopPropagation();
    var full = document.getElementById('lightbox-img');
    full.src = img.dataset.full || img.src;
    full.alt = img.alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  /* ── routes ───────────────────────────────────────────────────────── */
  var routes = {};

  routes.home = function (root) {
    /* hero */
    var hero = el('div', 'hero');
    var left = el('div');
    left.innerHTML =
      '<div class="hero-line"><span class="sig">$</span>Hi there, I\'m <span class="name">' +
        esc(P.name) + '</span></div>' +
      '<div class="hero-sub"><span class="sig">$</span>' + esc(P.role) +
        ' — <b>' + esc(P.tagline) + '</b></div>';

    var cols = el('div', 'hero-cols');
    var c1 = el('div', 'hero-col');
    c1.innerHTML = '<h2>CURRENT RESEARCH</h2>' + S.current.map(function (x) {
      return '<div class="hero-entry"><div class="t">' + esc(x.title) +
        '</div><div class="n">' + esc(x.note) + '</div></div>';
    }).join('');
    var c2 = el('div', 'hero-col');
    c2.innerHTML = '<h2>EDUCATION</h2>' + S.education.map(function (x) {
      return '<div class="hero-entry"><div class="t">' + esc(x.degree) +
        '</div><div class="n">' + esc(x.org) + ' · ' + esc(x.years) + '</div></div>';
    }).join('');
    cols.appendChild(c1); cols.appendChild(c2);
    left.appendChild(cols);

    var blurb = el('div', 'hero-blurb', P.blurb);
    left.appendChild(blurb);

    var side = el('div', 'hero-side');
    side.innerHTML = '<img class="hero-photo" src="' + esc(P.photo) + '" alt="' + esc(P.name) + '" />' +
      '<div class="hero-links">' + S.links.map(function (l) {
        return '<a href="' + esc(l.url) + '"' +
          (l.url.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') + '>' +
          esc(l.label) + '</a>';
      }).join('') + '</div>';

    hero.appendChild(left); hero.appendChild(side);
    root.appendChild(hero);

    /* recent updates feed */
    var feed = [];
    S.publications.forEach(function (p) {
      feed.push({ y: p.year, when: String(p.year), cat: 'PUBLICATION', tone: 'blue',
        t: p.title, s: p.journal, url: p.url, extra: p.cited + ' citations' });
    });
    S.conferences.forEach(function (c) {
      feed.push({ y: yearOf(c.date), when: c.date, cat: 'TALK', tone: 'purple',
        t: c.title, s: c.venue, url: c.url, extra: c.badges.join(' · ') });
    });
    S.experience.concat(S.volunteering).forEach(function (r) {
      feed.push({ y: yearOf(r.date), when: r.date,
        cat: r.kind === 'edu' ? 'EDUCATION' : (r.kind === 'vol' ? 'COMMUNITY' : 'ROLE'),
        tone: r.kind === 'edu' ? 'green' : (r.kind === 'vol' ? 'orange' : 'cyan'),
        t: r.role, s: r.org, extra: r.desc });
    });
    feed.sort(function (a, b) { return b.y - a.y; });

    var t = term({
      title: 'const <b>updates</b> = new <em>Feed</em>(<i>\'all\'</i>)',
      meta: '<span>' + feed.length + ' entries</span><span>newest first</span>',
      path: '~/updates',
      hint: 'sort -r | head -' + feed.length,
      foot: '<span><b>' + S.publications.length + '</b> publications</span>' +
            '<span><b>' + P.stats.citations + '</b> citations</span>' +
            '<span class="right"><span>h-index <b>' + P.stats.hindex + '</b></span>' +
            '<span>based in <b>' + esc(P.location) + '</b></span></span>'
    });

    var tb = table([{ label: 'TIME' }, { label: 'CAT' }, { label: 'PID' },
                    { label: 'ENTRY' }, { label: 'LINK' }, { label: '', num: true }]);
    feed.forEach(function (f, i) {
      var tr = el('tr', 'row');
      tr.innerHTML =
        '<td class="when">' + esc(f.when) + '</td>' +
        '<td><span class="chip ' + f.tone + '">' + f.cat + '</span></td>' +
        '<td class="pid">' + pid(i) + '</td>' +
        '<td><div class="t">' + esc(f.t) + '</div><div class="s">' + esc(f.s) + '</div></td>' +
        '<td>' + (f.url ? '<a class="chip grey chip-link" href="' + esc(f.url) +
          '" target="_blank" rel="noopener">open ↗</a>' : '<span class="pid">—</span>') + '</td>';
      expandable(tr, 6, function (box) {
        var p = el('p', null, f.extra || '—');
        box.appendChild(p);
      });
      tb.body.appendChild(tr);
    });
    t.bodyEl.appendChild(tb);
    root.appendChild(t);
  };

  routes.research = function (root) {
    section(root, 'Published <em>work</em>',
      'Peer-reviewed publications. Filter with the grep box, or open a row for tags and the DOI.');

    var pubs = S.publications.slice();
    var maxCit = Math.max.apply(null, pubs.map(function (p) { return p.cited; }));
    var years = pubs.map(function (p) { return p.year; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort().reverse();

    var t = term({
      title: 'const <b>papers</b> = new <em>Explorer</em>(<i>\'publications\'</i>)',
      meta: '<span>' + pubs.length + ' papers</span><span>' + P.stats.citations +
            ' citations</span><span>h-index ' + P.stats.hindex + '</span>',
      path: '~/research',
      hint: 'type a term above to filter',
      foot: '<span id="pub-count">Showing <b>' + pubs.length + '</b> of <b>' + pubs.length + '</b></span>' +
            '<span class="right"><span>Latest <b>2024</b></span><span>Top cited <b>' + maxCit + '</b></span></span>'
    });

    var filters = el('div', 'filters');
    filters.innerHTML =
      '<label class="grep"><span>grep -i</span>' +
      '<input id="pub-grep" type="search" placeholder="\'quantile\' publications/*" ' +
      'aria-label="Filter publications" /></label>' +
      '<select id="pub-year" aria-label="Filter by year"><option value="">All years</option>' +
      years.map(function (y) { return '<option>' + y + '</option>'; }).join('') + '</select>' +
      '<select id="pub-sort" aria-label="Sort"><option value="cited">Sort: citations</option>' +
      '<option value="year">Sort: year</option></select>';
    t.bodyEl.appendChild(filters);

    var tb = table([{ label: 'PAPER' }, { label: 'VENUE' }, { label: 'YEAR', num: true },
                    { label: 'CITED', num: true }, { label: '', num: true }]);
    t.bodyEl.appendChild(tb);

    function render() {
      var q = (document.getElementById('pub-grep').value || '').toLowerCase().replace(/['"]/g, '');
      var yr = document.getElementById('pub-year').value;
      var sort = document.getElementById('pub-sort').value;
      var rows = pubs.filter(function (p) {
        var hay = (p.title + ' ' + p.journal + ' ' + p.tags.join(' ')).toLowerCase();
        return (!q || hay.indexOf(q) !== -1) && (!yr || String(p.year) === yr);
      }).sort(function (a, b) {
        return sort === 'year' ? b.year - a.year || b.cited - a.cited : b.cited - a.cited;
      });

      tb.body.textContent = '';
      rows.forEach(function (p) {
        var tr = el('tr', 'row');
        tr.innerHTML =
          '<td><div class="t">' + esc(p.title) + '</div></td>' +
          '<td class="s">' + esc(p.journal) + '</td>' +
          '<td class="num when">' + p.year + '</td>' +
          '<td class="num">' + p.cited + '</td>';
        expandable(tr, 5, function (box) {
          box.appendChild(chips(p.tags, 'cyan'));
          var bar = el('div', 'hist');
          bar.innerHTML = '<div class="hist-row"><span class="y">cited</span>' +
            '<span class="hist-bar"><span class="hist-fill" style="width:' +
            Math.round((p.cited / maxCit) * 100) + '%"></span></span>' +
            '<span class="n">' + p.cited + '</span></div>';
          box.appendChild(bar);
          var link = el('div', 'chips');
          link.innerHTML = '<a class="chip blue chip-link" href="' + esc(p.url) +
            '" target="_blank" rel="noopener">open paper ↗</a>';
          box.appendChild(link);
        });
        tb.body.appendChild(tr);
      });
      document.getElementById('pub-count').innerHTML =
        'Showing <b>' + rows.length + '</b> of <b>' + pubs.length + '</b>';
    }

    root.appendChild(t);
    ['pub-grep', 'pub-year', 'pub-sort'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', render);
    });
    render();

    /* citations histogram */
    var years2 = Object.keys(S.citationsByYear);
    var max = Math.max.apply(null, years2.map(function (y) { return S.citationsByYear[y]; }));
    var h = term({
      title: 'const <b>citations</b> = <em>histogram</em>(<i>\'by year\'</i>)',
      meta: '<span>' + P.stats.citations + ' total</span><span>source: Google Scholar</span>',
      path: '~/research/metrics',
      prompt: false,
      foot: '<span>h-index <b>' + P.stats.hindex + '</b></span><span>i10-index <b>' +
            P.stats.i10 + '</b></span><span class="right"><span>peak <b>' + max + '</b> in 2025</span></span>'
    });
    var pad = el('div', 'term-pad');
    var hist = el('div', 'hist');
    hist.innerHTML = years2.map(function (y) {
      var n = S.citationsByYear[y];
      return '<div class="hist-row"><span class="y">' + y + '</span>' +
        '<span class="hist-bar"><span class="hist-fill" data-w="' +
        Math.round((n / max) * 100) + '%"></span></span><span class="n">' + n + '</span></div>';
    }).join('');
    pad.appendChild(hist);
    h.bodyEl.appendChild(pad);
    root.appendChild(h);

    var fills = hist.querySelectorAll('.hist-fill');
    function grow() { [].forEach.call(fills, function (f) { f.style.width = f.dataset.w; }); }
    if (reduce || !('IntersectionObserver' in window)) { grow(); }
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { grow(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(hist);
    }
  };

  routes.conferences = function (root) {
    section(root, 'Conference <em>presentations</em>', 'Posters and talks at international meetings.');
    var t = term({
      title: 'const <b>talks</b> = new <em>Explorer</em>(<i>\'conferences\'</i>)',
      meta: '<span>' + S.conferences.length + ' presentations</span>',
      path: '~/conferences',
      hint: 'ls -la ./talks',
      foot: '<span><b>' + S.conferences.length + '</b> total</span><span class="right"><span>latest <b>2026</b></span></span>'
    });
    var tb = table([{ label: 'POSTER' }, { label: 'WHEN' }, { label: 'PRESENTATION' },
                    { label: 'ROLE' }, { label: '', num: true }]);
    S.conferences.forEach(function (c) {
      var tr = el('tr', 'row');
      tr.innerHTML =
        '<td>' + (c.poster ? '<img class="poster" src="' + esc(c.poster) + '" alt="Poster" />'
                           : '<span class="pid">—</span>') + '</td>' +
        '<td class="when">' + esc(c.date) + '</td>' +
        '<td><div class="t">' + esc(c.title) + '</div><div class="s">' + esc(c.venue) + '</div></td>' +
        '<td>' + c.badges.map(function (b) {
          return '<span class="chip purple">' + esc(b) + '</span>';
        }).join(' ') + '</td>';
      expandable(tr, 5, function (box) {
        var p = el('p', null, c.venue);
        box.appendChild(p);
        if (c.url) {
          var link = el('div', 'chips');
          link.innerHTML = '<a class="chip blue chip-link" href="' + esc(c.url) +
            '" target="_blank" rel="noopener">abstract ↗</a>';
          box.appendChild(link);
        }
      });
      tb.body.appendChild(tr);
    });
    t.bodyEl.appendChild(tb);
    root.appendChild(t);
  };

  function rowsPage(root, key, title, sub, termTitle, path) {
    section(root, title, sub);
    var rows = S[key];
    var TONE = { edu: 'green', work: 'cyan', vol: 'orange', conf: 'purple' };
    var t = term({
      title: termTitle,
      meta: '<span>' + rows.length + ' entries</span>',
      path: path,
      hint: 'cat ./' + key + '.log',
      foot: '<span><b>' + rows.length + '</b> entries</span>'
    });
    var tb = table([{ label: 'WHEN' }, { label: 'WHAT' }, { label: 'KIND' }, { label: '', num: true }]);
    rows.forEach(function (r) {
      var tr = el('tr', 'row');
      tr.innerHTML =
        '<td class="when">' + esc(r.date) + '</td>' +
        '<td><div class="t">' + esc(r.role) + '</div><div class="s">' + esc(r.org) + '</div></td>' +
        '<td><span class="chip ' + (TONE[r.kind] || 'grey') + '">' + esc(r.badge) + '</span></td>';
      expandable(tr, 4, function (box) {
        box.appendChild(el('p', null, r.desc || '—'));
      });
      tb.body.appendChild(tr);
    });
    t.bodyEl.appendChild(tb);
    root.appendChild(t);
  }

  routes.experience = function (root) {
    rowsPage(root, 'experience', 'Background &amp; <em>education</em>',
      'Where I have studied and worked.',
      'const <b>history</b> = new <em>Log</em>(<i>\'experience\'</i>)', '~/experience');
  };

  routes.volunteering = function (root) {
    rowsPage(root, 'volunteering', 'Community &amp; <em>service</em>',
      'Volunteering and organising alongside the research.',
      'const <b>service</b> = new <em>Log</em>(<i>\'community\'</i>)', '~/community');
  };

  routes.about = function (root) {
    section(root, 'Bridging statistics and <em>public health</em>');
    var t = term({
      title: 'cat <b>about.md</b>',
      meta: '<span>' + S.about.length + ' paragraphs</span>',
      path: '~/about',
      hint: 'wc -w about.md',
      prompt: true
    });
    var pad = el('div', 'term-pad prose');
    S.about.forEach(function (p) { pad.appendChild(el('p', null, p)); });
    t.bodyEl.appendChild(pad);
    root.appendChild(t);

    var sk = term({
      title: 'ls <b>~/skills</b>',
      meta: '<span>' + S.skills.reduce(function (n, g) { return n + g.items.length; }, 0) + ' entries</span>',
      path: '~/skills',
      prompt: false
    });
    var pad2 = el('div', 'term-pad');
    var grid = el('div', 'skills');
    grid.innerHTML = S.skills.map(function (g) {
      return '<div class="skill-group"><h4>' + esc(g.group.toUpperCase()) + '</h4><ul>' +
        g.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    pad2.appendChild(grid);
    sk.bodyEl.appendChild(pad2);
    root.appendChild(sk);
  };

  routes.contact = function (root) {
    section(root, 'Open to <em>collaboration</em>',
      'Interested in work involving statistical methodology, public health or biomedical data science. Best reached by email.');
    var t = term({
      title: 'const <b>contact</b> = new <em>Map</em>(<i>\'links\'</i>)',
      meta: '<span>' + S.links.length + ' entries</span>',
      path: '~/contact',
      hint: 'mail -s "hello" ' + P.user,
      foot: '<span class="right"><span>based in <b>' + esc(P.location) + '</b></span></span>'
    });
    var tb = table([{ label: 'WHERE' }, { label: 'HANDLE' }, { label: '', num: true }]);
    S.links.forEach(function (l) {
      var tr = el('tr', 'row');
      var external = l.url.indexOf('http') === 0;
      tr.innerHTML = '<td class="t">' + esc(l.label) + '</td>' +
        '<td class="s">' + esc(l.hint) + '</td>' +
        '<td class="num"><a class="chip blue chip-link" href="' + esc(l.url) + '"' +
        (external ? ' target="_blank" rel="noopener"' : '') + '>open ↗</a></td>';
      tb.body.appendChild(tr);
    });
    t.bodyEl.appendChild(tb);
    root.appendChild(t);
  };

  /* pages whose content lives in the HTML just get the chrome + clock */
  routes.static = function () {};

  var root = document.getElementById('app');
  var name = document.body.dataset.page;
  if (root && routes[name]) routes[name](root);

  tickClocks();
  setInterval(tickClocks, 1000);

  /* drawings carousel (interests page) */
  (function () {
    var inner = document.getElementById('dc-inner');
    var dots = document.getElementById('dc-dots');
    var counter = document.getElementById('dc-counter');
    var track = document.getElementById('dc-track');
    if (!inner || !dots || !counter || !track) return;
    var slides = inner.querySelectorAll('.dc-slide'), total = slides.length, cur = 0;
    [].forEach.call(slides, function (_, i) {
      var d = el('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Drawing ' + (i + 1));
      d.style.cssText = 'width:7px;height:7px;border-radius:50%;border:0;padding:0;cursor:pointer;transition:background .2s,transform .2s;';
      d.addEventListener('click', function () { go(i); });
      dots.appendChild(d);
    });
    function paint() {
      inner.style.transform = 'translateX(-' + (cur * 100) + '%)';
      [].forEach.call(dots.children, function (d, i) {
        d.style.background = i === cur ? 'var(--blue)' : 'var(--line2)';
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
