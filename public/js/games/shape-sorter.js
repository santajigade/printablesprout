(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10, NS = 'http://www.w3.org/2000/svg';
  function hexPts() { var p = []; for (var k = 0; k < 6; k++) { var a = Math.PI / 3 * k; p.push((50 + 42 * Math.cos(a)).toFixed(1) + ',' + (50 + 42 * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  function starPts() { var p = []; for (var k = 0; k < 10; k++) { var r = k % 2 ? 19 : 44, a = -Math.PI / 2 + Math.PI / 5 * k; p.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (54 + r * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  var SHAPES = {
    circle: { tag: 'circle', a: { cx: 50, cy: 50, r: 40 }, spin: 0, fact: 'A circle is round. It has no sides and no corners.' },
    square: { tag: 'rect', a: { x: 15, y: 15, width: 70, height: 70 }, spin: 90, fact: 'A square has 4 sides that are all the same length, and 4 corners.' },
    triangle: { tag: 'polygon', a: { points: '50,10 91,84 9,84' }, spin: 360, fact: 'A triangle has 3 sides and 3 corners.' },
    rectangle: { tag: 'rect', a: { x: 5, y: 26, width: 90, height: 48 }, spin: 180, fact: 'A rectangle has 4 sides and 4 square corners. Two sides are long and two are short.' },
    hexagon: { tag: 'polygon', a: { points: hexPts() }, spin: 60, fact: 'A hexagon has 6 sides and 6 corners.' },
    oval: { tag: 'ellipse', a: { cx: 50, cy: 50, rx: 45, ry: 28 }, spin: 180, fact: 'An oval is round like a stretched circle. It has no corners.' },
    star: { tag: 'polygon', a: { points: starPts() }, spin: 72, fact: 'This star has 5 points.' },
    heart: { tag: 'path', a: { d: 'M50 88C20 66 6 50 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 18-14 34-44 56z' }, spin: 40, fact: 'A heart has two round bumps on top and a point at the bottom.' },
  };
  var COLORS = { red: '#e4572e', blue: '#3a7bd5', yellow: '#f6c945', green: '#5aa84a', purple: '#9b5de5', orange: '#f28c28' };
  var CNAMES = Object.keys(COLORS);
  var LEVELS = {
    four: { shapes: ['circle', 'square', 'triangle', 'rectangle'], n: 3 },
    eight: { shapes: Object.keys(SHAPES), n: 4 },
    color: { shapes: Object.keys(SHAPES), n: 6, color: true },
  };
  var f, done, last, busy = false;

  function draw(item) {
    var s = SHAPES[item.shape];
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'gk-shp-svg');
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', 'translate(50 50) rotate(' + item.rot + ') scale(' + item.size + ') translate(-50 -50)');
    var n = document.createElementNS(NS, s.tag);
    for (var k in s.a) n.setAttribute(k, s.a[k]);
    n.setAttribute('fill', COLORS[item.color]); n.setAttribute('stroke', '#2a2522'); n.setAttribute('stroke-width', 4 / item.size); n.setAttribute('stroke-linejoin', 'round');
    g.appendChild(n); svg.appendChild(g); return svg;
  }
  function make(shape, color) {
    var s = SHAPES[shape];
    var rot = s.spin === 40 ? GK.rand(-20, 20) : (s.spin ? GK.rand(0, s.spin) : 0);
    return { shape: shape, color: color || GK.pick(CNAMES), rot: rot, size: (GK.rand(62, 100) / 100) };
  }
  function label(it, useColor) { return (useColor ? it.color + ' ' : '') + it.shape; }

  function start() { done = 0; last = ''; f.progress(0); f.say(LEVELS[f.level].color ? 'Find the shape with the right color too.' : 'Read the shape name, then tap that shape.'); round(); }

  function round() {
    var L = LEVELS[f.level], target;
    do { target = make(GK.pick(L.shapes)); } while (label(target, L.color) === last);
    last = label(target, L.color);
    // a square is also a rectangle, so never show a square when the question asks for a rectangle
    var pool = L.shapes.filter(function (s) { return !(target.shape === 'rectangle' && s === 'square'); });
    var items = [target], keys = [label(target, true)], tries = 0;
    while (items.length < L.n && tries++ < 200) {
      var it;
      if (L.color) {
        var r = Math.random();
        if (r < 0.35) it = make(target.shape, GK.pick(CNAMES.filter(function (c) { return c !== target.color; })));
        else if (r < 0.7) it = make(GK.pick(pool.filter(function (s) { return s !== target.shape; })), target.color);
        else it = make(GK.pick(pool));
        if (it.shape === target.shape && it.color === target.color) continue;
        if (keys.indexOf(label(it, true)) >= 0) continue;
      } else {
        it = make(GK.pick(pool.filter(function (s) { return s !== target.shape; })));
        if (items.some(function (x) { return x.shape === it.shape; })) continue;
      }
      items.push(it); keys.push(label(it, true));
    }
    items = GK.shuffle(items);
    f.area.innerHTML = '';
    var q = GK.el('p', { class: 'gk-q' });
    q.appendChild(document.createTextNode('Tap the '));
    if (L.color) q.appendChild(GK.el('span', { class: 'gk-shp-word', style: 'color:' + COLORS[target.color], text: target.color + ' ' }));
    q.appendChild(GK.el('span', { class: 'gk-shp-word', text: target.shape }));
    var grid = GK.el('div', { class: 'gk-shp-grid gk-shp-n' + L.n });
    items.forEach(function (it) {
      var ok = it === target;
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-shp-btn', 'aria-label': label(it, true) });
      b.appendChild(draw(it));
      b.addEventListener('click', function () { answer(b, ok, it, target, L.color); });
      if (ok) GK.solve = function () { b.click(); };
      grid.appendChild(b);
    });
    f.area.appendChild(q); f.area.appendChild(grid);
  }

  function answer(btn, ok, it, target, useColor) {
    if (busy) return;
    GK.flash(btn, ok);
    if (!ok) {
      GK.bad();
      var t = it.shape === target.shape ? 'That is a ' + it.shape + ', but it is ' + it.color + '. Look for ' + target.color + '.' : 'That one is a ' + it.shape + '. Try again!';
      f.say(t, 'bad'); return;
    }
    busy = true; GK.good(btn); done++; f.progress(done);
    f.say(GK.pick(['Yes! ', 'Great eyes! ', 'You found it! ']) + SHAPES[target.shape].fact, 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Shape expert!', text: 'You found ten shapes, big and small, turned every which way.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1300);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'four', label: '4 shapes' }, { key: 'eight', label: '8 shapes' }, { key: 'color', label: 'Shapes and colors' }], onLevel: start });
  start();
})();
