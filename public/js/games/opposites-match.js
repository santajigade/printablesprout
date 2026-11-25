(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  /* Opposites Match: balance the seesaw in Seesaw Park by dragging the opposite onto the empty seat. Momo the monkey sits in the middle. */
  var NS = 'http://www.w3.org/2000/svg';
  var K = 'stroke="#2a2522" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
  var P = {
    big: '<circle cx="50" cy="54" r="40" fill="#e0574a" ' + K + '/><path d="M14 46 Q50 66 86 46" fill="none" stroke="#fff" stroke-width="8"/>',
    small: '<circle cx="50" cy="74" r="14" fill="#e0574a" ' + K + '/><path d="M37 71 Q50 78 63 71" fill="none" stroke="#fff" stroke-width="4"/>',
    hot: '<path d="M22 44 h46 v32 q0 14 -14 14 h-18 q-14 0 -14 -14z" fill="#f08a24" ' + K + '/><path d="M68 52 q16 0 16 12 q0 12 -16 12" fill="none" ' + K + '/><path d="M34 34 q-6 -8 0 -14 q6 -6 0 -14 M48 34 q-6 -8 0 -14 q6 -6 0 -14" fill="none" stroke="#c2541b" stroke-width="4" stroke-linecap="round"/>',
    cold: '<rect x="24" y="30" width="52" height="52" rx="8" fill="#bfe6ff" ' + K + '/><path d="M34 42 l10 0 M34 52 l6 0" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M50 8 v16 M42 12 l16 8 M58 12 l-16 8" stroke="#2f7fd0" stroke-width="3.5" stroke-linecap="round"/>',
    day: '<rect x="4" y="4" width="92" height="92" rx="14" fill="#bfe3ff"/><circle cx="50" cy="50" r="20" fill="#ffd23f" ' + K + '/><g stroke="#f2a541" stroke-width="5" stroke-linecap="round"><path d="M50 14 v8 M50 78 v8 M14 50 h8 M78 50 h8 M24 24 l6 6 M70 70 l6 6 M76 24 l-6 6 M30 70 l-6 6"/></g>',
    night: '<rect x="4" y="4" width="92" height="92" rx="14" fill="#2b3a67"/><path d="M60 22 a28 28 0 1 0 14 48 a22 22 0 1 1 -14 -48z" fill="#ffe9a6" ' + K + '/><g fill="#fff"><circle cx="24" cy="24" r="3"/><circle cx="30" cy="70" r="2.5"/><circle cx="80" cy="20" r="2.5"/></g>',
    happy: '<circle cx="50" cy="50" r="40" fill="#ffd23f" ' + K + '/><circle cx="36" cy="42" r="5" fill="#2a2522"/><circle cx="64" cy="42" r="5" fill="#2a2522"/><path d="M30 58 Q50 80 70 58" fill="none" ' + K + '/>',
    sad: '<circle cx="50" cy="50" r="40" fill="#9fc6e8" ' + K + '/><circle cx="36" cy="44" r="5" fill="#2a2522"/><circle cx="64" cy="44" r="5" fill="#2a2522"/><path d="M32 72 Q50 56 68 72" fill="none" ' + K + '/><path d="M64 52 q-5 9 0 12 q5 -3 0 -12z" fill="#2f7fd0"/>',
    full: '<path d="M28 14 h44 l-6 74 h-32z" fill="#fff" ' + K + '/><path d="M30 24 h40 l-5 62 h-30z" fill="#f2a541"/><circle cx="44" cy="50" r="3" fill="#fff" opacity=".7"/><circle cx="54" cy="66" r="2.5" fill="#fff" opacity=".7"/>',
    empty: '<path d="M28 14 h44 l-6 74 h-32z" fill="#fff" ' + K + '/><path d="M36 22 l-2 24" stroke="#cfe6f5" stroke-width="5" stroke-linecap="round"/>',
    open: '<rect x="20" y="10" width="54" height="84" fill="#3a2f2a" ' + K + '/><path d="M74 10 l16 8 v70 l-16 6z" fill="#c98d52" ' + K + '/><circle cx="84" cy="54" r="3" fill="#2a2522"/>',
    closed: '<rect x="20" y="10" width="54" height="84" fill="#c98d52" ' + K + '/><rect x="28" y="20" width="38" height="28" rx="3" fill="none" stroke="#8a5a22" stroke-width="3"/><circle cx="64" cy="58" r="4" fill="#2a2522"/>',
    up: '<path d="M50 62 q-4 14 2 30" fill="none" stroke="#2a2522" stroke-width="2.5"/><ellipse cx="50" cy="34" rx="22" ry="27" fill="#d62976" ' + K + '/><path d="M46 61 h8 l-4 5z" fill="#d62976" ' + K + '/><path d="M86 70 v-50 M78 30 l8 -10 8 10" fill="none" stroke="#5cb85c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    down: '<path d="M4 92 h92" stroke="#8a5a22" stroke-width="5"/><ellipse cx="50" cy="66" rx="20" ry="24" fill="#d62976" ' + K + '/><path d="M14 20 v50 M6 60 l8 10 8 -10" fill="none" stroke="#e0574a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    tall: '<rect x="44" y="40" width="12" height="56" fill="#8a5a22" ' + K + '/><ellipse cx="50" cy="28" rx="22" ry="26" fill="#5cb85c" ' + K + '/>',
    short: '<rect x="45" y="80" width="10" height="16" fill="#8a5a22" ' + K + '/><ellipse cx="50" cy="72" rx="20" ry="12" fill="#5cb85c" ' + K + '/>',
    fast: '<path d="M18 62 h62 q8 0 8 -8 l-10 -14 h-30 l-12 10 h-14 q-6 0 -6 6z" fill="#2f7fd0" ' + K + '/><circle cx="34" cy="66" r="9" fill="#3a3330" ' + K + '/><circle cx="72" cy="66" r="9" fill="#3a3330" ' + K + '/><path d="M2 40 h14 M0 52 h10 M4 30 h16" stroke="#f2a541" stroke-width="4" stroke-linecap="round"/>',
    slow: '<path d="M14 78 h60 q10 0 12 -10" fill="#9ed37a" ' + K + '/><circle cx="46" cy="58" r="20" fill="#f2b15a" ' + K + '/><path d="M46 58 m-10 0 a10 10 0 1 1 10 10" fill="none" stroke="#8a5a22" stroke-width="3"/><path d="M76 74 v-20 M84 72 v-18" stroke="#2a2522" stroke-width="3"/><circle cx="76" cy="52" r="3" fill="#2a2522"/><circle cx="84" cy="52" r="3" fill="#2a2522"/>',
    long: '<g transform="rotate(-20 50 50)"><rect x="2" y="42" width="78" height="16" fill="#f2c230" ' + K + '/><path d="M80 42 l16 8 -16 8z" fill="#f6d8a8" ' + K + '/><rect x="2" y="42" width="10" height="16" fill="#f59a9a" ' + K + '/></g>',
    shortp: '<g transform="rotate(-20 50 50)"><rect x="36" y="42" width="26" height="16" fill="#f2c230" ' + K + '/><path d="M62 42 l16 8 -16 8z" fill="#f6d8a8" ' + K + '/><rect x="30" y="42" width="8" height="16" fill="#f59a9a" ' + K + '/></g>',
    on: '<circle cx="50" cy="34" r="30" fill="#fff2a8" opacity=".8"/><path d="M34 54 q-10 -12 -6 -26 q6 -18 22 -18 q16 0 22 18 q4 14 -6 26 v10 h-32z" fill="#ffd23f" ' + K + '/><rect x="36" y="66" width="28" height="14" rx="3" fill="#a9b4c2" ' + K + '/><path d="M42 90 h16" ' + K + '/>',
    off: '<path d="M34 54 q-10 -12 -6 -26 q6 -18 22 -18 q16 0 22 18 q4 14 -6 26 v10 h-32z" fill="#e6e6e6" ' + K + '/><rect x="36" y="66" width="28" height="14" rx="3" fill="#a9b4c2" ' + K + '/><path d="M42 90 h16" ' + K + '/>',
  };
  // a and b are opposites. word is what the card says. oneWay: only show "a" as the prompt (short has two opposites)
  var PAIRS = [
    { a: 'big', b: 'small', s: ['An elephant is not small. It is ___.', 'A mouse is not big. It is ___.'] },
    { a: 'hot', b: 'cold', s: ['Soup on the stove is not cold. It is ___.', 'Snow is not hot. Snow is ___.'] },
    { a: 'day', b: 'night', s: ['We see the stars at ___.', 'The sun is up. It is ___.'], sAns: ['night', 'day'] },
    { a: 'happy', b: 'sad', s: ['He lost his kite. He feels ___.', 'It is her birthday party. She feels ___.'], sAns: ['sad', 'happy'] },
    { a: 'full', b: 'empty', s: ['I drank all my milk. My cup is ___.', 'The cookie jar has lots of cookies. It is ___.'], sAns: ['empty', 'full'] },
    { a: 'open', b: 'closed', s: ['The door is not closed. It is ___.', 'The shop is not open at night. It is ___.'] },
    { a: 'up', b: 'down', s: ['The balloon floats ___ to the sky.', 'The ball rolls ___ the hill.'], sAns: ['up', 'down'] },
    { a: 'tall', b: 'short', bPic: 'short', oneWay: true, s: ['A giraffe is not short. It is ___.'] },
    { a: 'fast', b: 'slow', s: ['A race car is not slow. It is ___.', 'A snail is not fast. It is ___.'] },
    { a: 'long', b: 'short', bPic: 'shortp', oneWay: true, s: ['A train is not short. It is ___.'] },
    { a: 'on', b: 'off', s: ['It is dark. Turn the light ___.', 'Time for bed. Turn the light ___.'], sAns: ['on', 'off'] },
  ];
  var ROUNDS = { pictures: 10, words: 10, sentences: 8 };
  var f, done, task, busy = false, plank, leftSeat, rightSeat, tray, momo, flowers, sentEl, last = -1, drag = null, skipClick = false;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function E(t, a, k) { return GK.el(t, a, k); }

  function pic(key) { var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 100 100'); s.setAttribute('class', 'gk-om-pic'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = P[key]; return s; }
  function card(word, picKey, opts) {
    opts = opts || {};
    var c = E(opts.btn ? 'button' : 'div', { class: 'gk-om-card' + (picKey ? '' : ' gk-om-wordonly') });
    if (opts.btn) { c.type = 'button'; c.setAttribute('aria-label', word); }
    if (picKey) c.appendChild(pic(picKey));
    c.appendChild(E('span', { class: 'gk-om-word', text: word }));
    c.dataset.word = word;
    return c;
  }
  function momoSvg() {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 120 120'); s.setAttribute('class', 'gk-om-momo'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML =
      '<path class="gk-om-tail" d="M86 92 q30 -4 24 -32 q-4 -12 -14 -6" fill="none" stroke="#8a5a22" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="60" cy="88" rx="28" ry="24" fill="#a0682f" stroke="#2a2522" stroke-width="4"/><ellipse cx="60" cy="92" rx="16" ry="15" fill="#f1cf9d"/>' +
      '<g class="gk-om-arms"><path d="M34 80 q-18 -8 -20 -26" fill="none" stroke="#a0682f" stroke-width="10" stroke-linecap="round"/><path d="M86 80 q18 -8 20 -26" fill="none" stroke="#a0682f" stroke-width="10" stroke-linecap="round"/></g>' +
      '<circle cx="28" cy="40" r="12" fill="#f1cf9d" stroke="#2a2522" stroke-width="4"/><circle cx="92" cy="40" r="12" fill="#f1cf9d" stroke="#2a2522" stroke-width="4"/>' +
      '<circle cx="60" cy="42" r="30" fill="#a0682f" stroke="#2a2522" stroke-width="4"/>' +
      '<path d="M38 46 q0 -16 22 -14 q22 -2 22 14 q0 20 -22 20 q-22 0 -22 -20z" fill="#f1cf9d"/>' +
      '<g class="gk-om-eyes"><circle cx="50" cy="42" r="4.5" fill="#2a2522"/><circle cx="70" cy="42" r="4.5" fill="#2a2522"/></g>' +
      '<path class="gk-om-mouth" d="M50 54 Q60 62 70 54" fill="none" stroke="#2a2522" stroke-width="3.5" stroke-linecap="round"/>';
    return s;
  }
  function parkSvg() {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 800 340'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('class', 'gk-om-bg'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<rect width="800" height="340" fill="#d8f0ff"/><circle cx="90" cy="64" r="30" fill="#ffd95a"/>' +
      '<g fill="#fff"><ellipse cx="560" cy="58" rx="54" ry="18"/><ellipse cx="598" cy="44" rx="30" ry="16"/><ellipse cx="300" cy="40" rx="34" ry="12"/></g>' +
      '<path d="M0 250 Q200 200 400 240 T800 230 L800 340 L0 340 Z" fill="#9ed37a"/><path d="M0 290 Q260 260 520 292 T800 286 L800 340 L0 340 Z" fill="#7bbf5c"/>' +
      '<g fill="#4f8a3a"><circle cx="720" cy="200" r="30"/><circle cx="748" cy="214" r="22"/></g><rect x="716" y="220" width="10" height="34" fill="#8a5a22"/>';
    return s;
  }

  function newTask() {
    var L = f.level, i, p, flip;
    do { i = GK.rand(0, PAIRS.length - 1); } while (i === last);
    last = i; p = PAIRS[i];
    if (L === 'sentences') {
      var k = GK.rand(0, p.s.length - 1), ans = p.sAns ? p.sAns[k] : (k === 0 ? p.a : p.b);
      if (p.oneWay) ans = p.a;
      var other = ans === p.a ? p.b : p.a;
      var opts = [ans, other];
      while (opts.length < 3) { var q = GK.pick(PAIRS), w = GK.pick([q.a, q.b]); if (opts.indexOf(w) < 0) opts.push(w); }
      return { kind: 'sent', p: p, sent: p.s[k], ans: ans, opts: opts.map(function (w) { return { w: w }; }) };
    }
    flip = !p.oneWay && Math.random() < 0.5;
    var show = flip ? p.b : p.a, want = flip ? p.a : p.b;
    var showPic = flip ? (p.bPic || p.b) : p.a, wantPic = flip ? p.a : (p.bPic || p.b);
    var choices = [{ w: want, pic: wantPic }];
    while (choices.length < 3) {
      var r = GK.pick(PAIRS); if (r === p) continue;
      var pick = Math.random() < 0.5 ? { w: r.a, pic: r.a } : { w: r.b, pic: r.bPic || r.b };
      if (choices.every(function (c) { return c.w !== pick.w; }) && pick.w !== show) choices.push(pick);
    }
    // on the words level one wrong choice is the same word, to check the child is thinking "opposite"
    if (L === 'words' && done > 3) choices[2] = { w: show, pic: showPic };
    return { kind: L, p: p, show: show, showPic: showPic, ans: want, ansPic: wantPic, opts: choices };
  }

  function start() {
    done = 0; busy = false; last = -1; f.progress(0, ROUNDS[f.level]);
    f.area.innerHTML = '';
    var scene = E('div', { class: 'gk-om-scene' });
    scene.appendChild(parkSvg());
    sentEl = E('p', { class: 'gk-om-sent', 'aria-live': 'polite' });
    scene.appendChild(sentEl);
    var saw = E('div', { class: 'gk-om-saw' });
    plank = E('div', { class: 'gk-om-plank' });
    leftSeat = E('div', { class: 'gk-om-seat gk-om-l' });
    rightSeat = E('div', { class: 'gk-om-seat gk-om-r', 'data-drop': '1', 'aria-label': 'Empty seat' });
    plank.appendChild(leftSeat); plank.appendChild(rightSeat);
    momo = E('div', { class: 'gk-om-mwrap' }, [momoSvg()]);
    saw.appendChild(plank); saw.appendChild(momo);
    saw.appendChild(E('div', { class: 'gk-om-pivot', 'aria-hidden': 'true' }));
    scene.appendChild(saw);
    flowers = E('div', { class: 'gk-om-flowers', 'aria-hidden': 'true' });
    for (var i = 0; i < ROUNDS[f.level]; i++) flowers.appendChild(E('span', { class: 'gk-om-fl' }));
    scene.appendChild(flowers);
    f.area.appendChild(scene);
    tray = E('div', { class: 'gk-om-tray', role: 'group', 'aria-label': 'Cards to choose from' });
    f.area.appendChild(tray);
    round();
  }

  function round() {
    task = newTask(); busy = false;
    plank.classList.remove('level'); momo.classList.remove('gk-om-yay', 'gk-om-hmm');
    leftSeat.innerHTML = ''; rightSeat.innerHTML = ''; rightSeat.classList.remove('full');
    rightSeat.appendChild(E('span', { class: 'gk-om-q', text: '?' }));
    if (task.kind === 'sent') {
      sentEl.textContent = task.sent;
      leftSeat.appendChild(E('div', { class: 'gk-om-card gk-om-wordonly gk-om-book' }, [E('span', { class: 'gk-om-word', text: '📖' })]));
    } else {
      sentEl.textContent = 'What is the opposite of ' + task.show.toUpperCase() + '?';
      leftSeat.appendChild(card(task.show, task.kind === 'pictures' ? task.showPic : null));
    }
    tray.innerHTML = '';
    GK.shuffle(task.opts).forEach(function (o) {
      var b = card(o.w, task.kind === 'pictures' ? o.pic : null, { btn: true });
      bind(b); tray.appendChild(b);
    });
    if (done === 0) f.say(task.kind === 'sent' ? 'Read the sentence. Drag the word that fits onto the empty seat.' : 'The seesaw is stuck! Drag the opposite onto the empty seat to balance it.');
  }

  function bind(b) {
    b.addEventListener('click', function () { if (skipClick) { skipClick = false; return; } choose(b); });
    b.addEventListener('pointerdown', function (e) { if (busy || e.button > 0) return; drag = { b: b, x: e.clientX, y: e.clientY, g: null }; try { b.setPointerCapture(e.pointerId); } catch (x) {} });
    b.addEventListener('pointermove', function (e) {
      if (!drag || drag.b !== b) return;
      if (!drag.g && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8) {
        var r = b.getBoundingClientRect(); drag.g = b.cloneNode(true); drag.g.classList.add('gk-om-ghost'); drag.g.style.width = r.width + 'px';
        drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; document.body.appendChild(drag.g); b.classList.add('gk-om-lift'); GK.sfx.tap();
      }
      if (drag.g) { drag.g.style.left = (e.clientX - drag.dx) + 'px'; drag.g.style.top = (e.clientY - drag.dy) + 'px'; rightSeat.classList.toggle('hover', near(e)); }
    });
    function end(e) {
      if (!drag || drag.b !== b) return;
      var d = drag; drag = null;
      if (d.g) { skipClick = true; setTimeout(function () { skipClick = false; }, 60); d.g.remove(); b.classList.remove('gk-om-lift'); rightSeat.classList.remove('hover'); if (near(e)) choose(b); else GK.sfx.tap(); }
    }
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  }
  function near(e) { var r = rightSeat.getBoundingClientRect(); return e.clientX > r.left - 30 && e.clientX < r.right + 30 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40; }

  function choose(b) {
    if (busy) return;
    var w = b.dataset.word;
    if (w === task.ans) {
      busy = true; done++;
      rightSeat.innerHTML = ''; rightSeat.classList.add('full');
      var shown = card(w, task.kind === 'sent' ? null : (task.kind === 'words' ? null : task.ansPic));
      if (task.kind !== 'pictures') { // after a word answer, show both pictures so the meaning is clear
        var pa = task.kind === 'sent' ? (task.ans === task.p.a ? task.p.a : (task.p.bPic || task.p.b)) : task.ansPic;
        shown = card(w, pa);
        if (task.kind === 'words') { leftSeat.innerHTML = ''; leftSeat.appendChild(card(task.show, task.showPic)); }
        else { leftSeat.innerHTML = ''; var oth = task.ans === task.p.a ? (task.p.bPic || task.p.b) : task.p.a; leftSeat.appendChild(card(task.ans === task.p.a ? task.p.b : task.p.a, oth)); }
      }
      shown.classList.add('gk-om-land'); rightSeat.appendChild(shown);
      b.remove();
      plank.classList.add('level'); momo.classList.add('gk-om-yay');
      GK.good(rightSeat); f.progress(done, ROUNDS[f.level]);
      var fl = flowers.children[done - 1]; if (fl) setTimeout(function () { fl.classList.add('on'); GK.sfx.pop(); }, 350);
      if (task.kind === 'sent') sentEl.textContent = task.sent.replace('___', w.toUpperCase());
      f.say(task.kind === 'sent' ? GK.pick(['Yes! That fits.', 'Perfect sentence!', 'Momo loves it!']) : task.show + ' and ' + w + ' are opposites!', 'good');
      setTimeout(function () { if (done >= ROUNDS[f.level]) return end(); round(); }, still ? 1100 : 1900);
    } else {
      GK.bad(); GK.flash(b, false);
      momo.classList.remove('gk-om-hmm'); void momo.offsetWidth; momo.classList.add('gk-om-hmm');
      plank.classList.remove('gk-om-wob'); void plank.offsetWidth; plank.classList.add('gk-om-wob');
      if (task.kind === 'sent') f.say('Hmm, read it again. Which word makes the sentence true?', 'bad');
      else if (w === task.show) f.say('That is the same word! We need the opposite of ' + task.show + '.', 'bad');
      else f.say(w + ' is not the opposite of ' + task.show + '. Think: what is the other end?', 'bad');
    }
  }

  function end() {
    var txt = { pictures: 'You balanced 10 seesaws with picture opposites.', words: 'You read 10 words and found every opposite.', sentences: 'You finished 8 sentences with the right word.' }[f.level];
    GK.finish(f, { title: 'Seesaw Park is in bloom!', text: txt + ' Momo grew a flower for each one.', sheet: root.dataset.sheet, onReplay: start });
    var box = f.area.querySelector('.gk-end');
    if (box) { var row = E('div', { class: 'gk-om-flowers gk-om-endfl', 'aria-hidden': 'true' }); for (var i = 0; i < done; i++) row.appendChild(E('span', { class: 'gk-om-fl on' })); box.insertBefore(row, box.children[1]); }
  }

  GK.solve = function () {
    if (busy || !task) return;
    var b = null; tray.querySelectorAll('.gk-om-card').forEach(function (x) { if (x.dataset.word === task.ans) b = x; });
    if (b) choose(b);
  };

  f = GK.frame({ root: root, rounds: ROUNDS.pictures, levels: [{ key: 'pictures', label: 'Picture opposites' }, { key: 'words', label: 'Word opposites' }, { key: 'sentences', label: 'Finish the sentence' }], onLevel: start });
  start();
})();
