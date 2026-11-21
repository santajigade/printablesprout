(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  // The 11 Hindi swar in the usual chart order, with a simple English sound helper for parents.
  var SWAR = [
    { l: 'अ', s: 'a' }, { l: 'आ', s: 'aa' }, { l: 'इ', s: 'i' }, { l: 'ई', s: 'ee' },
    { l: 'उ', s: 'u' }, { l: 'ऊ', s: 'oo' }, { l: 'ऋ', s: 'ri' }, { l: 'ए', s: 'e' },
    { l: 'ऐ', s: 'ai' }, { l: 'ओ', s: 'o' }, { l: 'औ', s: 'au' },
  ];
  // letters that look alike, so the match level trains careful looking
  var LOOK = { 'अ': ['आ', 'ओ', 'औ'], 'आ': ['अ', 'ओ', 'औ'], 'इ': ['ई', 'ऋ', 'उ'], 'ई': ['इ', 'ऋ', 'ऊ'], 'उ': ['ऊ', 'ऋ', 'इ'], 'ऊ': ['उ', 'ऋ', 'ई'], 'ऋ': ['उ', 'ऊ', 'इ'], 'ए': ['ऐ', 'ओ', 'अ'], 'ऐ': ['ए', 'औ', 'आ'], 'ओ': ['औ', 'अ', 'आ'], 'औ': ['ओ', 'आ', 'अ'] };
  var ROUNDS = { match: 10, sound: 10, order: SWAR.length };
  var f, done, busy = false, last = '';

  function snd(l) { for (var i = 0; i < SWAR.length; i++) if (SWAR[i].l === l) return SWAR[i].s; return ''; }

  function start() {
    done = 0; last = ''; f.progress(0, ROUNDS[f.level]);
    if (f.level === 'match') f.say('Find the letter that looks exactly the same.');
    else if (f.level === 'sound') f.say('Read the sound with a grown up, then tap its Hindi letter.');
    else f.say('Tap the swar in order, from अ to औ.');
    if (f.level === 'order') orderBoard(); else round();
  }

  function round() {
    var t; do { t = GK.pick(SWAR); } while (t.l === last); last = t.l;
    var n = f.level === 'match' ? 3 : 4;
    var opts = [t.l].concat(GK.shuffle(LOOK[t.l]).slice(0, n - 1));
    opts = GK.shuffle(opts);
    f.area.innerHTML = '';
    if (f.level === 'match') {
      f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'Find this letter' }));
      f.area.appendChild(GK.el('div', { class: 'gk-hs-big', lang: 'hi', text: t.l }));
      f.area.appendChild(GK.el('p', { class: 'gk-small', text: 'It says "' + t.s + '"' }));
    } else {
      f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'Which letter says' }));
      f.area.appendChild(GK.el('div', { class: 'gk-hs-sound', text: '"' + t.s + '"' }));
    }
    var ch = GK.el('div', { class: 'gk-choices gk-hs-choices gk-hs-n' + n });
    opts.forEach(function (o) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-hs-letter', lang: 'hi', text: o, 'aria-label': 'Hindi letter ' + snd(o) });
      b.addEventListener('click', function () { answer(b, o, t); });
      ch.appendChild(b);
    });
    f.area.appendChild(ch);
    GK.solve = function () { if (busy) return; ch.querySelectorAll('button')[opts.indexOf(t.l)].click(); };
  }

  function answer(btn, o, t) {
    if (busy) return;
    var ok = o === t.l;
    GK.flash(btn, ok);
    if (!ok) {
      GK.bad();
      f.say('That one is ' + o + ', it says "' + snd(o) + '". Look again at the little lines and curls.', 'bad');
      return;
    }
    busy = true; GK.good(btn); done++; f.progress(done, ROUNDS[f.level]);
    f.say(GK.pick(['Shabash! ', 'Very good! ', 'Yes! ']) + t.l + ' says "' + t.s + '".', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS[f.level]) end(); else round();
    }, 1000);
  }

  function orderBoard() {
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'Tap the swar in order' }));
    var line = GK.el('div', { class: 'gk-hs-line', 'aria-label': 'Swar placed so far' });
    SWAR.forEach(function () { line.appendChild(GK.el('span', { class: 'gk-hs-slot' })); });
    f.area.appendChild(line);
    var pile = GK.shuffle(SWAR);
    var grid = GK.el('div', { class: 'gk-hs-pile' });
    pile.forEach(function (s) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-hs-letter gk-hs-tile', lang: 'hi', text: s.l, 'aria-label': 'Hindi letter ' + s.s });
      b.addEventListener('click', function () {
        if (busy || b.disabled) return;
        var want = SWAR[done];
        if (s.l !== want.l) {
          GK.flash(b, false); GK.bad();
          f.say('Not yet. After ' + (done ? SWAR[done - 1].l : 'the start') + ' comes the letter that says "' + want.s + '".', 'bad');
          return;
        }
        GK.sfx.pop(); b.disabled = true; b.classList.add('gk-hs-used');
        var slot = line.children[done]; slot.textContent = s.l; slot.setAttribute('lang', 'hi'); slot.classList.add('on');
        done++; f.progress(done, ROUNDS.order);
        if (done >= SWAR.length) { busy = true; GK.good(b); f.say('All 11 swar in order!', 'good'); setTimeout(function () { busy = false; end(); }, 1000); }
        else f.say(s.l + ' says "' + s.s + '". What comes next?', 'good');
      });
      grid.appendChild(b);
    });
    f.area.appendChild(grid);
    GK.solve = function () {
      if (busy) return;
      var want = SWAR[done], bs = grid.querySelectorAll('button');
      for (var i = 0; i < pile.length; i++) if (pile[i].l === want.l) { bs[i].click(); return; }
    };
  }

  function end() {
    GK.finish(f, { title: 'Shabash!', text: f.level === 'order' ? 'You put all 11 swar in order, from अ to औ.' : 'Ten Hindi vowels found. Try the next level when you are ready.', sheet: root.dataset.sheet, onReplay: start });
  }

  f = GK.frame({ root: root, rounds: 10, levels: [{ key: 'match', label: 'Same letter' }, { key: 'sound', label: 'Sound to letter' }, { key: 'order', label: 'अ to औ in order' }], onLevel: start });
  start();
})();
