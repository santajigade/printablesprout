(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var PICS = ['🍎', '🍌', '🍇', '🍊'];
  var LV = {
    pics: { n: 4, br: 2, bc: 2, blanks: 7, puzzles: 4, pics: true },
    four: { n: 4, br: 2, bc: 2, blanks: 10, puzzles: 4 },
    six: { n: 6, br: 2, bc: 3, blanks: 17, puzzles: 3 },
    expert: { n: 6, br: 2, bc: 3, blanks: 23, puzzles: 3 },
  };
  var f, L, done, sol, grid, given, cells, sel, busy, left, pad, misses;

  /* ---------- puzzle maker ---------- */
  function boxOf(r, c) { return Math.floor(r / L.br) * L.br + Math.floor(c / L.bc); }
  function okAt(g, r, c, v) {
    for (var i = 0; i < L.n; i++) { if (g[r][i] === v || g[i][c] === v) return false; }
    var r0 = r - r % L.br, c0 = c - c % L.bc;
    for (var y = r0; y < r0 + L.br; y++) for (var x = c0; x < c0 + L.bc; x++) if (g[y][x] === v) return false;
    return true;
  }
  function fill(g, k) {
    if (k === L.n * L.n) return true;
    var r = Math.floor(k / L.n), c = k % L.n;
    var vals = GK.shuffle(range());
    for (var i = 0; i < vals.length; i++) { if (okAt(g, r, c, vals[i])) { g[r][c] = vals[i]; if (fill(g, k + 1)) return true; g[r][c] = 0; } }
    return false;
  }
  function count(g, limit) {
    for (var k = 0; k < L.n * L.n; k++) {
      var r = Math.floor(k / L.n), c = k % L.n;
      if (g[r][c]) continue;
      var total = 0;
      for (var v = 1; v <= L.n; v++) if (okAt(g, r, c, v)) { g[r][c] = v; total += count(g, limit - total); g[r][c] = 0; if (total >= limit) break; }
      return total;
    }
    return 1;
  }
  function range() { var a = []; for (var i = 1; i <= L.n; i++) a.push(i); return a; }
  function blank() { var g = []; for (var r = 0; r < L.n; r++) { g.push([]); for (var c = 0; c < L.n; c++) g[r].push(0); } return g; }
  function make() {
    var best = null;
    for (var tries = 0; tries < 6; tries++) {
      var s = blank(); fill(s, 0);
      var p = s.map(function (row) { return row.slice(); }), removed = 0;
      var order = GK.shuffle(allCells());
      for (var i = 0; i < order.length && removed < L.blanks; i++) {
        var r = order[i][0], c = order[i][1], keep = p[r][c];
        p[r][c] = 0;
        if (count(p.map(function (row) { return row.slice(); }), 2) !== 1) p[r][c] = keep; else removed++;
      }
      if (!best || removed > best.removed) best = { s: s, p: p, removed: removed };
      if (removed >= L.blanks) break;
    }
    return best;
  }
  function allCells() { var a = []; for (var r = 0; r < L.n; r++) for (var c = 0; c < L.n; c++) a.push([r, c]); return a; }

  /* ---------- drawing ---------- */
  function show(v) { return L.pics ? PICS[v - 1] : String(v); }
  function name(v) { return L.pics ? ['apple', 'banana', 'grape', 'orange'][v - 1] : String(v); }
  function art(v) { return L.pics ? ['an apple', 'a banana', 'a grape', 'an orange'][v - 1] : 'a ' + v; }

  function start() {
    L = LV[f.level]; done = 0; f.progress(0, L.puzzles);
    f.say(L.pics ? 'Each row, column and thick box needs one of every fruit.' : 'Each row, column and thick box needs every number from 1 to ' + L.n + ' once.');
    puzzle();
  }

  function puzzle() {
    var m = make(); sol = m.s; grid = m.p; busy = false; sel = null; misses = 0;
    given = grid.map(function (row) { return row.map(function (v) { return v > 0; }); });
    left = 0; grid.forEach(function (row) { row.forEach(function (v) { if (!v) left++; }); });
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-msd-q', text: 'Puzzle ' + (done + 1) + ' of ' + L.puzzles + ': ' + left + ' empty squares' }));
    var board = GK.el('div', { class: 'gk-msd-board gk-msd-n' + L.n + (L.pics ? ' gk-msd-pics' : ''), role: 'grid', 'aria-label': L.n + ' by ' + L.n + ' sudoku' });
    cells = [];
    for (var r = 0; r < L.n; r++) {
      cells.push([]);
      for (var c = 0; c < L.n; c++) {
        var cls = 'gk-msd-cell';
        if (c % L.bc === L.bc - 1 && c < L.n - 1) cls += ' gk-msd-rb';
        if (r % L.br === L.br - 1 && r < L.n - 1) cls += ' gk-msd-bb';
        if (boxOf(r, c) % 2 === 1) cls += ' gk-msd-alt';
        if (given[r][c]) cls += ' gk-msd-given';
        var b = GK.el('button', { type: 'button', class: cls, role: 'gridcell', 'data-r': r, 'data-c': c, text: grid[r][c] ? show(grid[r][c]) : '', 'aria-label': 'Row ' + (r + 1) + ' column ' + (c + 1) + (grid[r][c] ? ', ' + name(grid[r][c]) : ', empty') });
        (function (r, c, b) { b.addEventListener('click', function () { choose(r, c); }); })(r, c, b);
        cells[r].push(b); board.appendChild(b);
      }
    }
    board.addEventListener('keydown', key);
    f.area.appendChild(board);
    pad = GK.el('div', { class: 'gk-msd-pad gk-msd-p' + L.n });
    range().forEach(function (v) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-msd-num', text: show(v), 'aria-label': 'Put ' + name(v) });
      b.addEventListener('click', function () { place(v, b); });
      pad.appendChild(b);
    });
    f.area.appendChild(pad);
    var hint = GK.el('button', { type: 'button', class: 'gk-tool', text: '💡 Find an easy square' });
    hint.addEventListener('click', helper);
    f.area.appendChild(hint);
    var first = firstEmpty(); if (first) choose(first[0], first[1], true);
    GK.sfx.flip();
    GK.solve = function () {
      if (busy) return;
      for (var r = 0; r < L.n; r++) for (var c = 0; c < L.n; c++) if (!grid[r][c]) { choose(r, c, true); place(sol[r][c]); if (busy) return; }
    };
  }

  function firstEmpty() { for (var r = 0; r < L.n; r++) for (var c = 0; c < L.n; c++) if (!grid[r][c]) return [r, c]; return null; }

  function choose(r, c, quiet) {
    if (busy) return;
    if (sel) cells[sel[0]][sel[1]].classList.remove('gk-msd-sel');
    cells.forEach(function (row) { row.forEach(function (b) { b.classList.remove('gk-msd-peer', 'gk-msd-tip'); }); });
    sel = [r, c];
    for (var i = 0; i < L.n; i++) { cells[r][i].classList.add('gk-msd-peer'); cells[i][c].classList.add('gk-msd-peer'); }
    var r0 = r - r % L.br, c0 = c - c % L.bc;
    for (var y = r0; y < r0 + L.br; y++) for (var x = c0; x < c0 + L.bc; x++) cells[y][x].classList.add('gk-msd-peer');
    cells[r][c].classList.add('gk-msd-sel');
    if (!quiet) { GK.sfx.tap(); if (given[r][c] || grid[r][c]) f.say('This square is already filled. Pick an empty one.'); else f.say('Now tap what goes here.'); }
  }

  function key(e) {
    if (!sel) return;
    var r = sel[0], c = sel[1], k = e.key;
    var mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[k];
    if (mv) { e.preventDefault(); r = (r + mv[0] + L.n) % L.n; c = (c + mv[1] + L.n) % L.n; choose(r, c, true); cells[r][c].focus(); return; }
    var v = parseInt(k, 10); if (v >= 1 && v <= L.n) { e.preventDefault(); place(v); }
  }

  function why(r, c, v) {
    for (var i = 0; i < L.n; i++) if (grid[r][i] === v) return 'There is already ' + art(v) + ' in this row.';
    for (var j = 0; j < L.n; j++) if (grid[j][c] === v) return 'There is already ' + art(v) + ' in this column.';
    var r0 = r - r % L.br, c0 = c - c % L.bc;
    for (var y = r0; y < r0 + L.br; y++) for (var x = c0; x < c0 + L.bc; x++) if (grid[y][x] === v) return 'There is already ' + art(v) + ' in this thick box.';
    return 'That fits for now, but it will block another square later. Look for a square with only one choice.';
  }

  function cands(r, c) { var a = []; for (var v = 1; v <= L.n; v++) if (okAt(grid, r, c, v)) a.push(v); return a; }

  function helper() {
    if (busy) return;
    GK.sfx.pop();
    for (var r = 0; r < L.n; r++) for (var c = 0; c < L.n; c++) if (!grid[r][c] && cands(r, c).length === 1) {
      choose(r, c, true); cells[r][c].classList.add('gk-msd-tip');
      f.say('This square has only one choice left. Check its row, column and box to find it.');
      return;
    }
    var p = firstEmpty(); if (p) { choose(p[0], p[1], true); f.say('Try a row or box that is almost full.'); }
  }

  function place(v, btn) {
    if (busy || !sel) return;
    var r = sel[0], c = sel[1], cell = cells[r][c];
    if (grid[r][c]) { f.say('Pick an empty square first.'); return; }
    if (sol[r][c] !== v) {
      misses++; GK.bad(); GK.flash(cell, false); if (btn) GK.flash(btn, false);
      f.say(why(r, c, v), 'bad');
      return;
    }
    grid[r][c] = v; left--;
    cell.textContent = show(v); cell.classList.add('gk-msd-mine', 'gk-msd-new');
    cell.setAttribute('aria-label', 'Row ' + (r + 1) + ' column ' + (c + 1) + ', ' + name(v));
    cell.classList.remove('gk-msd-tip');
    GK.sfx.match();
    if (left > 0) {
      f.say(GK.pick(['Yes! ', 'Good thinking! ', 'Right! ']) + left + ' to go.', 'good');
      var nx = nextEmpty(r, c); if (nx) choose(nx[0], nx[1], true);
      return;
    }
    busy = true; done++; f.progress(done, L.puzzles); GK.good(cell);
    f.area.querySelector('.gk-msd-board').classList.add('gk-msd-solved');
    f.say(misses === 0 ? 'Solved with no slips! Every row, column and box is complete.' : 'Solved! Every row, column and box is complete.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= L.puzzles) GK.finish(f, { title: 'Sudoku solver!', text: L.n === 4 ? 'You finished every 4 by 4 puzzle. Ready for the 6 by 6 level?' : 'You solved every 6 by 6 puzzle. That takes real logic. Well done!', sheet: root.dataset.sheet, onReplay: start });
      else puzzle();
    }, 1800);
  }

  function nextEmpty(r, c) {
    var k0 = r * L.n + c;
    for (var i = 1; i <= L.n * L.n; i++) { var k = (k0 + i) % (L.n * L.n), y = Math.floor(k / L.n), x = k % L.n; if (!grid[y][x]) return [y, x]; }
    return null;
  }

  f = GK.frame({ root: root, rounds: 4, levels: [{ key: 'pics', label: 'Fruit 4x4' }, { key: 'four', label: 'Number 4x4' }, { key: 'six', label: '6x6' }, { key: 'expert', label: '6x6 expert' }], onLevel: start });
  start();
})();
