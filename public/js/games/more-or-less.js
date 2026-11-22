(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10;
  var THINGS = [['🍎', 'apples'], ['⭐', 'stars'], ['🐟', 'fish'], ['🌸', 'flowers'], ['🐞', 'ladybugs'], ['🎈', 'balloons'], ['🍓', 'strawberries'], ['🐥', 'chicks'], ['🍪', 'cookies'], ['🚗', 'cars'], ['🦋', 'butterflies'], ['🐢', 'turtles']];
  var LV = { more: { max: 5, gap: 2 }, fewer: { max: 7, gap: 1 }, mix: { max: 10, gap: 1 } };
  var f, done, ask, a, b, thing, busy = false, lastKey = '';

  function start() {
    done = 0; f.progress(0);
    f.say(f.level === 'more' ? 'Which side has more? Tap that box.' : f.level === 'fewer' ? 'Fewer means not as many. Tap the box with fewer.' : 'Look out: big pictures do not always mean more. Count them!');
    round();
  }

  function group(n, big, side) {
    var box = GK.el('button', { type: 'button', class: 'gk-mol-box' + (big ? ' gk-mol-big' : ''), 'aria-label': (side === 0 ? 'Left' : 'Right') + ' box, ' + n + ' ' + thing[1] });
    for (var i = 0; i < n; i++) box.appendChild(GK.el('span', { class: 'gk-mol-item', text: thing[0], 'aria-hidden': 'true' }));
    return box;
  }

  function round() {
    var L = LV[f.level], key;
    do {
      ask = f.level === 'more' ? 'more' : f.level === 'fewer' ? 'fewer' : GK.pick(['more', 'fewer', 'more', 'fewer', 'same']);
      a = GK.rand(1, L.max);
      if (ask === 'same') b = a;
      else { do { b = GK.rand(1, L.max); } while (Math.abs(a - b) < L.gap); }
      key = ask + a + '-' + b;
    } while (key === lastKey);
    lastKey = key;
    thing = GK.pick(THINGS);
    var right = ask === 'same' ? 'same' : (ask === 'more' ? (a > b ? 0 : 1) : (a < b ? 0 : 1));
    // on the mixed level the smaller group gets bigger pictures, so size cannot give the answer away
    var bigSide = f.level === 'mix' && a !== b ? (a < b ? 0 : 1) : -1;
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: ask === 'same' ? 'More, fewer or the same?' : 'Which has ' + ask + '?' }));
    var row = GK.el('div', { class: 'gk-mol-row' });
    var boxes = [group(a, bigSide === 0, 0), group(b, bigSide === 1, 1)];
    boxes.forEach(function (bx, i) { bx.addEventListener('click', function () { answer(bx, i, right, boxes); }); row.appendChild(bx); });
    f.area.appendChild(row);
    var same = null;
    if (f.level === 'mix') {
      same = GK.el('button', { type: 'button', class: 'gk-choice gk-mol-same', text: '🟰 Same' });
      same.addEventListener('click', function () { answer(same, 'same', right, boxes); });
      f.area.appendChild(same);
    }
    GK.sfx.flip();
    GK.solve = function () { if (busy) return; (right === 'same' ? same : boxes[right]).click(); };
  }

  function number(boxes) {
    boxes.forEach(function (bx) { var k = 0; bx.querySelectorAll('.gk-mol-item').forEach(function (s) { k++; s.classList.add('tagn'); s.setAttribute('data-n', k); }); });
  }

  function answer(btn, pick, right, boxes) {
    if (busy) return;
    if (pick !== right) {
      GK.bad(); GK.flash(btn, false);
      if (right === 'same') f.say('Count each side. Do they have the same number?', 'bad');
      else if (pick === 'same') f.say('Count again. One side has ' + (ask === 'more' ? 'more' : 'fewer') + '.', 'bad');
      else f.say(ask === 'more' ? 'Hmm. Count both boxes. Which number is bigger?' : 'Hmm. Fewer means the smaller number. Count both boxes.', 'bad');
      return;
    }
    busy = true; done++; GK.good(btn); GK.flash(btn, true); f.progress(done);
    number(boxes); GK.sfx.count(Math.max(a, b));
    var big = Math.max(a, b), small = Math.min(a, b);
    f.say(right === 'same' ? 'Yes! ' + a + ' and ' + b + ' are the same.' : 'Yes! ' + big + ' is more than ' + small + ', and ' + small + ' is fewer than ' + big + '.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'You found them all!', text: 'Ten right answers. Now find two groups of toys at home and ask: which has more?', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1700);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'more', label: 'Which has more?' }, { key: 'fewer', label: 'Which has fewer?' }, { key: 'mix', label: 'More, fewer, same' }], onLevel: start });
  start();
})();
