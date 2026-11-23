(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 5, C = 40, NS = 'http://www.w3.org/2000/svg';
  var LV = { small: { n: 5, key: false }, medium: { n: 7, key: false }, big: { n: 9, key: true } };
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], DN = ['up', 'right', 'down', 'left'];
  var bumpMsg = false, f, done, n, open, pos, goal, key, hasKey, seen, svg, me, busy = false, moves, bumps, keyNode, goalNode, trail;

  function idx(x, y) { return y * n + x; }
  function build() { // random depth first maze: every cell reachable, one path between any two cells
    open = []; for (var i = 0; i < n * n; i++) open.push([false, false, false, false]);
    var vis = {}, stack = [[0, 0]]; vis[0] = true;
    while (stack.length) {
      var c = stack[stack.length - 1], opts = [];
      for (var d = 0; d < 4; d++) { var x = c[0] + DX[d], y = c[1] + DY[d]; if (x >= 0 && y >= 0 && x < n && y < n && !vis[idx(x, y)]) opts.push(d); }
      if (!opts.length) { stack.pop(); continue; }
      var dd = GK.pick(opts), nx = c[0] + DX[dd], ny = c[1] + DY[dd];
      open[idx(c[0], c[1])][dd] = true; open[idx(nx, ny)][(dd + 2) % 4] = true;
      vis[idx(nx, ny)] = true; stack.push([nx, ny]);
    }
  }
  function path(a, b) { // shortest list of directions from a to b
    var prev = {}, q = [a], s = idx(a[0], a[1]); prev[s] = -1;
    while (q.length) {
      var c = q.shift(); if (c[0] === b[0] && c[1] === b[1]) break;
      for (var d = 0; d < 4; d++) if (open[idx(c[0], c[1])][d]) { var x = c[0] + DX[d], y = c[1] + DY[d], k = idx(x, y); if (!(k in prev)) { prev[k] = [idx(c[0], c[1]), d]; q.push([x, y]); } }
    }
    var out = [], k = idx(b[0], b[1]);
    while (prev[k] !== -1 && prev[k] !== undefined) { out.unshift(prev[k][1]); k = prev[k][0]; }
    return out;
  }
  function cellsOn(a, dirs) { var x = a[0], y = a[1], o = {}; o[idx(x, y)] = 1; dirs.forEach(function (d) { x += DX[d]; y += DY[d]; o[idx(x, y)] = 1; }); return o; }

  function S(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function emoji(t, x, y) { var e = S('text', { x: x * C + C / 2, y: y * C + C / 2 + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': C * 0.7 }); e.textContent = t; return e; }

  function start() { done = 0; f.progress(0); round(); }

  function round() {
    var L = LV[f.level]; n = L.n; build();
    pos = [0, 0]; goal = [n - 1, n - 1]; hasKey = !L.key; key = null; moves = 0; bumps = 0; seen = {}; seen[0] = 1;
    if (L.key) { // key in a dead end that is off the main path
      var main = cellsOn(pos, path(pos, goal)), best = [], far = 0;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
        var o = open[idx(x, y)].filter(Boolean).length; if (o !== 1 || main[idx(x, y)]) continue;
        var dist = path([0, 0], [x, y]).length;
        if (dist > far + 2) { far = dist; best = [[x, y]]; } else if (dist >= far - 2) best.push([x, y]);
      }
      key = best.length ? GK.pick(best) : [n - 1, 0];
    }
    draw();
    f.say(L.key ? 'Find the key first. The door at the end is locked!' : 'Help the turtle reach the strawberry. Use the arrows.');
    GK.sfx.flip();
    GK.solve = function () {
      if (busy) return;
      var target = hasKey ? goal : key;
      path(pos, target).forEach(function (d) { if (!busy) step(d); });
    };
  }

  function draw() {
    f.area.innerHTML = '';
    var W = n * C;
    svg = S('svg', { viewBox: '-4 -4 ' + (W + 8) + ' ' + (W + 8), class: 'gk-mz-svg', role: 'img', 'aria-label': 'Maze, ' + n + ' by ' + n });
    svg.appendChild(S('rect', { x: 0, y: 0, width: W, height: W, fill: '#fffaf2' }));
    trail = S('g', {}); svg.appendChild(trail);
    var walls = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var o = open[idx(x, y)], X = x * C, Y = y * C;
      if (!o[0]) walls += 'M' + X + ' ' + Y + 'h' + C;
      if (!o[3]) walls += 'M' + X + ' ' + Y + 'v' + C;
      if (x === n - 1 && !o[1]) walls += 'M' + (X + C) + ' ' + Y + 'v' + C;
      if (y === n - 1 && !o[2]) walls += 'M' + X + ' ' + (Y + C) + 'h' + C;
    }
    svg.appendChild(S('path', { d: walls, stroke: '#3b2f6b', 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }));
    goalNode = emoji(LV[f.level].key ? '🚪' : '🍓', goal[0], goal[1]); svg.appendChild(goalNode);
    keyNode = key ? emoji('🔑', key[0], key[1]) : null; if (keyNode) svg.appendChild(keyNode);
    me = emoji('🐢', 0, 0); me.setAttribute('class', 'gk-mz-me'); svg.appendChild(me);
    mark(0, 0);
    svg.addEventListener('pointerdown', tapCell);
    var wrap = GK.el('div', { class: 'gk-mz-wrap' }); wrap.appendChild(svg); f.area.appendChild(wrap);
    var pad = GK.el('div', { class: 'gk-mz-pad' });
    [['⬆️', 0, 'up'], ['⬅️', 3, 'left'], ['➡️', 1, 'right'], ['⬇️', 2, 'down']].forEach(function (a) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-mz-' + a[2], 'aria-label': 'Move ' + a[2], text: a[0] });
      b.addEventListener('click', function () { step(a[1]); });
      pad.appendChild(b);
    });
    f.area.appendChild(pad);
    f.area.appendChild(GK.el('p', { class: 'gk-mz-tip', text: 'Tip: tap a spot in a straight line to slide there. Arrow keys work too.' }));
  }
  function mark(x, y) { trail.appendChild(S('rect', { x: x * C + 6, y: y * C + 6, width: C - 12, height: C - 12, rx: 8, fill: hasKey && LV[f.level].key ? '#ffe9a8' : '#d8f0d2' })); }

  function tapCell(e) {
    if (busy) return;
    var r = svg.getBoundingClientRect(), W = n * C + 8;
    var x = Math.floor(((e.clientX - r.left) / r.width * W - 4) / C), y = Math.floor(((e.clientY - r.top) / r.height * W - 4) / C);
    if (x < 0 || y < 0 || x >= n || y >= n) return;
    var d = -1;
    if (x === pos[0] && y !== pos[1]) d = y < pos[1] ? 0 : 2;
    else if (y === pos[1] && x !== pos[0]) d = x < pos[0] ? 3 : 1;
    if (d < 0) { if (x !== pos[0] || y !== pos[1]) f.say('Tap a spot in the same row or column as the turtle.'); return; }
    var steps = Math.abs(x - pos[0]) + Math.abs(y - pos[1]);
    for (var i = 0; i < steps && !busy; i++) if (!step(d)) break;
  }

  function step(d) {
    if (busy) return false;
    if (!open[idx(pos[0], pos[1])][d]) {
      bumps++; GK.sfx.tap(); me.classList.remove('gk-mz-bump'); void me.getBBox(); me.classList.add('gk-mz-bump');
      bumpMsg = true; f.say('Bump! There is a wall ' + (d === 0 ? 'above' : d === 2 ? 'below' : 'to the ' + DN[d]) + '. Try another way.', 'bad');
      return false;
    }
    pos = [pos[0] + DX[d], pos[1] + DY[d]]; moves++;
    me.setAttribute('x', pos[0] * C + C / 2); me.setAttribute('y', pos[1] * C + C / 2 + 1);
    var k = idx(pos[0], pos[1]);
    if (!seen[k]) { seen[k] = 1; mark(pos[0], pos[1]); }
    GK.sfx.scratch();
    if (key && !hasKey && pos[0] === key[0] && pos[1] === key[1]) {
      hasKey = true; keyNode.remove(); goalNode.textContent = '🏠'; GK.sfx.coin();
      f.say('You got the key! Now find your way to the door.', 'good');
      return true;
    }
    if (pos[0] === goal[0] && pos[1] === goal[1]) {
      if (!hasKey) { f.say('The door is locked. Go find the key!', 'bad'); GK.sfx.bad(); return true; }
      win(); return false;
    }
    if (d === 1 || d === 2) f.say('');
    return true;
  }

  function win() {
    busy = true; done++; f.progress(done); GK.good(svg);
    svg.classList.add('gk-mz-done');
    f.say('You made it in ' + moves + ' moves' + (bumps ? ' and ' + bumps + ' bumps' : ' with no bumps') + '!', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Maze master!', text: 'Five mazes done. Try drawing your own maze on paper for someone at home to solve.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1800);
  }

  document.addEventListener('keydown', function (e) {
    var m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
    if (m === undefined || !svg || !document.body.contains(svg)) return;
    var r = root.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    e.preventDefault(); step(m);
  });

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'small', label: 'Small maze' }, { key: 'medium', label: 'Medium maze' }, { key: 'big', label: 'Key maze' }], onLevel: start });
  start();
})();
