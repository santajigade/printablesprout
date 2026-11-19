(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var PICS = [['🌙', 'moon'], ['⭐', 'star'], ['🐱', 'cat'], ['🐶', 'dog'], ['🍎', 'apple'], ['🌈', 'rainbow'], ['🐢', 'turtle'], ['🌻', 'sunflower'], ['🐝', 'bee'], ['🚀', 'rocket'], ['🍩', 'donut'], ['🦋', 'butterfly']];
  var COLS = { '6': 3, '12': 4, '16': 4 };
  var f, open, turns, found, pairs, lock;

  function start() {
    var n = +f.level; pairs = n / 2; open = []; turns = 0; found = 0; lock = false;
    f.progress(0, pairs);
    var deck = GK.shuffle(GK.shuffle(PICS).slice(0, pairs).reduce(function (a, p) { return a.concat([p, p]); }, []));
    f.area.innerHTML = '';
    var board = GK.el('div', { class: 'gk-board' }); board.style.gridTemplateColumns = 'repeat(' + COLS[f.level] + ', 1fr)';
    if (n === 6) board.style.maxWidth = '420px';
    deck.forEach(function (p, i) {
      var c = GK.el('button', { type: 'button', class: 'gk-card', 'aria-label': 'Card ' + (i + 1) + ', face down', text: '?' });
      c.dataset.pic = p[0]; c.dataset.name = p[1]; c.dataset.i = i + 1;
      c.addEventListener('click', function () { flip(c); });
      board.appendChild(c);
    });
    f.area.appendChild(board);
    f.say('Tap two cards to find a pair.');
  }

  function plural(w) { return /y$/.test(w) ? w.slice(0, -1) + 'ies' : /s$/.test(w) ? w + 'es' : w + 's'; }

  function show(c, up) {
    c.classList.toggle('up', up);
    c.textContent = up ? c.dataset.pic : '?';
    c.setAttribute('aria-label', 'Card ' + c.dataset.i + ', ' + (up ? c.dataset.name : 'face down'));
  }

  function flip(c) {
    if (lock || c.classList.contains('up')) return;
    GK.sfx.flip(); show(c, true); open.push(c);
    if (open.length < 2) return;
    turns++;
    var a = open[0], b = open[1]; open = [];
    if (a.dataset.pic === b.dataset.pic) {
      found++; f.progress(found, pairs);
      [a, b].forEach(function (x) { x.classList.add('done'); x.disabled = true; x.setAttribute('aria-label', 'Matched ' + x.dataset.name); });
      setTimeout(function () { GK.sfx.match(); GK.burst(b); }, 120);
      f.say(GK.pick(['A pair of ', 'You found the ', 'Match! Two ']) + plural(a.dataset.name) + '!', 'good');
      if (found === pairs) setTimeout(function () {
        GK.finish(f, { title: 'Board cleared!', text: 'You found all ' + pairs + ' pairs in ' + turns + ' turns. Can you do it in fewer?', sheet: root.dataset.sheet, onReplay: start });
      }, 900);
    } else {
      lock = true;
      setTimeout(function () { GK.sfx.tap(); show(a, false); show(b, false); lock = false; }, 950);
      f.say('Not a match. Remember where they were!');
    }
  }

  f = GK.frame({ root: root, levels: [{ key: '6', label: '6 cards' }, { key: '12', label: '12 cards' }, { key: '16', label: '16 cards' }], onLevel: start });
  start();
})();
