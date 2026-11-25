(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  /* Fair Share: help Bo the hedgehog baker share treats fairly at the picnic.
     Four levels: deal it out, plan first, leftover stories, mystery numbers. */
  var NS = 'http://www.w3.org/2000/svg';
  var ROUNDS = 8;
  var FACES = ['#f2b15a', '#a9b4c2', '#f3f0ea', '#b07a4a', '#c9c2ba', '#f59a9a', '#9ed37a', '#9fc6e8', '#e8c06a'];
  var f, done, task, busy = false, scene, jarN, platesEl, plates, panel, qEl, bo, sumEl, vals, stars;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function E(t, a, k) { return GK.el(t, a, k); }
  function R(a, b) { return GK.rand(a, b); }
  function svg(vb, cls, html) { var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); s.innerHTML = html; return s; }
  function cookieSvg() { return svg('0 0 20 20', 'gk-fs-ck', '<circle cx="10" cy="10" r="8.5" fill="#e3a957" stroke="#8a5a22" stroke-width="2"/><circle cx="7" cy="7" r="1.6" fill="#5a3514"/><circle cx="12.5" cy="9" r="1.6" fill="#5a3514"/><circle cx="8.5" cy="13" r="1.6" fill="#5a3514"/>'); }

  function boSvg() {
    var spikes = ''; for (var i = 0; i < 9; i++) { var a = Math.PI * (0.55 + i * 0.11); spikes += (i ? ' L' : 'M') + (60 + 48 * Math.cos(a)).toFixed(1) + ' ' + (80 - 48 * Math.sin(a)).toFixed(1) + ' L' + (60 + 36 * Math.cos(a + 0.055)).toFixed(1) + ' ' + (80 - 36 * Math.sin(a + 0.055)).toFixed(1); }
    return svg('0 0 120 130', 'gk-fs-bo',
      '<path d="' + spikes + ' L100 80 Q100 120 60 120 Q20 120 20 80 Z" fill="#8a5a22" stroke="#2a2522" stroke-width="4" stroke-linejoin="round"/>' +
      '<ellipse cx="62" cy="88" rx="30" ry="28" fill="#f1cf9d" stroke="#2a2522" stroke-width="4"/>' +
      '<path d="M36 46 q-6 -20 12 -22 q6 -14 22 -6 q18 -4 18 14 q10 10 -4 18 h-44 q-10 -2 -4 -4z" fill="#fff" stroke="#2a2522" stroke-width="3.5"/><rect x="40" y="44" width="40" height="10" rx="3" fill="#fff" stroke="#2a2522" stroke-width="3.5"/>' +
      '<g class="gk-fs-eyes"><circle cx="52" cy="80" r="4.5" fill="#2a2522"/><circle cx="74" cy="80" r="4.5" fill="#2a2522"/></g>' +
      '<circle cx="63" cy="92" r="5" fill="#2a2522"/>' +
      '<path class="gk-fs-mouth" d="M54 102 Q63 109 72 102" fill="none" stroke="#2a2522" stroke-width="3.5" stroke-linecap="round"/>' +
      '<circle cx="44" cy="96" r="5" fill="#f59a9a" opacity=".7"/><circle cx="82" cy="96" r="5" fill="#f59a9a" opacity=".7"/>');
  }
  function faceSvg(i) {
    var c = FACES[i % FACES.length];
    return svg('0 0 60 50', 'gk-fs-face', '<circle cx="16" cy="14" r="8" fill="' + c + '" stroke="#2a2522" stroke-width="3"/><circle cx="44" cy="14" r="8" fill="' + c + '" stroke="#2a2522" stroke-width="3"/><circle cx="30" cy="28" r="19" fill="' + c + '" stroke="#2a2522" stroke-width="3"/><circle cx="23" cy="26" r="2.8" fill="#2a2522"/><circle cx="37" cy="26" r="2.8" fill="#2a2522"/><path class="gk-fs-fm" d="M24 35 Q30 39 36 35" fill="none" stroke="#2a2522" stroke-width="2.5" stroke-linecap="round"/>');
  }
  function bgSvg() {
    var h = '<rect width="800" height="300" fill="#cfeaff"/><circle cx="90" cy="74" r="26" fill="#ffd95a"/><g fill="#fff"><ellipse cx="200" cy="50" rx="44" ry="14"/><ellipse cx="228" cy="40" rx="26" ry="13"/></g>' +
      '<path d="M0 110 Q200 70 420 104 T800 96 L800 300 L0 300 Z" fill="#9ed37a"/>';
    h += '<rect x="40" y="130" width="720" height="170" fill="#fff3e0"/>';
    for (var x = 0; x < 12; x++) for (var y = 0; y < 4; y++) if ((x + y) % 2 === 0) h += '<rect x="' + (40 + x * 60) + '" y="' + (130 + y * 42.5) + '" width="60" height="42.5" fill="#e0574a" opacity=".8"/>';
    h += '<rect x="40" y="130" width="720" height="170" fill="none" stroke="#b23a30" stroke-width="5"/>';
    var b = svg('0 0 800 300', 'gk-fs-bg', h); b.setAttribute('preserveAspectRatio', 'xMidYMax slice'); return b;
  }

  /* ---------- Tasks ---------- */
  function divTask(k, q, r) { return { N: k * q + r, k: k, q: q, r: r }; }
  function newTask() {
    var L = f.level, k, q, r, t;
    if (L === 'deal') { k = R(2, 5); q = R(2, 6); r = done % 3 === 2 ? 0 : R(1, k - 1); t = divTask(k, q, r); t.kind = 'deal'; t.dealt = 0; t.ask = 'two'; return t; }
    if (L === 'plan') { k = R(3, 9); q = R(3, 9); r = done === 3 ? 0 : R(1, k - 1); t = divTask(k, q, r); t.kind = 'plan'; t.ask = 'two'; return t; }
    if (L === 'story') {
      var type = ['up', 'down', 'left'][done % 3];
      var g = R(3, 8); q = R(3, type === 'up' ? 7 : 8); r = R(1, g - 1);
      t = { kind: 'story', type: type, N: g * q + r, g: g, q: q, r: r, ask: 'one' };
      if (type === 'up') { t.ans = q + 1; t.label = 'boxes'; t.text = 'Bo packs ' + t.N + ' muffins into boxes. Each box holds ' + g + '. How many boxes does Bo need so that no muffin is left out?'; }
      else if (type === 'down') { t.ans = q; t.label = 'cupcakes'; t.text = 'Each cupcake gets exactly ' + g + ' cherries on top. Bo has ' + t.N + ' cherries. How many cupcakes can get a full set?'; }
      else { t.ans = r; t.label = 'left for Bo'; t.k = g; t.text = 'Bo shares ' + t.N + ' grapes equally among ' + g + ' friends. Everyone gets the same number. How many grapes are left over for Bo?'; }
      return t;
    }
    var mt = ['back', 'table', 'two', 'back', 'table', 'two', 'back', 'two'][done];
    if (mt === 'back') {
      k = R(3, 9); q = R(4, 9); r = R(1, k - 1); t = divTask(k, q, r); t.kind = 'myst'; t.type = 'back'; t.ask = 'one'; t.ans = t.N; t.label = 'cookies';
      t.text = 'Bo shared some cookies among ' + k + ' friends. Each friend got ' + q + ' and ' + r + (r === 1 ? ' was' : ' were') + ' left over. How many cookies did Bo bake?';
      return t;
    }
    if (mt === 'table') {
      var opts, d, N, tries = 0;
      do {
        opts = GK.shuffle([3, 4, 5, 6, 7, 8, 9]).slice(0, 4).sort(function (a, b) { return a - b; });
        d = GK.pick(opts); q = R(3, 9); N = d * q; tries++;
      } while (opts.filter(function (o) { return N % o === 0; }).length !== 1 && tries < 200);
      t = divTask(d, q, 0); t.kind = 'myst'; t.type = 'table'; t.ask = 'pick'; t.opts = opts; t.ans = d;
      t.text = 'Bo has ' + N + ' cookies and wants to share them all with nothing left over. Which table of friends works?';
      return t;
    }
    var trays = R(2, 5), per = R(4, 9); k = R(3, 8);
    while (Math.floor(trays * per / k) > 12 || trays * per < k * 2) { trays = R(2, 5); per = R(4, 9); k = R(3, 8); }
    var tot = trays * per;
    t = divTask(k, Math.floor(tot / k), tot % k); t.kind = 'myst'; t.type = 'two'; t.ask = 'two'; t.trays = trays; t.per = per;
    t.text = 'Bo bakes ' + trays + ' trays with ' + per + ' cookies on each tray. Then Bo shares them all equally among ' + k + ' friends. How many does each friend get, and how many are left?';
    return t;
  }

  /* ---------- Scene ---------- */
  function start() {
    done = 0; busy = false; f.progress(0, ROUNDS);
    f.area.innerHTML = '';
    scene = E('div', { class: 'gk-fs-scene' });
    scene.appendChild(bgSvg());
    stars = E('div', { class: 'gk-fs-stars', 'aria-hidden': 'true' });
    for (var i = 0; i < ROUNDS; i++) stars.appendChild(E('span', { text: '🍪' }));
    scene.appendChild(stars);
    bo = E('div', { class: 'gk-fs-bowrap' }, [boSvg()]);
    jarN = E('strong', { class: 'gk-fs-jarn' });
    var jar = E('div', { class: 'gk-fs-jar' }, [E('span', { class: 'gk-fs-lid', 'aria-hidden': 'true' }), cookieSvg(), jarN]);
    scene.appendChild(E('div', { class: 'gk-fs-left' }, [bo, jar]));
    platesEl = E('div', { class: 'gk-fs-plates' });
    scene.appendChild(platesEl);
    f.area.appendChild(scene);
    qEl = E('p', { class: 'gk-fs-q', 'aria-live': 'polite' });
    f.area.appendChild(qEl);
    sumEl = E('p', { class: 'gk-fs-sum', 'aria-live': 'polite' });
    panel = E('div', { class: 'gk-fs-panel' });
    f.area.appendChild(panel);
    f.area.appendChild(sumEl);
    round();
  }

  function setJar(n) { jarN.textContent = n; jarN.parentNode.setAttribute('aria-label', n + ' in the jar'); }
  function makePlates(n, kind) {
    platesEl.innerHTML = ''; plates = [];
    platesEl.classList.toggle('gk-fs-boxes', kind === 'box' || kind === 'cup');
    for (var i = 0; i < n; i++) {
      var grid = E('div', { class: 'gk-fs-grid' });
      var p = E('div', { class: 'gk-fs-plate gk-fs-' + kind }, [kind === 'plate' ? faceSvg(i) : null, E('div', { class: 'gk-fs-dish' }, [grid])]);
      p.grid = grid; p.n = 0; plates.push(p); platesEl.appendChild(p);
    }
  }
  function addTo(p, delay) {
    p.n++;
    var c = cookieSvg(); if (!still) { c.style.animationDelay = (delay || 0) + 'ms'; c.classList.add('gk-fs-pop'); }
    p.grid.appendChild(c);
  }

  function round() {
    task = newTask(); busy = false; vals = { each: 0, left: 0, one: 0 };
    sumEl.textContent = ''; bo.classList.remove('gk-fs-yay', 'gk-fs-hmm');
    var t = task;
    if (t.kind === 'deal') { qEl.textContent = 'Share ' + t.N + ' cookies fairly among ' + t.k + ' friends. Deal one to each friend at a time.'; makePlates(t.k, 'plate'); setJar(t.N); }
    else if (t.kind === 'plan') { qEl.textContent = 'Plan first! ' + t.N + ' cookies, ' + t.k + ' friends. How many does each friend get, and how many are left?'; makePlates(t.k, 'plate'); setJar(t.N); }
    else if (t.kind === 'story') { qEl.textContent = t.text; platesEl.innerHTML = ''; plates = []; setJar(t.N); }
    else { qEl.textContent = t.text; platesEl.innerHTML = ''; plates = []; setJar(t.type === 'back' ? '?' : t.N); if (t.type === 'two') setJar(t.trays + '×' + t.per); }
    buildPanel();
    var tips = { deal: 'Tap Deal to give each friend one cookie. Stop when there are not enough for everyone.', plan: 'Use times tables to plan, then press Deal it to test your plan.', story: 'Read carefully: what do you do with the leftovers?', myst: 'Mystery time! Work backwards, or in two steps.' };
    f.say(done === 0 ? tips[t.kind] : GK.pick(['Next picnic!', 'More friends are hungry!', 'Bo baked another batch!']));
  }

  function stepper(key, label) {
    var out = E('strong', { class: 'gk-fs-num', text: '0' });
    function ch(d) { if (busy) return; vals[key] = Math.max(0, Math.min(99, vals[key] + d)); out.textContent = vals[key]; GK.sfx.tap(); }
    var mk = function (d, txt) { var b = E('button', { type: 'button', class: 'gk-tool gk-fs-st', 'aria-label': label + (d > 0 ? ' plus ' : ' minus ') + Math.abs(d), text: txt }); b.addEventListener('click', function () { ch(d); }); return b; };
    var big = task.ask === 'one' && (task.type === 'back');
    return E('div', { class: 'gk-fs-stepper' }, [E('span', { class: 'gk-fs-lab', text: label }), big ? mk(-10, '−10') : null, mk(-1, '−1'), out, mk(1, '+1'), big ? mk(10, '+10') : null]);
  }
  function buildPanel() {
    panel.innerHTML = '';
    var t = task, tools = E('div', { class: 'gk-tools' });
    if (t.kind === 'deal') {
      var deal = E('button', { type: 'button', class: 'gk-big gk-fs-deal', text: '🍪 Deal one each' });
      deal.addEventListener('click', dealOne);
      panel.appendChild(E('div', { class: 'gk-fs-row' }, [deal]));
    }
    if (t.ask === 'two') { panel.appendChild(stepper('each', 'Each friend')); panel.appendChild(stepper('left', 'Left over')); }
    else if (t.ask === 'one') panel.appendChild(stepper('one', t.label.charAt(0).toUpperCase() + t.label.slice(1)));
    if (t.ask === 'pick') {
      var row = E('div', { class: 'gk-fs-pick' });
      t.opts.forEach(function (o) {
        var b = E('button', { type: 'button', class: 'gk-choice gk-fs-tbl', 'aria-label': 'Table of ' + o + ' friends' });
        var dots = E('span', { class: 'gk-fs-tdots', 'aria-hidden': 'true' }); for (var i = 0; i < o; i++) dots.appendChild(E('i'));
        b.appendChild(dots); b.appendChild(E('span', { text: o + ' friends' }));
        b.dataset.v = o; b.addEventListener('click', function () { pickTable(b); });
        row.appendChild(b);
      });
      panel.appendChild(row);
    } else {
      var go = E('button', { type: 'button', class: 'gk-big', text: t.kind === 'plan' ? 'Deal it! ✓' : 'Check ✓' });
      go.addEventListener('click', check);
      tools.appendChild(go);
    }
    var help = E('button', { type: 'button', class: 'gk-tool', text: '\u00D7 Times table helper' });
    help.addEventListener('click', helper);
    tools.appendChild(help);
    panel.appendChild(tools);
  }

  /* ---------- Actions ---------- */
  function left() { return task.N - task.dealt; }
  function dealOne() {
    if (busy) return;
    var t = task;
    if (left() < t.k) { GK.bad(); bo.classList.remove('gk-fs-hmm'); void bo.offsetWidth; bo.classList.add('gk-fs-hmm'); f.say('Only ' + left() + ' left, and there are ' + t.k + ' friends. Not enough for everyone! Now fill in your answer.', 'bad'); return; }
    t.dealt += t.k; setJar(left());
    plates.forEach(function (p, i) { addTo(p, i * 70); });
    GK.sfx.count(t.dealt / t.k * 2);
    f.say('Round ' + (t.dealt / t.k) + ': each friend has ' + (t.dealt / t.k) + '. ' + left() + ' left in the jar.');
  }
  function dealAll(k, N, cb) { // deal N treats round robin to k plates, quickly
    var n = 0, i = 0;
    makePlates(k, 'plate'); setJar(N);
    var step = function () {
      if (n >= Math.floor(N / k) * k) { cb(); return; }
      var batch = still ? N : k;
      for (var b = 0; b < batch && n < Math.floor(N / k) * k; b++) { addTo(plates[i % k], 0); i++; n++; }
      setJar(N - n); GK.sfx.scratch();
      setTimeout(step, still ? 0 : 130);
    };
    step();
  }
  function pack(g, N, kind, cb) { // fill containers of size g, one after another
    var boxes = Math.ceil(N / g); makePlates(boxes, kind); setJar(N);
    var n = 0, step = function () {
      if (n >= N) { cb(); return; }
      var batch = still ? N : g;
      for (var b = 0; b < batch && n < N; b++) { addTo(plates[Math.floor(n / g)], b * 25); n++; }
      setJar(N - n); GK.sfx.scratch();
      setTimeout(step, still ? 0 : 220);
    };
    step();
  }

  function check() {
    if (busy) return;
    var t = task;
    if (t.kind === 'deal') {
      if (vals.each === t.q && vals.left === t.r) { if (left() >= t.k) { f.say('Your numbers are right, but there are still enough cookies to deal another round. Tap Deal!', 'bad'); GK.bad(); return; } return win(); }
      return miss(twoHint());
    }
    if (t.kind === 'plan' || (t.kind === 'myst' && t.type === 'two')) {
      busy = true;
      dealAll(t.k, t.N, function () {
        busy = false;
        if (vals.each === t.q && vals.left === t.r) return win();
        miss('Bo dealt them out: each friend got ' + t.q + ' and ' + t.r + ' ' + (t.r === 1 ? 'was' : 'were') + ' left. ' + twoHint());
        setTimeout(function () { if (!busy) { makePlates(t.k, 'plate'); setJar(t.kind === 'plan' ? t.N : t.trays + '×' + t.per); } }, 2600);
      });
      return;
    }
    if (vals.one === t.ans) {
      busy = true;
      var done2 = function () { busy = false; win(); };
      if (t.kind === 'story') { if (t.type === 'left') dealAll(t.g, t.N, done2); else pack(t.g, t.N, t.type === 'up' ? 'box' : 'cup', done2); }
      else dealAll(t.k, t.N, done2);
      return;
    }
    miss(oneHint());
  }
  function pickTable(b) {
    if (busy) return;
    var v = +b.dataset.v, t = task;
    busy = true;
    dealAll(v, t.N, function () {
      busy = false;
      if (v === t.ans) return win();
      GK.flash(b, false);
      miss('With ' + v + ' friends, ' + (t.N % v) + ' would be left over. Try another table.');
    });
  }
  function twoHint() {
    var t = task;
    if (vals.left >= t.k) return 'Left over ' + vals.left + ' is ' + t.k + ' or more, so everyone could get one more. The leftover must be less than ' + t.k + '.';
    if (vals.each * t.k + vals.left !== t.N) return 'Check it: ' + t.k + ' × ' + vals.each + ' + ' + vals.left + ' = ' + (vals.each * t.k + vals.left) + ', not ' + t.N + '.';
    return 'Try again.';
  }
  function oneHint() {
    var t = task, v = vals.one;
    if (t.kind === 'story') {
      if (t.type === 'up' && v === t.q) return t.q + ' boxes hold only ' + t.q * t.g + ' muffins. ' + t.r + ' would be left out! They need a box too.';
      if (t.type === 'down' && v === t.q + 1) return 'The last cupcake would only get ' + t.r + ' cherries. That is not a full set.';
      if (t.type === 'left' && v === t.q) return 'That is how many each friend gets. The question asks how many are LEFT.';
      return 'Think: how many groups of ' + t.g + ' fit in ' + t.N + '? Then decide what to do with the leftovers.';
    }
    if (t.type === 'back') return 'Work backwards: ' + t.k + ' friends × ' + t.q + ' each, then add the ' + t.r + ' left over.';
    return 'Try again.';
  }
  function miss(msg) {
    GK.bad(); f.say(msg, 'bad');
    bo.classList.remove('gk-fs-hmm'); void bo.offsetWidth; bo.classList.add('gk-fs-hmm');
  }
  function win() {
    busy = true; done++;
    var t = task;
    f.progress(done, ROUNDS);
    var st = stars.children[done - 1]; if (st) st.classList.add('on');
    GK.good(qEl); bo.classList.remove('gk-fs-yay'); void bo.offsetWidth; bo.classList.add('gk-fs-yay');
    platesEl.classList.add('gk-fs-happy');
    var k = t.kind === 'story' ? t.g : t.k;
    sumEl.textContent = t.N + ' ÷ ' + k + ' = ' + Math.floor(t.N / k) + (t.N % k ? ' R ' + (t.N % k) : '') + '   because   ' + k + ' × ' + Math.floor(t.N / k) + (t.N % k ? ' + ' + (t.N % k) : '') + ' = ' + t.N;
    f.say(GK.pick(['Fair and square!', 'Everyone is happy!', 'Bo does a happy dance!', 'Perfect sharing!']), 'good');
    setTimeout(function () { platesEl.classList.remove('gk-fs-happy'); if (done >= ROUNDS) return end(); round(); }, still ? 1500 : 2600);
  }
  function helper() {
    GK.sfx.pop();
    var t = task, k = t.kind === 'story' ? t.g : t.type === 'table' ? null : t.k;
    if (t.type === 'back') { f.say('Each friend got ' + t.q + '. So ' + t.k + ' friends got ' + t.k + ' × ' + t.q + '. Do not forget the leftovers!'); return; }
    if (t.type === 'two') { f.say('Step 1: ' + t.trays + ' trays × ' + t.per + ' = how many cookies? Step 2: share them among ' + t.k + '.'); return; }
    if (!k) { f.say('Which number goes into ' + t.N + ' with nothing left? Try each table in your head.'); return; }
    var row = []; for (var i = 1; i <= 10; i++) row.push(k + '×' + i + '=' + k * i);
    f.say(row.join('  '));
  }
  function end() {
    var txt = { deal: 'You dealt cookies fairly 8 times and found the leftovers.', plan: 'You planned 8 fair shares before dealing. That is division with remainders!', story: 'You solved 8 leftover stories: round up, round down, or the leftover is the answer.', myst: 'You cracked 8 mystery puzzles by working backwards and in two steps.' }[f.level];
    GK.finish(f, { title: 'Best picnic ever!', text: txt + ' Bo saved you a cookie for each one.', sheet: root.dataset.sheet, onReplay: start });
    var box = f.area.querySelector('.gk-end');
    if (box) { var row = E('div', { class: 'gk-fs-endrow', 'aria-hidden': 'true' }); for (var i = 0; i < ROUNDS; i++) row.appendChild(cookieSvg()); box.insertBefore(row, box.children[1]); }
  }

  GK.solve = function () {
    if (busy || !task) return;
    var t = task;
    if (t.kind === 'deal' && left() >= t.k) { dealOne(); return; }
    if (t.ask === 'two') { vals.each = t.q; vals.left = t.r; }
    else if (t.ask === 'one') vals.one = t.ans;
    else { var b = null; panel.querySelectorAll('.gk-fs-tbl').forEach(function (x) { if (+x.dataset.v === t.ans) b = x; }); if (b) pickTable(b); return; }
    panel.querySelectorAll('.gk-fs-num').forEach(function (o, i) { o.textContent = t.ask === 'two' ? (i ? t.r : t.q) : t.ans; });
    check();
  };

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'deal', label: '1 Deal it out' }, { key: 'plan', label: '2 Plan first' }, { key: 'story', label: '3 Leftover stories' }, { key: 'myst', label: '4 Mystery numbers' }], onLevel: start });
  start();
})();
