(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10;
  // simple drawn shapes, each one a color and a shape so children can see the rule
  var COLORS = [
    { k: 'red', c: '#e0473c' }, { k: 'blue', c: '#2f7fd0' }, { k: 'yellow', c: '#f2c230' },
    { k: 'green', c: '#4fa84a' }, { k: 'purple', c: '#8a4fc4' }, { k: 'orange', c: '#f08a24' },
  ];
  var SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];
  // pattern cores by level: letters stand for different pieces
  var CORES = {
    ab: ['AB', 'AB', 'AAB', 'ABB'],
    abc: ['ABC', 'AAB', 'ABB', 'AABB'],
    two: ['AB', 'ABC', 'AAB', 'ABB', 'AABB', 'ABCC'],
  };
  var f, done, busy = false;

  function shapeSvg(p, size) {
    var s = size || 60, col = p.c, path;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 60 60'); svg.setAttribute('width', s); svg.setAttribute('height', s);
    svg.setAttribute('aria-hidden', 'true');
    if (p.shape === 'circle') path = '<circle cx="30" cy="30" r="24"/>';
    else if (p.shape === 'square') path = '<rect x="8" y="8" width="44" height="44" rx="6"/>';
    else if (p.shape === 'triangle') path = '<path d="M30 5 L55 52 L5 52 Z"/>';
    else if (p.shape === 'star') path = '<path d="M30 4 L37 22 L56 23 L41 35 L46 54 L30 43 L14 54 L19 35 L4 23 L23 22 Z"/>';
    else path = '<path d="M30 54 C10 40 4 30 4 20 C4 11 11 5 19 5 C24 5 28 8 30 12 C32 8 36 5 41 5 C49 5 56 11 56 20 C56 30 50 40 30 54 Z"/>';
    svg.innerHTML = '<g fill="' + col + '" stroke="#2a2522" stroke-width="3" stroke-linejoin="round">' + path + '</g>';
    return svg;
  }
  function same(a, b) { return a.shape === b.shape && a.c === b.c; }
  function name(p) { return p.k + ' ' + p.shape; }

  function makePieces(n, level) {
    // level ab: same shape, different colors. Later levels: different shapes and colors
    var cols = GK.shuffle(COLORS).slice(0, n), shp = GK.shuffle(SHAPES).slice(0, n);
    var one = GK.pick(SHAPES);
    return cols.map(function (c, i) { return { k: c.k, c: c.c, shape: level === 'ab' ? one : shp[i] }; });
  }

  function start() { done = 0; f.progress(0); f.say('Look at the train. What comes next?'); round(); }

  function round() {
    var L = f.level, core = GK.pick(CORES[L]);
    var letters = 'ABC'.slice(0, Math.max.apply(null, core.split('').map(function (ch) { return 'ABC'.indexOf(ch) + 1; })));
    var pieces = makePieces(letters.length, L), map = {};
    letters.split('').forEach(function (ch, i) { map[ch] = pieces[i]; });
    var len = Math.max(core.length * 2 + 1, L === 'ab' ? 5 : 7);
    if (len > 9) len = 9;
    var seq = [];
    for (var i = 0; i < len; i++) seq.push(map[core[i % core.length]]);
    var missing = L === 'two' ? 2 : 1, filled = 0;
    var answers = seq.slice(len - missing);
    // choices: every piece in the pattern, plus one look-alike that is not in it
    var choices = pieces.slice();
    var extraCol = COLORS.filter(function (c) { return !pieces.some(function (p) { return p.c === c.c; }); })[0];
    choices.push({ k: extraCol.k, c: extraCol.c, shape: pieces[0].shape });
    choices = GK.shuffle(choices);

    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-q gk-pt-q', text: missing === 2 ? 'Fill the last two carriages' : 'What comes next?' }));
    var train = GK.el('div', { class: 'gk-pt-train', role: 'img', 'aria-label': 'A pattern train: ' + seq.slice(0, len - missing).map(name).join(', ') + ', then ' + missing + ' empty' });
    train.appendChild(GK.el('span', { class: 'gk-pt-engine', 'aria-hidden': 'true', text: '🚂' }));
    var slots = [];
    seq.forEach(function (p, idx) {
      var car = GK.el('span', { class: 'gk-pt-car' });
      if (idx < len - missing) car.appendChild(shapeSvg(p, 46));
      else { car.classList.add('gk-pt-empty'); car.appendChild(GK.el('span', { class: 'gk-pt-qm', text: '?' })); slots.push(car); }
      train.appendChild(car);
    });
    f.area.appendChild(train);
    var ch = GK.el('div', { class: 'gk-pt-choices' });
    choices.forEach(function (p) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-pt-btn', 'aria-label': name(p) });
      b.appendChild(shapeSvg(p, 56));
      b.addEventListener('click', function () { pick(b, p); });
      ch.appendChild(b);
    });
    f.area.appendChild(ch);

    function pick(btn, p) {
      if (busy) return;
      var want = answers[filled];
      GK.flash(btn, same(p, want));
      if (!same(p, want)) {
        GK.bad();
        f.say('Not that one. Say the pattern out loud from the start: ' + seq.slice(0, core.length).map(function (x) { return x.k; }).join(', ') + '...', 'bad');
        return;
      }
      GK.sfx.pop();
      var slot = slots[filled]; slot.innerHTML = ''; slot.classList.remove('gk-pt-empty'); slot.classList.add('gk-pt-new'); slot.appendChild(shapeSvg(p, 46));
      filled++;
      if (filled < missing) { f.say('Yes, the ' + name(p) + '. One more carriage!', 'good'); return; }
      busy = true; GK.good(btn); done++; f.progress(done);
      f.say(GK.pick(['Choo choo! ', 'You found the pattern! ', 'Right on track! ']) + 'The pattern goes ' + core.split('').map(function (x) { return map[x].k; }).join(', ') + ', and again.', 'good');
      train.classList.add('gk-pt-go');
      setTimeout(function () {
        busy = false;
        if (done >= ROUNDS) GK.finish(f, { title: 'All aboard, pattern pro!', text: 'Ten trains finished. Try a harder track next time.', sheet: root.dataset.sheet, onReplay: start });
        else round();
      }, 1100);
    }
    GK.solve = function () {
      if (busy) return;
      var want = answers[filled], btns = ch.querySelectorAll('button');
      for (var i = 0; i < choices.length; i++) if (same(choices[i], want)) { btns[i].click(); return; }
    };
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'ab', label: 'Two colors' }, { key: 'abc', label: 'Shapes and colors' }, { key: 'two', label: 'Two missing' }], onLevel: start });
  start();
})();
