(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var GATES = 10, LANES = 3;
  // speed is in road heights per second; each level starts slower for harder sums
  var LEVELS = {
    // very slow on purpose so children have time to think: about 20, 23 and 30 seconds per gate, and the road never speeds up
    add: { speed: 0.045, gain: 0 },
    times: { speed: 0.04, gain: 0 },
    brain: { speed: 0.03, gain: 0 },
  };
  var f, cv, cx, W = 0, H = 0, dpr = 1, raf = 0, lastT = 0;
  var lane, carX, gate, q, done, speed, scroll, running, busy, wobble, waitT, qEl, startBtn, trees;

  function R(a, b) { return GK.rand(a, b); }
  function makeQ() {
    var L = f.level, a, b, c, t;
    if (L === 'add') {
      if (Math.random() < 0.5) { a = R(6, 59); b = R(3, 40); return { text: a + ' + ' + b, ans: a + b }; }
      a = R(15, 90); b = R(3, a - 2); return { text: a + ' − ' + b, ans: a - b };
    }
    if (L === 'times') {
      a = R(2, 12); b = R(2, 12);
      if (Math.random() < 0.55) return { text: a + ' × ' + b, ans: a * b };
      return { text: (a * b) + ' ÷ ' + a, ans: b };
    }
    t = R(1, 4);
    if (t === 1) { a = R(3, 12); b = R(3, 12); c = R(2, 30); return { text: a + ' × ' + b + ' + ' + c, ans: a * b + c }; }
    if (t === 2) { a = R(13, 49); b = R(3, 9); return { text: a + ' × ' + b, ans: a * b }; }
    if (t === 3) { b = R(3, 9); a = R(12, 99); return { text: (a * b) + ' ÷ ' + b, ans: a }; }
    a = R(4, 12); b = R(4, 12); c = R(2, a * b - 1); return { text: a + ' × ' + b + ' − ' + c, ans: a * b - c };
  }
  function wrongs(ans) {
    var near = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans + 5, ans - 5, ans + 3];
    if (f.level === 'brain') near.push(ans + 11, ans - 9, ans + 20);
    var out = [];
    GK.shuffle(near).forEach(function (n) { if (out.length < LANES - 1 && n >= 0 && n !== ans && out.indexOf(n) < 0) out.push(n); });
    return out;
  }
  function newGate(sameQ) {
    if (!sameQ) { q = makeQ(); }
    qEl.textContent = q.text + ' = ?';
    var vals = GK.shuffle([q.ans].concat(wrongs(q.ans)));
    gate = { y: -0.12, vals: vals, right: vals.indexOf(q.ans), hit: false };
  }

  function laneX(i) { var rw = W * 0.72, left = (W - rw) / 2; return left + rw / LANES * (i + 0.5); }
  function steer(d) {
    if (!running) return;
    var n = Math.max(0, Math.min(LANES - 1, lane + d));
    if (n !== lane) { lane = n; GK.sfx.tap(); }
  }

  function resize() {
    var w = cv.parentNode.clientWidth;
    dpr = window.devicePixelRatio || 1;
    W = w; H = Math.round(Math.min(Math.max(w * 0.9, 340), 480));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (carX == null || !running) carX = laneX(lane);
    draw();
  }

  function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function carY() { return H * 0.8; }

  function drawCar(x, y, s) {
    cx.save(); cx.translate(x, y); cx.rotate(wobble * 0.25 * Math.sin(wobble * 30));
    cx.lineWidth = 3; cx.strokeStyle = '#2a2522';
    cx.fillStyle = '#2a2522';
    [[-0.42, -0.3], [0.42, -0.3], [-0.42, 0.32], [0.42, 0.32]].forEach(function (p) { rr(p[0] * s - s * 0.1, p[1] * s - s * 0.13, s * 0.2, s * 0.26, 4); cx.fill(); });
    cx.fillStyle = '#e4572e'; rr(-s * 0.36, -s * 0.55, s * 0.72, s * 1.1, s * 0.22); cx.fill(); cx.stroke();
    cx.fillStyle = '#cfe8ff'; rr(-s * 0.26, -s * 0.3, s * 0.52, s * 0.24, 6); cx.fill(); cx.stroke();
    cx.fillStyle = '#f6c945'; cx.beginPath(); cx.arc(-s * 0.2, -s * 0.48, s * 0.06, 0, 7); cx.arc(s * 0.2, -s * 0.48, s * 0.06, 0, 7); cx.fill();
    cx.fillStyle = '#fff'; rr(-s * 0.06, s * 0.0, s * 0.12, s * 0.45, 3); cx.fill();
    cx.restore();
  }

  function draw() {
    if (!cx || !W) return;
    var rw = W * 0.72, left = (W - rw) / 2;
    cx.fillStyle = '#8cc56f'; cx.fillRect(0, 0, W, H);
    cx.fillStyle = '#6f6a66'; cx.fillRect(left, 0, rw, H);
    cx.fillStyle = '#fff'; cx.fillRect(left + 4, 0, 5, H); cx.fillRect(left + rw - 9, 0, 5, H);
    var dash = 46, off = (scroll * H) % dash;
    cx.fillStyle = '#f2f2ee';
    for (var i = 1; i < LANES; i++) { var x = left + rw / LANES * i - 3; for (var y = -dash + off; y < H; y += dash) cx.fillRect(x, y, 6, 24); }
    trees.forEach(function (t) {
      var y = ((t.y + scroll) % 1.2) * H - 0.1 * H, x = t.side < 0 ? left / 2 + t.dx * left * 0.3 : W - left / 2 + t.dx * left * 0.3;
      if (left < 26) return;
      cx.fillStyle = '#4f9a3c'; cx.strokeStyle = '#2a2522'; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(x, y, Math.min(left * 0.32, 22), 0, 7); cx.fill(); cx.stroke();
    });
    if (gate) {
      var gy = gate.y * H, bw = rw / LANES;
      cx.fillStyle = 'rgba(42,37,34,.85)'; cx.fillRect(left, gy - 3, rw, 6);
      gate.vals.forEach(function (v, i) {
        var gx = left + bw * i + bw / 2, r = Math.min(bw * 0.36, 40);
        var col = gate.hit && i === gate.right ? '#5aa84a' : '#fff';
        cx.fillStyle = col; cx.strokeStyle = '#2a2522'; cx.lineWidth = 3;
        rr(gx - r * 1.15, gy - r * 0.8, r * 2.3, r * 1.6, 14); cx.fill(); cx.stroke();
        cx.fillStyle = '#2a2522'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        var fs = Math.min(r * 0.9, String(v).length > 3 ? r * 0.72 : r * 0.9);
        cx.font = '800 ' + Math.round(fs) + 'px Trebuchet MS, Segoe UI, Arial, sans-serif';
        cx.fillText(String(v), gx, gy + 1);
      });
    }
    drawCar(carX, carY(), Math.min(rw / LANES * 0.62, 70));
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
    if (!running) { draw(); return; }
    scroll += dt * speed * 2.2;
    var tx = laneX(lane); carX += (tx - carX) * Math.min(1, dt * 14);
    if (wobble > 0) wobble = Math.max(0, wobble - dt);
    if (waitT > 0) { waitT -= dt; if (waitT <= 0) newGate(gate && gate.retry); }
    else if (gate && !gate.hit) {
      gate.y += dt * speed;
      if (gate.y * H >= carY() - 10) cross();
    } else if (gate && gate.hit) { gate.y += dt * speed; if (gate.y > 1.2) gate = null; }
    draw();
  }

  function cross() {
    var ok = lane === gate.right;
    if (ok) {
      gate.hit = true; done++; f.progress(done); GK.sfx.good(); speed += LEVELS[f.level].gain;
      f.say(GK.pick(['Zoom! ', 'Right gate! ', 'Nice driving! ']) + q.text + ' = ' + q.ans + '.', 'good');
      if (done >= GATES) { running = false; setTimeout(function () { stop(); GK.finish(f, { title: 'You won the race!', text: 'Ten right gates in a row of fast math. Try a harder level next time.', sheet: root.dataset.sheet, onReplay: start }); }, 700); return; }
      waitT = 0.9; gate.retry = false;
    } else {
      GK.bad(); wobble = 0.5;
      f.say('Oops, that gate was ' + gate.vals[lane] + '. Work out ' + q.text + ' again. The next gate is coming!', 'bad');
      gate = { y: 2, vals: [], right: -1, hit: true, retry: true }; waitT = 1.1;
    }
  }

  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function go() {
    if (running) return;
    if (startBtn) { startBtn.remove(); startBtn = null; }
    running = true; GK.sfx.vroom(); newGate(false);
    f.say('Steer into the lane with the right answer.');
    try { cv.focus({ preventScroll: true }); } catch (e) {}
  }

  function start() {
    stop(); done = 0; lane = 1; carX = null; speed = LEVELS[f.level].speed; scroll = 0; running = false; busy = false; wobble = 0; waitT = 0; gate = null; lastT = 0;
    trees = []; for (var i = 0; i < 8; i++) trees.push({ y: i * 0.15, side: i % 2 ? 1 : -1, dx: (Math.random() - 0.5) });
    f.progress(0); f.area.innerHTML = '';
    qEl = GK.el('p', { class: 'gk-q gk-rr-q', 'aria-live': 'polite', text: 'Ready?' });
    var wrap = GK.el('div', { class: 'gk-rr-wrap' });
    cv = GK.el('canvas', { class: 'gk-rr-canvas', tabindex: '0', role: 'img', 'aria-label': 'Road with three lanes. Answer gates come toward your car.' });
    cx = cv.getContext('2d');
    wrap.appendChild(cv);
    startBtn = GK.el('button', { type: 'button', class: 'gk-big gk-rr-start', text: '🏁 Start the race' });
    startBtn.addEventListener('click', function () { GK.sfx.pop(); go(); });
    wrap.appendChild(startBtn);
    cv.addEventListener('pointerdown', function (e) {
      if (!running) return;
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left;
      steer(x < carX ? -1 : 1);
    });
    var left = GK.el('button', { type: 'button', class: 'gk-choice gk-rr-btn', 'aria-label': 'Steer left', text: '◀' });
    var right = GK.el('button', { type: 'button', class: 'gk-choice gk-rr-btn', 'aria-label': 'Steer right', text: '▶' });
    left.addEventListener('click', function () { steer(-1); });
    right.addEventListener('click', function () { steer(1); });
    var pad = GK.el('div', { class: 'gk-rr-pad' }, [left, right]);
    f.area.appendChild(qEl); f.area.appendChild(wrap); f.area.appendChild(pad);
    f.say('Tap Start. Then use the arrows, the arrow keys, or tap the road to change lanes.');
    resize();
    GK.solve = function () {
      if (!running) { go(); }
      if (gate && !gate.hit) { lane = gate.right; carX = laneX(lane); gate.y = (carY() - 8) / H; }
      else { waitT = Math.min(waitT, 0.01); }
    };
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', function (e) {
    if (!running || !document.body.contains(cv)) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); steer(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); steer(1); }
  });
  window.addEventListener('resize', function () { if (cv && document.body.contains(cv)) resize(); });

  f = GK.frame({ root: root, rounds: GATES, levels: [{ key: 'add', label: 'Add and subtract' }, { key: 'times', label: 'Times and divide' }, { key: 'brain', label: 'Two step (9 to 10)' }], onLevel: start });
  start();
})();
