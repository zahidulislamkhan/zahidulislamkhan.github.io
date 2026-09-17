/* ─────────────────────────────────────────────────────────────────────────
   TRAVEL CONTENT — paste a link, that is the whole job.

     { url: 'https://youtube.com/shorts/XXXX' }
     { url: 'https://www.instagram.com/<user>/reel/XXXX/' }
     { url: 'https://www.facebook.com/<page>/videos/XXXX/' }
     { src: 'assets/travel/<file>.jpg' }                 ← a photo

   Optional on any entry: title, place, date, poster, ratio ('9/16' | '16/9').

   The platform, the video id and portrait-vs-landscape are all worked out
   from the URL. YouTube serves its own thumbnail. Instagram does not hand
   one out without an API key, so those cards load Instagram's own embed to
   get a real cover — give an entry a `poster` and it uses that instead,
   which is faster and keeps the card in this site's styling.
   ──────────────────────────────────────────────────────────────────────── */

var TRAVEL = [
  { url: 'https://www.instagram.com/zahidul._.islam._.khan/reel/Da42LPyK5eU/' },
  { url: 'https://youtube.com/shorts/ljg-6V2Md0E' },
  { url: 'https://www.instagram.com/zahidul._.islam._.khan/reel/DcoNOvYq8Rv/' },
  { url: 'https://youtube.com/shorts/IzsB5SJQOEE' }
];

/* ── renderer ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var grid = document.getElementById('travel-grid');
  if (!grid) return;

  var LABEL = { youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook', photo: 'Photo' };
  var FALLBACK = { youtube: 'YouTube video', instagram: 'Instagram reel',
                   facebook: 'Facebook video', photo: 'Photo' };

  /* everything below is derived from the link the entry carries */
  function parse(item) {
    var u = item.url || '';
    var o = { kind: 'photo', portrait: false, id: null, code: null };
    if (!item.url && item.src) return o;

    if (/youtube\.com|youtu\.be/.test(u)) {
      var m = u.match(/(?:youtu\.be\/|\/shorts\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{6,})/);
      o.kind = 'youtube';
      o.id = item.id || (m && m[1]);
      o.portrait = /\/shorts\//.test(u);
    } else if (/instagram\.com/.test(u)) {
      var c = u.match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
      o.kind = 'instagram';
      o.code = c && c[1];
      o.portrait = /\/reels?\//.test(u);
    } else if (/facebook\.com/.test(u)) {
      o.kind = 'facebook';
    }
    if (item.ratio) o.portrait = item.ratio === '9/16';
    return o;
  }

  /* the frame is 9:16 for reels and shorts, so the fallback has to match */
  function placeholder(label, portrait) {
    var w = portrait ? 180 : 320, h = portrait ? 320 : 180;
    return 'data:image/svg+xml;charset=utf-8,' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<rect width="' + w + '" height="' + h + '" fill="%23222B37"/>' +
      '<text x="' + (w / 2) + '" y="' + (h / 2 + 4) + '" text-anchor="middle" fill="%2397A3B2" ' +
      'font-family="monospace" font-size="11">' + label + '</text></svg>';
  }

  function embedSrc(item, p) {
    if (p.kind === 'youtube') {
      return 'https://www.youtube-nocookie.com/embed/' + p.id + '?autoplay=1&rel=0&playsinline=1';
    }
    if (p.kind === 'instagram') {
      return 'https://www.instagram.com/reel/' + p.code + '/embed';
    }
    if (p.kind === 'facebook') {
      return 'https://www.facebook.com/plugins/video.php?href=' +
        encodeURIComponent(item.url) + '&show_text=false&autoplay=true';
    }
    return '';
  }

  function outbound(item, p) {
    if (p.kind === 'youtube') {
      return p.portrait ? 'https://www.youtube.com/shorts/' + p.id
                        : 'https://www.youtube.com/watch?v=' + p.id;
    }
    return item.url || item.src;
  }

  function frame(src, title, scroll) {
    var f = document.createElement('iframe');
    f.src = src;
    f.title = title;
    f.loading = 'lazy';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    if (!scroll) f.setAttribute('scrolling', 'no');
    return f;
  }

  TRAVEL.forEach(function (item) {
    var p = parse(item);
    var title = item.title || FALLBACK[p.kind];

    var card = document.createElement('article');
    card.className = 'tv-card' + (p.portrait ? ' is-portrait' : '');

    var media = document.createElement('div');
    media.className = 'tv-media';

    /* Instagram hands out no thumbnail without an API key, so unless a poster
       is supplied the card shows Instagram's own embed — loaded only once it
       scrolls into view, so the page does not pay for it up front. */
    var useLiveEmbed = p.kind === 'instagram' && !item.poster;

    if (useLiveEmbed) {
      card.classList.add('is-embed');
      var mount = function () {
        media.appendChild(frame(embedSrc(item, p), title, true));
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (rows) {
          rows.forEach(function (r) { if (r.isIntersecting) { mount(); io.disconnect(); } });
        }, { rootMargin: '200px' });
        io.observe(media);
      } else { mount(); }
    } else {
      var img = document.createElement('img');
      img.alt = title;
      img.loading = 'lazy';
      if (p.kind === 'photo') {
        img.src = item.src; img.className = 'tv-photo'; img.dataset.full = item.src;
      } else if (item.poster) {
        img.src = item.poster;
      } else if (p.kind === 'youtube') {
        /* shorts have a vertical thumbnail under oardefault; fall back to hq */
        img.src = 'https://i.ytimg.com/vi/' + p.id + (p.portrait ? '/oardefault.jpg' : '/hqdefault.jpg');
        img.dataset.fallback = 'https://i.ytimg.com/vi/' + p.id + '/hqdefault.jpg';
      } else {
        img.src = placeholder(LABEL[p.kind], p.portrait);
      }
      img.addEventListener('error', function () {
        if (img.dataset.fallback) { img.src = img.dataset.fallback; delete img.dataset.fallback; return; }
        img.src = placeholder(LABEL[p.kind] || 'Video', p.portrait);
      });
      media.appendChild(img);

      if (p.kind !== 'photo') {
        var play = document.createElement('button');
        play.type = 'button';
        play.className = 'tv-play';
        play.setAttribute('aria-label', 'Play ' + title);
        play.innerHTML = '<i></i>';
        play.addEventListener('click', function () {
          media.textContent = '';
          media.appendChild(frame(embedSrc(item, p), title, false));
        });
        media.appendChild(play);
      }
    }

    var badge = document.createElement('span');
    badge.className = 'tv-badge';
    badge.textContent = LABEL[p.kind];
    media.appendChild(badge);

    var body = document.createElement('div');
    body.className = 'tv-body';

    var t = document.createElement('div');
    t.className = 'tv-title';
    t.textContent = title;
    body.appendChild(t);

    if (item.place || item.date) {
      var meta = document.createElement('div');
      meta.className = 'tv-meta';
      meta.textContent = [item.place, item.date].filter(Boolean).join(' · ');
      body.appendChild(meta);
    }

    if (p.kind !== 'photo') {
      var out = document.createElement('a');
      out.className = 'tv-out';
      out.href = outbound(item, p);
      out.target = '_blank';
      out.rel = 'noopener';
      out.textContent = 'Open on ' + LABEL[p.kind] + ' ↗';
      body.appendChild(out);
    }

    card.appendChild(media);
    card.appendChild(body);
    grid.appendChild(card);
  });
})();
