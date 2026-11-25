(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  /* Hindi Ginti: animal customers order fruit at Chiku the parrot's stall in Hindi number words.
     Number words checked against two Hindi number lists read on 2026-11-25 (spellings पाँच and छह). */
  var W = [null,
    ['एक', 'ek'], ['दो', 'do'], ['तीन', 'teen'], ['चार', 'chaar'], ['पाँच', 'paanch'],
    ['छह', 'chhah'], ['सात', 'saat'], ['आठ', 'aath'], ['नौ', 'nau'], ['दस', 'das'],
    ['ग्यारह', 'gyaarah'], ['बारह', 'baarah'], ['तेरह', 'terah'], ['चौदह', 'chaudah'], ['पंद्रह', 'pandrah'],
    ['सोलह', 'solah'], ['सत्रह', 'satrah'], ['अठारह', 'athaarah'], ['उन्नीस', 'unnees'], ['बीस', 'bees']];
  var DIG = '०१२३४५६७८९';
  function dev(n) { return String(n).split('').map(function (c) { return DIG[+c]; }).join(''); }
  var ROUNDS = 8;
  var RANGE = { small: [1, 5], mid: [6, 10], big: [11, 20] };
  var FRUITS = [
    { k: 'mangoes', one: 'mango', c: '#f6a623', d: '#c97a0a' },
    { k: 'apples', one: 'apple', c: '#e0473c', d: '#a82a22' },
    { k: 'oranges', one: 'orange', c: '#f28a1e', d: '#b9600a' },
    { k: 'plums', one: 'plum', c: '#8a4fc4', d: '#5d2f8e' },
  ];
  var ANIMALS = ['rabbit', 'cat', 'bear', 'elephant', 'mouse'];
  var NS = 'http://www.w3.org/2000/svg';
  var f, done, task, busy = false, basket, items, countEl, custEl, parrot, jar, crate, bubble, lastN = 0, drag = null, skipClick = false;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function E(t, a, k) { return GK.el(t, a, k); }

  /* ---------- Art ---------- */
  function svg(vb, cls, html) { var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); s.innerHTML = html; return s; }
  function fruitHtml(fr, x, y, r) {
    var shape = fr.one === 'mango' ? '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r * 0.82 + '" ry="' + r + '" transform="rotate(-25 ' + x + ' ' + y + ')"' : '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"';
    return shape + ' fill="' + fr.c + '" stroke="' + fr.d + '" stroke-width="' + Math.max(2, r / 7) + '"/>' +
      '<circle cx="' + (x - r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + r * 0.22 + '" fill="#fff" opacity=".55"/>' +
      '<path d="M' + x + ' ' + (y - r) + ' q' + r * 0.5 + ' ' + (-r * 0.6) + ' ' + r * 0.9 + ' ' + (-r * 0.3) + ' q' + (-r * 0.4) + ' ' + r * 0.5 + ' ' + (-r * 0.9) + ' ' + r * 0.3 + 'z" fill="#4fa84a"/>';
  }
  function fruitSvg(fr, cls) { return svg('0 0 60 60', cls || 'gk-hg-fr', fruitHtml(fr, 30, 34, 20)); }
  function boxSvg(fr) {
    var h = '<rect x="4" y="16" width="92" height="50" rx="6" fill="#d9a066" stroke="#7a4a1e" stroke-width="4"/>';
    for (var i = 0; i < 10; i++) h += fruitHtml(fr, 16 + (i % 5) * 17, i < 5 ? 14 : 24, 7.5);
    h += '<rect x="4" y="30" width="92" height="36" rx="6" fill="#e8b47a" stroke="#7a4a1e" stroke-width="4"/>';
    h += '<text x="50" y="58" text-anchor="middle" font-size="22" font-weight="800" fill="#5a3514">10</text>';
    return svg('0 0 100 70', 'gk-hg-boxsvg', h);
  }
  function animalSvg(kind) {
    var col = { rabbit: '#f3f0ea', cat: '#f2b15a', bear: '#b07a4a', elephant: '#a9b4c2', mouse: '#c9c2ba' }[kind];
    var ear = '';
    if (kind === 'rabbit') ear = '<ellipse cx="44" cy="22" rx="10" ry="26" fill="' + col + '" stroke="#2a2522" stroke-width="4"/><ellipse cx="76" cy="22" rx="10" ry="26" fill="' + col + '" stroke="#2a2522" stroke-width="4"/><ellipse cx="44" cy="24" rx="4" ry="16" fill="#f5a3b5"/><ellipse cx="76" cy="24" rx="4" ry="16" fill="#f5a3b5"/>';
    else if (kind === 'cat') ear = '<path d="M28 50 L34 14 L56 34 Z M92 50 L86 14 L64 34 Z" fill="' + col + '" stroke="#2a2522" stroke-width="4" stroke-linejoin="round"/>';
    else if (kind === 'bear') ear = '<circle cx="34" cy="36" r="13" fill="' + col + '" stroke="#2a2522" stroke-width="4"/><circle cx="86" cy="36" r="13" fill="' + col + '" stroke="#2a2522" stroke-width="4"/>';
    else if (kind === 'elephant') ear = '<ellipse cx="22" cy="66" rx="20" ry="26" fill="' + col + '" stroke="#2a2522" stroke-width="4"/><ellipse cx="98" cy="66" rx="20" ry="26" fill="' + col + '" stroke="#2a2522" stroke-width="4"/>';
    else ear = '<circle cx="30" cy="40" r="17" fill="' + col + '" stroke="#2a2522" stroke-width="4"/><circle cx="90" cy="40" r="17" fill="' + col + '" stroke="#2a2522" stroke-width="4"/><circle cx="30" cy="40" r="8" fill="#f5a3b5"/><circle cx="90" cy="40" r="8" fill="#f5a3b5"/>';
    var nose = kind === 'elephant' ? '<path d="M60 74 q-4 26 10 34" fill="none" stroke="#2a2522" stroke-width="12" stroke-linecap="round"/><path d="M60 74 q-4 26 10 34" fill="none" stroke="' + col + '" stroke-width="5" stroke-linecap="round"/>' : '<ellipse cx="60" cy="76" rx="6" ry="4.5" fill="#2a2522"/>';
    return svg('0 0 120 120', 'gk-hg-ani', ear +
      '<ellipse cx="60" cy="68" rx="38" ry="36" fill="' + col + '" stroke="#2a2522" stroke-width="4"/>' +
      '<g class="gk-hg-eyes"><circle cx="46" cy="62" r="5" fill="#2a2522"/><circle cx="74" cy="62" r="5" fill="#2a2522"/><circle cx="47.5" cy="60.5" r="1.6" fill="#fff"/><circle cx="75.5" cy="60.5" r="1.6" fill="#fff"/></g>' +
      '<circle cx="36" cy="78" r="6" fill="#f59a9a" opacity=".7"/><circle cx="84" cy="78" r="6" fill="#f59a9a" opacity=".7"/>' + nose +
      '<path class="gk-hg-smile" d="M50 86 Q60 94 70 86" fill="none" stroke="#2a2522" stroke-width="3.5" stroke-linecap="round"/>');
  }
  function parrotSvg() {
    return svg('0 0 120 150', 'gk-hg-parrot',
      '<rect x="8" y="128" width="104" height="10" rx="5" fill="#8a5a22"/>' +
      '<path d="M62 118 q14 22 6 30 q-10 -8 -14 -28z" fill="#2f7fd0" stroke="#2a2522" stroke-width="3"/>' +
      '<ellipse cx="60" cy="88" rx="30" ry="40" fill="#5cb85c" stroke="#2a2522" stroke-width="4"/>' +
      '<path class="gk-hg-wing" d="M40 80 q-22 20 -4 48 q18 -6 18 -30z" fill="#3f9a43" stroke="#2a2522" stroke-width="3.5"/>' +
      '<ellipse cx="60" cy="98" rx="16" ry="22" fill="#b7e58f"/>' +
      '<circle cx="60" cy="44" r="26" fill="#5cb85c" stroke="#2a2522" stroke-width="4"/>' +
      '<path d="M74 44 q20 2 14 22 q-8 -4 -16 -8z" fill="#e0473c" stroke="#2a2522" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<circle cx="62" cy="38" r="8" fill="#fff" stroke="#2a2522" stroke-width="2"/><circle class="gk-hg-pupil" cx="64" cy="38" r="3.5" fill="#2a2522"/>' +
      '<path d="M50 20 q6 -16 18 -10 q-6 4 -8 12z" fill="#f2c230" stroke="#2a2522" stroke-width="3"/>' +
      '<path d="M52 128 v-8 M68 128 v-8" stroke="#f08a24" stroke-width="5" stroke-linecap="round"/>');
  }
  function stallSvg() {
    var h = '<rect width="800" height="300" fill="#fff2d6"/><rect y="236" width="800" height="64" fill="#d9a066"/><rect y="236" width="800" height="8" fill="#b07a4a"/>';
    for (var i = 0; i < 10; i++) h += '<path d="M' + i * 80 + ' 0 h80 v34 q-20 18 -40 0 q-20 18 -40 0z" fill="' + (i % 2 ? '#fff8ec' : '#e0574a') + '"/>';
    h += '<g opacity=".25" fill="#f2a541"><circle cx="120" cy="110" r="40"/><circle cx="690" cy="120" r="50"/></g>';
    var b = svg('0 0 800 300', 'gk-hg-bg', h); b.setAttribute('preserveAspectRatio', 'xMidYMax slice'); return b;
  }

  /* ---------- Rounds ---------- */
  function newTask() {
    var r = RANGE[f.level], n;
    do { n = GK.rand(r[0], r[1]); } while (n === lastN);
    lastN = n;
    return { n: n, fr: GK.pick(FRUITS), ani: ANIMALS[done % ANIMALS.length] };
  }

  function start() {
    done = 0; busy = false; lastN = 0; f.progress(0, ROUNDS);
    f.area.innerHTML = '';
    var scene = E('div', { class: 'gk-hg-scene' });
    scene.appendChild(stallSvg());
    parrot = E('div', { class: 'gk-hg-chiku' }, [parrotSvg()]);
    jar = E('div', { class: 'gk-hg-jar', 'aria-label': 'Coin jar' });
    custEl = E('div', { class: 'gk-hg-cust' });
    bubble = E('div', { class: 'gk-hg-bubble', 'aria-live': 'polite' });
    scene.appendChild(E('div', { class: 'gk-hg-left' }, [parrot, jar]));
    scene.appendChild(E('div', { class: 'gk-hg-mid' }, [bubble, custEl]));
    f.area.appendChild(scene);
    crate = E('div', { class: 'gk-hg-crate', role: 'group', 'aria-label': 'Fruit crate' });
    basket = E('div', { class: 'gk-hg-basket', 'data-drop': '1', role: 'group', 'aria-label': 'Basket' });
    countEl = E('p', { class: 'gk-hg-count', 'aria-live': 'polite' });
    var give = E('button', { type: 'button', class: 'gk-big gk-hg-give', text: 'Give the basket 🧺' });
    give.addEventListener('click', check);
    var empty = E('button', { type: 'button', class: 'gk-tool', text: '↺ Empty basket' });
    empty.addEventListener('click', function () { if (busy) return; items = []; drawBasket(); GK.sfx.flip(); });
    var hear = E('button', { type: 'button', class: 'gk-tool', text: '🦜 Count with Chiku' });
    hear.addEventListener('click', countAlong);
    f.area.appendChild(E('div', { class: 'gk-hg-shop' }, [crate, E('div', { class: 'gk-hg-bwrap' }, [basket, countEl])]));
    f.area.appendChild(E('div', { class: 'gk-tools' }, [give, empty, hear]));
    round();
  }

  function round() {
    task = newTask(); items = []; busy = false;
    custEl.innerHTML = ''; custEl.appendChild(animalSvg(task.ani));
    custEl.classList.remove('gk-hg-happy', 'gk-hg-leave'); if (!still) { custEl.classList.remove('gk-hg-come'); void custEl.offsetWidth; custEl.classList.add('gk-hg-come'); }
    var w = W[task.n];
    bubble.innerHTML = '';
    bubble.appendChild(E('strong', { class: 'gk-hg-word', text: w[0] }));
    bubble.appendChild(E('span', { class: 'gk-hg-ask' }, [fruitSvg(task.fr, 'gk-hg-mini')]));
    bubble.appendChild(E('span', { class: 'gk-hg-ask gk-hg-pl', text: 'please!' }));
    var help = f.level === 'small' ? w[1] + ' = ' + task.n + ' ' + (task.n === 1 ? task.fr.one : task.fr.k) : 'Say it: ' + w[1];
    bubble.appendChild(E('span', { class: 'gk-hg-help', text: help }));
    crate.innerHTML = '';
    if (f.level === 'big') {
      var bx = E('button', { type: 'button', class: 'gk-hg-pick gk-hg-box', 'aria-label': 'A box of 10 ' + task.fr.k }, [boxSvg(task.fr)]);
      bx.dataset.v = 10; bindPick(bx); crate.appendChild(bx);
    }
    for (var i = 0; i < (f.level === 'big' ? 3 : 5); i++) {
      var b = E('button', { type: 'button', class: 'gk-hg-pick', 'aria-label': 'One ' + task.fr.one }, [fruitSvg(task.fr)]);
      b.dataset.v = 1; bindPick(b); crate.appendChild(b);
    }
    drawBasket();
    f.say(done === 0 ? (f.level === 'big' ? 'Big orders! A box holds 10. Drag a box, then single fruits.' : 'Read the Hindi number. Drag that many fruits into the basket.') : GK.pick(['A new customer!', 'Here comes someone hungry!', 'Next order, please!']));
  }

  function total() { return items.reduce(function (a, b) { return a + b; }, 0); }
  function drawBasket() {
    basket.innerHTML = '';
    items.forEach(function (v, i) {
      var t = E('button', { type: 'button', class: 'gk-hg-in' + (v === 10 ? ' gk-hg-inbox' : ''), 'aria-label': 'Take out ' + (v === 10 ? 'the box of 10' : 'one ' + task.fr.one) }, [v === 10 ? boxSvg(task.fr) : fruitSvg(task.fr)]);
      t.addEventListener('click', function () { if (busy) return; items.splice(i, 1); GK.sfx.flip(); drawBasket(); });
      basket.appendChild(t);
    });
    if (!items.length) basket.appendChild(E('span', { class: 'gk-hg-empty', text: 'Drop fruit here' }));
    var n = total();
    countEl.innerHTML = '';
    if (!n) { countEl.textContent = 'The basket is empty.'; return; }
    var tens = items.filter(function (v) { return v === 10; }).length * 10, ones = n - tens;
    var lead = tens && ones ? tens + ' + ' + ones + ' = ' : '';
    countEl.appendChild(E('span', { text: 'In the basket: ' + lead }));
    countEl.appendChild(E('strong', { class: 'gk-hg-dig', text: dev(n) }));
    if (n <= 20) { countEl.appendChild(E('strong', { class: 'gk-hg-cw', text: ' ' + W[n][0] })); countEl.appendChild(E('span', { text: ' (' + W[n][1] + ', ' + n + ')' })); }
    else countEl.appendChild(E('span', { text: ' (' + n + ', too many!)' }));
  }

  function add(v, from) {
    if (busy) return;
    if (total() + v > 20) { GK.bad(); f.say('The basket is full. Take some out first.', 'bad'); return; }
    items.push(v); items.sort(function (a, b) { return b - a; });
    GK.sfx.count(total()); drawBasket();
    if (!still && from) fly(from);
    var last = basket.lastChild; if (last && last.classList) { last.classList.add('gk-hg-drop'); }
  }
  function fly(from) {
    var r = from.getBoundingClientRect(), t = basket.getBoundingClientRect();
    var g = from.cloneNode(true); g.className = 'gk-hg-flyer'; g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px';
    document.body.appendChild(g);
    requestAnimationFrame(function () { g.style.transform = 'translate(' + (t.left + t.width / 2 - r.left - r.width / 2) + 'px,' + (t.top + 20 - r.top) + 'px) scale(.6)'; g.style.opacity = '0.2'; });
    setTimeout(function () { g.remove(); }, 450);
  }

  function bindPick(b) {
    b.addEventListener('click', function () { if (skipClick) { skipClick = false; return; } add(+b.dataset.v, b); });
    b.addEventListener('pointerdown', function (e) { if (busy || e.button > 0) return; drag = { b: b, x: e.clientX, y: e.clientY, g: null }; try { b.setPointerCapture(e.pointerId); } catch (x) {} });
    b.addEventListener('pointermove', function (e) {
      if (!drag || drag.b !== b) return;
      if (!drag.g && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8) {
        var r = b.getBoundingClientRect(); drag.g = b.cloneNode(true); drag.g.className = 'gk-hg-ghost'; drag.g.style.width = r.width + 'px';
        drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; document.body.appendChild(drag.g); GK.sfx.tap();
      }
      if (drag.g) { drag.g.style.left = (e.clientX - drag.dx) + 'px'; drag.g.style.top = (e.clientY - drag.dy) + 'px'; basket.classList.toggle('hover', over(e)); }
    });
    function end(e) {
      if (!drag || drag.b !== b) return;
      var d = drag; drag = null;
      if (d.g) { skipClick = true; setTimeout(function () { skipClick = false; }, 60); d.g.remove(); basket.classList.remove('hover'); if (over(e)) add(+b.dataset.v, null); else GK.sfx.tap(); }
    }
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  }
  function over(e) { var r = basket.getBoundingClientRect(); return e.clientX > r.left - 10 && e.clientX < r.right + 10 && e.clientY > r.top - 16 && e.clientY < r.bottom + 16; }

  function check() {
    if (busy) return;
    var n = total(), want = task.n, w = W[want];
    if (n === want) {
      busy = true; done++; f.progress(done, ROUNDS);
      GK.good(basket); custEl.classList.add('gk-hg-happy'); parrot.classList.remove('gk-hg-flap'); void parrot.offsetWidth; parrot.classList.add('gk-hg-flap');
      f.say('Well done! ' + w[0] + ' (' + w[1] + ') is ' + want + '. Thank you, Chiku!', 'good');
      setTimeout(function () { GK.sfx.coin(); var c = E('span', { class: 'gk-hg-coin', 'aria-hidden': 'true' }); jar.appendChild(c); jar.setAttribute('aria-label', 'Coin jar with ' + done + ' coins'); }, 500);
      setTimeout(function () { if (!still) custEl.classList.add('gk-hg-leave'); }, 900);
      setTimeout(function () { if (done >= ROUNDS) return end(); round(); }, still ? 1100 : 1700);
    } else {
      GK.bad(); GK.flash(basket, false);
      parrot.classList.remove('gk-hg-tilt'); void parrot.offsetWidth; parrot.classList.add('gk-hg-tilt');
      var tip = n < want ? 'A little more! ' : 'Oops, a few too many. ';
      if (f.level === 'big' && n < want && items.indexOf(10) < 0) tip += 'Try a box of 10 first. ';
      f.say(tip + w[0] + ' means ' + (f.level === 'small' ? want : w[1]) + '. Count again.', 'bad');
    }
  }

  function countAlong() {
    if (busy) return;
    var n = Math.max(1, Math.min(total() || task.n, 20)), shown = f.level === 'small';
    var seq = []; for (var i = 1; i <= Math.min(n, 10); i++) seq.push(i);
    if (n > 10) { seq = [10]; for (var j = 11; j <= n; j++) seq.push(j); }
    seq.forEach(function (k, idx) { setTimeout(function () { GK.sfx.count(k); f.say(W[k][0] + ' ' + W[k][1] + (shown || k <= 10 ? ' (' + k + ')' : '')); }, idx * 650); });
    parrot.classList.remove('gk-hg-flap'); void parrot.offsetWidth; parrot.classList.add('gk-hg-flap');
  }

  function end() {
    var txt = { small: 'You served 8 customers with एक to पाँच (1 to 5).', mid: 'You served 8 customers with छह to दस (6 to 10).', big: 'You packed big orders from ग्यारह to बीस (11 to 20), using boxes of 10.' }[f.level];
    GK.finish(f, { title: 'Chiku’s stall is a hit!', text: txt + ' ' + done + ' coins in the jar!', sheet: root.dataset.sheet, onReplay: start });
    var box = f.area.querySelector('.gk-end');
    if (box) { var j = E('div', { class: 'gk-hg-endjar', 'aria-hidden': 'true' }); for (var i = 0; i < done; i++) j.appendChild(E('span', { class: 'gk-hg-coin' })); box.insertBefore(j, box.children[1]); }
  }

  GK.solve = function () {
    if (busy || !task) return;
    var n = total();
    if (n === task.n) return check();
    if (n > task.n) { items = []; drawBasket(); return; }
    while (total() < task.n) add(task.n - total() >= 10 && f.level === 'big' ? 10 : 1, null);
    check();
  };

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'small', label: '१ to ५ (1 to 5)' }, { key: 'mid', label: '६ to १० (6 to 10)' }, { key: 'big', label: '११ to २० (11 to 20)' }], onLevel: start });
  start();
})();
