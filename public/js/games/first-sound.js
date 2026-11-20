(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10;
  // [picture, word, letters to keep out of the choices because the picture has another common name]
  // No words start with ch, sh, th, wh, ph, kn, soft c or soft g, and C words keep K out of the choices (and K words keep C out).
  var WORDS = [
    ['🍎', 'apple', ''], ['🐜', 'ant', 'b'], ['🐻', 'bear', 't'], ['🍌', 'banana', ''], ['🎈', 'balloon', ''], ['🐝', 'bee', ''], ['🚌', 'bus', 'v'],
    ['🐱', 'cat', 'k'], ['🐄', 'cow', 'k'], ['🚗', 'car', 'k'], ['🎂', 'cake', 'k'], ['🦆', 'duck', 'b'], ['🥁', 'drum', ''], ['🍩', 'donut', ''],
    ['🥚', 'egg', ''], ['🐘', 'elephant', ''], ['🐟', 'fish', ''], ['🐸', 'frog', 't'], ['🦊', 'fox', 'd'], ['🐐', 'goat', ''], ['🍇', 'grapes', ''],
    ['🎸', 'guitar', ''], ['🎁', 'gift', 'pb'], ['🐴', 'horse', 'p'], ['🎩', 'hat', ''], ['🏠', 'house', ''], ['🍦', 'ice cream', 'c'],
    ['🧃', 'juice', 'd'], ['🔑', 'key', 'c'], ['🪁', 'kite', 'c'], ['🦘', 'kangaroo', 'c'], ['🦁', 'lion', 'c'], ['🍋', 'lemon', ''], ['🍃', 'leaf', ''],
    ['🐒', 'monkey', 'a'], ['🌙', 'moon', ''], ['🐭', 'mouse', 'r'], ['🍄', 'mushroom', ''], ['👃', 'nose', ''], ['🐙', 'octopus', ''],
    ['🍊', 'orange', ''], ['🐷', 'pig', 'h'], ['🍕', 'pizza', ''], ['🐧', 'penguin', 'b'], ['🍐', 'pear', ''], ['👸', 'queen', 'pck'],
    ['🌈', 'rainbow', ''], ['🚀', 'rocket', ''], ['🤖', 'robot', ''], ['☀️', 'sun', ''], ['⭐', 'star', ''], ['🐍', 'snake', ''], ['🧦', 'socks', ''],
    ['🐯', 'tiger', 'c'], ['🍅', 'tomato', ''], ['🐢', 'turtle', ''], ['☂️', 'umbrella', ''], ['🎻', 'violin', 'f'], ['🌋', 'volcano', 'm'],
    ['🍉', 'watermelon', 'm'], ['⌚', 'watch', 'c'], ['🐺', 'wolf', 'd'], ['🧶', 'yarn', 'bw'], ['🦓', 'zebra', 'h'],
  ];
  // Level 1 uses short, clear words whose first sound can be stretched out (mmm, sss, fff) or bounced (b, p, t)
  var EASY = ['bus', 'cat', 'fish', 'hat', 'moon', 'nose', 'pig', 'sun', 'egg', 'apple', 'bee', 'car', 'lion', 'mouse', 'rocket', 'socks', 'cake', 'goat', 'fox', 'duck', 'pizza'];
  var ABC = 'abcdefghijklmnopqrstuvwyz'.split('');
  var LEVELS = { easy: { n: 3, list: WORDS.filter(function (w) { return EASY.indexOf(w[1]) >= 0; }), lower: false }, all: { n: 4, list: WORDS, lower: false }, small: { n: 4, list: WORDS, lower: true } };
  var f, done, deck, busy = false;

  function start() { done = 0; deck = GK.shuffle(LEVELS[f.level].list); f.progress(0); f.say('Say the picture name out loud. What sound does it start with?'); round(); }

  function show(letter) { return LEVELS[f.level].lower ? letter : letter.toUpperCase(); }

  function round() {
    var L = LEVELS[f.level];
    if (!deck.length) deck = GK.shuffle(L.list);
    var w = deck.pop(), first = w[1][0];
    var opts = [first], keep = (w[2] + first).split('');
    while (opts.length < L.n) { var c = GK.pick(ABC); if (keep.indexOf(c) < 0 && opts.indexOf(c) < 0) opts.push(c); }
    opts = GK.shuffle(opts);
    f.area.innerHTML = '';
    var pic = GK.el('div', { class: 'gk-fs-pic', role: 'img', 'aria-label': 'Picture: ' + w[1], text: w[0] });
    var word = GK.el('p', { class: 'gk-fs-word', 'aria-live': 'polite', text: ' ' });
    var hint = GK.el('button', { type: 'button', class: 'gk-tool gk-fs-hint', text: '💡 Hint' });
    hint.addEventListener('click', function () { GK.sfx.tap(); word.textContent = '_' + w[1].slice(1); f.say('The word is ' + w[1] + '. Say it slowly and listen to the start.'); });
    var ch = GK.el('div', { class: 'gk-choices gk-fs-choices gk-fs-n' + L.n });
    opts.forEach(function (o) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-fs-letter', text: show(o), 'aria-label': 'Letter ' + o.toUpperCase() });
      b.addEventListener('click', function () { answer(b, o === first, w, word, o); });
      if (o === first) GK.solve = function () { b.click(); };
      ch.appendChild(b);
    });
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'What does it start with?' }));
    f.area.appendChild(pic); f.area.appendChild(word); f.area.appendChild(ch); f.area.appendChild(hint);
  }

  function answer(btn, ok, w, word, o) {
    if (busy) return;
    GK.flash(btn, ok);
    if (!ok) { GK.bad(); f.say(show(o) + ' is not the one. Say "' + w[1] + '" slowly and try again.', 'bad'); return; }
    busy = true; GK.good(btn); done++; f.progress(done);
    var big = w[1][0].toUpperCase(), cap = LEVELS[f.level].lower ? w[1][0] : big;
    word.innerHTML = ''; word.appendChild(GK.el('b', { text: cap })); word.appendChild(document.createTextNode(w[1].slice(1)));
    f.say(GK.pick(['Yes! ', 'Good listening! ', 'You got it! ']) + w[1].charAt(0).toUpperCase() + w[1].slice(1) + ' starts with ' + big + '.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Super listener!', text: 'You found the first sound in ten words. Try the next level for more letters.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1400);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'easy', label: 'Easy (3 letters)' }, { key: 'all', label: 'ABC (4 letters)' }, { key: 'small', label: 'abc small letters' }], onLevel: start });
  start();
})();
