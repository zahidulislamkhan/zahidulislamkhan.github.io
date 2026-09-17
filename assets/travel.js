/* ─────────────────────────────────────────────────────────────────────────
   TRAVEL CONTENT — this is the only part you edit.

   Add an entry to the TRAVEL list below. Four kinds are supported:

     { kind: 'youtube',   id:  'dQw4w9WgXcQ',                    ... }
     { kind: 'instagram', url: 'https://www.instagram.com/reel/ABC123/', poster: '...', ... }
     { kind: 'facebook',  url: 'https://www.facebook.com/<page>/videos/123456/', poster: '...', ... }
     { kind: 'photo',     src: 'assets/travel/rovaniemi.jpg',    ... }

   Every entry also takes:  title, place, date   (all optional)

   YouTube pulls its own thumbnail from the video id, so no poster is needed.
   Instagram and Facebook do not expose thumbnails without an API key, so give
   those a `poster` — any image in assets/travel/. Without one they fall back to
   a plain placeholder.

   Drop `sample: true` from an entry once it is real; it only draws the dashed
   border and the "sample" chip.
   ──────────────────────────────────────────────────────────────────────── */

var TRAVEL = [
  {
    kind: 'youtube',
    id: 'REPLACE_WITH_VIDEO_ID',
    title: 'Sample — a YouTube video',
    place: 'Replace with somewhere you went',
    date: '2026',
    sample: true
  },
  {
    kind: 'instagram',
    url: 'https://www.instagram.com/reel/REPLACE_WITH_REEL_CODE/',
    title: 'Sample — an Instagram reel',
    place: 'Poster image comes from assets/travel/',
    date: '2026',
    sample: true
  },
  {
    kind: 'photo',
    src: 'assets/photo.jpg',
    title: 'Sample — a still photo',
    place: 'Click to open it full size',
    date: '2026',
    sample: true
  }
];

/* ── renderer ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var grid = document.getElementById('travel-grid');
  if (!grid) return;

  var LABEL = { youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook', photo: 'Photo' };

  function placeholder(label) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">' +
      '<rect width="320" height="180" fill="%23F3F5FB"/>' +
      '<text x="160" y="164" text-anchor="middle" fill="%238A9099" ' +
      'font-family="monospace" font-size="12">' + label + ' — add a poster image</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + svg;
  }

  function thumb(item) {
    if (item.poster) return item.poster;
    if (item.kind === 'photo') return item.src;
    if (item.kind === 'youtube' && item.id) return 'https://i.ytimg.com/vi/' + item.id + '/hqdefault.jpg';
    return placeholder(LABEL[item.kind] || 'Video');
  }

  function embed(item) {
    if (item.kind === 'youtube') {
      return 'https://www.youtube-nocookie.com/embed/' + item.id + '?autoplay=1&rel=0';
    }
    if (item.kind === 'instagram') {
      return item.url.replace(/\/?$/, '/') + 'embed';
    }
    if (item.kind === 'facebook') {
      return 'https://www.facebook.com/plugins/video.php?href=' +
        encodeURIComponent(item.url) + '&show_text=false&autoplay=true';
    }
    return '';
  }

  function outbound(item) {
    if (item.kind === 'youtube') return 'https://www.youtube.com/watch?v=' + item.id;
    return item.url || item.src;
  }

  TRAVEL.forEach(function (item) {
    var card = document.createElement('article');
    card.className = 'tv-card' + (item.sample ? ' is-sample' : '');

    var media = document.createElement('div');
    media.className = 'tv-media';

    var img = document.createElement('img');
    img.src = thumb(item);
    img.alt = item.title || item.place || LABEL[item.kind];
    img.loading = 'lazy';
    if (item.kind === 'photo') { img.className = 'tv-photo'; img.dataset.full = item.src; }
    // a YouTube id that does not resolve should not leave a broken image
    img.addEventListener('error', function () { img.src = placeholder(LABEL[item.kind] || 'Video'); });
    media.appendChild(img);

    var badge = document.createElement('span');
    badge.className = 'tv-badge';
    badge.textContent = item.sample ? 'sample · ' + LABEL[item.kind] : LABEL[item.kind];
    media.appendChild(badge);

    if (item.kind !== 'photo') {
      var play = document.createElement('button');
      play.type = 'button';
      play.className = 'tv-play';
      play.setAttribute('aria-label', 'Play ' + (item.title || 'video'));
      play.innerHTML = '<i></i>';
      play.addEventListener('click', function () {
        var frame = document.createElement('iframe');
        frame.src = embed(item);
        frame.title = item.title || LABEL[item.kind] + ' video';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        frame.setAttribute('allowfullscreen', '');
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        media.textContent = '';
        media.appendChild(frame);
      });
      media.appendChild(play);
    }

    var body = document.createElement('div');
    body.className = 'tv-body';
    if (item.title) {
      var t = document.createElement('div');
      t.className = 'tv-title'; t.textContent = item.title;
      body.appendChild(t);
    }
    if (item.place || item.date) {
      var m = document.createElement('div');
      m.className = 'tv-meta';
      m.textContent = [item.place, item.date].filter(Boolean).join(' · ');
      body.appendChild(m);
    }
    if (item.kind !== 'photo') {
      var out = document.createElement('a');
      out.className = 'tv-out';
      out.href = outbound(item);
      out.target = '_blank';
      out.rel = 'noopener';
      out.textContent = 'Open on ' + LABEL[item.kind] + ' ↗';
      body.appendChild(out);
    }

    card.appendChild(media);
    card.appendChild(body);
    grid.appendChild(card);
  });
})();
