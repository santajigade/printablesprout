(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  // Each pad has a color, a shape (so children who see colors differently can play) and its own note.
  var PADS = [
    { name: 'red', c: '#e84a5f', s: '♥', n: 0 },
    { name: 'blue', c: '#3d8fd1', s: '●', n: 4 },
    { name: 'yellow', c: '#f2c14e', s: '★', n: 7 },
    { name: 'green', c: '#5cb85c', s: '▲', n: 12 },
    { name: 'purple', c: '#8a5cc7', s: '◆', n: 9 },
    { name: 'orange', c: '#f28a30', s: '■', n: 16 },
  ];
  var LV = {
    small: { pads: 4, from: 1, rounds: 8, gap: 750 },
    big: { pads: 4, from: 3, rounds: 8, gap: 600 },
    six: { pads: 6, from: 3, rounds: 8, gap: 560 },
  };
  var f, cfg, seq, pos, done, mode, btns, playBtn, timers = [];

  function clear() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function start() {
    clear(); cfg = LV[f.level]; done = 0; seq = [];
    for (var i = 0; i < cfg.from; i++) seq.push(GK.rand(0, cfg.pads - 1));
    f.progress(0, cfg.rounds);
    f.area.innerHTML = '';
    var pad = GK.el('div', { class: 'gk-ce-pad gk-ce-n' + cfg.pads });
    btns = [];
    PADS.slice(0, cfg.pads).forEach(function (p, i) {
      var b = GK.el('button', { type: 'button', class: 'gk-ce-btn', 'aria-label': p.name + ' ' + (i + 1), text: p.s });
      b.style.background = p.c;
      b.addEventListener('click', function () { tap(i); });
      btns.push(b); pad.appendChild(b);
    });
    var bar = GK.el('div', { class: 'gk-tools' });
    playBtn = GK.el('button', { type: 'button', class: 'gk-tool', text: '👀 Show again' });
    playBtn.addEventListener('click', function () { if (mode === 'input') show(); });
    var count = GK.el('span', { class: 'gk-ce-count' });
    bar.appendChild(count); bar.appendChild(playBtn);
    f.area.appendChild(pad); f.area.appendChild(bar);
    f.count = count;
    f.say('Watch and listen. Then tap the same colors in the same order.');
    later(show, 900);
  }

  function light(i, ms) {
    var b = btns[i]; b.classList.add('gk-ce-on'); GK.sfx.count(PADS[i].n);
    later(function () { b.classList.remove('gk-ce-on'); }, ms);
  }

  function show() {
    clear(); mode = 'watch'; pos = 0;
    root.classList.add('gk-ce-watching');
    f.count.textContent = 'Steps: ' + seq.length;
    f.say('Watch... ' + seq.length + (seq.length === 1 ? ' step' : ' steps') + '.');
    seq.forEach(function (p, k) { later(function () { light(p, cfg.gap * .6); }, 400 + k * cfg.gap); });
    later(function () { mode = 'input'; root.classList.remove('gk-ce-watching'); f.say('Your turn! Tap the ' + seq.length + (seq.length === 1 ? ' color.' : ' colors in order.')); }, 400 + seq.length * cfg.gap);
  }

  function tap(i) {
    if (mode !== 'input') return;
    if (i !== seq[pos]) {
      GK.flash(btns[i], false); GK.bad(); mode = 'watch';
      f.say('Oops, step ' + (pos + 1) + ' was ' + PADS[seq[pos]].name + '. Watch it one more time.', 'bad');
      later(show, 1500);
      return;
    }
    light(i, 260); pos++;
    if (pos < seq.length) return;
    mode = 'watch'; done++; f.progress(done, cfg.rounds); GK.good(btns[i]);
    if (done >= cfg.rounds) {
      later(function () { GK.finish(f, { title: 'Super memory!', text: 'You echoed a pattern of ' + seq.length + ' colors in a row. That is a big memory!', sheet: root.dataset.sheet, onReplay: start }); }, 800);
      return;
    }
    f.say(GK.pick(['Perfect echo! ', 'You remembered! ', 'Yes! ']) + 'Now one more step.', 'good');
    seq.push(GK.rand(0, cfg.pads - 1));
    later(show, 1200);
  }

  // Test hook: finish the current pattern correctly.
  GK.solve = function () {
    if (mode !== 'input') return;
    var rest = seq.slice(pos);
    rest.forEach(function (p) { if (mode === 'input') tap(p); });
  };

  f = GK.frame({ root: root, rounds: 8, levels: [{ key: 'small', label: 'Start small' }, { key: 'big', label: 'Longer' }, { key: 'six', label: '6 colors' }], onLevel: start });
  start();
})();
