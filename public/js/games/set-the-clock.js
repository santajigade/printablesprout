(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10, NS = 'http://www.w3.org/2000/svg';
  var STEP = { hour: 60, half: 30, quarter: 15, five: 5 };
  var f, done, busy = false, last = '', target, cur, svg, hourHand, minHand, readout, grab = null;

  function s(tag, a) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); return n; }
  function txt(h, m) { return h + ':' + ('0' + m).slice(-2); }
  function words(h, m) {
    if (m === 0) return h + " o'clock";
    if (m === 30) return 'half past ' + h;
    if (m === 15) return 'quarter past ' + h;
    if (m === 45) return 'quarter to ' + (h % 12 + 1);
    return m + ' minutes past ' + h;
  }

  function buildClock() {
    svg = s('svg', { viewBox: '0 0 260 260', class: 'gk-stc-clock', role: 'img', 'aria-label': 'Clock to set. Drag the hands or use the buttons below.' });
    svg.appendChild(s('circle', { cx: 130, cy: 130, r: 122, fill: '#fff', stroke: '#2a2522', 'stroke-width': 7 }));
    svg.appendChild(s('circle', { cx: 130, cy: 130, r: 110, fill: '#eef7ff', stroke: '#c7dcef', 'stroke-width': 3 }));
    for (var i = 0; i < 60; i++) {
      var a = i * Math.PI / 30, big = i % 5 === 0, r1 = big ? 95 : 102;
      svg.appendChild(s('line', { x1: 130 + Math.sin(a) * r1, y1: 130 - Math.cos(a) * r1, x2: 130 + Math.sin(a) * 108, y2: 130 - Math.cos(a) * 108, stroke: big ? '#2f5d8a' : '#a9c3dc', 'stroke-width': big ? 4 : 2, 'stroke-linecap': 'round' }));
    }
    for (var n = 1; n <= 12; n++) {
      var an = n * Math.PI / 6, t = s('text', { x: 130 + Math.sin(an) * 74, y: 130 - Math.cos(an) * 74 + 8, 'text-anchor': 'middle', 'font-size': 23, 'font-weight': 700, fill: '#2f5d8a', 'font-family': 'Fredoka, Trebuchet MS, Arial, sans-serif' });
      t.textContent = n; svg.appendChild(t);
    }
    hourHand = s('g', { class: 'gk-stc-hand' });
    hourHand.appendChild(s('line', { x1: 130, y1: 130, x2: 130, y2: 70, stroke: 'transparent', 'stroke-width': 34, 'stroke-linecap': 'round' }));
    hourHand.appendChild(s('line', { x1: 130, y1: 130, x2: 130, y2: 70, stroke: '#2a2522', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    minHand = s('g', { class: 'gk-stc-hand' });
    minHand.appendChild(s('line', { x1: 130, y1: 130, x2: 130, y2: 34, stroke: 'transparent', 'stroke-width': 30, 'stroke-linecap': 'round' }));
    minHand.appendChild(s('line', { x1: 130, y1: 130, x2: 130, y2: 34, stroke: '#c2541b', 'stroke-width': 8, 'stroke-linecap': 'round' }));
    minHand.appendChild(s('circle', { cx: 130, cy: 40, r: 9, fill: '#c2541b' }));
    svg.appendChild(hourHand); svg.appendChild(minHand);
    svg.appendChild(s('circle', { cx: 130, cy: 130, r: 10, fill: '#2a2522' }));
    hourHand.addEventListener('pointerdown', function (e) { grab = 'h'; e.stopPropagation(); down(e); });
    minHand.addEventListener('pointerdown', function (e) { grab = 'm'; e.stopPropagation(); down(e); });
    svg.addEventListener('pointerdown', function (e) {
      var p = pt(e), d = Math.sqrt(p.x * p.x + p.y * p.y);
      if (d < 20) return;
      grab = (f.level !== 'hour' && d > 80) ? 'm' : 'h';
      down(e);
    });
    svg.addEventListener('pointermove', function (e) { if (grab) { e.preventDefault(); move(e); } });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { svg.addEventListener(ev, function () { if (grab) { grab = null; svg.classList.remove('gk-stc-drag'); } }); });
    return svg;
  }
  function pt(e) {
    var r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * 260 - 130, y: (e.clientY - r.top) / r.height * 260 - 130 };
  }
  function down(e) { if (busy) { grab = null; return; } try { svg.setPointerCapture(e.pointerId); } catch (x) {} svg.classList.add('gk-stc-drag'); move(e); }
  function move(e) {
    if (busy) return;
    var p = pt(e), deg = (Math.atan2(p.x, -p.y) * 180 / Math.PI + 360) % 360, before = cur.h + ':' + cur.m;
    if (grab === 'm') {
      var st = STEP[f.level]; if (st >= 60) return;
      var nm = Math.round(deg / 6 / st) * st % 60;
      // carry the hour when the minute hand passes 12
      if (cur.m >= 45 && nm <= 15 && nm < cur.m) cur.h = cur.h % 12 + 1;
      else if (cur.m <= 15 && nm >= 45 && nm > cur.m) cur.h = cur.h === 1 ? 12 : cur.h - 1;
      cur.m = nm;
    } else {
      var nh = Math.round(deg / 30 - cur.m / 60);
      nh = ((nh % 12) + 12) % 12 || 12; cur.h = nh;
    }
    if (before !== cur.h + ':' + cur.m) { GK.sfx.tap(); draw(); }
  }
  function draw() {
    hourHand.setAttribute('transform', 'rotate(' + (((cur.h % 12) + cur.m / 60) * 30) + ' 130 130)');
    minHand.setAttribute('transform', 'rotate(' + (cur.m * 6) + ' 130 130)');
    readout.textContent = 'Your clock: ' + txt(cur.h, cur.m);
  }
  function nudge(which, dir) {
    if (busy) return;
    GK.sfx.tap();
    if (which === 'h') { cur.h = ((cur.h - 1 + dir + 12) % 12) + 1; }
    else {
      var st = STEP[f.level], nm = cur.m + dir * st;
      if (nm >= 60) { nm -= 60; cur.h = cur.h % 12 + 1; }
      if (nm < 0) { nm += 60; cur.h = cur.h === 1 ? 12 : cur.h - 1; }
      cur.m = nm;
    }
    draw();
  }
  function stepBtn(label, aria, fn) { return GK.el('button', { type: 'button', class: 'gk-stc-step', text: label, 'aria-label': aria, onclick: fn }); }

  function start() { done = 0; f.progress(0); f.say(f.level === 'hour' ? 'Drag the short hand to the hour. The long hand stays on 12.' : 'Set the long orange hand for the minutes, then the short hand for the hour.'); round(); }

  function round() {
    var st = STEP[f.level], h, m, key, opts = [];
    for (var x = 0; x < 60; x += st) opts.push(x);
    if (f.level !== 'hour') opts = opts.filter(function (v) { return v !== 0 || Math.random() < 0.25; });
    do { h = GK.rand(1, 12); m = GK.pick(opts); key = h + ':' + m; } while (key === last);
    last = key; target = { h: h, m: m };
    cur = { h: 12, m: 0 };
    if (cur.h === h && cur.m === m) cur.h = 6;
    f.area.innerHTML = '';
    var q = GK.el('div', { class: 'gk-stc-q' }, [
      GK.el('span', { class: 'gk-stc-label', text: 'Set the clock to' }),
      GK.el('span', { class: 'gk-stc-time', text: txt(h, m) }),
      GK.el('span', { class: 'gk-stc-words', text: words(h, m) }),
    ]);
    f.area.appendChild(q);
    f.area.appendChild(buildClock());
    readout = GK.el('p', { class: 'gk-stc-read', 'aria-live': 'polite' });
    f.area.appendChild(readout);
    var ctrl = GK.el('div', { class: 'gk-stc-ctrl' });
    ctrl.appendChild(GK.el('div', { class: 'gk-stc-pair' }, [stepBtn('◀', 'Hour back', function () { nudge('h', -1); }), GK.el('span', { text: 'Hour' }), stepBtn('▶', 'Hour forward', function () { nudge('h', 1); })]));
    if (f.level !== 'hour') ctrl.appendChild(GK.el('div', { class: 'gk-stc-pair gk-stc-min' }, [stepBtn('◀', 'Minutes back', function () { nudge('m', -1); }), GK.el('span', { text: 'Minutes' }), stepBtn('▶', 'Minutes forward', function () { nudge('m', 1); })]));
    f.area.appendChild(ctrl);
    var chk = GK.el('button', { type: 'button', class: 'gk-big gk-stc-check', text: '✔ Check my clock' });
    chk.addEventListener('click', function () { check(chk); });
    f.area.appendChild(chk);
    draw();
    GK.sfx.flip();
    GK.solve = function () { if (busy) return; cur = { h: target.h, m: target.m }; draw(); chk.click(); };
  }

  function check(btn) {
    if (busy) return;
    var okM = cur.m === target.m, okH = cur.h === target.h;
    if (!okM || !okH) {
      GK.bad(); GK.flash(btn, false);
      if (!okM) {
        var n = target.m / 5 || 12;
        f.say(target.m === 0 ? 'Almost. For o\'clock the long hand points straight up at 12.' : 'Almost. Count by fives: ' + target.m + ' minutes means the long hand points at the ' + n + '.', 'bad');
      } else if (target.m >= 30) f.say('The minutes are right. After half past, the short hand sits between ' + target.h + ' and ' + (target.h % 12 + 1) + '.', 'bad');
      else f.say('The minutes are right. Now move the short hand to the ' + target.h + '.', 'bad');
      return;
    }
    busy = true; done++; GK.good(btn); GK.flash(btn, true); f.progress(done);
    svg.classList.add('gk-stc-ok');
    f.say('Yes! The clock says ' + words(target.h, target.m) + '.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Clock setter!', text: 'You set ten clocks. Try the next level, or ask a grown up for a time to set.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1300);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'hour', label: "O'clock" }, { key: 'half', label: 'Half past' }, { key: 'quarter', label: 'Quarters' }, { key: 'five', label: 'Every 5 min' }], onLevel: start });
  start();
})();
