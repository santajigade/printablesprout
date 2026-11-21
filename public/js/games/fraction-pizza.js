(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var NS = 'http://www.w3.org/2000/svg';
  var ROUNDS = { make: 10, equal: 10, compare: 8, add: 8 };
  var f, done, busy = false, task, step, pizzas, ui;

  function R(a, b) { return GK.rand(a, b); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function frac(n, d) { // stacked fraction for screen, with a spoken label
    var s = GK.el('span', { class: 'gk-fp-frac', role: 'img', 'aria-label': n + ' over ' + d });
    s.appendChild(GK.el('span', { text: String(n), 'aria-hidden': 'true' }));
    s.appendChild(GK.el('span', { class: 'gk-fp-bar', 'aria-hidden': 'true' }));
    s.appendChild(GK.el('span', { text: String(d), 'aria-hidden': 'true' }));
    return s;
  }
  function word(d) { return { 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 12: 'twelfths' }[d] || d + 'ths'; }

  /* ---------- One pizza: an SVG with d tappable slices ---------- */
  function Pizza(d, label) {
    var p = { d: d, on: [], el: GK.el('div', { class: 'gk-fp-pizza' }), locked: false };
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-110 -110 220 220'); svg.setAttribute('class', 'gk-fp-svg');
    svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', label || ('Pizza cut into ' + d + ' equal slices'));
    var crust = document.createElementNS(NS, 'circle');
    crust.setAttribute('r', '104'); crust.setAttribute('fill', '#e3a957'); crust.setAttribute('stroke', '#8a5a22'); crust.setAttribute('stroke-width', '4');
    svg.appendChild(crust);
    p.paths = [];
    for (var i = 0; i < d; i++) {
      var a0 = -Math.PI / 2 + i * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d, r = 92;
      var x0 = r * Math.cos(a0), y0 = r * Math.sin(a0), x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'gk-fp-slice'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.setAttribute('aria-pressed', 'false'); g.setAttribute('aria-label', 'Slice ' + (i + 1) + ' of ' + d);
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d === 1 ? 'M0 -92 A92 92 0 1 1 -0.01 -92 Z' : 'M0 0 L' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' Z');
      path.setAttribute('class', 'gk-fp-cheese');
      g.appendChild(path);
      // toppings sit in the middle of the slice and only show when the slice is picked
      var mid = (a0 + a1) / 2, tops = document.createElementNS(NS, 'g'); tops.setAttribute('class', 'gk-fp-tops');
      var half = Math.PI / d;
      [[0.66, 0], [0.86, -0.5], [0.86, 0.5], [0.44, 0]].forEach(function (t) {
        var ang = mid + t[1] * half, rr = r * t[0];
        var cr = Math.min(9, rr * Math.sin(Math.min(half, 1.2)) * 0.55);
        if (cr < 4.5) return;
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', (rr * Math.cos(ang)).toFixed(1)); c.setAttribute('cy', (rr * Math.sin(ang)).toFixed(1));
        c.setAttribute('r', cr.toFixed(1)); c.setAttribute('fill', '#c8372d'); c.setAttribute('stroke', '#8e2119'); c.setAttribute('stroke-width', '2');
        tops.appendChild(c);
      });
      g.appendChild(tops);
      (function (idx, node) {
        function hit(e) { if (e) e.preventDefault(); toggle(p, idx); }
        node.addEventListener('click', hit);
        node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') hit(e); });
      })(i, g);
      svg.appendChild(g); p.paths.push(g);
    }
    p.el.appendChild(svg);
    p.count = function () { return p.on.filter(Boolean).length; };
    p.set = function (n) { for (var i = 0; i < d; i++) { p.on[i] = i < n; paint(p, i); } };
    for (var k = 0; k < d; k++) p.on[k] = false;
    return p;
  }
  function paint(p, i) { p.paths[i].classList.toggle('on', !!p.on[i]); p.paths[i].setAttribute('aria-pressed', p.on[i] ? 'true' : 'false'); }
  function toggle(p, i) {
    if (busy || p.locked) return;
    p.on[i] = !p.on[i]; paint(p, i); GK.sfx.tap();
    if (ui && ui.count) ui.count();
  }

  /* ---------- Making a task for each level ---------- */
  function makeTask() {
    var L = f.level, d, n, b, k, a, c, d2;
    if (L === 'make') {
      d = GK.pick([2, 3, 4, 5, 6, 8, 8, 10, 12].slice(0, done < 4 ? 6 : 9)); n = R(1, d - 1);
      if (done === 9) n = d; // last pizza: a whole one
      return { kind: 'make', n: n, d: d };
    }
    if (L === 'equal') {
      b = GK.pick([2, 3, 4, 2, 4]); k = GK.pick(b === 3 ? [2, 3, 4] : b === 4 ? [2, 3] : [2, 3, 4, 5, 6]);
      a = R(1, b - 1); return { kind: 'equal', a: a, b: b, D: b * k, N: a * k };
    }
    if (L === 'compare') {
      var pairs = [[2, 4], [2, 8], [4, 8], [3, 6], [2, 6], [3, 4], [4, 6], [2, 3], [3, 8], [5, 10], [2, 5], [4, 5], [6, 8]];
      var pr = GK.pick(pairs); if (Math.random() < 0.5) pr = [pr[1], pr[0]];
      b = pr[0]; d = pr[1];
      do { a = R(1, b - 1); c = R(1, d - 1); } while (a * d === c * b && Math.random() < 0.7); // equal pairs happen, but not too often
      return { kind: 'compare', a: a, b: b, c: c, d: d };
    }
    // add: same bottom number first, then one bottom number that is a multiple of the other
    if (done < 4) { d = GK.pick([4, 5, 6, 8, 10]); a = R(1, d - 2); c = R(1, d - 1 - a); return { kind: 'add', a: a, b: d, c: c, d: d, D: d }; }
    var pr2 = GK.pick([[2, 4], [2, 6], [3, 6], [4, 8], [2, 8], [3, 12], [4, 12], [5, 10]]);
    b = pr2[0]; d2 = pr2[1]; k = d2 / b;
    do { a = R(1, b - 1); c = R(1, d2 - 1); } while (a * k + c > d2);
    return { kind: 'add', a: a, b: b, c: c, d: d2, D: d2 };
  }

  function start() { done = 0; f.progress(0, ROUNDS[f.level]); intro(); round(); }
  function intro() {
    var m = { make: 'Tap slices to add pepperoni. Show the fraction, then tap Check.', equal: 'Same amount of pizza, more slices. Show it, then name the new fraction.', compare: 'Build both pizzas, then decide which one has more.', add: 'Two friends share pizza. Show how much they ate in all.' };
    f.say(m[f.level]);
  }

  function row(kids, cls) { return GK.el('div', { class: cls || 'gk-fp-row' }, kids); }
  function txt(t, cls) { return GK.el('span', { class: cls || 'gk-fp-t', text: t }); }

  function round() {
    task = makeTask(); step = 0; pizzas = []; ui = {};
    f.area.innerHTML = '';
    var t = task, q = GK.el('div', { class: 'gk-fp-q' });
    if (t.kind === 'make') q.appendChild(row([txt('Put pepperoni on'), frac(t.n, t.d), txt('of the pizza')]));
    else if (t.kind === 'equal') q.appendChild(row([txt('Show'), frac(t.a, t.b), txt('on a pizza cut into ' + t.D + ' slices')]));
    else if (t.kind === 'compare') { q.appendChild(row([txt('Compare'), frac(t.a, t.b), txt('and'), frac(t.c, t.d)])); q.appendChild(txt('Which is more, or are they the same?', 'gk-fp-sub')); }
    else { q.appendChild(row([txt('Ana eats'), frac(t.a, t.b), txt('and Raj eats'), frac(t.c, t.d)])); q.appendChild(txt('How much pizza did they eat in all?', 'gk-fp-sub')); }
    f.area.appendChild(q);
    var board = GK.el('div', { class: 'gk-fp-board' });
    f.area.appendChild(board);
    var count = GK.el('p', { class: 'gk-fp-count', 'aria-live': 'polite' });
    f.area.appendChild(count);
    var act = GK.el('div', { class: 'gk-fp-act' });
    f.area.appendChild(act);

    if (t.kind === 'make') pizzas = [Pizza(t.d)];
    else if (t.kind === 'equal' || t.kind === 'add') pizzas = [Pizza(t.D)];
    else pizzas = [Pizza(t.b, 'Left pizza, cut into ' + t.b + ' slices'), Pizza(t.d, 'Right pizza, cut into ' + t.d + ' slices')];
    pizzas.forEach(function (p, i) {
      var wrap = GK.el('div', { class: 'gk-fp-slot' });
      if (t.kind === 'compare') wrap.appendChild(GK.el('p', { class: 'gk-fp-tag', text: i ? 'Right pizza' : 'Left pizza' }));
      wrap.appendChild(p.el); board.appendChild(wrap);
    });
    if (t.kind === 'compare') { pizzas[1].locked = true; pizzas[1].el.classList.add('gk-fp-wait'); }

    ui.count = function () {
      var p = pizzas[t.kind === 'compare' ? step : 0];
      if (!p) return;
      count.textContent = p.count() + ' of ' + p.d + ' slices have pepperoni';
    };
    ui.count();
    shadeStep(act);
  }

  // how many slices the current pizza needs
  function target() {
    var t = task;
    if (t.kind === 'make') return t.n;
    if (t.kind === 'equal') return t.N;
    if (t.kind === 'compare') return step === 0 ? t.a : t.c;
    return t.a * (t.D / t.b) + t.c;
  }
  function curPizza() { return pizzas[task.kind === 'compare' ? step : 0]; }

  function shadeStep(act) {
    act.innerHTML = '';
    var clear = GK.el('button', { type: 'button', class: 'gk-tool', text: 'Clear' });
    clear.addEventListener('click', function () { if (busy) return; curPizza().set(0); ui.count(); GK.sfx.pop(); });
    var chk = GK.el('button', { type: 'button', class: 'gk-big gk-fp-check', text: 'Check' });
    chk.addEventListener('click', function () { check(chk); });
    act.appendChild(clear); act.appendChild(chk);
    ui.check = chk;
    if (task.kind === 'compare') f.say(step === 0 ? 'First, show the left fraction on the left pizza.' : 'Now show the right fraction on the right pizza.');
    else if (task.kind === 'add' && task.b !== task.d) f.say('Tip: 1/' + task.b + ' is the same as ' + (task.D / task.b) + '/' + task.D + '. Change ' + task.a + '/' + task.b + ' first, then add.');
  }

  function check(btn) {
    if (busy) return;
    var p = curPizza(), have = p.count(), need = target(), t = task;
    if (have !== need) {
      GK.flash(btn, false); GK.bad();
      var hint;
      if (t.kind === 'make') hint = 'The bottom number ' + t.d + ' tells how many slices. The top number ' + t.n + ' tells how many get pepperoni.';
      else if (t.kind === 'equal') hint = 'Each 1/' + t.b + ' of this pizza is ' + (t.D / t.b) + ' small slices. So ' + t.a + '/' + t.b + ' is ' + t.a + ' groups of ' + (t.D / t.b) + '.';
      else if (t.kind === 'compare') hint = 'This pizza has ' + p.d + ' slices. Pepperoni goes on ' + (step === 0 ? t.a : t.c) + ' of them.';
      else hint = t.b === t.d ? 'Add the top numbers: ' + t.a + ' slices and ' + t.c + ' slices.' : 'Change ' + t.a + '/' + t.b + ' into ' + (t.D) + 'ths first: that is ' + (t.a * t.D / t.b) + ' small slices. Then add ' + t.c + ' more.';
      f.say('You have ' + have + ' slices. ' + hint, 'bad');
      return;
    }
    GK.sfx.match(); p.locked = true; p.el.classList.add('gk-fp-done');
    if (t.kind === 'make') return win(btn, 'Yes! ' + t.n + ' out of ' + t.d + ' slices is ' + t.n + '/' + t.d + (t.n === t.d ? ', the whole pizza.' : '.'));
    if (t.kind === 'compare' && step === 0) {
      step = 1; pizzas[1].locked = false; pizzas[1].el.classList.remove('gk-fp-wait'); ui.count(); shadeStep(btn.parentNode); return;
    }
    // last step: a choice
    step = 2; choiceStep(btn.parentNode);
  }

  function choiceStep(act) {
    var t = task, opts, right, label;
    act.innerHTML = '';
    if (t.kind === 'equal') {
      label = 'So ' + t.a + '/' + t.b + ' = ? / ' + t.D;
      right = String(t.N);
      var o = [t.N, t.N + 1, t.N - 1, t.a, t.N + t.D / t.b].filter(function (x, i, arr) { return x > 0 && x <= t.D && arr.indexOf(x) === i; });
      opts = GK.shuffle([String(t.N)].concat(GK.shuffle(o.slice(1)).slice(0, 2).map(String)));
      f.say('Great shading! Now finish the sentence.', 'good');
    } else if (t.kind === 'compare') {
      label = t.a + '/' + t.b + '  ?  ' + t.c + '/' + t.d;
      var l = t.a * t.d, r = t.c * t.b; right = l > r ? '>' : l < r ? '<' : '=';
      opts = ['<', '=', '>'];
      f.say('Both pizzas are ready. Look at them. Which has more pepperoni?', 'good');
    } else {
      var n = t.a * (t.D / t.b) + t.c, g = gcd(n, t.D);
      label = t.a + '/' + t.b + ' + ' + t.c + '/' + t.d + ' = ?';
      right = n + '/' + t.D;
      var wrongs = [(t.a + t.c) + '/' + (t.b + t.d), (n + 1) + '/' + t.D, (n - 1) + '/' + t.D, (t.a + t.c) + '/' + t.D];
      wrongs = wrongs.filter(function (w, i, arr) { return w !== right && arr.indexOf(w) === i && w.split('/')[0] !== '0' && +w.split('/')[0] <= +w.split('/')[1] && (+w.split('/')[0]) * t.D !== n * (+w.split('/')[1]); });
      opts = GK.shuffle([right].concat(GK.shuffle(wrongs).slice(0, 2)));
      t.simple = g > 1 ? (n / g) + '/' + (t.D / g) : '';
      f.say('That is the right amount. Which fraction names it?', 'good');
    }
    act.appendChild(GK.el('p', { class: 'gk-fp-ask', text: label }));
    var ch = GK.el('div', { class: 'gk-choices gk-fp-choices' });
    opts.forEach(function (o) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice', text: o, 'aria-label': o === '<' ? 'less than' : o === '>' ? 'more than' : o === '=' ? 'the same as' : o });
      b.addEventListener('click', function () {
        if (busy) return;
        if (o !== right) {
          GK.flash(b, false); GK.bad();
          var h = t.kind === 'compare' ? 'Look at the pizzas: which one has more of it covered? Both pizzas are the same size.' : t.kind === 'equal' ? 'Count the slices with pepperoni. That number goes on top.' : 'Count every slice with pepperoni. The pizza has ' + t.D + ' slices, so ' + t.D + ' goes on the bottom. We never add the bottom numbers.';
          f.say(h, 'bad'); return;
        }
        GK.flash(b, true);
        var msg;
        if (t.kind === 'equal') msg = 'Yes! ' + t.a + '/' + t.b + ' = ' + t.N + '/' + t.D + '. Same amount of pizza, just smaller slices.';
        else if (t.kind === 'compare') msg = right === '=' ? 'Yes! ' + t.a + '/' + t.b + ' and ' + t.c + '/' + t.d + ' are the same amount.' : 'Yes! ' + t.a + '/' + t.b + (right === '>' ? ' is more than ' : ' is less than ') + t.c + '/' + t.d + '.';
        else msg = 'Yes! They ate ' + right + ' of the pizza' + (t.simple ? ', which is the same as ' + t.simple + '.' : '.');
        win(b, msg);
      });
      ch.appendChild(b);
    });
    act.appendChild(ch);
    ui.choice = function () { ch.querySelectorAll('button')[opts.indexOf(right)].click(); };
  }

  function win(btn, msg) {
    busy = true; GK.good(btn); done++; f.progress(done, ROUNDS[f.level]);
    f.say(msg, 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS[f.level]) {
        var next = { make: 'Try Equal slices next.', equal: 'Try Compare next.', compare: 'Try Add slices next.', add: 'You finished the hardest level. Pizza chef!' }[f.level];
        GK.finish(f, { title: 'Fraction pizza chef!', text: ROUNDS[f.level] + ' pizzas done. ' + next, sheet: root.dataset.sheet, onReplay: start });
      } else round();
    }, 1800);
  }

  // test hook: one correct step each call
  GK.solve = function () {
    if (busy || !task) return;
    if (step === 2 && ui.choice) { ui.choice(); return; }
    var p = curPizza(); p.set(target()); ui.count(); check(ui.check);
  };

  f = GK.frame({ root: root, rounds: 10, levels: [{ key: 'make', label: 'Make it' }, { key: 'equal', label: 'Equal slices' }, { key: 'compare', label: 'Compare' }, { key: 'add', label: 'Add slices' }], onLevel: start });
  start();
})();
