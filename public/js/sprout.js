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

  // Watercolor filters: ragged soft edges, uneven pigment and darker pooled edges.
  // They live inside the SVG so print and PNG download keep the paint look.
  var defs = document.createElementNS(NS, 'defs');
  defs.innerHTML =
    '<filter id="wc-wash" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="9" result="n2"/>' +
      '<feColorMatrix in="n2" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.9 0 0 0 -0.35" result="a"/>' +
      '<feComposite in="d" in2="a" operator="in" result="tex"/>' +
      '<feMorphology in="d" operator="erode" radius="2.5" result="inner"/>' +
      '<feComposite in="d" in2="inner" operator="out" result="edge"/>' +
      '<feMerge><feMergeNode in="tex"/><feMergeNode in="edge"/></feMerge>' +
    '</filter>' +
    '<filter id="wc-brush" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="2" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feGaussianBlur in="d" stdDeviation="0.7" result="b"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" result="n2"/>' +
      '<feColorMatrix in="n2" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.7 0 0 0 -0.2" result="a"/>' +
      '<feComposite in="b" in2="a" operator="in" result="tex"/>' +
      '<feMorphology in="b" operator="erode" radius="1.5" result="inner"/>' +
      '<feComposite in="b" in2="inner" operator="out" result="edge"/>' +
      '<feMerge><feMergeNode in="tex"/><feMergeNode in="edge"/></feMerge>' +
    '</filter>';
  svg.insertBefore(defs, svg.firstChild);

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

  // Tap to fill
  svg.addEventListener('click', function (e) {
    if (state.tool !== 'fill') return;
    var t = e.target.closest && e.target.closest('.f'); if (!t) return;
    undo.push({ t: 'fill', el: t, prev: t.getAttribute('fill') });
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
      else { cur.setAttribute('opacity', '0.55'); cur.setAttribute('filter', 'url(#wc-brush)'); cur.setAttribute('style', 'mix-blend-mode:multiply'); }
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
  function wash(shape) {
    if (isWhite()) {
      // White in watercolor mode lifts the paint off the tapped shape
      var n = shape.nextSibling;
      while (n && n.nodeType === 1 && n.classList.contains('wc')) { var nx = n.nextSibling; undo.push({ t: 'unwash', el: n, after: shape }); n.remove(); n = nx; }
      return;
    }
    if (shape.hasAttribute('data-field')) { undo.push({ t: 'fill', el: shape, prev: shape.getAttribute('fill') }); shape.setAttribute('fill', state.color); return; }
    var c = shape.cloneNode(false);
    ['class', 'id', 'stroke', 'stroke-width', 'stroke-dasharray', 'data-orig'].forEach(function (a) { c.removeAttribute(a); });
    c.setAttribute('class', 'wc'); c.setAttribute('fill', state.color); c.setAttribute('stroke', 'none');
    c.setAttribute('opacity', '0.72'); c.setAttribute('filter', 'url(#wc-wash)');
    c.setAttribute('pointer-events', 'none'); c.setAttribute('style', 'mix-blend-mode:multiply');
    var last = shape; while (last.nextSibling && last.nextSibling.nodeType === 1 && last.nextSibling.classList.contains('wc')) last = last.nextSibling;
    last.parentNode.insertBefore(c, last.nextSibling);
    undo.push({ t: 'stroke', el: c });
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
      else if (a.t === 'unwash') a.after.parentNode.insertBefore(a.el, a.after.nextSibling);
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
