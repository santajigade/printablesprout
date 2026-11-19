(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var GOAL = 10, SETS = { easy: [2, 5, 10], mid: [3, 4, 6], hard: [7, 8, 9, 11, 12], all: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
  var f, done, t0, timer, car, clock, lastQ = '', busy = false, best = {};

  function fmt(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  function start() {
    done = 0; busy = false; clearInterval(timer); t0 = 0;
    f.progress(0); f.area.innerHTML = '';
    var track = GK.el('div', { class: 'gk-track', 'aria-hidden': 'true' });
    car = GK.el('span', { class: 'gk-car', text: '🏎️' });
    track.appendChild(car); track.appendChild(GK.el('span', { class: 'gk-flag', text: '🏁' }));
    clock = GK.el('span', { class: 'gk-timer', text: 'Time 0:00' });
    f.area.appendChild(track); f.area.appendChild(clock);
    f.q = GK.el('p', { class: 'gk-q' }); f.area.appendChild(f.q);
    f.ch = GK.el('div', { class: 'gk-choices' }); f.area.appendChild(f.ch);
    f.say('Tap the right answer to move your car.');
    move(); ask();
  }

  function move() { car.style.left = 'calc(8px + ' + (done / GOAL) + ' * (100% - 110px))'; }

  function ask() {
    var a, b, key;
    do { a = GK.pick(SETS[f.level]); b = GK.rand(1, 12); key = a + 'x' + b; } while (key === lastQ);
    lastQ = key;
    if (Math.random() < 0.5) { var t = a; a = b; b = t; }
    var ans = a * b, opts = [ans];
    var near = [ans + a, ans - a, ans + b, ans - b, ans + 1, ans - 1, ans + 10, (a + 1) * b, a * (b + 1)];
    GK.shuffle(near).forEach(function (n) { if (opts.length < 4 && n > 0 && opts.indexOf(n) < 0) opts.push(n); });
    GK.solve = function () { f.ch.querySelectorAll('button').forEach(function (x) { if (x.textContent === String(ans)) x.click(); }); };
    f.q.textContent = a + ' × ' + b + ' = ?';
    f.ch.innerHTML = '';
    GK.shuffle(opts).forEach(function (o) {
      var btn = GK.el('button', { type: 'button', class: 'gk-choice', text: String(o) });
      btn.addEventListener('click', function () { answer(btn, o === ans, a, b, ans); });
      f.ch.appendChild(btn);
    });
  }

  function answer(btn, ok, a, b, ans) {
    if (busy) return;
    if (!t0) { t0 = Date.now(); timer = setInterval(function () { clock.textContent = 'Time ' + fmt(Date.now() - t0); }, 250); }
    GK.flash(btn, ok);
    if (!ok) {
      GK.bad(); busy = true;
      f.say(a + ' × ' + b + ' = ' + ans + '. Say it out loud, then try the next one.', 'bad');
      f.ch.querySelectorAll('button').forEach(function (x) { if (x.textContent === String(ans)) x.classList.add('gk-ok'); });
      setTimeout(function () { busy = false; ask(); }, 1700);
      return;
    }
    busy = true; done++; GK.good(btn); GK.sfx.vroom(); f.progress(done); move();
    f.say(GK.pick(['Zoom! ', 'Right! ', 'Fast thinking! ']) + a + ' × ' + b + ' = ' + ans, 'good');
    setTimeout(function () {
      busy = false;
      if (done < GOAL) return ask();
      clearInterval(timer);
      var ms = Date.now() - t0, prev = best[f.level], beat = !prev || ms < prev;
      if (beat) best[f.level] = ms;
      GK.finish(f, { title: 'You won the race!', text: 'Your time: ' + fmt(ms) + (prev ? (beat ? '. A new best time!' : '. Best time this visit: ' + fmt(prev) + '.') : '.') + ' Race again to beat it.', sheet: root.dataset.sheet, again: 'Race again', onReplay: start });
    }, 800);
  }

  f = GK.frame({ root: root, rounds: GOAL, levels: [{ key: 'easy', label: '2, 5, 10' }, { key: 'mid', label: '3, 4, 6' }, { key: 'hard', label: '7 to 12' }, { key: 'all', label: 'All mixed' }], onLevel: start });
  start();
})();
