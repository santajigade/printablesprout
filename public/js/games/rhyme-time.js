(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  // Rhyme families. Words in one family rhyme; words in different families do not.
  var FAM = [
    [['cat', '🐱'], ['hat', '🎩'], ['bat', '🦇']],
    [['dog', '🐶'], ['frog', '🐸'], ['log', '🪵']],
    [['bee', '🐝'], ['tree', '🌳'], ['key', '🔑'], ['three', '3️⃣']],
    [['star', '⭐'], ['car', '🚗'], ['jar', '🫙']],
    [['moon', '🌙'], ['spoon', '🥄']],
    [['cake', '🎂'], ['snake', '🐍']],
    [['bear', '🐻'], ['pear', '🍐'], ['chair', '🪑']],
    [['fish', '🐟'], ['dish', '🍽️']],
    [['mouse', '🐭'], ['house', '🏠']],
    [['goat', '🐐'], ['boat', '⛵'], ['coat', '🧥']],
    [['bell', '🔔'], ['shell', '🐚']],
    [['rain', '🌧️'], ['train', '🚆'], ['plane', '✈️']],
    [['sock', '🧦'], ['clock', '🕒'], ['rock', '🪨']],
    [['ball', '⚽'], ['wall', '🧱']],
    [['box', '📦'], ['fox', '🦊']],
    [['hen', '🐔'], ['pen', '🖊️'], ['ten', '🔟']],
    [['nose', '👃'], ['rose', '🌹']],
    [['bed', '🛏️'], ['bread', '🍞']],
    [['snail', '🐌'], ['whale', '🐋'], ['pail', '🪣']],
    [['kite', '🪁'], ['light', '💡']],
  ];
  var ROUNDS = 10, ROUNDS3 = 8;
  var f, done, busy = false, last = -1, picked = null;

  function rounds() { return f.level === 'pairs' ? ROUNDS3 : ROUNDS; }
  function famOf(w) { for (var i = 0; i < FAM.length; i++) for (var j = 0; j < FAM[i].length; j++) if (FAM[i][j][0] === w) return i; return -1; }
  function card(w, big) {
    return GK.el('span', { class: 'gk-rt-card' + (big ? ' gk-rt-target' : '') }, [
      GK.el('span', { class: 'gk-rt-pic', 'aria-hidden': 'true', text: w[1] }),
      GK.el('span', { class: 'gk-rt-word', text: w[0] }),
    ]);
  }

  function start() {
    done = 0; last = -1; busy = false; f.progress(0, rounds());
    f.say(f.level === 'pairs' ? 'Find the two pictures that rhyme. Tap one, then the other.' : 'Say the word out loud. Which picture rhymes with it?');
    round();
  }

  function others(fi, n, avoidLetter) {
    var pool = [];
    FAM.forEach(function (fam, i) { if (i !== fi) fam.forEach(function (w) { pool.push(w); }); });
    pool = GK.shuffle(pool);
    var out = [], used = {};
    if (avoidLetter) { // tricky level: start with words that begin with the same letter, so the child must listen to the end
      pool.forEach(function (w) { if (out.length < n && w[0][0] === avoidLetter && !used[famOf(w[0])]) { out.push(w); used[famOf(w[0])] = 1; } });
    }
    pool.forEach(function (w) { if (out.length < n && !used[famOf(w[0])]) { out.push(w); used[famOf(w[0])] = 1; } });
    return out;
  }

  function round() {
    picked = null;
    var fi; do { fi = GK.rand(0, FAM.length - 1); } while (fi === last); last = fi;
    var fam = GK.shuffle(FAM[fi]);
    f.area.innerHTML = '';
    if (f.level === 'pairs') return pairsRound(fam, fi);
    var target = fam[0], answer = fam[1];
    var n = f.level === 'easy' ? 3 : 4;
    var opts = GK.shuffle([answer].concat(others(fi, n - 1, f.level === 'tricky' ? target[0][0] : '')));
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'What rhymes with...' }));
    f.area.appendChild(card(target, true));
    var ch = GK.el('div', { class: 'gk-choices gk-rt-choices' + (n === 3 ? ' gk-rt-n3' : '') });
    opts.forEach(function (o) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-rt-btn', 'aria-label': o[0] }, [card(o)]);
      b.addEventListener('click', function () { answerOne(b, o, target, answer); });
      ch.appendChild(b);
    });
    f.area.appendChild(ch);
    GK.solve = function () { if (busy) return; ch.querySelectorAll('button')[opts.indexOf(answer)].click(); };
  }

  function answerOne(btn, o, target, answer) {
    if (busy) return;
    var ok = o === answer;
    GK.flash(btn, ok);
    if (!ok) {
      GK.bad();
      f.say(target[0] + ' and ' + o[0] + ' do not end the same way. Say them both and listen to the end.', 'bad');
      return;
    }
    busy = true; GK.good(btn); next(target[0] + ' and ' + o[0] + ' rhyme!');
  }

  function pairsRound(fam, fi) {
    var pair = [fam[0], fam[1]];
    var cards = GK.shuffle(pair.concat(others(fi, 3, '')));
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'Find the rhyming pair' }));
    var ch = GK.el('div', { class: 'gk-choices gk-rt-choices gk-rt-five' });
    var btns = [];
    cards.forEach(function (c) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-rt-btn', 'aria-label': c[0], 'aria-pressed': 'false' }, [card(c)]);
      b.addEventListener('click', function () { tapPair(b, c, pair, btns); });
      btns.push(b); ch.appendChild(b);
    });
    f.area.appendChild(ch);
    GK.solve = function () {
      if (busy) return;
      var a = btns[cards.indexOf(pair[0])], b = btns[cards.indexOf(pair[1])];
      if (picked && picked.b !== a) { tapPair(picked.b, picked.c, pair, btns); }
      if (!picked) a.click();
      if (!busy) b.click();
    };
  }

  function tapPair(btn, c, pair, btns) {
    if (busy) return;
    if (!picked) {
      picked = { b: btn, c: c }; btn.classList.add('gk-rt-sel'); btn.setAttribute('aria-pressed', 'true'); GK.sfx.tap();
      f.say(c[0] + '... now tap the word that rhymes with ' + c[0] + '.');
      return;
    }
    if (picked.b === btn) { btn.classList.remove('gk-rt-sel'); btn.setAttribute('aria-pressed', 'false'); picked = null; GK.sfx.tap(); f.say('Pick any picture to start again.'); return; }
    var first = picked; picked = null;
    first.b.classList.remove('gk-rt-sel'); first.b.setAttribute('aria-pressed', 'false');
    var ok = famOf(first.c[0]) === famOf(c[0]);
    if (!ok) {
      GK.flash(btn, false); GK.bad();
      f.say(first.c[0] + ' and ' + c[0] + ' do not rhyme. Try another pair.', 'bad');
      return;
    }
    busy = true; GK.flash(first.b, true); GK.flash(btn, true); GK.good(btn);
    next(first.c[0] + ' and ' + c[0] + ' rhyme!');
  }

  function next(text) {
    done++; f.progress(done, rounds());
    f.say(GK.pick(['Yes! ', 'Great ears! ', 'You got it! ']) + text, 'good');
    setTimeout(function () {
      busy = false;
      if (done >= rounds()) GK.finish(f, { title: 'Rhyme star!', text: 'You matched ' + done + ' rhymes. Can you think of one more word that rhymes with cat?', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1000);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'easy', label: 'Easy' }, { key: 'tricky', label: 'Tricky' }, { key: 'pairs', label: 'Rhyme pairs' }], onLevel: start });
  start();
})();
