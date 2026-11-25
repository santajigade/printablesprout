(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  /* Days of the Week Train: drag day carriages onto Tooty the engine's train in the right order.
     US calendars start the week on Sunday; the weekend is Saturday and Sunday. */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var COL = ['#e0574a', '#f08a24', '#f2c230', '#5cb85c', '#2f9fd0', '#6f6fd8', '#c45fb8'];
  var ROUNDS = { gaps: 8, week: 6, tomorrow: 10 };
  var NS = 'http://www.w3.org/2000/svg';
  var f, done, task, busy = false, scene, trainEl, slots, platform, board, engine, stars, idleT, dragging = null, skipClick = false;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function E(t, a, k) { return GK.el(t, a, k); }
  function wrap(i) { return ((i % 7) + 7) % 7; }

  /* ---------- Art ---------- */
  function engineSvg() {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 120 100'); s.setAttribute('class', 'gk-dw-engsvg'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML =
      '<g class="gk-dw-smoke"><circle cx="30" cy="10" r="7" fill="#fff" opacity=".9"/><circle cx="20" cy="4" r="5" fill="#fff" opacity=".7"/></g>' +
      '<rect x="22" y="14" width="16" height="22" rx="4" fill="#2a2522"/>' +
      '<rect x="10" y="34" width="74" height="40" rx="14" fill="#2f7fd0" stroke="#2a2522" stroke-width="4"/>' +
      '<rect x="62" y="16" width="44" height="58" rx="10" fill="#e0574a" stroke="#2a2522" stroke-width="4"/>' +
      '<rect x="70" y="24" width="28" height="20" rx="6" fill="#fff8e6" stroke="#2a2522" stroke-width="3"/>' +
      '<g class="gk-dw-eyes"><circle cx="30" cy="50" r="6" fill="#fff"/><circle cx="50" cy="50" r="6" fill="#fff"/><circle cx="31" cy="51" r="3.2" fill="#2a2522"/><circle cx="51" cy="51" r="3.2" fill="#2a2522"/></g>' +
      '<path class="gk-dw-mouth" d="M32 61 Q40 68 48 61" fill="none" stroke="#2a2522" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="22" cy="60" r="4" fill="#f59a9a" opacity=".8"/><circle cx="58" cy="60" r="4" fill="#f59a9a" opacity=".8"/>' +
      '<path d="M4 74 L10 66 L10 74 Z" fill="#f2c230" stroke="#2a2522" stroke-width="3" stroke-linejoin="round"/>' +
      '<g class="gk-dw-wheels" fill="#3a3330" stroke="#2a2522" stroke-width="3"><circle cx="28" cy="80" r="11"/><circle cx="58" cy="80" r="11"/><circle cx="88" cy="80" r="11"/></g>' +
      '<g fill="#f2c230"><circle cx="28" cy="80" r="3.5"/><circle cx="58" cy="80" r="3.5"/><circle cx="88" cy="80" r="3.5"/></g>' +
      '<text class="gk-dw-zz" x="96" y="12" font-size="16" font-weight="800" fill="#2f5d8a">z z</text>';
    return s;
  }
  function sceneSvg() {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 800 300'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('class', 'gk-dw-bg'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML =
      '<defs><linearGradient id="dwsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs>' +
      '<rect width="800" height="300" fill="url(#dwsky)"/>' +
      '<circle cx="700" cy="60" r="34" fill="#ffd95a"/><circle cx="700" cy="60" r="46" fill="#ffd95a" opacity=".25"/>' +
      '<g fill="#fff" opacity=".95"><ellipse cx="140" cy="60" rx="46" ry="16"/><ellipse cx="172" cy="48" rx="30" ry="16"/><ellipse cx="470" cy="46" rx="40" ry="13"/><ellipse cx="496" cy="38" rx="24" ry="12"/></g>' +
      '<path d="M0 190 Q120 120 250 180 T520 170 T800 160 L800 300 L0 300 Z" fill="#9ed37a"/>' +
      '<path d="M0 220 Q160 170 340 215 T800 205 L800 300 L0 300 Z" fill="#7bbf5c"/>' +
      '<g fill="#4f8a3a"><circle cx="610" cy="168" r="18"/><circle cx="634" cy="160" r="22"/><circle cx="90" cy="190" r="16"/></g>' +
      '<g fill="#8a5a22"><rect x="628" y="176" width="8" height="22"/><rect x="86" y="200" width="7" height="16"/></g>';
    return s;
  }
  function car(i, opts) {
    opts = opts || {};
    var c = E(opts.btn ? 'button' : 'div', { class: 'gk-dw-car' + (opts.cls ? ' ' + opts.cls : '') });
    if (opts.btn) { c.setAttribute('type', 'button'); c.setAttribute('aria-label', DAYS[i] + ' carriage'); }
    c.style.setProperty('--c', COL[i]);
    c.dataset.day = i;
    c.appendChild(E('span', { class: 'gk-dw-roof', 'aria-hidden': 'true' }));
    c.appendChild(E('span', { class: 'gk-dw-name', text: DAYS[i] }));
    c.appendChild(E('span', { class: 'gk-dw-whl', 'aria-hidden': 'true' }));
    if (i === 0 || i === 6) c.appendChild(E('span', { class: 'gk-dw-wk', 'aria-hidden': 'true', text: '★' }));
    return c;
  }

  /* ---------- Tasks ---------- */
  function newTask() {
    var L = f.level, start, miss, i;
    if (L === 'gaps') {
      start = done < 4 ? 0 : GK.rand(0, 6);
      var n = done < 3 ? 2 : done < 6 ? 3 : 4;
      miss = GK.shuffle([1, 2, 3, 4, 5, 6]).slice(0, n);
      return { kind: 'gaps', start: start, slots: 7, given: [0, 1, 2, 3, 4, 5, 6].filter(function (k) { return miss.indexOf(k) < 0; }), deck: miss.map(function (k) { return wrap(start + k); }) };
    }
    if (L === 'week') {
      start = done === 0 ? 0 : GK.rand(0, 6);
      var deck = []; for (i = 1; i < 7; i++) deck.push(wrap(start + i));
      return { kind: 'week', start: start, slots: 7, given: [0], deck: deck };
    }
    var today = GK.rand(0, 6), types = ['after', 'before', 'after', 'before', 'after2', 'before2', 'weekend'];
    var type = done < 4 ? types[done % 2] : done === 9 ? 'weekend' : GK.pick(types.slice(0, 6));
    var off = { after: 1, before: -1, after2: 2, before2: -2 }[type];
    var ans = type === 'weekend' ? GK.pick([0, 6]) : wrap(today + off);
    var opts = [ans], d;
    while (opts.length < 3) { d = type === 'weekend' ? GK.rand(1, 5) : wrap(ans + GK.pick([-2, -1, 1, 2, 3])); if (opts.indexOf(d) < 0 && d !== today) opts.push(d); }
    return { kind: 'ask', type: type, today: today, ans: ans, deck: opts, off: off };
  }
  function askText(t) {
    var D = DAYS[t.today];
    if (t.type === 'after') return 'Today is ' + D + '. What day will it be tomorrow?';
    if (t.type === 'before') return 'Today is ' + D + '. What day was it yesterday?';
    if (t.type === 'after2') return 'Today is ' + D + '. What day is the day after tomorrow?';
    if (t.type === 'before2') return 'Today is ' + D + '. What day was the day before yesterday?';
    return 'The weekend is two days: ' + (t.ans === 0 ? 'Saturday' : 'Sunday') + ' and which other day?';
  }
  function hintFor(dayWanted) {
    return 'Hmm, not that one. ' + DAYS[dayWanted] + ' comes right after ' + DAYS[wrap(dayWanted - 1)] + '.';
  }

  /* ---------- Build ---------- */
  function start() {
    done = 0; busy = false; f.progress(0, ROUNDS[f.level]);
    f.area.innerHTML = '';
    scene = E('div', { class: 'gk-dw-scene' });
    scene.appendChild(sceneSvg());
    stars = E('div', { class: 'gk-dw-stars', 'aria-hidden': 'true' });
    for (var i = 0; i < ROUNDS[f.level]; i++) stars.appendChild(E('span', { text: '★' }));
    scene.appendChild(stars);
    board = E('p', { class: 'gk-dw-board', 'aria-live': 'polite' });
    scene.appendChild(board);
    trainEl = E('div', { class: 'gk-dw-train' });
    scene.appendChild(trainEl);
    f.area.appendChild(scene);
    platform = E('div', { class: 'gk-dw-plat', role: 'group', 'aria-label': 'Carriages waiting on the platform' });
    f.area.appendChild(platform);
    var help = E('button', { type: 'button', class: 'gk-tool', text: '💡 Hint' });
    help.addEventListener('click', hint);
    var song = E('button', { type: 'button', class: 'gk-tool', text: '🎵 Sing the week' });
    song.addEventListener('click', sing);
    f.area.appendChild(E('div', { class: 'gk-tools' }, [help, song]));
    round(true);
  }

  function round(first) {
    task = newTask(); busy = false;
    trainEl.innerHTML = ''; slots = [];
    engine = E('div', { class: 'gk-dw-engine' }, [engineSvg()]);
    trainEl.appendChild(engine);
    if (task.kind === 'ask') {
      var hookFirst = task.off < 0;
      var gap = Math.abs(task.off || 1);
      var parts = [];
      if (task.type === 'weekend') parts = [{ d: task.ans === 0 ? 6 : 0 }, { slot: true }];
      else {
        // show the days between today and the answer, so the child can count along the train
        for (var k = 0; k <= gap; k++) parts.push(k === gap ? { slot: true } : { d: wrap(task.today + (hookFirst ? -k : k)), today: k === 0 });
        if (hookFirst) parts.reverse();
      }
      parts.forEach(function (p) {
        if (p.slot) { var s = E('div', { class: 'gk-dw-slot', 'data-drop': '1', 'aria-label': 'Empty hook' }, [E('span', { text: '?' })]); s.dataset.want = task.ans; slots.push(s); trainEl.appendChild(s); }
        else { var cc = car(p.d, { cls: p.today ? 'gk-dw-today' : '' }); if (p.today) cc.appendChild(E('span', { class: 'gk-dw-tag', text: 'today' })); trainEl.appendChild(cc); }
      });
      board.textContent = askText(task);
    } else {
      for (var i = 0; i < 7; i++) {
        var day = wrap(task.start + i);
        if (task.given.indexOf(i) >= 0) trainEl.appendChild(car(day));
        else { var sl = E('div', { class: 'gk-dw-slot', 'data-drop': '1', 'aria-label': 'Empty hook' }, [E('span', { text: '?' })]); sl.dataset.want = day; slots.push(sl); trainEl.appendChild(sl); }
      }
      board.textContent = task.kind === 'gaps' ? 'Some carriages fell off! Drag each one back into its place.' : 'The train starts on ' + DAYS[task.start] + '. Hook on the other days in order.';
    }
    platform.innerHTML = '';
    GK.shuffle(task.deck).forEach(function (d) { var b = car(d, { btn: true }); bindCar(b); platform.appendChild(b); });
    if (!still && !first) { trainEl.classList.remove('gk-dw-in'); void trainEl.offsetWidth; trainEl.classList.add('gk-dw-in'); }
    if (!first || f.level !== 'gaps') f.say(task.kind === 'ask' ? 'Drag the right carriage onto the empty hook, or tap it.' : 'Drag a carriage to its hook, or tap it to hook it on.');
    else f.say('Help Tooty the engine! Drag each day back to its place on the train.');
    wake();
  }

  function nextSlot() {
    for (var i = 0; i < slots.length; i++) if (!slots[i].classList.contains('full')) return slots[i];
    return null;
  }

  /* ---------- Drag and tap ---------- */
  function bindCar(b) {
    b.addEventListener('click', function () { if (skipClick) { skipClick = false; return; } if (busy) return; tryPlace(b, task.kind === 'week' || task.kind === 'ask' ? nextSlot() : slotFor(b)); });
    b.addEventListener('pointerdown', function (e) {
      if (busy || e.button > 0) return;
      dragging = { b: b, x: e.clientX, y: e.clientY, ghost: null, id: e.pointerId };
      try { b.setPointerCapture(e.pointerId); } catch (x) {}
    });
    b.addEventListener('pointermove', function (e) {
      var d = dragging; if (!d || d.b !== b) return;
      if (!d.ghost && Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 8) {
        var r = b.getBoundingClientRect();
        d.ghost = b.cloneNode(true); d.ghost.classList.add('gk-dw-ghost'); d.ghost.style.width = r.width + 'px';
        d.dx = e.clientX - r.left; d.dy = e.clientY - r.top;
        document.body.appendChild(d.ghost); b.classList.add('gk-dw-lift'); GK.sfx.tap();
      }
      if (d.ghost) {
        d.ghost.style.left = (e.clientX - d.dx) + 'px'; d.ghost.style.top = (e.clientY - d.dy) + 'px';
        var over = dropAt(e.clientX, e.clientY);
        slots.forEach(function (s) { s.classList.toggle('hover', s === over); });
      }
    });
    function end(e) {
      var d = dragging; if (!d || d.b !== b) return;
      dragging = null;
      if (d.ghost) {
        skipClick = true; setTimeout(function () { skipClick = false; }, 60);
        var target = dropAt(e.clientX, e.clientY);
        d.ghost.remove(); b.classList.remove('gk-dw-lift');
        slots.forEach(function (s) { s.classList.remove('hover'); });
        if (target) tryPlace(b, target); else GK.sfx.tap();
      }
    }
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  }
  function dropAt(x, y) {
    var hit = null;
    slots.forEach(function (s) {
      if (s.classList.contains('full')) return;
      var r = s.getBoundingClientRect();
      if (x > r.left - 14 && x < r.right + 14 && y > r.top - 20 && y < r.bottom + 20) hit = s;
    });
    return hit;
  }
  function slotFor(b) { // tap in Fill the gaps: hook it into its own gap if it has one
    var d = +b.dataset.day;
    for (var i = 0; i < slots.length; i++) if (+slots[i].dataset.want === d && !slots[i].classList.contains('full')) return slots[i];
    return nextSlot();
  }

  function tryPlace(b, slot) {
    if (!slot || busy) return;
    var d = +b.dataset.day, want = +slot.dataset.want;
    wake();
    if (task.kind === 'week' && slot !== nextSlot()) { slot = nextSlot(); want = +slot.dataset.want; }
    if (d === want) {
      var c = car(d, { cls: 'gk-dw-new' });
      slot.replaceWith(c); slots[slots.indexOf(slot)] = c; c.classList.add('full');
      b.remove(); GK.sfx.match(); GK.burst(c); cheer();
      if (!nextSlot()) return roundWon();
      f.say(task.kind === 'week' ? DAYS[d] + '! What comes after ' + DAYS[d] + '?' : 'Yes, ' + DAYS[d] + '!', 'good');
    } else {
      GK.bad(); GK.flash(b, false); oops();
      if (task.kind === 'ask') f.say(askHint(), 'bad');
      else f.say(hintFor(want), 'bad');
    }
  }
  function askHint() {
    var t = task;
    if (t.type === 'weekend') return 'Not quite. The weekend days have a star on them: Saturday and Sunday.';
    if (t.off > 0) return 'Not quite. Start at ' + DAYS[t.today] + ' and count forward ' + t.off + (t.off === 1 ? ' day.' : ' days.');
    return 'Not quite. Start at ' + DAYS[t.today] + ' and count back ' + (-t.off) + (t.off === -1 ? ' day.' : ' days.');
  }

  function roundWon() {
    busy = true; done++;
    f.progress(done, ROUNDS[f.level]);
    var st = stars.children[done - 1]; if (st) st.classList.add('on');
    GK.sfx.vroom(); setTimeout(function () { GK.sfx.good(); }, 200);
    f.say(GK.pick(['Toot toot! All aboard!', 'Choo choo, perfect order!', 'Tooty is so happy!', 'Off we go!']), 'good');
    engine.classList.add('gk-dw-cheer');
    if (!still) trainEl.classList.add('gk-dw-go');
    setTimeout(function () {
      trainEl.classList.remove('gk-dw-go');
      if (done >= ROUNDS[f.level]) return end();
      round();
    }, still ? 700 : 1500);
  }

  function end() {
    var txt = { gaps: 'You fixed 8 trains. Every day went back in its place, Sunday to Saturday.', week: 'You built 6 whole weeks, starting from different days. After Saturday comes Sunday again!', tomorrow: 'You worked out yesterday, tomorrow and the weekend 10 times. You know the week by heart.' }[f.level];
    GK.finish(f, { title: 'Tooty says thank you!', text: txt, sheet: root.dataset.sheet, onReplay: start });
    var show = E('div', { class: 'gk-dw-endtrain', 'aria-hidden': 'true' });
    DAYS.forEach(function (d, i) { show.appendChild(car(i)); });
    var endBox = f.area.querySelector('.gk-end'); if (endBox) endBox.insertBefore(show, endBox.children[1]);
  }

  /* ---------- Tooty reacts ---------- */
  function cheer() { engine.classList.remove('gk-dw-cheer', 'gk-dw-oops', 'gk-dw-sleep'); void engine.offsetWidth; engine.classList.add('gk-dw-cheer'); }
  function oops() { engine.classList.remove('gk-dw-cheer', 'gk-dw-oops', 'gk-dw-sleep'); void engine.offsetWidth; engine.classList.add('gk-dw-oops'); }
  function wake() {
    clearTimeout(idleT); if (engine) engine.classList.remove('gk-dw-sleep');
    idleT = setTimeout(function () { if (engine && engine.isConnected) { engine.classList.add('gk-dw-sleep'); f.say('Tooty is having a nap. Hook on the next carriage to wake him up!'); } }, 14000);
  }
  function hint() {
    GK.sfx.pop(); wake();
    var s = nextSlot(); if (!s) return;
    var want = +s.dataset.want;
    if (task.kind === 'ask') { f.say(askHint()); }
    else f.say('Look for the carriage that comes after ' + DAYS[wrap(want - 1)] + '.');
    platform.querySelectorAll('.gk-dw-car').forEach(function (b) { if (+b.dataset.day === want) { b.classList.remove('gk-dw-glow'); void b.offsetWidth; b.classList.add('gk-dw-glow'); } });
  }
  function sing() {
    wake();
    var base = task && task.kind !== 'ask' ? task.start : 0;
    for (var i = 0; i < 7; i++) (function (k) {
      setTimeout(function () { GK.sfx.count(k * 2); f.say(DAYS[wrap(base + k)] + '...'); }, k * 420);
    })(i);
    setTimeout(function () { f.say('That is 7 days in a week!'); }, 7 * 420);
  }

  GK.solve = function () {
    if (busy || !task) return;
    var s = nextSlot(); if (!s) return;
    var want = +s.dataset.want;
    var b = null; platform.querySelectorAll('.gk-dw-car').forEach(function (x) { if (+x.dataset.day === want) b = x; });
    if (b) tryPlace(b, s);
  };

  f = GK.frame({ root: root, rounds: ROUNDS.gaps, levels: [{ key: 'gaps', label: 'Fill the gaps' }, { key: 'week', label: 'Build the week' }, { key: 'tomorrow', label: 'Yesterday and tomorrow' }], onLevel: start });
  start();
})();
