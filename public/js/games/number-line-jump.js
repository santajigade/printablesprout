(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10, NS = 'http://www.w3.org/2000/svg';
  var f, done, q, busy = false, lastKey = '', tries, frog, arcs, ticks;

  function makeQ() {
    var lv = f.level, s, j, lo, step = 1;
    if (lv === 'ones') {
      var a = GK.rand(1, 5), fwd = Math.random() < 0.55;
      s = fwd ? GK.rand(0, 10 - a) : GK.rand(a, 10);
      j = [fwd ? a : -a]; lo = 0;
    } else if (lv === 'two') {
      var a1, a2, m, e;
      do { s = GK.rand(0, 20); a1 = GK.rand(2, 6) * (Math.random() < 0.6 ? 1 : -1); a2 = GK.rand(1, 5) * (a1 > 0 ? -1 : 1) * (Math.random() < 0.3 ? -1 : 1); m = s + a1; e = m + a2; }
      while (m < 0 || m > 20 || e < 0 || e > 20 || Math.max(s, m, e) - Math.min(s, m, e) > 10 || e === s);
      j = [a1, a2];
      var mn = Math.min(s, m, e), mx = Math.max(s, m, e);
      lo = GK.rand(Math.max(0, mx - 10), Math.min(mn, 10)); // window of 11 numbers that shows every stop
    } else {
      step = 10;
      var b1, b2, mm, ee, two = Math.random() < 0.5;
      do { s = GK.rand(0, 10) * 10; b1 = GK.rand(1, 5) * 10 * (Math.random() < 0.55 ? 1 : -1); b2 = two ? GK.rand(1, 4) * 10 * (b1 > 0 ? -1 : 1) : 0; mm = s + b1; ee = mm + b2; }
      while (mm < 0 || mm > 100 || ee < 0 || ee > 100 || ee === s);
      j = two ? [b1, b2] : [b1]; lo = 0;
    }
    var end = s; j.forEach(function (x) { end += x; });
    return { s: s, j: j, end: end, lo: lo, step: step };
  }

  function words(x, step) { var n = Math.abs(x); return n + (step === 1 && n === 1 ? ' step' : '') + (x > 0 ? ' forward' : ' back'); }

  function start() {
    done = 0; f.progress(0);
    f.say(f.level === 'ones' ? 'Forward means bigger numbers. Back means smaller.' : f.level === 'two' ? 'Two jumps now. Follow the frog in your head.' : 'Big jumps! Every mark is 10.');
    round();
  }

  function xOf(v) { return ((v - q.lo) / (10 * q.step)) * 100; }

  function round() {
    var k;
    do { q = makeQ(); k = q.s + ':' + q.j.join(','); } while (k === lastKey);
    lastKey = k; tries = 0;
    f.area.innerHTML = '';
    var text = 'The frog is on ' + q.s + '. It jumps ' + words(q.j[0], q.step) + (q.j[1] ? ', then ' + words(q.j[1], q.step) : '') + '.';
    f.area.appendChild(GK.el('p', { class: 'gk-nlj-q', text: text }));
    f.area.appendChild(GK.el('p', { class: 'gk-nlj-ask', text: 'Where does it land? Tap the number.' }));
    var line = GK.el('div', { class: 'gk-nlj-line' });
    var sky = GK.el('div', { class: 'gk-nlj-sky' });
    arcs = document.createElementNS(NS, 'svg'); arcs.setAttribute('viewBox', '0 0 100 40'); arcs.setAttribute('preserveAspectRatio', 'none'); arcs.setAttribute('class', 'gk-nlj-arcs'); arcs.setAttribute('aria-hidden', 'true');
    sky.appendChild(arcs);
    frog = GK.el('span', { class: 'gk-nlj-frog', 'aria-hidden': 'true', text: '🐸' });
    frog.style.left = 'calc(' + col(q.s) + ')';
    sky.appendChild(frog);
    line.appendChild(sky);
    var row = GK.el('div', { class: 'gk-nlj-ticks' }); ticks = {};
    for (var i = 0; i <= 10; i++) {
      var v = q.lo + i * q.step;
      var b = GK.el('button', { type: 'button', class: 'gk-nlj-tick' + (v === q.s ? ' gk-nlj-start' : ''), 'aria-label': String(v) }, [GK.el('span', { text: String(v) })]);
      (function (v, b) { b.addEventListener('click', function () { answer(v, b); }); })(v, b);
      ticks[v] = b; row.appendChild(b);
    }
    line.appendChild(row);
    f.area.appendChild(line);
    GK.sfx.flip();
    GK.solve = function () { if (!busy) ticks[q.end].click(); };
  }
  // center of tick column i out of 11 equal columns
  function col(v) { var i = (v - q.lo) / q.step; return ((i + 0.5) / 11 * 100) + '%'; }
  function pc(v) { return ((v - q.lo) / q.step + 0.5) / 11 * 100; }

  function arc(a, b, color) {
    var x1 = pc(a), x2 = pc(b), h = Math.min(36, 8 + Math.abs(x2 - x1) * 0.9);
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M' + x1 + ' 39 Q' + ((x1 + x2) / 2) + ' ' + (39 - h * 2) + ' ' + x2 + ' 39');
    p.setAttribute('stroke', color); p.setAttribute('stroke-width', '3'); p.setAttribute('fill', 'none'); p.setAttribute('vector-effect', 'non-scaling-stroke'); p.setAttribute('stroke-dasharray', '6 5');
    arcs.appendChild(p);
  }

  function hops(cb) { // move the frog one mark at a time so the child can count along
    var stops = [], v = q.s;
    q.j.forEach(function (x) { var d = x > 0 ? q.step : -q.step; for (var k = 0; k < Math.abs(x) / q.step; k++) { v += d; stops.push(v); } });
    var i = 0, prev = q.s;
    (function next() {
      if (i >= stops.length) { cb(); return; }
      var to = stops[i++]; arc(prev, to, i <= Math.abs(q.j[0]) / q.step ? '#2f8a4a' : '#c2541b'); prev = to;
      frog.style.left = 'calc(' + col(to) + ')'; GK.sfx.count(i);
      setTimeout(next, stops.length > 8 ? 160 : 260);
    })();
  }

  function answer(v, b) {
    if (busy) return;
    if (v !== q.end) {
      tries++; GK.bad(); GK.flash(b, false);
      var first = q.j[0];
      if (tries === 1) f.say(v === q.s + first && q.j[1] ? 'That is where the first jump lands. Now do the second jump.' : (first > 0) !== (v > q.s) && !q.j[1] ? (first > 0 ? 'Forward means the numbers get bigger.' : 'Back means the numbers get smaller.') : 'Not quite. Count each hop from ' + q.s + '.', 'bad');
      else f.say('Put your finger on ' + q.s + ' and move ' + (q.step === 10 ? Math.abs(first) / 10 + ' marks' : Math.abs(first) + ' marks') + (first > 0 ? ' to the right' : ' to the left') + (q.j[1] ? ' first' : '') + '.', 'bad');
      return;
    }
    busy = true; done++; f.progress(done); GK.good(b); GK.flash(b, true);
    var eq = String(q.s); q.j.forEach(function (x) { eq += (x > 0 ? ' + ' : ' - ') + Math.abs(x); }); eq += ' = ' + q.end;
    hops(function () {
      f.say('Yes! ' + eq, 'good');
      setTimeout(function () {
        busy = false;
        if (done >= ROUNDS) GK.finish(f, { title: 'Hop, hop, hooray!', text: 'Ten jumps right. Draw a number line with chalk outside and jump it for real.', sheet: root.dataset.sheet, onReplay: start });
        else round();
      }, 1500);
    });
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'ones', label: 'One jump to 10' }, { key: 'two', label: 'Two jumps to 20' }, { key: 'tens', label: 'Jumps of 10' }], onLevel: start });
  start();
})();
