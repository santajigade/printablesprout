(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var SIZE = 400, FONT = '700 270px Fredoka, "Trebuchet MS", Arial, sans-serif', BASE = 300;
  var f, idx, stars, guide, ink, gctx, ictx, mask, drawing = false, lastPt = null, lastSnd = 0, passed = false;

  function letters() {
    var a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return f.level === 'lower' ? a.toLowerCase().split('') : a.split('');
  }

  function build() {
    idx = 0; stars = 0;
    f.progress(0, 0);
    f.area.innerHTML = '';
    var wrap = GK.el('div', { class: 'gk-trace' });
    guide = GK.el('canvas', { width: SIZE, height: SIZE, 'aria-hidden': 'true' });
    ink = GK.el('canvas', { width: SIZE, height: SIZE, class: 'ink', role: 'img' });
    wrap.appendChild(guide); wrap.appendChild(ink);
    gctx = guide.getContext('2d'); ictx = ink.getContext('2d');
    var label = GK.el('strong', { 'aria-live': 'polite' });
    var prev = GK.el('button', { type: 'button', class: 'gk-tool', 'aria-label': 'Previous letter', text: '◀' });
    var next = GK.el('button', { type: 'button', class: 'gk-tool', 'aria-label': 'Next letter', text: '▶' });
    var nav = GK.el('div', { class: 'gk-letternav' }, [prev, label, next]);
    var clear = GK.el('button', { type: 'button', class: 'gk-tool', text: 'Clear' });
    var skip = GK.el('button', { type: 'button', class: 'gk-tool', text: 'Skip' });
    f.area.appendChild(nav); f.area.appendChild(wrap); f.area.appendChild(GK.el('div', { class: 'gk-tools' }, [clear, skip]));
    prev.addEventListener('click', function () { GK.sfx.tap(); if (idx > 0) { idx--; show(); } });
    next.addEventListener('click', function () { GK.sfx.tap(); if (idx < letters().length - 1) { idx++; show(); } });
    skip.addEventListener('click', advance);
    clear.addEventListener('click', function () { GK.sfx.flip(); ictx.clearRect(0, 0, SIZE, SIZE); passed = false; f.say('Trace over the gray letter.'); });
    bindInk();
    f.label = label;
    var go = function () { show(); };
    if (document.fonts && document.fonts.load) document.fonts.load(FONT).then(go, go); else go();
  }

  function show() {
    var L = letters()[idx];
    passed = false;
    f.label.textContent = L + '  ' + (idx + 1) + '/26';
    ink.setAttribute('aria-label', 'Tracing area for the letter ' + L);
    gctx.clearRect(0, 0, SIZE, SIZE);
    gctx.fillStyle = '#fffaf3'; gctx.fillRect(0, 0, SIZE, SIZE);
    // writing lines
    gctx.lineWidth = 3; gctx.strokeStyle = '#9fc9c3'; gctx.setLineDash([]);
    [[110], [BASE]].forEach(function (y) { gctx.beginPath(); gctx.moveTo(20, y[0]); gctx.lineTo(SIZE - 20, y[0]); gctx.stroke(); });
    gctx.setLineDash([12, 10]); gctx.beginPath(); gctx.moveTo(20, 205); gctx.lineTo(SIZE - 20, 205); gctx.stroke();
    // the letter
    gctx.setLineDash([]); gctx.font = FONT; gctx.textAlign = 'center'; gctx.textBaseline = 'alphabetic';
    gctx.fillStyle = '#e9e1d6'; gctx.fillText(L, SIZE / 2, BASE);
    gctx.setLineDash([8, 8]); gctx.lineWidth = 3; gctx.strokeStyle = '#c2541b'; gctx.strokeText(L, SIZE / 2, BASE); gctx.setLineDash([]);
    // mask of the letter at low resolution for checking
    var m = document.createElement('canvas'); m.width = m.height = SIZE;
    var mc = m.getContext('2d'); mc.font = FONT; mc.textAlign = 'center'; mc.fillStyle = '#000'; mc.fillText(L, SIZE / 2, BASE);
    mask = mc.getImageData(0, 0, SIZE, SIZE).data;
    ictx.clearRect(0, 0, SIZE, SIZE);
    f.say('Trace over the gray letter ' + L + '.');
  }

  function pt(e) { var r = ink.getBoundingClientRect(); return { x: (e.clientX - r.left) * SIZE / r.width, y: (e.clientY - r.top) * SIZE / r.height }; }

  function bindInk() {
    ink.addEventListener('pointerdown', function (e) { e.preventDefault(); drawing = true; ink.setPointerCapture(e.pointerId); lastPt = pt(e); dot(lastPt); });
    ink.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pt(e); line(lastPt, p); lastPt = p; var now = Date.now(); if (now - lastSnd > 90) { lastSnd = now; GK.sfx.scratch(); } });
    var end = function () { if (!drawing) return; drawing = false; check(); };
    ink.addEventListener('pointerup', end); ink.addEventListener('pointercancel', end);
  }
  function style() { ictx.strokeStyle = 'rgba(47,93,138,.85)'; ictx.fillStyle = 'rgba(47,93,138,.85)'; ictx.lineWidth = 30; ictx.lineCap = 'round'; ictx.lineJoin = 'round'; }
  function dot(p) { style(); ictx.beginPath(); ictx.arc(p.x, p.y, 15, 0, Math.PI * 2); ictx.fill(); }
  function line(a, b) { style(); ictx.beginPath(); ictx.moveTo(a.x, a.y); ictx.lineTo(b.x, b.y); ictx.stroke(); }

  function check() {
    if (passed) return;
    var d = ictx.getImageData(0, 0, SIZE, SIZE).data, inL = 0, cov = 0, inkAll = 0, inkIn = 0;
    for (var i = 3; i < d.length; i += 16) { // sample every 4th pixel
      var isL = mask[i] > 100, isI = d[i] > 40;
      if (isL) { inL++; if (isI) cov++; }
      if (isI) { inkAll++; if (isL) inkIn++; }
    }
    var coverage = inL ? cov / inL : 0, neat = inkAll ? inkIn / inkAll : 0;
    if (coverage > 0.62 && neat > 0.45) {
      passed = true; stars++; GK.good(f.label); GK.confetti(f.root);
      f.say(GK.pick(['Super tracing! ', 'Beautiful! ', 'You did it! ']) + '⭐', 'good');
      setTimeout(advance, 1100);
    } else if (coverage > 0.3) {
      f.say('Keep going. Cover the rest of the letter.');
    }
  }

  function advance() {
    if (idx < letters().length - 1) { idx++; show(); }
    else GK.finish(f, { title: 'A to Z, all done!', text: 'You traced ' + stars + ' letters. Now try them with a crayon on paper.', sheet: root.dataset.sheet, onReplay: build });
  }

  GK.solve = function () { if (!passed) { passed = true; stars++; advance(); } };

  f = GK.frame({ root: root, rounds: 0, levels: [{ key: 'upper', label: 'ABC' }, { key: 'lower', label: 'abc' }], onLevel: build });
  build();
})();
