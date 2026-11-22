(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10;
  var WORDS = {
    three: [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['bus', '🚌'], ['pig', '🐷'], ['hat', '🎩'], ['bed', '🛏️'], ['bee', '🐝'], ['cow', '🐮'], ['fox', '🦊'], ['owl', '🦉'], ['egg', '🥚'], ['key', '🔑'], ['car', '🚗'], ['ant', '🐜'], ['box', '📦']],
    four: [['fish', '🐟'], ['frog', '🐸'], ['duck', '🦆'], ['cake', '🎂'], ['bear', '🐻'], ['lion', '🦁'], ['moon', '🌙'], ['star', '⭐'], ['tree', '🌳'], ['boat', '⛵'], ['kite', '🪁'], ['sock', '🧦'], ['milk', '🥛'], ['bell', '🔔'], ['drum', '🥁'], ['corn', '🌽'], ['crab', '🦀'], ['goat', '🐐'], ['bird', '🐦']],
    long: [['apple', '🍎'], ['horse', '🐴'], ['house', '🏠'], ['train', '🚆'], ['zebra', '🦓'], ['tiger', '🐯'], ['chair', '🪑'], ['bread', '🍞'], ['grapes', '🍇'], ['carrot', '🥕'], ['rabbit', '🐰'], ['turtle', '🐢'], ['banana', '🍌'], ['pencil', '✏️'], ['rocket', '🚀'], ['monkey', '🐵'], ['flower', '🌸'], ['cheese', '🧀'], ['tomato', '🍅'], ['spoon', '🥄'], ['robot', '🤖']],
  };
  var ABC = 'abcdefghijklmnopqrstuvwxyz';
  var f, done, deck, word, pic, pos, busy, slots, tiles, misses;

  function start() {
    done = 0; f.progress(0); deck = GK.shuffle(WORDS[f.level]);
    f.say(f.level === 'long' ? 'One tile is extra. Say the word slowly and listen for each sound.' : 'Say the picture word, then tap the letters in order.');
    round();
  }

  function round() {
    var w = deck[done % deck.length]; word = w[0]; pic = w[1]; pos = 0; busy = false; misses = 0;
    var letters = word.split('');
    if (f.level === 'long') { var x; do { x = GK.pick(ABC.split('')); } while (word.indexOf(x) >= 0); letters.push(x); }
    var mix; do { mix = GK.shuffle(letters); } while (mix.join('') === word);
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('div', { class: 'gk-sb-pic', role: 'img', 'aria-label': 'Picture: ' + word, text: pic }));
    var row = GK.el('div', { class: 'gk-sb-slots', 'aria-label': word.length + ' letters' });
    slots = [];
    for (var i = 0; i < word.length; i++) { var sl = GK.el('span', { class: 'gk-sb-slot' }); slots.push(sl); row.appendChild(sl); }
    f.area.appendChild(row);
    var pile = GK.el('div', { class: 'gk-sb-pile' });
    tiles = [];
    mix.forEach(function (ch) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-sb-tile', text: ch, 'aria-label': 'Letter ' + ch });
      b.addEventListener('click', function () { tap(b, ch); });
      tiles.push(b); pile.appendChild(b);
    });
    f.area.appendChild(pile);
    var hint = GK.el('button', { type: 'button', class: 'gk-tool gk-sb-hint', text: '💡 Show the next letter' });
    hint.addEventListener('click', function () {
      if (busy) return;
      GK.sfx.pop();
      var t = find(word[pos]); if (t) { t.classList.remove('gk-wiggle'); void t.offsetWidth; t.classList.add('gk-wiggle'); }
      f.say('The next letter is ' + word[pos].toUpperCase() + '.');
    });
    f.area.appendChild(hint);
    GK.sfx.flip();
    GK.solve = function () {
      if (busy) return;
      while (pos < word.length && !busy) { var t = find(word[pos]); if (!t) break; t.click(); }
    };
  }

  function find(ch) { for (var i = 0; i < tiles.length; i++) if (!tiles[i].disabled && tiles[i].textContent === ch) return tiles[i]; return null; }

  function tap(btn, ch) {
    if (busy || btn.disabled) return;
    if (ch !== word[pos]) {
      misses++; GK.bad(); GK.flash(btn, false);
      var sofar = word.slice(0, pos);
      f.say(pos === 0 ? 'Not this one. What sound does ' + word + ' start with?' : (misses > 2 ? 'Try the hint button. ' : '') + 'You have "' + sofar + '". What sound comes next?', 'bad');
      return;
    }
    GK.sfx.pop();
    btn.disabled = true; btn.classList.add('gk-sb-used'); btn.classList.remove('gk-wiggle');
    slots[pos].textContent = ch; slots[pos].classList.add('on');
    pos++;
    if (pos < word.length) { f.say(word.slice(0, pos) + '...'); return; }
    busy = true; done++; GK.good(slots[slots.length - 1]); f.progress(done);
    f.area.querySelector('.gk-sb-slots').classList.add('gk-sb-done');
    f.say(GK.pick(['Yes! ', 'You spelled it! ', 'Great spelling! ']) + word.toUpperCase().split('').join(' ') + ' spells ' + word + '.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Super speller!', text: 'Ten words built letter by letter. Try writing three of them on paper.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1500);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'three', label: '3 letters' }, { key: 'four', label: '4 letters' }, { key: 'long', label: '5 and 6 letters' }], onLevel: start });
  start();
})();
