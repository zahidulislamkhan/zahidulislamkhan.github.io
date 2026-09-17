/* ─────────────────────────────────────────────────────────────────────────
   TRAVEL CONTENT — the only file to edit for this page.

     { kind: 'youtube',   id:  'ljg-6V2Md0E' }
     { kind: 'instagram', url: 'https://www.instagram.com/<user>/reel/<code>/' }
     { kind: 'facebook',  url: 'https://www.facebook.com/<page>/videos/<id>/' }
     { kind: 'photo',     src: 'assets/travel/<file>.jpg' }

   Optional on any entry: title, place, date, poster.
   YouTube pulls its own thumbnail from the id. Instagram and Facebook do not
   expose one without an API key, so give those a `poster` once you have an
   image — until then they show a neutral placeholder and still play on click.
   ──────────────────────────────────────────────────────────────────────── */

var TRAVEL = [
  { kind: 'instagram', url: 'https://www.instagram.com/zahidul._.islam._.khan/reel/Da42LPyK5eU/' },
  { kind: 'youtube',   id: 'ljg-6V2Md0E' },
  { kind: 'instagram', url: 'https://www.instagram.com/zahidul._.islam._.khan/reel/DcoNOvYq8Rv/' },
  { kind: 'youtube',   id: 'IzsB5SJQOEE' }
];

/* ── renderer ─────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var grid = document.getElementById('travel-grid');
  if (!grid) return;

  var LABEL = { youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook', photo: 'Photo' };
  var FALLBACK_TITLE = { youtube: 'YouTube short', instagram: 'Instagram reel',
                         facebook: 'Facebook video', photo: 'Photo' };

  /* a reel URL may be profile-scoped; the embed needs the canonical form */
  function igCode(url) {
    var m = String(url).match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  }

  function placeholder(label) {
    return 'data:image/svg+xml;charset=utf-8,' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">' +
      '<rect width="320" height="180" fill="%23222B37"/>' +
      '<text x="160" y="164" text-anchor="middle" fill="%2397A3B2" ' +
      'font-family="monospace" font-size="12">' + label + '</text></svg>';
  }

  function thumb(item) {
    if (item.poster) return item.poster;
    if (item.kind === 'photo') return item.src;
    if (item.kind === 'youtube') return 'https://i.ytimg.com/vi/' + item.id + '/hqdefault.jpg';
    return placeholder(LABEL[item.kind] || 'Video');
  }

  function embed(item) {
    if (item.kind === 'youtube') {
      return 'https://www.youtube-nocookie.com/embed/' + item.id + '?autoplay=1&rel=0&playsinline=1';
    }
    if (item.kind === 'instagram') {
      var code = igCode(item.url);
      return code ? 'https://www.instagram.com/reel/' + code + '/embed'
                  : item.url.replace(/\/?$/, '/') + 'embed';
    }
    if (item.kind === 'facebook') {
      return 'https://www.facebook.com/plugins/video.php?href=' +
        encodeURIComponent(item.url) + '&show_text=false&autoplay=true';
    }
    return '';
  }

  function outbound(item) {
    return item.kind === 'youtube' ? 'https://www.youtube.com/watch?v=' + item.id
                                   : (item.url || item.src);
  }

  TRAVEL.forEach(function (item) {
    var card = document.createElement('article');
    card.className = 'tv-card';

    var media = document.createElement('div');
    media.className = 'tv-media';

    var img = document.createElement('img');
    img.src = thumb(item);
    img.alt = item.title || FALLBACK_TITLE[item.kind];
    img.loading = 'lazy';
    if (item.kind === 'photo') { img.className = 'tv-photo'; img.dataset.full = item.src; }
    img.addEventListener('error', function () { img.src = placeholder(LABEL[item.kind] || 'Video'); });
    media.appendChild(img);

    var badge = document.createElement('span');
    badge.className = 'tv-badge';
    badge.textContent = LABEL[item.kind];
    media.appendChild(badge);

    if (item.kind !== 'photo') {
      var play = document.createElement('button');
      play.type = 'button';
      play.className = 'tv-play';
      play.setAttribute('aria-label', 'Play ' + (item.title || FALLBACK_TITLE[item.kind]));
      play.innerHTML = '<i></i>';
      play.addEventListener('click', function () {
        var frame = document.createElement('iframe');
        frame.src = embed(item);
        frame.title = item.title || FALLBACK_TITLE[item.kind];
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

    var t = document.createElement('div');
    t.className = 'tv-title';
    t.textContent = item.title || FALLBACK_TITLE[item.kind];
    body.appendChild(t);

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
