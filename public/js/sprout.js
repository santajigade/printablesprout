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

  // Ink layer for crayon strokes, on top of the art
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
      if (kind === 'tool') { state.tool = v; svg.classList.toggle('crayon', v === 'crayon'); }
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

  // Crayon
  var cur = null, pts = [];
  function pt(e) {
    var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    var q = p.matrixTransform(svg.getScreenCTM().inverse());
    return Math.round(q.x * 10) / 10 + ' ' + Math.round(q.y * 10) / 10;
  }
  svg.addEventListener('pointerdown', function (e) {
    if (state.tool !== 'crayon') return;
    e.preventDefault(); svg.setPointerCapture(e.pointerId);
    pts = [pt(e)];
    cur = document.createElementNS(NS, 'path');
    cur.setAttribute('fill', 'none'); cur.setAttribute('stroke', state.color); cur.setAttribute('stroke-width', state.size);
    cur.setAttribute('stroke-linecap', 'round'); cur.setAttribute('stroke-linejoin', 'round'); cur.setAttribute('opacity', '0.88');
    cur.setAttribute('d', 'M' + pts[0] + ' l0.1 0');
    ink.appendChild(cur);
  });
  svg.addEventListener('pointermove', function (e) {
    if (!cur) return; pts.push(pt(e));
    cur.setAttribute('d', 'M' + pts[0] + ' L' + pts.slice(1).join(' L'));
  });
  function end() { if (cur) { undo.push({ t: 'stroke', el: cur }); cur = null; } }
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);

  // Actions
  var clearArmed = false;
  maker.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act;
    if (act === 'undo') {
      var a = undo.pop(); if (!a) return;
      if (a.t === 'fill') a.el.setAttribute('fill', a.prev); else a.el.remove();
    }
    if (act === 'clear') {
      if (!clearArmed) { clearArmed = true; b.textContent = 'Tap again to clear'; setTimeout(function () { clearArmed = false; b.textContent = 'Clear colors'; }, 2500); return; }
      clearArmed = false; b.textContent = 'Clear colors';
      fills.forEach(function (el) { el.setAttribute('fill', el.dataset.orig); });
      ink.innerHTML = ''; undo = [];
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
