(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var COLORS = ['#e84a5f', '#f2a541', '#f2d13e', '#5cb85c', '#3d8fd1', '#8a5cc7'];
  var NAMES = ['first', 'middle', 'last'];
  var f, n, pegs, held, moves, busy = false, pegBtns, counter, hintBtn;

  function best() { return Math.pow(2, n) - 1; }
  function top(p) { var s = pegs[p]; return s.length ? s[s.length - 1] : 0; }
  function where(d) { for (var p = 0; p < 3; p++) if (pegs[p].indexOf(d) >= 0) return p; return -1; }
  // the next move of the shortest solution from any legal position, moving every disc to peg 2
  function nextMove(d, t) {
    if (d === 0) return null;
    var p = where(d);
    if (p === t) return nextMove(d - 1, t);
    var m = nextMove(d - 1, 3 - p - t);
    return m || [p, t];
  }
  function stacked() { var c = 0, s = pegs[2]; for (var i = 0; i < s.length; i++) { if (s[i] === n - i) c++; else break; } return c; }

  function start() {
    n = +f.level; pegs = [[], [], []]; held = -1; moves = 0;
    for (var d = n; d >= 1; d--) pegs[0].push(d);
    f.progress(0, n);
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-dt-goal', text: 'Move the whole tower to the last peg. Only one disc at a time, and never put a bigger disc on a smaller one.' }));
    var board = GK.el('div', { class: 'gk-dt-board' }); pegBtns = [];
    for (var p = 0; p < 3; p++) {
      var b = GK.el('button', { type: 'button', class: 'gk-dt-peg' + (p === 2 ? ' gk-dt-target' : '') });
      (function (p) { b.addEventListener('click', function () { tapPeg(p); }); })(p);
      pegBtns.push(b); board.appendChild(b);
    }
    f.area.appendChild(board);
    var bar = GK.el('div', { class: 'gk-dt-bar' });
    counter = GK.el('span', { class: 'gk-dt-count' });
    hintBtn = GK.el('button', { type: 'button', class: 'gk-tool gk-dt-hint', text: '💡 Hint' });
    hintBtn.addEventListener('click', hint);
    var reset = GK.el('button', { type: 'button', class: 'gk-tool', text: '↺ Start over' });
    reset.addEventListener('click', function () { GK.sfx.pop(); start(); f.say('Fresh start. You can do it!'); });
    bar.appendChild(counter); bar.appendChild(hintBtn); bar.appendChild(reset);
    f.area.appendChild(bar);
    render();
    f.say(n === 3 ? 'Tap a peg to pick up its top disc, then tap another peg to put it down.' : n + ' discs. The fewest moves is ' + best() + '. Plan before you move!');
    GK.solve = function () {
      if (busy) return;
      if (held >= 0) { held = -1; render(); }
      var m = nextMove(n, 2); if (!m) return;
      tapPeg(m[0]); tapPeg(m[1]);
    };
  }

  function render() {
    for (var p = 0; p < 3; p++) {
      var b = pegBtns[p]; b.innerHTML = '';
      b.appendChild(GK.el('span', { class: 'gk-dt-pole', 'aria-hidden': 'true' }));
      var stack = GK.el('span', { class: 'gk-dt-stack', 'aria-hidden': 'true' });
      pegs[p].forEach(function (d, i) {
        var disc = GK.el('span', { class: 'gk-dt-disc' + (held === p && i === pegs[p].length - 1 ? ' gk-dt-up' : ''), text: String(d) });
        disc.style.width = (28 + 70 * d / n) + '%'; disc.style.background = COLORS[(d - 1) % COLORS.length];
        stack.appendChild(disc);
      });
      b.appendChild(stack);
      b.appendChild(GK.el('span', { class: 'gk-dt-base', 'aria-hidden': 'true' }));
      var label = NAMES[p] + ' peg, ' + (pegs[p].length ? pegs[p].length + ' discs, top disc ' + top(p) : 'empty') + (held === p ? ', disc picked up' : '');
      b.setAttribute('aria-label', label);
      b.classList.toggle('gk-dt-held', held === p);
    }
    counter.textContent = 'Moves: ' + moves + ' (best ' + best() + ')';
    f.progress(stacked(), n);
  }

  function tapPeg(p) {
    if (busy) return;
    pegBtns.forEach(function (b) { b.classList.remove('gk-dt-tip', 'gk-dt-tipto'); });
    if (held < 0) {
      if (!pegs[p].length) { GK.sfx.tap(); f.say('That peg is empty. Pick a peg with discs on it.'); return; }
      held = p; GK.sfx.pop(); render();
      f.say('Disc ' + top(p) + ' picked up. Now tap where it should go.');
      return;
    }
    if (p === held) { held = -1; GK.sfx.tap(); render(); f.say('Put back. Pick any disc you like.'); return; }
    var d = top(held), t = top(p);
    if (t && t < d) {
      GK.bad(); GK.flash(pegBtns[p], false);
      f.say('Disc ' + d + ' is bigger than disc ' + t + '. A big disc can not go on a smaller one.', 'bad');
      return;
    }
    pegs[p].push(pegs[held].pop()); held = -1; moves++;
    GK.sfx.flip(); render();
    if (pegs[2].length === n) { done(); return; }
    var s = stacked();
    f.say(s && p === 2 && top(2) === n - s + 1 ? 'Nice! ' + s + ' of ' + n + ' discs are in place on the last peg.' : 'Moved disc ' + d + '. Moves so far: ' + moves + '.');
  }

  function hint() {
    if (busy) return;
    GK.sfx.pop();
    if (held >= 0) { held = -1; render(); }
    var m = nextMove(n, 2); if (!m) return;
    pegBtns[m[0]].classList.add('gk-dt-tip'); pegBtns[m[1]].classList.add('gk-dt-tipto');
    f.say('Try moving disc ' + top(m[0]) + ' from the ' + NAMES[m[0]] + ' peg to the ' + NAMES[m[1]] + ' peg.');
  }

  function done() {
    busy = true; GK.good(pegBtns[2]);
    var perfect = moves === best();
    f.say(perfect ? 'Perfect! ' + moves + ' moves, the fewest possible!' : 'Tower moved in ' + moves + ' moves!', 'good');
    setTimeout(function () {
      busy = false;
      GK.finish(f, {
        title: perfect ? 'Perfect tower!' : 'Tower moved!',
        text: 'You used ' + moves + ' moves. The fewest for ' + n + ' discs is ' + best() + '.' + (n < 6 ? ' Ready for ' + (n + 1) + ' discs? Pick the next level.' : ' That is the hardest level. Can you match ' + best() + ' moves?'),
        sheet: root.dataset.sheet, onReplay: start, again: 'Play this level again',
      });
    }, 1400);
  }

  document.addEventListener('keydown', function (e) {
    if (!pegBtns || !document.body.contains(pegBtns[0]) || ['1', '2', '3'].indexOf(e.key) < 0) return;
    tapPeg(+e.key - 1);
  });

  f = GK.frame({ root: root, levels: [{ key: '3', label: '3 discs' }, { key: '4', label: '4 discs' }, { key: '5', label: '5 discs' }, { key: '6', label: '6 discs' }], onLevel: start });
  start();
})();
