/* PrintableSprout coloring tool. Works on any sheet SVG that follows the art rules:
   fillable shapes have class "f", editable text has data-field (+ data-tpl, data-empty),
   versions are <g data-variant="key">. */
(function () {
  var maker = document.getElementById('maker');
  var svg = document.getElementById('sheet');
  if (!maker || !svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var state = { tool: 'fill', color: '#e8742c', size: 12 };
  var undo = [];
  var fills = Array.prototype.slice.call(svg.querySelectorAll('.f'));
  fills.forEach(function (el) { el.dataset.orig = el.getAttribute('fill') || '#fff'; });

  // Ink layer for crayon and watercolor brush strokes, on top of the art
  var ink = document.createElementNS(NS, 'g');
  ink.setAttribute('id', 'ink');
  svg.appendChild(ink);

  // Editable text fields
  var values = {};
  function renderText() {
    svg.querySelectorAll('[data-field]').forEach(function (t) {
      var tpl = t.getAttribute('data-tpl') || '{' + t.getAttribute('data-field') + '}';
      var keys = (tpl.match(/\{(\w+)\}/g) || []).map(function (k) { return k.slice(1, -1); });
      var allEmpty = keys.every(function (k) { return !values[k]; });
      t.textContent = allEmpty ? (t.getAttribute('data-empty') || '') : tpl.replace(/\{(\w+)\}/g, function (_, k) { return values[k] || ''; });
    });
  }
  maker.querySelectorAll('[data-input]').forEach(function (inp) {
    inp.addEventListener('input', function () { values[inp.dataset.input] = inp.value.trim(); renderText(); });
  });

  // Variants
  function showVariant(v) {
    svg.querySelectorAll('[data-variant]').forEach(function (g) { g.style.display = g.getAttribute('data-variant') === v ? '' : 'none'; });
  }
  var firstVar = maker.querySelector('[data-seg="variant"] button');
  if (firstVar) showVariant(firstVar.dataset.v);

  // Segmented buttons
  maker.querySelectorAll('[data-seg]').forEach(function (box) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      box.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var kind = box.dataset.seg, v = b.dataset.v;
      if (kind === 'variant') showVariant(v);
      if (kind === 'tool') { state.tool = v; svg.classList.toggle('crayon', v !== 'fill'); maker.querySelectorAll('[data-tip]').forEach(function (t) { t.hidden = t.dataset.tip !== v; }); }
      if (kind === 'size') state.size = +v;
      if (kind === 'paper') setPaper(v);
    });
  });
  // Apply the default buttons (page may open in draw mode)
  maker.querySelectorAll('[data-seg="tool"] button.on, [data-seg="size"] button.on').forEach(function (b) { b.click(); });
  var pageStyle = document.createElement('style');
  document.head.appendChild(pageStyle);
  function setPaper(v) { pageStyle.textContent = '@page { size: ' + v + '; margin: 0.4in; }'; }
  setPaper('letter');

  // Palette
  maker.querySelectorAll('.sw').forEach(function (b) {
    b.addEventListener('click', function () {
      maker.querySelectorAll('.sw').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); state.color = b.dataset.color;
    });
  });

  // Watercolor helpers
  function tint(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function mix(v) { return Math.round(v * 0.62 + 255 * 0.38); }
    return 'rgb(' + mix(r) + ',' + mix(g) + ',' + mix(b) + ')';
  }
  function edgeOf(shape) {
    var n = shape.nextSibling;
    return n && n.nodeType === 1 && n.classList.contains('wc') ? n : null;
  }

  // Tap to fill
  svg.addEventListener('click', function (e) {
    if (state.tool !== 'fill') return;
    var t = e.target.closest && e.target.closest('.f'); if (!t) return;
    var oldEdge = edgeOf(t);
    undo.push({ t: 'wash', el: t, prev: t.getAttribute('fill'), oldEdge: oldEdge, newEdge: null });
    if (oldEdge) oldEdge.remove();
    t.setAttribute('fill', state.color);
  });

  // Crayon and watercolor brush. In watercolor mode a tap (no drag) washes the
  // tapped shape with paint; a drag paints a soft brush stroke.
  var cur = null, pts = [], start = null, moved = 0, downTarget = null;
  function xy(e) {
    var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    var q = p.matrixTransform(svg.getScreenCTM().inverse());
    return [Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10];
  }
  function pt(e) { var q = xy(e); return q[0] + ' ' + q[1]; }
  var isWhite = function () { return state.color.toLowerCase() === '#ffffff'; };
  svg.addEventListener('pointerdown', function (e) {
    if (state.tool !== 'crayon' && state.tool !== 'water') return;
    e.preventDefault(); svg.setPointerCapture(e.pointerId);
    start = xy(e); moved = 0;
    downTarget = e.target.closest && e.target.closest('.f');
    pts = [pt(e)];
    cur = document.createElementNS(NS, 'path');
    cur.setAttribute('fill', 'none'); cur.setAttribute('stroke', state.color);
    cur.setAttribute('stroke-linecap', 'round'); cur.setAttribute('stroke-linejoin', 'round');
    if (state.tool === 'water') {
      cur.setAttribute('stroke-width', Math.round(state.size * 1.8));
      if (isWhite()) { cur.setAttribute('opacity', '0.9'); }
      else { cur.setAttribute('stroke', tint(state.color)); cur.setAttribute('opacity', '0.8'); }
    } else {
      cur.setAttribute('stroke-width', state.size); cur.setAttribute('opacity', '0.88');
    }
    cur.setAttribute('d', 'M' + pts[0] + ' l0.1 0');
    ink.appendChild(cur);
  });
  svg.addEventListener('pointermove', function (e) {
    if (!cur) return;
    var q = xy(e); moved = Math.max(moved, Math.abs(q[0] - start[0]) + Math.abs(q[1] - start[1]));
    pts.push(q[0] + ' ' + q[1]);
    cur.setAttribute('d', 'M' + pts[0] + ' L' + pts.slice(1).join(' L'));
  });
  // Watercolor wash: one even, soft shade per shape (a lighter tint of the color)
  // with a faint darker painted edge. Tapping again replaces the color, it never
  // stacks layers, so the shade stays uniform. Plain SVG, no filters, so it looks
  // the same in every browser, in print and in the PNG download.
  function wash(shape) {
    var oldEdge = edgeOf(shape);
    var rec = { t: 'wash', el: shape, prev: shape.getAttribute('fill'), oldEdge: oldEdge, newEdge: null };
    if (oldEdge) oldEdge.remove();
    if (isWhite()) { shape.setAttribute('fill', shape.dataset.orig || '#fff'); undo.push(rec); return; }
    shape.setAttribute('fill', tint(state.color));
    if (!shape.hasAttribute('data-field')) {
      var c = shape.cloneNode(false);
      ['class', 'id', 'stroke-dasharray', 'data-orig', 'data-field', 'data-tpl', 'data-empty'].forEach(function (a) { c.removeAttribute(a); });
      c.setAttribute('class', 'wc'); c.setAttribute('fill', 'none'); c.setAttribute('stroke', state.color);
      c.setAttribute('stroke-width', '6'); c.setAttribute('stroke-opacity', '0.22'); c.setAttribute('pointer-events', 'none');
      shape.parentNode.insertBefore(c, shape.nextSibling);
      rec.newEdge = c;
    }
    undo.push(rec);
  }
  function end() {
    if (!cur) return;
    if (state.tool === 'water' && moved < 4 && downTarget) { cur.remove(); wash(downTarget); }
    else undo.push({ t: 'stroke', el: cur });
    cur = null; downTarget = null;
  }
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  // Actions
  var clearArmed = false;
  maker.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act;
    if (act === 'undo') {
      var a = undo.pop(); if (!a) return;
      if (a.t === 'fill') a.el.setAttribute('fill', a.prev);
      else if (a.t === 'wash') {
        a.el.setAttribute('fill', a.prev);
        if (a.newEdge) a.newEdge.remove();
        if (a.oldEdge) a.el.parentNode.insertBefore(a.oldEdge, a.el.nextSibling);
      }
      else a.el.remove();
    }
    if (act === 'clear') {
      if (!clearArmed) { clearArmed = true; b.textContent = 'Tap again to clear'; setTimeout(function () { clearArmed = false; b.textContent = 'Clear colors'; }, 2500); return; }
      clearArmed = false; b.textContent = 'Clear colors';
      fills.forEach(function (el) { el.setAttribute('fill', el.dataset.orig); });
      ink.innerHTML = ''; undo = [];
      svg.querySelectorAll('.wc').forEach(function (n) { n.remove(); });
    }
    if (act === 'print') window.print();
    if (act === 'png') downloadPng();
  });

  function downloadPng() {
    var clone = svg.cloneNode(true);
    clone.removeAttribute('class');
    clone.querySelectorAll('[style*="display: none"]').forEach(function (n) { n.remove(); });
    var xml = new XMLSerializer().serializeToString(clone);
    var img = new Image();
    img.onload = function () {
      var vb = svg.viewBox.baseVal, scale = 2;
      var c = document.createElement('canvas'); c.width = vb.width * scale; c.height = vb.height * scale;
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(function (blob) {
        var a = document.createElement('a');
        var who = (values.name || '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        a.href = URL.createObjectURL(blob);
        a.download = (who ? who + '-' : '') + maker.dataset.slug + '.png';
        document.body.appendChild(a); a.click(); a.remove();
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  }
})();
