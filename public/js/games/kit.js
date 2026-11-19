/* PrintableSprout game kit: shared helpers for the learning games.
   Sounds are made in the browser with Web Audio (no audio files to download).
   No tracking, no network calls, nothing stored about the child. */
(function () {
  var muted = false, ac = null, master = null, verb = null;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  /* ---------- Sound engine ---------- */
  function audio() {
    if (muted) return null;
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0.55;
        // soft room echo so sounds feel warm and round
        verb = ac.createDelay(); verb.delayTime.value = 0.11;
        var fb = ac.createGain(); fb.gain.value = 0.28;
        var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
        verb.connect(lp); lp.connect(fb); fb.connect(verb); lp.connect(master);
        var comp = ac.createDynamicsCompressor();
        master.connect(comp); comp.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  // one note: bell-like with a soft overtone
  function note(freq, t, dur, o) {
    o = o || {};
    var a = audio(); if (!a) return;
    var start = a.currentTime + (t || 0), vol = o.vol || 0.22;
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + (o.attack || 0.012));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    g.connect(master); if (o.echo !== false) g.connect(verb);
    [[1, o.type || 'sine', 1], [o.over || 2, 'sine', o.overVol == null ? 0.25 : o.overVol]].forEach(function (p) {
      if (!p[2]) return;
      var osc = a.createOscillator(), og = a.createGain();
      osc.type = p[1]; osc.frequency.setValueAtTime(freq * p[0], start);
      if (o.slide) osc.frequency.exponentialRampToValueAtTime(freq * p[0] * o.slide, start + dur);
      og.gain.value = p[2]; osc.connect(og); og.connect(g);
      osc.start(start); osc.stop(start + dur + 0.05);
    });
  }
  function noise(t, dur, o) {
    o = o || {};
    var a = audio(); if (!a) return;
    var len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = a.createBufferSource(); src.buffer = buf;
    var f = a.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.Q.value = o.q || 1.2;
    var s = a.currentTime + (t || 0);
    f.frequency.setValueAtTime(o.from || 800, s); f.frequency.exponentialRampToValueAtTime(o.to || 3000, s + dur);
    var g = a.createGain(); g.gain.setValueAtTime(o.vol || 0.18, s); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(s);
  }

  var SFX = {
    tap: function () { note(1200, 0, 0.07, { vol: 0.08, overVol: 0, echo: false, slide: 0.7 }); },
    pop: function () { note(520, 0, 0.12, { vol: 0.16, slide: 2.2, overVol: 0 }); },
    good: function () { // bright two-note chime with sparkle
      note(784, 0, 0.35, { vol: 0.2, over: 3, overVol: 0.12 });
      note(1175, 0.09, 0.5, { vol: 0.2, over: 3, overVol: 0.12 });
      note(2349, 0.18, 0.25, { vol: 0.05, overVol: 0 });
    },
    bad: function () { // gentle "hmm", never harsh
      note(392, 0, 0.16, { vol: 0.13, type: 'triangle', overVol: 0 });
      note(330, 0.13, 0.26, { vol: 0.12, type: 'triangle', overVol: 0 });
    },
    win: function () { // happy fanfare and sparkles
      [523, 659, 784, 1047].forEach(function (f, i) { note(f, i * 0.11, 0.4, { vol: 0.2, over: 2, overVol: 0.2 }); });
      note(784, 0.5, 0.7, { vol: 0.16 }); note(1047, 0.5, 0.9, { vol: 0.18 }); note(1319, 0.5, 0.9, { vol: 0.14 });
      for (var i = 0; i < 7; i++) note(1800 + Math.random() * 1600, 0.65 + i * 0.07, 0.18, { vol: 0.05, overVol: 0 });
    },
    flip: function () { noise(0, 0.12, { from: 900, to: 3500, vol: 0.12 }); },
    match: function () { note(659, 0, 0.3, { vol: 0.18 }); note(988, 0.07, 0.45, { vol: 0.18 }); },
    coin: function () { // metal clink
      note(1568, 0, 0.25, { vol: 0.13, over: 2.76, overVol: 0.4, echo: false });
      note(2093, 0.05, 0.3, { vol: 0.1, over: 2.76, overVol: 0.3 });
    },
    note: function () { noise(0, 0.18, { from: 2000, to: 600, vol: 0.12, filter: 'highpass' }); },
    vroom: function () { note(110, 0, 0.45, { vol: 0.12, type: 'sawtooth', overVol: 0, slide: 2.4, echo: false }); },
    scratch: function () { noise(0, 0.05, { from: 1500, to: 2500, vol: 0.025, q: 0.8 }); },
    count: function (n) { // rising pitch as a child taps each picture
      note(392 * Math.pow(2, Math.min(n, 24) / 12), 0, 0.2, { vol: 0.14, overVol: 0.15 });
    },
  };

  /* ---------- Confetti ---------- */
  function confetti(host) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = el('canvas', { class: 'gk-confetti', 'aria-hidden': 'true' });
    host.appendChild(c);
    var w = c.width = host.clientWidth, h = c.height = host.clientHeight, x = c.getContext('2d');
    var colors = ['#c2541b', '#f2a541', '#7bb661', '#2f5d8a', '#d62976', '#f2c14e'];
    var bits = [];
    for (var i = 0; i < 90; i++) bits.push({ x: w / 2 + (Math.random() - .5) * 80, y: h * .45, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6, s: (Math.random() - .5) * .3, c: colors[i % colors.length] });
    var t0 = performance.now();
    (function frame(t) {
      x.clearRect(0, 0, w, h);
      bits.forEach(function (b) { b.vy += .32; b.x += b.vx; b.y += b.vy; b.a += b.s; x.save(); x.translate(b.x, b.y); x.rotate(b.a); x.fillStyle = b.c; x.fillRect(-b.r / 2, -b.r / 4, b.r, b.r / 2); x.restore(); });
      if (t - t0 < 2200) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }

  /* Floating star that rises from a button on a right answer */
  function burst(from) {
    if (!from || !from.getBoundingClientRect) return;
    var r = from.getBoundingClientRect();
    var s = el('span', { class: 'gk-float', 'aria-hidden': 'true', text: '⭐' });
    s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top) + 'px';
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 900);
  }

  var GK = {
    el: el, sfx: SFX, confetti: confetti, burst: burst,
    rand: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    pick: function (a) { return a[Math.floor(Math.random() * a.length)]; },
    good: function (btn) { SFX.good(); burst(btn); },
    bad: function () { SFX.bad(); },
    win: function () { SFX.win(); },

    /* Shared frame. opts: { root, levels:[{key,label}], level, rounds, onLevel(key) } */
    frame: function (opts) {
      var root = opts.root; root.innerHTML = ''; root.style.position = 'relative';
      var bar = el('div', { class: 'gk-bar' });
      var seg = el('div', { class: 'gk-levels', role: 'group', 'aria-label': 'Choose a level' });
      var api = { level: opts.level || opts.levels[0].key };
      opts.levels.forEach(function (l) {
        var b = el('button', { type: 'button', class: 'gk-lv' + (l.key === api.level ? ' on' : ''), 'aria-pressed': l.key === api.level ? 'true' : 'false', text: l.label });
        b.addEventListener('click', function () {
          SFX.pop();
          api.level = l.key;
          seg.querySelectorAll('.gk-lv').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
          opts.onLevel(l.key);
        });
        seg.appendChild(b);
      });
      var snd = el('button', { type: 'button', class: 'gk-snd', 'aria-pressed': 'false', text: '🔊 Sound on' });
      snd.addEventListener('click', function () {
        muted = !muted;
        snd.textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
        snd.setAttribute('aria-pressed', muted ? 'true' : 'false');
        if (!muted) SFX.pop();
      });
      bar.appendChild(seg); bar.appendChild(snd);
      var prog = el('div', { class: 'gk-prog', 'aria-hidden': 'true' });
      var area = el('div', { class: 'gk-area' });
      var msg = el('p', { class: 'gk-msg', role: 'status', 'aria-live': 'polite' });
      root.appendChild(bar); root.appendChild(prog); root.appendChild(area); root.appendChild(msg);
      api.root = root; api.area = area;
      api.say = function (t, kind) { msg.textContent = t || ''; msg.className = 'gk-msg' + (kind ? ' ' + kind : ''); if (kind) { msg.classList.add('bounce'); } };
      api.progress = function (done, total) {
        total = total == null ? opts.rounds : total; prog.innerHTML = '';
        for (var i = 0; i < total; i++) prog.appendChild(el('span', { class: 'gk-dot' + (i < done ? ' on' : '') + (i === done - 1 ? ' new' : '') }));
      };
      return api;
    },

    /* End screen inside the game area */
    finish: function (f, o) {
      GK.win(); confetti(f.root);
      f.say(''); f.progress(0, 0);
      f.area.innerHTML = '';
      var again = el('button', { type: 'button', class: 'gk-big', text: o.again || 'Play again' });
      again.addEventListener('click', function () { SFX.pop(); o.onReplay(); });
      f.area.appendChild(el('div', { class: 'gk-end' }, [
        el('div', { class: 'gk-stars', 'aria-hidden': 'true' }, [el('span', { text: '⭐' }), el('span', { text: '⭐' }), el('span', { text: '⭐' })]),
        el('h2', { text: o.title || 'Great job!' }),
        el('p', { text: o.text || '' }),
        again,
        o.sheet ? el('a', { class: 'gk-sheetlink', href: o.sheet, text: '🖨️ Print the matching worksheet' }) : null,
      ]));
      again.focus({ preventScroll: true });
    },

    flash: function (btn, ok) {
      btn.classList.remove('gk-ok', 'gk-no'); void btn.offsetWidth;
      btn.classList.add(ok ? 'gk-ok' : 'gk-no');
    },
  };
  window.GK = GK;
})();
