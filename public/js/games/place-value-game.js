(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  /* Place Value Blocks: Bix the beaver runs a block yard. Build each order with hundreds, tens and ones blocks, trade 10 for 1, and stack a tower floor for every number built. */
  var NS = 'http://www.w3.org/2000/svg';
  var ROUNDS = { tens: 8, hundreds: 8, puzzles: 8 };
  var PL = [
    { k: 'h', name: 'hundreds', one: 'hundred', v: 100, label: 'Hundreds' },
    { k: 't', name: 'tens', one: 'ten', v: 10, label: 'Tens' },
    { k: 'o', name: 'ones', one: 'one', v: 1, label: 'Ones' },
  ];
  var MAX = 19;
  var FLOOR = ['#e0574a', '#f2a541', '#7bb661', '#2f7fd0', '#d62976', '#8e6bd1', '#f2c14e', '#3bb3a6'];
  var f, done, task, cnt, busy, used, els = {}, drag = null, skipClick = false;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function E(t, a, k) { return GK.el(t, a, k); }

  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function words(n) {
    var h = Math.floor(n / 100), r = n % 100, out = [];
    if (h) out.push(ONES[h] + ' hundred');
    if (r || !h) out.push(r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? '-' + ONES[r % 10] : ''));
    return out.join(' ');
  }
  function digits(n) { return { h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, o: n % 10 }; }
  function value() { return cnt.h * 100 + cnt.t * 10 + cnt.o; }
  function plural(n, p) { return n + ' ' + (n === 1 ? p.one : p.name); }

  function bixSvg() {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 120 130'); s.setAttribute('class', 'gk-pv-bix'); s.setAttribute('aria-hidden', 'true');
    var K = 'stroke="#2a2522" stroke-width="4" stroke-linejoin="round"';
    s.innerHTML =
      '<g class="gk-pv-tail"><ellipse cx="96" cy="108" rx="22" ry="11" fill="#6b4423" ' + K + ' transform="rotate(-20 96 108)"/><path d="M84 104 l20 -6 M86 112 l20 -6" stroke="#4a2f17" stroke-width="2"/></g>' +
      '<ellipse cx="58" cy="96" rx="30" ry="28" fill="#9a6332" ' + K + '/><ellipse cx="58" cy="102" rx="18" ry="18" fill="#e8c08a"/>' +
      '<ellipse cx="38" cy="122" rx="12" ry="6" fill="#6b4423" ' + K + '/><ellipse cx="78" cy="122" rx="12" ry="6" fill="#6b4423" ' + K + '/>' +
      '<g class="gk-pv-arms"><path d="M32 86 q-14 4 -16 -10" fill="none" stroke="#9a6332" stroke-width="11" stroke-linecap="round"/><path d="M84 86 q14 4 16 -10" fill="none" stroke="#9a6332" stroke-width="11" stroke-linecap="round"/></g>' +
      '<circle cx="34" cy="36" r="9" fill="#9a6332" ' + K + '/><circle cx="82" cy="36" r="9" fill="#9a6332" ' + K + '/>' +
      '<circle cx="58" cy="52" r="28" fill="#9a6332" ' + K + '/><ellipse cx="58" cy="64" rx="17" ry="12" fill="#e8c08a"/>' +
      '<g class="gk-pv-eyes"><circle cx="47" cy="48" r="4.5" fill="#2a2522"/><circle cx="69" cy="48" r="4.5" fill="#2a2522"/><circle cx="48.5" cy="46.5" r="1.5" fill="#fff"/><circle cx="70.5" cy="46.5" r="1.5" fill="#fff"/></g>' +
      '<ellipse cx="58" cy="58" rx="6" ry="4.5" fill="#2a2522"/><path class="gk-pv-mouth" d="M50 64 Q58 70 66 64" fill="none" stroke="#2a2522" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="52" y="67" width="12" height="10" rx="2" fill="#fff" stroke="#2a2522" stroke-width="2.5"/><path d="M58 67 v10" stroke="#2a2522" stroke-width="2"/>' +
      '<path d="M30 34 q0 -26 28 -26 q28 0 28 26z" fill="#f2c14e" ' + K + '/><rect x="24" y="31" width="68" height="8" rx="4" fill="#f2a541" ' + K + '/><path d="M58 10 v22" stroke="#d48a1f" stroke-width="4"/>';
    return s;
  }
  function yardSvg() {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 800 240'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('class', 'gk-pv-bg'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<defs><linearGradient id="gkpvsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs>' +
      '<rect width="800" height="240" fill="url(#gkpvsky)"/><circle cx="700" cy="46" r="26" fill="#ffd95a"/>' +
      '<g fill="#fff"><ellipse cx="220" cy="42" rx="46" ry="14"/><ellipse cx="252" cy="32" rx="26" ry="13"/><ellipse cx="480" cy="56" rx="36" ry="11"/></g>' +
      '<g stroke="#e0a030" stroke-width="6" fill="none"><path d="M560 200 V40 H760"/><path d="M560 60 L600 40 M560 100 L600 40 M600 40 V200"/></g><path d="M740 40 v40" stroke="#2a2522" stroke-width="2"/><rect x="728" y="80" width="24" height="10" fill="#e0a030" stroke="#2a2522" stroke-width="2"/>' +
      '<path d="M0 186 Q200 168 400 182 T800 178 V240 H0Z" fill="#c9a46a"/><path d="M0 212 Q300 200 560 214 T800 208 V240 H0Z" fill="#b48a52"/>';
    return s;
  }
  function blockPic(k) {
    if (k === 'h') return E('span', { class: 'gk-pv-b gk-pv-flat gk-pv-mini' });
    if (k === 't') return E('span', { class: 'gk-pv-b gk-pv-rod gk-pv-mini' });
    return E('span', { class: 'gk-pv-b gk-pv-cube gk-pv-mini' });
  }

  function newTask() {
    var L = f.level, n, kind = 'plain', show, sub = '';
    for (var tries = 0; tries < 50; tries++) {
      if (L === 'tens') n = GK.rand(11, 99);
      else if (L === 'hundreds') {
        n = GK.rand(100, 999);
        if (done === 2 || done === 5) n = Math.floor(n / 100) * 100 + GK.rand(1, 9); // zero tens
        if (done === 4) n = Math.floor(n / 10) * 10; // zero ones
      } else n = GK.rand(102, 989);
      if (used.indexOf(n) < 0) break;
    }
    used.push(n);
    var d = digits(n);
    if (L === 'puzzles') {
      kind = ['words', 'expanded', 'mixed', 'shuffle'][done % 4];
      if (kind === 'words') { show = words(n); sub = 'Read the number word'; }
      else if (kind === 'expanded') { show = [d.h * 100, d.t * 10, d.o].filter(function (x) { return x; }).join(' + '); sub = 'Add the parts'; }
      else if (kind === 'mixed') {
        if (d.h < 1) { n += 100; d = digits(n); }
        // one hundred is given as 10 tens, so the child must trade
        var giveT = d.t + 10; show = (d.h - 1 ? plural(d.h - 1, PL[0]) + ', ' : '') + giveT + ' tens and ' + plural(d.o, PL[2]); sub = 'Too many tens? Trade them';
      } else {
        var bits = GK.shuffle([plural(d.o, PL[2]), plural(d.t, PL[1]), plural(d.h, PL[0])]);
        show = bits.join(', '); sub = 'Mixed up order. Look at each place';
      }
    } else { show = String(n); sub = L === 'tens' ? 'Use tens and ones' : 'Use hundreds, tens and ones'; }
    return { n: n, d: d, kind: kind, show: show, sub: sub };
  }

  var gen = 0;
  function start() {
    gen++; done = 0; busy = false; used = [];
    f.progress(0, ROUNDS[f.level]);
    f.area.innerHTML = '';
    var scene = E('div', { class: 'gk-pv-scene' });
    scene.appendChild(yardSvg());
    els.bix = E('div', { class: 'gk-pv-bixwrap' }, [bixSvg()]);
    els.order = E('div', { class: 'gk-pv-order', 'aria-live': 'polite' });
    els.tower = E('div', { class: 'gk-pv-tower', 'aria-label': 'Tower of numbers you built' });
    scene.appendChild(els.bix); scene.appendChild(els.order); scene.appendChild(els.tower);
    f.area.appendChild(scene);

    els.mat = E('div', { class: 'gk-pv-mat' + (f.level === 'tens' ? ' gk-pv-two' : '') });
    els.cols = {};
    PL.forEach(function (p) {
      if (f.level === 'tens' && p.k === 'h') return;
      var take = E('button', { type: 'button', class: 'gk-pv-take', 'aria-label': 'Take away one ' + p.one, text: '-' });
      take.addEventListener('click', function () { remove(p.k); });
      var stack = E('div', { class: 'gk-pv-stack gk-pv-s' + p.k, 'data-hint': 'Drop ' + p.name + ' here' });
      var dig = E('div', { class: 'gk-pv-digit', text: '0' });
      var trade = null;
      if (p.k !== 'h' && !(f.level === 'tens' && p.k === 't')) {
        trade = E('button', { type: 'button', class: 'gk-pv-trade', text: 'Trade 10 ' + p.name + ' for 1 ' + (p.k === 'o' ? 'ten' : 'hundred') });
        trade.addEventListener('click', function () { doTrade(p.k); });
      }
      var col = E('div', { class: 'gk-pv-col gk-pv-c' + p.k }, [E('div', { class: 'gk-pv-head' }, [E('span', { text: p.label }), take]), stack, trade, dig]);
      els.cols[p.k] = { col: col, stack: stack, dig: dig, trade: trade };
      els.mat.appendChild(col);
    });
    f.area.appendChild(els.mat);

    els.bins = E('div', { class: 'gk-pv-bins', role: 'group', 'aria-label': 'Block bins' });
    PL.forEach(function (p) {
      if (f.level === 'tens' && p.k === 'h') return;
      var b = E('button', { type: 'button', class: 'gk-pv-bin', 'aria-label': 'Add one ' + p.one + ' block' }, [blockPic(p.k), E('span', { class: 'gk-pv-binlab', text: p.one.charAt(0).toUpperCase() + p.one.slice(1) + ' (' + p.v + ')' })]);
      b.dataset.k = p.k; bindBin(b); els.bins.appendChild(b);
    });
    f.area.appendChild(els.bins);
    els.go = E('button', { type: 'button', class: 'gk-big gk-pv-go', text: 'Build it!' });
    els.go.addEventListener('click', check);
    f.area.appendChild(els.go);
    round();
  }

  function round() {
    task = newTask(); busy = false; cnt = { h: 0, t: 0, o: 0 };
    els.order.innerHTML = '';
    els.order.appendChild(E('span', { class: 'gk-pv-olab', text: 'Order ' + (done + 1) }));
    els.order.appendChild(E('strong', { class: 'gk-pv-onum' + (task.show.length > 8 ? ' gk-pv-long' : ''), text: task.show }));
    els.order.appendChild(E('span', { class: 'gk-pv-osub', text: task.sub }));
    els.order.classList.remove('gk-pv-in'); void els.order.offsetWidth; els.order.classList.add('gk-pv-in');
    els.bix.classList.remove('gk-pv-yay', 'gk-pv-hmm');
    render();
    if (done === 0) f.say(f.level === 'tens' ? 'Tap or drag blocks onto the mat to build the number. A ten is 10 ones stuck together.' : f.level === 'hundreds' ? 'A hundred block is 10 tens. Build the order, then press Build it!' : 'Read each order carefully. Some need a trade!');
    else f.say('New order! Build ' + task.show + '.');
  }

  function render(newK) {
    PL.forEach(function (p) {
      var c = els.cols[p.k]; if (!c) return;
      var n = cnt[p.k], st = c.stack;
      while (st.children.length > n) st.removeChild(st.lastChild);
      while (st.children.length < n) {
        var b = E('span', { class: 'gk-pv-b ' + (p.k === 'h' ? 'gk-pv-flat' : p.k === 't' ? 'gk-pv-rod' : 'gk-pv-cube') + (newK === p.k ? ' gk-pv-new' : '') });
        b.addEventListener('click', function () { remove(p.k); });
        st.appendChild(b);
      }
      c.dig.textContent = n;
      c.col.classList.toggle('gk-pv-over', n > 9);
      if (c.trade) c.trade.style.display = n >= 10 ? '' : 'none';
    });
  }

  function add(k) {
    if (busy) return;
    if (cnt[k] >= MAX) { GK.bad(); f.say('That column is full! Try a trade, or take some away.', 'bad'); return; }
    cnt[k]++; render(k);
    GK.sfx.count(cnt.h * 3 + cnt.t + cnt.o % 12);
    var p = PL.filter(function (x) { return x.k === k; })[0];
    if (cnt[k] === 10 && k !== 'h' && els.cols[k].trade) f.say('10 ' + p.name + '! You can trade them for one bigger block.');
    else f.say(plural(cnt[k], p) + '.');
  }
  function remove(k) {
    if (busy || !cnt[k]) return;
    cnt[k]--; render(); GK.sfx.tap();
    f.say('Took one away.');
  }
  function doTrade(k) {
    if (busy || cnt[k] < 10) return;
    var up = k === 'o' ? 't' : 'h';
    var st = els.cols[k].stack, kids = Array.prototype.slice.call(st.children, -10);
    busy = true; GK.sfx.match();
    kids.forEach(function (b) { b.classList.add('gk-pv-merge'); });
    var g = gen;
    setTimeout(function () {
      if (g !== gen) return;
      cnt[k] -= 10; cnt[up]++; busy = false; render(up);
      f.say('10 ' + (k === 'o' ? 'ones' : 'tens') + ' make 1 ' + (k === 'o' ? 'ten' : 'hundred') + '. Snap!', 'good');
    }, still ? 50 : 420);
  }

  function bindBin(b) {
    var k = b.dataset.k;
    b.addEventListener('click', function () { if (skipClick) { skipClick = false; return; } add(k); });
    b.addEventListener('pointerdown', function (e) { if (busy || e.button > 0) return; drag = { b: b, x: e.clientX, y: e.clientY, g: null }; try { b.setPointerCapture(e.pointerId); } catch (x) {} });
    b.addEventListener('pointermove', function (e) {
      if (!drag || drag.b !== b) return;
      if (!drag.g && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8) {
        drag.g = E('div', { class: 'gk-pv-ghost' }, [blockPic(k)]); document.body.appendChild(drag.g); GK.sfx.tap();
      }
      if (drag.g) { drag.g.style.left = (e.clientX - 20) + 'px'; drag.g.style.top = (e.clientY - 20) + 'px'; els.mat.classList.toggle('hover', overMat(e)); }
    });
    function end(e) {
      if (!drag || drag.b !== b) return;
      var d = drag; drag = null;
      if (d.g) { skipClick = true; setTimeout(function () { skipClick = false; }, 60); d.g.remove(); els.mat.classList.remove('hover'); if (overMat(e)) add(k); }
    }
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  }
  function overMat(e) { var r = els.mat.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top - 20 && e.clientY < r.bottom + 20; }

  function check() {
    if (busy) return;
    var v = value(), d = task.d, over = PL.filter(function (p) { return cnt[p.k] > 9; })[0];
    if (v === task.n && !over) return win();
    GK.bad();
    els.bix.classList.remove('gk-pv-hmm'); void els.bix.offsetWidth; els.bix.classList.add('gk-pv-hmm');
    if (v === task.n && over) return f.say('Right amount! But ' + cnt[over.k] + ' ' + over.name + ' is too many for one place. Trade 10 of them.', 'bad');
    if (over) return f.say('A place can hold 9 at most. Trade 10 ' + over.name + ' for one bigger block, then look again.', 'bad');
    var miss = PL.filter(function (p) { return els.cols[p.k] && cnt[p.k] !== d[p.k]; })[0];
    if (f.level === 'puzzles') {
      f.say('You built ' + v + '. ' + (v < task.n ? 'We need more.' : 'That is too much.') + ' Check the ' + miss.name + ' again.', 'bad');
    } else {
      f.say('Look at the ' + miss.name + ' place: ' + task.n + ' needs ' + d[miss.k] + ' and you have ' + cnt[miss.k] + '.', 'bad');
    }
  }

  function win() {
    busy = true; done++;
    els.mat.classList.remove('gk-pv-done'); void els.mat.offsetWidth; els.mat.classList.add('gk-pv-done');
    els.bix.classList.add('gk-pv-yay');
    GK.good(els.go); f.progress(done, ROUNDS[f.level]);
    var fl = E('div', { class: 'gk-pv-floor', text: String(task.n) });
    fl.style.background = FLOOR[(done - 1) % FLOOR.length];
    els.tower.appendChild(fl);
    setTimeout(function () { GK.sfx.pop(); }, 300);
    var d = task.d, parts = [];
    if (f.level !== 'tens') parts.push(plural(d.h, PL[0]));
    parts.push(plural(d.t, PL[1])); parts.push(plural(d.o, PL[2]));
    f.say(task.n + ' is ' + parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] + '!', 'good');
    var g = gen;
    setTimeout(function () { if (g !== gen) return; if (done >= ROUNDS[f.level]) return end(); round(); }, still ? 1200 : 2000);
  }

  function end() {
    var nums = Array.prototype.map.call(els.tower.children, function (x) { return x.textContent; });
    var txt = { tens: 'You built 8 numbers with tens and ones.', hundreds: 'You built 8 numbers with hundreds, tens and ones.', puzzles: 'You cracked 8 tricky orders, trades and all.' }[f.level];
    GK.finish(f, { title: 'Bix’s tower is finished!', text: txt + ' Every floor is a number you made.', sheet: root.dataset.sheet, onReplay: start });
    var box = f.area.querySelector('.gk-end');
    if (box) {
      var t = E('div', { class: 'gk-pv-tower gk-pv-endtower', 'aria-hidden': 'true' });
      nums.forEach(function (n, i) { var fl = E('div', { class: 'gk-pv-floor', text: n }); fl.style.background = FLOOR[i % FLOOR.length]; t.appendChild(fl); });
      box.insertBefore(t, box.children[1]);
    }
  }

  GK.solve = function () {
    if (busy || !task) return;
    cnt = { h: task.d.h, t: task.d.t, o: task.d.o }; render(); check();
  };

  f = GK.frame({ root: root, rounds: ROUNDS.tens, levels: [{ key: 'tens', label: 'Tens and ones' }, { key: 'hundreds', label: 'Hundreds' }, { key: 'puzzles', label: 'Number puzzles' }], onLevel: start });
  start();
})();
