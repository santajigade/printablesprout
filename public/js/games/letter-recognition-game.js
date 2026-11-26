(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  /* Letter Catch: apples with letters fall from the big orchard tree. Move Lulu the bunny so her basket catches the letter that is asked for. */
  var ROUNDS = { big: 10, small: 10, match: 10 };
  var BIG = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var SMALL = 'abcdefghijkmnopqrstuvwxyz'.split(''); // no small l: it looks like a capital I in many fonts
  var LOOK = { b: 'dpq', d: 'bpq', p: 'qbd', q: 'pdb', m: 'nwu', n: 'mhu', u: 'nvw', h: 'nk', a: 'oe', e: 'ac', o: 'ac', i: 'jt', j: 'it', v: 'wy', w: 'vm', E: 'FB', F: 'EP', M: 'NW', N: 'MH', O: 'QC', Q: 'OG', C: 'GO', P: 'RB', R: 'PB', V: 'WY', W: 'VM' };
  var FALL = { big: 34, small: 40, match: 46 };
  var f, cv, cx, W, H, S, R, done, target, apples, bun, waiting, caught, run = 0, last = 0, spawnT, sinceTarget, pointerX = null, dir = 0, pops, used;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FONT = '"Trebuchet MS", "Segoe UI", Arial, sans-serif';
  function E(t, a, k) { return GK.el(t, a, k); }
  function shown(ch) { return ch; }
  function wantCh() { return f.level === 'match' ? target.toLowerCase() : target; }

  function size() {
    var w = Math.min(cv.parentNode.clientWidth, 860);
    var oldW = W || w;
    W = w; H = Math.round(Math.max(400, Math.min(520, w * 0.58)));
    S = H / 420; R = Math.max(25, 30 * S);
    var dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (bun) { var k = W / oldW; bun.x *= k; apples.forEach(function (a) { a.x *= k; }); }
  }
  function groundY() { return H - 34 * S; }
  function basketW() { return Math.max(96, 128 * S); }
  function basketTop() { return groundY() - 150 * S; }
  function startY() { return 18 + 3 * R; }

  function start() {
    run++; done = 0; apples = []; pops = []; caught = []; used = []; waiting = false; spawnT = 0.4; sinceTarget = 0;
    f.progress(0, ROUNDS[f.level]);
    f.area.innerHTML = '';
    var wrap = E('div', { class: 'gk-lc-wrap' });
    cv = E('canvas', { class: 'gk-lc-cv', tabindex: '0', 'aria-label': 'Orchard. Move the bunny with the arrow keys, by dragging, or with the buttons below.' });
    wrap.appendChild(cv); f.area.appendChild(wrap);
    cx = cv.getContext('2d');
    var left = E('button', { type: 'button', class: 'gk-lc-mv', 'aria-label': 'Move left', text: '◀' });
    var right = E('button', { type: 'button', class: 'gk-lc-mv', 'aria-label': 'Move right', text: '▶' });
    [[left, -1], [right, 1]].forEach(function (p) {
      p[0].addEventListener('pointerdown', function (e) { e.preventDefault(); dir = p[1]; pointerX = null; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { p[0].addEventListener(ev, function () { dir = 0; }); });
      p[0].addEventListener('click', function (e) { if (e.detail === 0) { pointerX = null; bun.x = clampX(bun.x + p[1] * 60); } });
    });
    var bar = E('div', { class: 'gk-lc-ctl' }, [left, E('span', { class: 'gk-lc-tip', text: 'Drag, use arrow keys or hold a button' }), right]);
    f.area.appendChild(bar);
    W = 0; bun = null; size();
    bun = { x: W / 2, hop: 0, shake: 0, blink: 0, face: 1 };
    cv.addEventListener('pointerdown', function (e) { pointerX = e.clientX - cv.getBoundingClientRect().left; try { cv.setPointerCapture(e.pointerId); } catch (x) {} cv.focus({ preventScroll: true }); });
    cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'mouse') pointerX = e.clientX - cv.getBoundingClientRect().left; });
    cv.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); pointerX = null; dir = e.key === 'ArrowLeft' ? -1 : 1; }
    });
    cv.addEventListener('keyup', function () { dir = 0; });
    newTarget();
    var me = run; last = performance.now();
    requestAnimationFrame(function loop(t) {
      if (me !== run || !cv.isConnected) return;
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      step(dt); draw(t / 1000);
      requestAnimationFrame(loop);
    });
  }
  function clampX(x) { var m = basketW() / 2 + 6; return Math.max(m, Math.min(W - m, x)); }

  function newTarget() {
    var pool = f.level === 'small' ? SMALL : f.level === 'match' ? BIG.filter(function (c) { return c !== 'L'; }) : BIG, t;
    do { t = GK.pick(pool); } while (used.indexOf(t) >= 0 && used.length < pool.length);
    used.push(t); target = t; waiting = false; sinceTarget = 2;
    apples.forEach(function (a) { if (a.state === 'fall') a.state = 'fade'; });
    var msg = f.level === 'match' ? 'Catch the small letter for big ' + t + '.' : 'Catch the letter ' + t + '!';
    f.say(done === 0 ? msg + ' Move Lulu under the right apple.' : msg);
    GK.sfx.note();
  }

  function spawn(forceTarget) {
    var isT = forceTarget || sinceTarget >= 2 || (!apples.some(function (a) { return a.state === 'fall' && a.t; }) && Math.random() < 0.55);
    var ch, want = wantCh();
    if (isT) { ch = want; sinceTarget = 0; }
    else {
      sinceTarget++;
      var near = LOOK[want] && Math.random() < 0.6 ? LOOK[want].split('') : null;
      var pool = near || (f.level === 'big' ? BIG : SMALL);
      do { ch = GK.pick(pool); } while (ch === want);
    }
    var x, ok, tries = 0;
    do { x = R + 10 + Math.random() * (W - 2 * R - 20); ok = apples.every(function (a) { return a.state !== 'fall' || Math.abs(a.x - x) > R * 2.4 || a.y > H * 0.45; }); } while (!ok && ++tries < 20);
    var a = { x: x, y: startY(), vy: 0, vx: 0, ch: ch, t: ch === want, state: 'fall', rot: (Math.random() - 0.5) * 0.4, spin: 0, life: 1, grow: 0 };
    apples.push(a); return a;
  }

  function step(dt) {
    if (!bun) return;
    var falling = apples.filter(function (a) { return a.state === 'fall'; }).length;
    if (!waiting) {
      spawnT -= dt;
      var maxN = f.level === 'big' ? 2 : 3;
      if (spawnT <= 0 && falling < maxN) { spawn(); spawnT = (f.level === 'big' ? 2.2 : 1.7) + Math.random() * 0.8; }
    }
    // move bunny
    var sp = 520 * S + 120;
    if (dir) { bun.x = clampX(bun.x + dir * sp * dt); bun.face = dir; }
    else if (pointerX != null) {
      var d = clampX(pointerX) - bun.x;
      if (Math.abs(d) > 1) { var mv = Math.sign(d) * Math.min(Math.abs(d), sp * 1.3 * dt); bun.x += mv; bun.face = Math.sign(d); }
    }
    bun.hop = Math.max(0, bun.hop - dt * 2.2); bun.shake = Math.max(0, bun.shake - dt * 1.8);
    bun.blink -= dt; if (bun.blink < -3.2) bun.blink = 0.14;
    var bt = basketTop(), bw = basketW(), gy = groundY(), speed = FALL[f.level] * S * (still ? 0.85 : 1);
    apples.forEach(function (a) {
      if (a.state === 'fall') {
        a.grow = Math.min(1, a.grow + dt * 3);
        a.vy = speed; a.y += a.vy * dt; a.rot += Math.sin(a.y / 40) * dt * 0.4;
        if (a.y + R * 0.7 >= bt && a.y < bt + 26 * S && Math.abs(a.x - bun.x) < bw / 2 + R * 0.3) catchIt(a);
        else if (a.y + R >= gy + 10 * S) { a.state = 'roll'; a.vx = (a.x < W / 2 ? 1 : -1) * 60; a.y = gy + 10 * S - R; }
      } else if (a.state === 'bounce') {
        a.vy += 900 * S * dt; a.x += a.vx * dt; a.y += a.vy * dt; a.spin += dt * 8;
        if (a.y + R >= gy + 10 * S) { a.state = 'roll'; a.y = gy + 10 * S - R; }
      } else if (a.state === 'roll') {
        a.x += a.vx * dt; a.spin += a.vx * dt / R; a.life -= dt * 0.7;
      } else if (a.state === 'fade') {
        a.y += speed * dt; a.life -= dt * 2.5;
      } else if (a.state === 'fly') {
        a.k = Math.min(1, a.k + dt * 2.6);
        a.x = a.x0 + (bun.x - a.x0) * a.k; a.y = a.y0 + (bt - 6 * S - a.y0) * a.k - Math.sin(a.k * Math.PI) * 60 * S;
        if (a.k >= 1) a.life = 0;
      }
    });
    apples = apples.filter(function (a) { return a.life > 0 && a.x > -R * 2 && a.x < W + R * 2 && a.y < H + R * 2; });
    pops.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; });
    pops = pops.filter(function (p) { return p.t < p.max; });
  }

  function sparkle(x, y, col, n) {
    if (still) n = Math.min(n, 4);
    for (var i = 0; i < n; i++) { var an = Math.random() * Math.PI * 2, v = 80 + Math.random() * 160; pops.push({ x: x, y: y, vx: Math.cos(an) * v, vy: Math.sin(an) * v - 80, t: 0, max: 0.8, c: col || GK.pick(['#ffd23f', '#f27eb0', '#7bb661', '#5aa0e6']) }); }
  }
  function label(x, y, text, col) { pops.push({ x: x, y: y, vx: 0, vy: -50, t: 0, max: 1.3, text: text, c: col }); }

  function catchIt(a) {
    if (waiting && a.t) return;
    if (a.t) {
      waiting = true; done++;
      a.state = 'fly'; a.k = 0; a.x0 = a.x; a.y0 = a.y;
      caught.push(a.ch);
      bun.hop = 1; GK.sfx.good(); sparkle(a.x, a.y, null, 16); label(a.x, a.y - R, f.level === 'match' ? target + ' and ' + a.ch + '!' : a.ch + '!', '#2f7a4f');
      f.progress(done, ROUNDS[f.level]);
      f.say(f.level === 'match' ? 'Yes! Big ' + target + ' and small ' + a.ch + ' are the same letter.' : GK.pick(['Got it! That is ' + a.ch + '.', 'Yum! ' + a.ch + ' is in the basket.', 'Great catch! ' + a.ch + '!']), 'good');
      setTimeout(function () { if (!cv || !cv.isConnected) return; if (done >= ROUNDS[f.level]) return end(); newTarget(); }, still ? 900 : 1300);
    } else {
      a.state = 'bounce'; a.vy = -260 * S - 120; a.vx = (a.x < bun.x ? -1 : 1) * 150;
      bun.shake = 1; GK.sfx.bad(); label(a.x, a.y - R, 'Boing!', '#c2541b');
      var want = wantCh();
      f.say('Oops, that is ' + a.ch + '. Look for ' + want + (LOOK[want] && LOOK[want].indexOf(a.ch) >= 0 ? '. They look alike, so look closely!' : '.'), 'bad');
    }
  }

  /* ---------- Drawing ---------- */
  function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function ln(w) { cx.lineWidth = w; cx.strokeStyle = '#2a2522'; cx.lineJoin = 'round'; cx.lineCap = 'round'; }
  function draw(time) {
    var gy = groundY();
    var g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ffd9b0'); g.addColorStop(0.55, '#fff1d6'); g.addColorStop(1, '#fff7e8');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.fillStyle = '#ffe28a'; cx.beginPath(); cx.arc(W * 0.82, H * 0.42, 34 * S, 0, 7); cx.fill();
    cx.fillStyle = '#c9e59a'; cx.beginPath(); cx.moveTo(0, H * 0.7); cx.quadraticCurveTo(W * 0.3, H * 0.55, W * 0.6, H * 0.68); cx.quadraticCurveTo(W * 0.85, H * 0.6, W, H * 0.66); cx.lineTo(W, H); cx.lineTo(0, H); cx.fill();
    // trunks
    cx.fillStyle = '#8a5a22'; ln(3);
    [W * 0.07, W * 0.93].forEach(function (x) { cx.beginPath(); cx.moveTo(x - 16 * S, gy + 8); cx.lineTo(x - 10 * S, 40 * S); cx.lineTo(x + 10 * S, 40 * S); cx.lineTo(x + 16 * S, gy + 8); cx.closePath(); cx.fill(); cx.stroke(); });
    // ground
    cx.fillStyle = '#7bbf5c'; cx.fillRect(0, gy, W, H - gy);
    cx.fillStyle = '#6aae4c'; for (var i = 0; i < W; i += 26) { cx.beginPath(); cx.moveTo(i, gy); cx.lineTo(i + 5, gy - 9 * S); cx.lineTo(i + 10, gy); cx.fill(); }
    // canopy
    var sway = still ? 0 : Math.sin(time * 1.2) * 3;
    for (var j = 0; j < 2; j++) {
      cx.fillStyle = j ? '#5aa03e' : '#4a8a34';
      for (var x = -20; x < W + 40; x += 58 * S + 14) { cx.beginPath(); cx.arc(x + (j ? 26 : 0) + sway * (j ? 1 : -1), (j ? 52 : 26) * S, (44 + ((x * 7) % 11)) * S, 0, 7); cx.fill(); }
    }
    cx.fillStyle = 'rgba(255,255,255,.18)'; for (var k = 30; k < W; k += 90) { cx.beginPath(); cx.arc(k, 30 * S, 10 * S, 0, 7); cx.fill(); }
    // little hanging apples in the canopy
    for (var m = 40; m < W - 20; m += 110) { cx.fillStyle = '#e0574a'; cx.beginPath(); cx.arc(m + 20, 70 * S, 7 * S + 2, 0, 7); cx.fill(); }
    // banner
    drawBanner();
    apples.forEach(function (a) { if (a.state !== 'fly') drawApple(a); });
    drawBunny(time);
    apples.forEach(function (a) { if (a.state === 'fly') drawApple(a); });
    pops.forEach(function (p) {
      var al = Math.max(0, 1 - p.t / p.max); cx.globalAlpha = al;
      if (p.text) { cx.font = 'bold ' + Math.round(22 * S + 6) + 'px ' + FONT; cx.textAlign = 'center'; cx.lineWidth = 5; cx.strokeStyle = '#fff'; cx.strokeText(p.text, p.x, p.y); cx.fillStyle = p.c; cx.fillText(p.text, p.x, p.y); }
      else { cx.fillStyle = p.c; star(p.x, p.y, 6 * (1 - p.t / p.max) + 2); }
      cx.globalAlpha = 1;
    });
  }
  function star(x, y, r) { cx.beginPath(); for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5 - Math.PI / 2, rr2 = i % 2 ? r * 0.45 : r; cx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } cx.closePath(); cx.fill(); }
  function drawBanner() {
    var txt = f.level === 'match' ? 'Small letter for' : 'Catch', big = target;
    cx.font = 'bold ' + Math.round(20 * S + 6) + 'px ' + FONT;
    var tw = cx.measureText(txt).width, lw = R * 2.1, bw = tw + lw + 34, bh = R * 2 + 10, x = W / 2 - bw / 2, y = 8;
    cx.fillStyle = 'rgba(255,253,244,.96)'; rr(x, y, bw, bh, 18); cx.fill(); ln(3); cx.stroke();
    cx.fillStyle = '#5b4a3f'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillText(txt, x + 14, y + bh / 2 + 1);
    cx.fillStyle = waiting ? '#2f7a4f' : '#c2541b'; cx.font = 'bold ' + Math.round(R * 1.7) + 'px ' + FONT; cx.textAlign = 'center';
    cx.fillText(big, x + 14 + tw + 10 + lw / 2, y + bh / 2 + 2);
    cx.textBaseline = 'alphabetic';
  }
  function drawApple(a) {
    var r = R * (0.4 + 0.6 * a.grow || 1);
    if (a.state !== 'fall') r = R;
    if (a.state === 'fly') r = R * (1 - a.k * 0.55);
    cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, a.life)); cx.translate(a.x, a.y); cx.rotate(a.rot + a.spin);
    cx.fillStyle = '#6b4423'; cx.fillRect(-2, -r - 8, 4, 10);
    cx.fillStyle = '#5cb85c'; cx.beginPath(); cx.ellipse(r * 0.35, -r - 4, r * 0.32, r * 0.16, -0.5, 0, 7); cx.fill();
    cx.fillStyle = '#e0574a';
    cx.beginPath(); cx.moveTo(0, -r * 0.72); cx.bezierCurveTo(-r * 0.7, -r * 1.15, -r * 1.25, -r * 0.6, -r * 1.05, r * 0.2); cx.bezierCurveTo(-r * 0.9, r * 0.85, -r * 0.4, r * 1.05, 0, r * 0.88); cx.bezierCurveTo(r * 0.4, r * 1.05, r * 0.9, r * 0.85, r * 1.05, r * 0.2); cx.bezierCurveTo(r * 1.25, -r * 0.6, r * 0.7, -r * 1.15, 0, -r * 0.72); cx.closePath();
    cx.fill(); ln(3); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.45)'; cx.beginPath(); cx.ellipse(-r * 0.55, -r * 0.3, r * 0.14, r * 0.26, 0.4, 0, 7); cx.fill();
    cx.rotate(-(a.rot + a.spin) * 0.8);
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, r * 0.05, r * 0.62, 0, 7); cx.fill();
    cx.fillStyle = '#2a2522'; cx.font = 'bold ' + Math.round(r * 1.05) + 'px ' + FONT; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(shown(a.ch), 0, r * 0.1 + (a.ch === a.ch.toLowerCase() ? -r * 0.08 : 0));
    cx.textBaseline = 'alphabetic'; cx.restore();
  }
  function drawBunny(time) {
    var s = Math.max(0.62, S), gy = groundY(), bw = basketW();
    var hop = still ? 0 : Math.sin(bun.hop * Math.PI) * 26 * s, sh = still ? 0 : Math.sin(bun.shake * 18) * 0.12 * bun.shake;
    var idle = still ? 0 : Math.sin(time * 3) * 1.5;
    cx.save(); cx.translate(bun.x, gy - hop);
    // shadow
    cx.fillStyle = 'rgba(0,0,0,.15)'; cx.beginPath(); cx.ellipse(0, 6 + hop, 40 * s, 7 * s, 0, 0, 7); cx.fill();
    ln(3.5);
    // feet and body
    cx.fillStyle = '#f5efe6';
    cx.beginPath(); cx.ellipse(-20 * s, -4 * s, 18 * s, 9 * s, 0, 0, 7); cx.fill(); cx.stroke();
    cx.beginPath(); cx.ellipse(20 * s, -4 * s, 18 * s, 9 * s, 0, 0, 7); cx.fill(); cx.stroke();
    cx.beginPath(); cx.ellipse(0, -36 * s, 32 * s, 34 * s, 0, 0, 7); cx.fill(); cx.stroke();
    cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(0, -30 * s, 18 * s, 20 * s, 0, 0, 7); cx.fill();
    // head
    cx.save(); cx.translate(0, -84 * s + idle); cx.rotate(sh);
    var earW = still ? 0 : Math.sin(time * 2.4) * 0.06 + bun.hop * 0.3;
    [[-1, 0.35 + earW], [1, -0.35 - earW]].forEach(function (e) {
      cx.save(); cx.translate(e[0] * 24 * s, -12 * s); cx.rotate(e[1]);
      cx.fillStyle = '#e8dccb'; cx.beginPath(); cx.ellipse(0, 18 * s, 10 * s, 24 * s, 0, 0, 7); cx.fill(); ln(3.5); cx.stroke();
      cx.fillStyle = '#f7b4c6'; cx.beginPath(); cx.ellipse(0, 20 * s, 5 * s, 16 * s, 0, 0, 7); cx.fill();
      cx.restore();
    });
    cx.fillStyle = '#f5efe6'; cx.beginPath(); cx.ellipse(0, 0, 30 * s, 26 * s, 0, 0, 7); cx.fill(); ln(3.5); cx.stroke();
    var lx = bun.face * 3 * s;
    cx.fillStyle = '#2a2522';
    if (bun.blink > 0) { ln(3); cx.beginPath(); cx.moveTo(-14 * s + lx, -4 * s); cx.lineTo(-6 * s + lx, -4 * s); cx.moveTo(6 * s + lx, -4 * s); cx.lineTo(14 * s + lx, -4 * s); cx.stroke(); }
    else { cx.beginPath(); cx.arc(-10 * s + lx, -4 * s, 4.5 * s, 0, 7); cx.arc(10 * s + lx, -4 * s, 4.5 * s, 0, 7); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(-8.5 * s + lx, -5.5 * s, 1.5 * s, 0, 7); cx.arc(11.5 * s + lx, -5.5 * s, 1.5 * s, 0, 7); cx.fill(); }
    cx.fillStyle = '#f7a0b8'; cx.beginPath(); cx.arc(-19 * s, 6 * s, 5 * s, 0, 7); cx.arc(19 * s, 6 * s, 5 * s, 0, 7); cx.fill();
    cx.fillStyle = '#e0708f'; cx.beginPath(); cx.moveTo(-4 * s + lx, 4 * s); cx.lineTo(4 * s + lx, 4 * s); cx.lineTo(lx, 8 * s); cx.closePath(); cx.fill();
    ln(2.5); cx.beginPath();
    if (bun.shake > 0) { cx.moveTo(-6 * s + lx, 15 * s); cx.quadraticCurveTo(lx, 11 * s, 6 * s + lx, 15 * s); }
    else { cx.moveTo(-7 * s + lx, 11 * s); cx.quadraticCurveTo(lx, (bun.hop > 0 ? 20 : 16) * s, 7 * s + lx, 11 * s); }
    cx.stroke();
    cx.restore();
    // basket held up in front
    var by = -(gy - basketTop()), bh = 30 * s + 6;
    // arms up to the basket
    cx.strokeStyle = '#2a2522'; cx.lineWidth = 15 * s + 3.5; cx.beginPath(); cx.moveTo(-24 * s, -50 * s); cx.quadraticCurveTo(-bw / 2 - 6, -90 * s, -bw / 2 + 8, by + 2); cx.moveTo(24 * s, -50 * s); cx.quadraticCurveTo(bw / 2 + 6, -90 * s, bw / 2 - 8, by + 2); cx.stroke();
    cx.strokeStyle = '#f5efe6'; cx.lineWidth = 15 * s; cx.stroke();
    cx.save(); cx.translate(0, by + hop * 0);
    // caught apples peeking out
    var n = caught.length;
    for (var i = 0; i < n; i++) {
      var col = i % 5, row = Math.floor(i / 5), px = (col - 2) * bw * 0.17 + (row % 2 ? bw * 0.08 : 0), py = -11 - row * 9 * s;
      cx.fillStyle = '#e0574a'; cx.beginPath(); cx.arc(px, py, 10 * s + 2, 0, 7); cx.fill(); ln(2); cx.stroke();
      cx.fillStyle = '#fff'; cx.font = 'bold ' + Math.round(11 * s + 3) + 'px ' + FONT; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(caught[i], px, py + 1); cx.textBaseline = 'alphabetic';
    }
    cx.fillStyle = '#d9a15a'; cx.beginPath(); cx.moveTo(-bw / 2, 0); cx.lineTo(bw / 2, 0); cx.lineTo(bw / 2 - 12 * s, bh); cx.lineTo(-bw / 2 + 12 * s, bh); cx.closePath(); cx.fill(); ln(3.5); cx.stroke();
    cx.strokeStyle = '#a8743a'; cx.lineWidth = 2;
    for (var v = -bw / 2 + 14; v < bw / 2 - 6; v += 14) { cx.beginPath(); cx.moveTo(v, 3); cx.lineTo(v + 4 * s, bh - 3); cx.stroke(); }
    cx.beginPath(); cx.moveTo(-bw / 2 + 6, bh / 2); cx.lineTo(bw / 2 - 6, bh / 2); cx.stroke();
    cx.fillStyle = '#c98d52'; rr(-bw / 2 - 4, -6, bw + 8, 10, 5); cx.fill(); ln(3); cx.stroke();
    // paws on the rim
    cx.fillStyle = '#f5efe6'; cx.beginPath(); cx.arc(-bw / 2 + 8, -2, 8 * s + 2, 0, 7); cx.arc(bw / 2 - 8, -2, 8 * s + 2, 0, 7); cx.fill(); ln(3); cx.beginPath(); cx.arc(-bw / 2 + 8, -2, 8 * s + 2, 0, 7); cx.stroke(); cx.beginPath(); cx.arc(bw / 2 - 8, -2, 8 * s + 2, 0, 7); cx.stroke();
    cx.restore();
    cx.restore();
  }

  function end() {
    run++;
    var got = caught.slice();
    var txt = { big: 'Lulu caught 10 capital letters.', small: 'Lulu caught 10 small letters, even the tricky look-alikes.', match: 'You matched 10 big letters to their small partners.' }[f.level];
    GK.finish(f, { title: 'A basket full of letters!', text: txt + ' Can you say each one?', sheet: root.dataset.sheet, onReplay: start });
    var box = f.area.querySelector('.gk-end');
    if (box) { var row = E('div', { class: 'gk-lc-got', 'aria-label': 'Letters caught: ' + got.join(' ') }); got.forEach(function (c) { row.appendChild(E('span', { text: c })); }); box.insertBefore(row, box.children[1]); }
  }

  GK.solve = function () {
    if (waiting || !bun) return;
    var a = apples.filter(function (x) { return x.state === 'fall' && x.t; })[0] || spawn(true);
    bun.x = clampX(a.x); catchIt(a);
  };

  window.addEventListener('resize', function () { if (cv && cv.isConnected) size(); });
  f = GK.frame({ root: root, rounds: ROUNDS.big, levels: [{ key: 'big', label: 'Capital letters' }, { key: 'small', label: 'Small letters' }, { key: 'match', label: 'Big to small' }], onLevel: start });
  start();
})();
