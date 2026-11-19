(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10, NS = 'http://www.w3.org/2000/svg';
  var MINS = { hour: [0], half: [0, 30], quarter: [0, 15, 30, 45], five: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] };
  var f, done, busy = false, last = '';

  function s(tag, a) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); return n; }
  function txt(h, m) { return h + ':' + ('0' + m).slice(-2); }
  function words(h, m) {
    if (m === 0) return h + " o'clock";
    if (m === 30) return 'half past ' + h;
    if (m === 15) return 'quarter past ' + h;
    if (m === 45) return 'quarter to ' + (h % 12 + 1);
    return m + ' minutes past ' + h;
  }

  function clockSvg(h, m) {
    var svg = s('svg', { viewBox: '0 0 240 240', class: 'gk-clock', role: 'img', 'aria-label': 'A clock. Which time does it show?' });
    svg.appendChild(s('circle', { cx: 120, cy: 120, r: 112, fill: '#fff', stroke: '#2a2522', 'stroke-width': 7 }));
    svg.appendChild(s('circle', { cx: 120, cy: 120, r: 100, fill: '#f6f2ff', stroke: '#d9d0f2', 'stroke-width': 3 }));
    for (var i = 0; i < 60; i++) {
      var a = i * Math.PI / 30, big = i % 5 === 0, r1 = big ? 86 : 92;
      svg.appendChild(s('line', { x1: 120 + Math.sin(a) * r1, y1: 120 - Math.cos(a) * r1, x2: 120 + Math.sin(a) * 98, y2: 120 - Math.cos(a) * 98, stroke: big ? '#4a3290' : '#b9addf', 'stroke-width': big ? 4 : 2, 'stroke-linecap': 'round' }));
    }
    for (var n = 1; n <= 12; n++) {
      var an = n * Math.PI / 6, t = s('text', { x: 120 + Math.sin(an) * 66, y: 120 - Math.cos(an) * 66 + 8, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#4a3290', 'font-family': 'Fredoka, Trebuchet MS, Arial, sans-serif' });
      t.textContent = n; svg.appendChild(t);
    }
    var ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    var hour = s('line', { x1: 120, y1: 120, x2: 120, y2: 66, stroke: '#2a2522', 'stroke-width': 11, 'stroke-linecap': 'round' });
    var min = s('line', { x1: 120, y1: 120, x2: 120, y2: 36, stroke: '#c2541b', 'stroke-width': 7, 'stroke-linecap': 'round' });
    hour.setAttribute('transform', 'rotate(' + ha + ' 120 120)'); min.setAttribute('transform', 'rotate(' + ma + ' 120 120)');
    svg.appendChild(hour); svg.appendChild(min);
    svg.appendChild(s('circle', { cx: 120, cy: 120, r: 9, fill: '#2a2522' }));
    return svg;
  }

  function start() { done = 0; f.progress(0); f.say('Look at the short hand for the hour and the long orange hand for the minutes.'); round(); }

  function round() {
    var h, m, key;
    do { h = GK.rand(1, 12); m = GK.pick(MINS[f.level]); key = h + ':' + m; } while (key === last);
    last = key;
    var right = txt(h, m), opts = [right];
    GK.solve = function () { f.area.querySelectorAll('.gk-choice').forEach(function (x) { if (x.textContent === right) x.click(); }); };
    var cands = [txt(h % 12 + 1, m), txt(h === 1 ? 12 : h - 1, m)];
    var others = MINS[f.level].length > 1 ? MINS[f.level] : MINS.half;
    others.forEach(function (mm) { if (mm !== m) cands.push(txt(h, mm)); });
    var mh = Math.round(m / 5) || 12; if (mh !== h) cands.push(txt(mh, (h % 12) * 5)); // hands swapped
    GK.shuffle(cands).forEach(function (c) { if (opts.length < 3 && opts.indexOf(c) < 0) opts.push(c); });
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'What time is it?' }));
    var clk = clockSvg(h, m); f.area.appendChild(clk);
    var ch = GK.el('div', { class: 'gk-choices' });
    GK.shuffle(opts).forEach(function (o) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice', text: o });
      b.addEventListener('click', function () { answer(b, o === right, h, m); });
      ch.appendChild(b);
    });
    f.area.appendChild(ch);
    GK.sfx.flip();
  }

  function answer(btn, ok, h, m) {
    if (busy) return;
    GK.flash(btn, ok);
    if (!ok) { GK.bad(); f.say('Not yet. Find the hour first with the short hand.', 'bad'); return; }
    busy = true; done++; GK.good(btn); f.progress(done);
    f.say('Yes! It is ' + words(h, m) + '.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Clock champion!', text: 'Ten times read right. Try the next level for a bigger challenge.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1200);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'hour', label: "O'clock" }, { key: 'half', label: 'Half past' }, { key: 'quarter', label: 'Quarters' }, { key: 'five', label: 'Every 5 min' }], onLevel: start });
  start();
})();
