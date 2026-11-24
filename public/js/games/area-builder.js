(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var COLS = 10, ROWS = 8, ROUNDS = 8;
  var AREAS3 = [6, 8, 10, 12, 16, 18, 20, 24];
  var f, done, rect, task, busy = false, cells, grid, wOut, hOut, live, goalEl, dragFrom = null, last = '';

  function fits(w, h) { return w >= 1 && h >= 1 && ((w <= COLS && h <= ROWS) || (h <= COLS && w <= ROWS)); }
  function pairs(a) { var out = []; for (var w = 1; w * w <= a; w++) if (a % w === 0 && fits(w, a / w)) out.push([w, a / w]); return out; }
  function per(w, h) { return 2 * (w + h); }
  function sq(n) { return n + (n === 1 ? ' square' : ' squares'); }

  function newTask() {
    var t, key;
    do {
      if (f.level === 'area') {
        var a; do { a = GK.rand(4, 36); } while (!pairs(a).length);
        t = { kind: 'area', a: a };
      } else if (f.level === 'both') {
        var w, h; do { w = GK.rand(1, 8); h = GK.rand(1, 8); } while (w * h < 4 || w * h > 40);
        t = { kind: 'both', a: w * h, p: per(w, h) };
      } else if (f.level === 'same') {
        t = { kind: 'same', a: GK.pick(AREAS3), step: 1, first: null };
      } else {
        var P = GK.pick([12, 14, 16, 18, 20, 22, 24, 26, 28]);
        t = { kind: 'fence', p: P, goal: P <= 22 && Math.random() < .35 ? 'small' : 'big' };
      }
      key = JSON.stringify(t);
    } while (key === last);
    last = key; return t;
  }

  function goalText() {
    var t = task;
    if (t.kind === 'area') return 'Build a rectangle with an area of ' + sq(t.a) + '.';
    if (t.kind === 'both') return 'Build a rectangle with area ' + t.a + ' and perimeter ' + t.p + '.';
    if (t.kind === 'same') {
      if (t.step === 1) return 'Step 1: build any rectangle with an area of ' + sq(t.a) + '.';
      return 'Step 2: build a different rectangle, also area ' + t.a + ', with a ' + (t.dir === 'big' ? 'BIGGER' : 'SMALLER') + ' perimeter than ' + per(t.first[0], t.first[1]) + '.';
    }
    return 'You have ' + t.p + ' units of fence. Build the pen with the ' + (t.goal === 'big' ? 'BIGGEST' : 'SMALLEST') + ' area. Use all the fence.';
  }

  function start() {
    done = 0; busy = false; last = ''; f.progress(0, ROUNDS);
    f.area.innerHTML = '';
    goalEl = GK.el('p', { class: 'gk-ab-goal', 'aria-live': 'polite' });
    grid = GK.el('div', { class: 'gk-ab-grid', role: 'img' });
    cells = [];
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) { var c = GK.el('span', { class: 'gk-ab-cell' }); cells.push(c); grid.appendChild(c); }
    bindDrag();
    function stepper(label, dim) {
      var minus = GK.el('button', { type: 'button', class: 'gk-tool gk-ab-step', 'aria-label': label + ' one less', text: '−' });
      var plus = GK.el('button', { type: 'button', class: 'gk-tool gk-ab-step', 'aria-label': label + ' one more', text: '+' });
      var out = GK.el('strong', { class: 'gk-ab-num' });
      minus.addEventListener('click', function () { resize(dim, -1); });
      plus.addEventListener('click', function () { resize(dim, 1); });
      return { box: GK.el('div', { class: 'gk-ab-stepper' }, [GK.el('span', { class: 'gk-ab-lab', text: label }), minus, out, plus]), out: out };
    }
    var sw = stepper('Width', 'w'), sh = stepper('Height', 'h');
    wOut = sw.out; hOut = sh.out;
    live = GK.el('p', { class: 'gk-ab-live' });
    var check = GK.el('button', { type: 'button', class: 'gk-big gk-ab-check', text: 'Check ✓' });
    check.addEventListener('click', checkIt);
    var help = GK.el('button', { type: 'button', class: 'gk-tool', text: '💡 Hint' });
    help.addEventListener('click', hint);
    f.area.appendChild(goalEl);
    f.area.appendChild(grid);
    f.area.appendChild(GK.el('div', { class: 'gk-ab-controls' }, [sw.box, sh.box]));
    f.area.appendChild(live);
    f.area.appendChild(GK.el('div', { class: 'gk-tools' }, [check, help]));
    round();
  }

  function round() {
    task = newTask(); rect = { x: 0, y: 0, w: 1, h: 1 };
    goalEl.textContent = goalText(); draw();
    f.say(f.level === 'area' ? 'Drag on the grid or use the + and − buttons. Then press Check.' : 'Plan it first: what width and height will work?');
  }

  function draw() {
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
      var on = x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
      cells[y * COLS + x].classList.toggle('on', on);
    }
    wOut.textContent = rect.w; hOut.textContent = rect.h;
    grid.setAttribute('aria-label', 'Grid with a rectangle ' + rect.w + ' wide and ' + rect.h + ' high');
    live.textContent = f.level === 'area' ? 'Area: ' + sq(rect.w * rect.h) : 'Width ' + rect.w + ', height ' + rect.h + '. Work out the area and perimeter in your head.';
  }

  function resize(dim, d) {
    if (busy) return;
    if (dim === 'w') { var w = rect.w + d; if (w < 1 || w > COLS) { GK.sfx.tap(); return; } rect.w = w; if (rect.x + w > COLS) rect.x = COLS - w; }
    else { var h = rect.h + d; if (h < 1 || h > ROWS) { GK.sfx.tap(); return; } rect.h = h; if (rect.y + h > ROWS) rect.y = ROWS - h; }
    GK.sfx.pop(); draw();
  }

  function cellAt(e) {
    var r = grid.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / r.width * COLS), y = Math.floor((e.clientY - r.top) / r.height * ROWS);
    return { x: Math.max(0, Math.min(COLS - 1, x)), y: Math.max(0, Math.min(ROWS - 1, y)) };
  }
  function bindDrag() {
    grid.addEventListener('pointerdown', function (e) { if (busy) return; e.preventDefault(); try { grid.setPointerCapture(e.pointerId); } catch (x) {} dragFrom = cellAt(e); span(dragFrom); GK.sfx.tap(); });
    grid.addEventListener('pointermove', function (e) { if (!dragFrom) return; var c = cellAt(e); var ow = rect.w, oh = rect.h; span(c); if (ow !== rect.w || oh !== rect.h) GK.sfx.scratch(); });
    var end = function () { dragFrom = null; };
    grid.addEventListener('pointerup', end); grid.addEventListener('pointercancel', end);
  }
  function span(c) {
    rect = { x: Math.min(dragFrom.x, c.x), y: Math.min(dragFrom.y, c.y), w: Math.abs(c.x - dragFrom.x) + 1, h: Math.abs(c.y - dragFrom.y) + 1 };
    draw();
  }

  function fenceBest(P) {
    var s = P / 2, best = null;
    for (var w = 1; w < s; w++) {
      var h = s - w; if (!fits(w, h)) continue;
      var a = w * h;
      if (!best || (task.goal === 'big' ? a > best.a : a < best.a)) best = { w: w, h: h, a: a };
    }
    return best;
  }

  function answer() {
    var t = task;
    if (t.kind === 'area') return pairs(t.a)[0];
    if (t.kind === 'both') { var s = t.p / 2; for (var w = 1; w < s; w++) if (w * (s - w) === t.a) return [w, s - w]; }
    if (t.kind === 'same') {
      var ps = pairs(t.a);
      if (t.step === 1) return ps[0];
      for (var i = 0; i < ps.length; i++) { var p = per(ps[i][0], ps[i][1]), f0 = per(t.first[0], t.first[1]); if (t.dir === 'big' ? p > f0 : p < f0) return ps[i]; }
    }
    if (t.kind === 'fence') { var b = fenceBest(t.p); return [b.w, b.h]; }
    return [1, 1];
  }

  function setTo(wh) {
    var w = wh[0], h = wh[1];
    if (w > COLS || h > ROWS) { var t = w; w = h; h = t; }
    rect = { x: 0, y: 0, w: w, h: h }; draw();
  }

  function hint() {
    if (busy) return;
    GK.sfx.pop();
    var t = task, a = answer();
    if (t.kind === 'area') f.say('Think of two numbers that multiply to ' + t.a + '. One of them is ' + a[0] + '.');
    else if (t.kind === 'both') f.say('Width plus height must be half the perimeter: ' + (t.p / 2) + '. Which two numbers add to ' + (t.p / 2) + ' and multiply to ' + t.a + '?');
    else if (t.kind === 'same') f.say(t.step === 1 ? 'Try a width of ' + a[0] + '.' : 'Long thin shapes have a bigger perimeter. Shapes close to a square have a smaller one.');
    else f.say('Width plus height must be ' + (t.p / 2) + '. ' + (t.goal === 'big' ? 'Shapes close to a square hold the most.' : 'The thinnest pen holds the least.'));
  }

  function checkIt() {
    if (busy) return;
    var w = rect.w, h = rect.h, A = w * h, P = per(w, h), t = task;
    var info = 'Yours is ' + w + ' by ' + h + ': area ' + A + ', perimeter ' + P + '.';
    var ok = false, msg = '';
    if (t.kind === 'area') { ok = A === t.a; msg = ok ? w + ' times ' + h + ' is ' + A + '.' : 'That has ' + sq(A) + '. You need ' + t.a + '. ' + (A < t.a ? 'Make it bigger.' : 'Make it smaller.'); }
    else if (t.kind === 'both') {
      ok = A === t.a && P === t.p;
      msg = ok ? 'Area ' + A + ' and perimeter ' + P + '. Both right!' : info + (A !== t.a ? ' The area is off.' : ' The area is right, now fix the perimeter.');
    } else if (t.kind === 'same') {
      if (A !== t.a) { msg = info + ' The area must be ' + t.a + '.'; }
      else if (t.step === 1) {
        t.first = [w, h]; t.step = 2;
        var ps = pairs(t.a), fp = P, bigger = ps.some(function (q) { return per(q[0], q[1]) > fp; }), smaller = ps.some(function (q) { return per(q[0], q[1]) < fp; });
        t.dir = bigger && smaller ? GK.pick(['big', 'small']) : (bigger ? 'big' : 'small');
        GK.good(goalEl); goalEl.textContent = goalText();
        f.say('Step 1 done: perimeter ' + P + '. Now change the shape but keep ' + sq(t.a) + '.', 'good');
        return;
      } else {
        var f0 = per(t.first[0], t.first[1]);
        ok = t.dir === 'big' ? P > f0 : P < f0;
        msg = ok ? 'Same area ' + A + ', perimeter ' + f0 + ' became ' + P + '. Same space, different fence!' : info + ' The perimeter must be ' + (t.dir === 'big' ? 'more' : 'less') + ' than ' + f0 + '.';
      }
    } else {
      var best = fenceBest(t.p);
      if (P !== t.p) msg = 'This fence is ' + P + ' long. Use exactly ' + t.p + '.';
      else { ok = A === best.a; msg = ok ? 'Area ' + A + ' is the ' + (t.goal === 'big' ? 'biggest' : 'smallest') + ' pen for ' + t.p + ' units of fence!' : 'Good fence! This pen holds ' + sq(A) + '. Can you find one that holds ' + (t.goal === 'big' ? 'more' : 'less') + '?'; }
    }
    if (!ok) { GK.bad(); f.say(msg, 'bad'); return; }
    busy = true; done++; f.progress(done, ROUNDS); GK.good(goalEl); grid.classList.add('gk-ab-win');
    f.say(GK.pick(['Yes! ', 'Smart building! ', 'Exactly! ']) + msg, 'good');
    setTimeout(function () {
      busy = false; grid.classList.remove('gk-ab-win');
      if (done >= ROUNDS) GK.finish(f, { title: 'Master builder!', text: 'You solved ' + ROUNDS + ' building puzzles. Try drawing one on graph paper and ask a grown up to find its area and perimeter.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1600);
  }

  GK.solve = function () { if (busy) return; setTo(answer()); checkIt(); };

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'area', label: '1 Area' }, { key: 'both', label: '2 Area + perimeter' }, { key: 'same', label: '3 Same area' }, { key: 'fence', label: '4 Fence puzzle' }], onLevel: start });
  start();
})();
