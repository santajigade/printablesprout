(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10, MAX = { '5': 5, '10': 10, '20': 20 };
  var THINGS = ['🍎', '⭐', '🦆', '🌸', '🐟', '🎈', '🐞', '🍓', '🚗', '🌻'];
  var f, done, last;

  function start() { done = 0; last = 0; f.progress(0); f.say('Tap each picture to count it, then tap the number.'); round(); }

  function round() {
    var max = MAX[f.level], n;
    do { n = GK.rand(1, max); } while (n === last && max > 1);
    last = n;
    var thing = GK.pick(THINGS), opts = [n];
    while (opts.length < 3) {
      var d = GK.rand(Math.max(1, n - 3), Math.min(max, n + 3));
      if (opts.indexOf(d) < 0) opts.push(d);
      if (max < 3 && opts.length === max) break;
    }
    opts = GK.shuffle(opts);
    f.area.innerHTML = '';
    var box = GK.el('div', { class: 'gk-count', role: 'img', 'aria-label': n + ' pictures to count' });
    var tapped = 0;
    for (var i = 0; i < n; i++) {
      var s = GK.el('span', { text: thing });
      s.addEventListener('click', function () {
        if (this.classList.contains('seen')) return;
        tapped++; this.classList.add('seen', 'tagn'); this.setAttribute('data-n', tapped); GK.sfx.count(tapped);
      });
      box.appendChild(s);
    }
    var ch = GK.el('div', { class: 'gk-choices' });
    opts.forEach(function (o) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice', text: String(o), 'aria-label': 'Answer ' + o });
      b.addEventListener('click', function () { answer(b, o === n, n); });
      ch.appendChild(b);
    });
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'How many?' }));
    f.area.appendChild(box);
    f.area.appendChild(ch);
  }

  var busy = false;
  function answer(btn, ok, n) {
    if (busy) return;
    GK.flash(btn, ok);
    if (!ok) { GK.bad(); f.say('Not quite. Touch each picture and count again.', 'bad'); return; }
    busy = true; GK.good(btn); done++; f.progress(done);
    f.say(GK.pick(['Yes! ', 'Great counting! ', 'You got it! ']) + 'There are ' + n + '.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'You counted them all!', text: 'Ten right answers. Try a bigger level next time.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 900);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: '5', label: 'Up to 5' }, { key: '10', label: 'Up to 10' }, { key: '20', label: 'Up to 20' }], onLevel: start });
  start();
})();
