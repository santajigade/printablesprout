(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  // Marathi letters in the usual chart order (CIIL Marathi primer and a Marathi alphabet chart, read on 2026-11-24).
  // Only letters both sources list are used. s = a simple English sound helper for parents.
  var SETS = {
    swar: [['अ', 'a'], ['आ', 'aa'], ['इ', 'i'], ['ई', 'ee'], ['उ', 'u'], ['ऊ', 'oo'], ['ए', 'e'], ['ऐ', 'ai'], ['ओ', 'o'], ['औ', 'au'], ['अं', 'am'], ['अः', 'aha']],
    v1: [['क', 'ka'], ['ख', 'kha'], ['ग', 'ga'], ['घ', 'gha'], ['ङ', 'nga'], ['च', 'cha'], ['छ', 'chha'], ['ज', 'ja'], ['झ', 'jha'], ['ञ', 'nya'], ['ट', 'Ta'], ['ठ', 'Tha'], ['ड', 'Da'], ['ढ', 'Dha'], ['ण', 'Na']],
    v2: [['त', 'ta'], ['थ', 'tha'], ['द', 'da'], ['ध', 'dha'], ['न', 'na'], ['प', 'pa'], ['फ', 'pha'], ['ब', 'ba'], ['भ', 'bha'], ['म', 'ma']],
    v3: [['य', 'ya'], ['र', 'ra'], ['ल', 'la'], ['व', 'va'], ['श', 'sha'], ['ष', 'Sha'], ['स', 'sa'], ['ह', 'ha'], ['ळ', 'La'], ['क्ष', 'ksha'], ['ज्ञ', 'dnya']],
  };
  var SIZE = 400, FAM = '"Noto Sans Devanagari", "Kohinoor Devanagari", "Nirmala UI", Mangal, "Devanagari Sangam MN", FreeSans, sans-serif';
  var f, idx, stars, guide, ink, gctx, ictx, mask, drawing = false, lastPt = null, lastSnd = 0, passed = false, font = '';

  function list() { return SETS[f.level]; }

  function build() {
    idx = 0; stars = 0;
    f.area.innerHTML = '';
    var wrap = GK.el('div', { class: 'gk-trace' });
    guide = GK.el('canvas', { width: SIZE, height: SIZE, 'aria-hidden': 'true', lang: 'mr' });
    ink = GK.el('canvas', { width: SIZE, height: SIZE, class: 'ink', role: 'img' });
    wrap.appendChild(guide); wrap.appendChild(ink);
    gctx = guide.getContext('2d'); ictx = ink.getContext('2d');
    try { gctx.lang = 'mr'; } catch (e) {}
    var label = GK.el('strong', { class: 'gk-ma-label', lang: 'mr', 'aria-live': 'polite' });
    var helper = GK.el('p', { class: 'gk-ma-help' });
    var prev = GK.el('button', { type: 'button', class: 'gk-tool', 'aria-label': 'Previous letter', text: '◀' });
    var next = GK.el('button', { type: 'button', class: 'gk-tool', 'aria-label': 'Next letter', text: '▶' });
    var nav = GK.el('div', { class: 'gk-letternav' }, [prev, label, next]);
    var clear = GK.el('button', { type: 'button', class: 'gk-tool', text: 'Clear' });
    var skip = GK.el('button', { type: 'button', class: 'gk-tool', text: 'Skip' });
    var strip = GK.el('div', { class: 'gk-ma-strip', lang: 'mr', 'aria-hidden': 'true' });
    f.area.appendChild(nav); f.area.appendChild(helper); f.area.appendChild(wrap);
    f.area.appendChild(GK.el('div', { class: 'gk-tools' }, [clear, skip])); f.area.appendChild(strip);
    prev.addEventListener('click', function () { GK.sfx.tap(); if (idx > 0) { idx--; show(); } });
    next.addEventListener('click', function () { GK.sfx.tap(); if (idx < list().length - 1) { idx++; show(); } });
    skip.addEventListener('click', advance);
    clear.addEventListener('click', function () { GK.sfx.flip(); ictx.clearRect(0, 0, SIZE, SIZE); passed = false; f.say('Trace over the gray letter again.'); });
    bindInk();
    f.label = label; f.helper = helper; f.strip = strip;
    show();
  }

  function fit(L) {
    // pick a font size so the letter (with its top line and marks) fits the square
    var px = 250;
    gctx.textAlign = 'center'; gctx.textBaseline = 'alphabetic';
    for (; px > 120; px -= 10) {
      gctx.font = '600 ' + px + 'px ' + FAM;
      var m = gctx.measureText(L);
      var w = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width);
      var h = (m.actualBoundingBoxAscent || px * .8) + (m.actualBoundingBoxDescent || 0);
      if (w < 330 && h < 300) break;
    }
    font = '600 ' + px + 'px ' + FAM;
    gctx.font = font;
    var mm = gctx.measureText(L), asc = mm.actualBoundingBoxAscent || px * .8, desc = mm.actualBoundingBoxDescent || 0;
    var l = mm.actualBoundingBoxLeft || mm.width / 2, r = mm.actualBoundingBoxRight || mm.width / 2;
    return { x: SIZE / 2 + (l - r) / 2, y: SIZE / 2 + (asc - desc) / 2 };
  }

  function show() {
    var item = list()[idx], L = item[0];
    passed = false;
    f.progress(idx, list().length);
    f.label.textContent = L + '  ' + (idx + 1) + '/' + list().length;
    f.helper.textContent = 'Say it: "' + item[1] + '"';
    ink.setAttribute('aria-label', 'Tracing area for the Marathi letter ' + item[1]);
    f.strip.innerHTML = '';
    list().forEach(function (it, i) { f.strip.appendChild(GK.el('span', { class: i < idx ? 'gk-ma-done' : (i === idx ? 'gk-ma-now' : ''), text: it[0] })); });
    gctx.clearRect(0, 0, SIZE, SIZE);
    gctx.fillStyle = '#fffaf3'; gctx.fillRect(0, 0, SIZE, SIZE);
    var p = fit(L);
    gctx.textAlign = 'center'; gctx.textBaseline = 'alphabetic';
    gctx.fillStyle = '#e9e1d6'; gctx.fillText(L, p.x, p.y);
    gctx.setLineDash([8, 8]); gctx.lineWidth = 3; gctx.strokeStyle = '#c2541b'; gctx.strokeText(L, p.x, p.y); gctx.setLineDash([]);
    var m = document.createElement('canvas'); m.width = m.height = SIZE;
    var mc = m.getContext('2d'); try { mc.lang = 'mr'; } catch (e) {}
    mc.font = font; mc.textAlign = 'center'; mc.fillStyle = '#000'; mc.fillText(L, p.x, p.y);
    mask = mc.getImageData(0, 0, SIZE, SIZE).data;
    ictx.clearRect(0, 0, SIZE, SIZE);
    f.say('Trace the gray letter, top line too. It says "' + item[1] + '".');
  }

  function pt(e) { var r = ink.getBoundingClientRect(); return { x: (e.clientX - r.left) * SIZE / r.width, y: (e.clientY - r.top) * SIZE / r.height }; }

  function bindInk() {
    ink.addEventListener('pointerdown', function (e) { e.preventDefault(); drawing = true; try { ink.setPointerCapture(e.pointerId); } catch (x) {} lastPt = pt(e); dot(lastPt); });
    ink.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pt(e); line(lastPt, p); lastPt = p; var now = Date.now(); if (now - lastSnd > 90) { lastSnd = now; GK.sfx.scratch(); } });
    var end = function () { if (!drawing) return; drawing = false; check(); };
    ink.addEventListener('pointerup', end); ink.addEventListener('pointercancel', end);
  }
  function style() { ictx.strokeStyle = 'rgba(47,93,138,.85)'; ictx.fillStyle = 'rgba(47,93,138,.85)'; ictx.lineWidth = 26; ictx.lineCap = 'round'; ictx.lineJoin = 'round'; }
  function dot(p) { style(); ictx.beginPath(); ictx.arc(p.x, p.y, 13, 0, Math.PI * 2); ictx.fill(); }
  function line(a, b) { style(); ictx.beginPath(); ictx.moveTo(a.x, a.y); ictx.lineTo(b.x, b.y); ictx.stroke(); }

  function check() {
    if (passed) return;
    var d = ictx.getImageData(0, 0, SIZE, SIZE).data, inL = 0, cov = 0, inkAll = 0, inkIn = 0;
    for (var i = 3; i < d.length; i += 16) {
      var isL = mask[i] > 100, isI = d[i] > 40;
      if (isL) { inL++; if (isI) cov++; }
      if (isI) { inkAll++; if (isL) inkIn++; }
    }
    var coverage = inL ? cov / inL : 0, neat = inkAll ? inkIn / inkAll : 0;
    if (coverage > 0.6 && neat > 0.4) {
      passed = true; stars++; GK.good(f.label);
      f.say(GK.pick(['Shabbas! ', 'Chhan! ', 'Beautiful! ']) + '⭐', 'good');
      setTimeout(advance, 1100);
    } else if (coverage > 0.3) {
      f.say('Keep going. Cover the rest of the letter, top line too.');
    }
  }

  function advance() {
    if (idx < list().length - 1) { idx++; show(); }
    else {
      var names = { swar: 'all 12 swar', v1: 'क to ण', v2: 'त to म', v3: 'य to ज्ञ' };
      GK.finish(f, { title: 'Marathi letters done!', text: 'You traced ' + names[f.level] + ' and earned ' + stars + ' stars. Now write them on paper with a pencil.', sheet: root.dataset.sheet, onReplay: build });
    }
  }

  GK.solve = function () { if (!passed) { passed = true; stars++; advance(); } };

  f = GK.frame({ root: root, rounds: 0, levels: [{ key: 'swar', label: 'Swar अ' }, { key: 'v1', label: 'क to ण' }, { key: 'v2', label: 'त to म' }, { key: 'v3', label: 'य to ज्ञ' }], onLevel: build });
  build();
})();
