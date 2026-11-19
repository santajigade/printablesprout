(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 8, NS = 'http://www.w3.org/2000/svg';
  var ITEMS = ['🧸', '🍭', '🎈', '🍌', '📚', '🖍️', '⚽', '🍪', '🪀', '🧃'];
  // values: rupees for INR, cents for USD
  var MONEY = {
    inr: { coins: [
      { v: 1, label: '₹1', r: 26, fill: '#d9dde3', ring: '#a7aeb8' },
      { v: 2, label: '₹2', r: 29, fill: '#d9dde3', ring: '#a7aeb8' },
      { v: 5, label: '₹5', r: 31, fill: '#f2c14e', ring: '#c99a22' },
      { v: 10, label: '₹10', r: 33, fill: '#f2c14e', ring: '#a7aeb8' } ],
      notes: [ { v: 10, label: '₹10', fill: '#e8b98a' }, { v: 20, label: '₹20', fill: '#d8e59a' }, { v: 50, label: '₹50', fill: '#9fd3e6' } ],
      show: function (v) { return '₹' + v; } },
    usd: { coins: [
      { v: 1, label: '1¢', r: 27, fill: '#d79a6a', ring: '#a8693c' },
      { v: 5, label: '5¢', r: 30, fill: '#d9dde3', ring: '#a7aeb8' },
      { v: 10, label: '10¢', r: 25, fill: '#d9dde3', ring: '#a7aeb8' },
      { v: 25, label: '25¢', r: 33, fill: '#d9dde3', ring: '#a7aeb8' } ],
      notes: [ { v: 100, label: '$1', fill: '#bfe0b5' }, { v: 500, label: '$5', fill: '#d6e9c9' } ],
      show: function (v) { return v < 100 ? v + '¢' : '$' + (v / 100).toFixed(2); } },
  };
  var LEVELS = {
    'inr-s': { cur: 'inr', notes: false, min: 3, max: 20 },
    'inr-b': { cur: 'inr', notes: true, min: 21, max: 99 },
    'usd-s': { cur: 'usd', notes: false, min: 6, max: 60 },
    'usd-b': { cur: 'usd', notes: true, min: 101, max: 650 },
  };
  var f, done, price, purse, busy = false;

  function s(tag, a) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); return n; }
  function art(m, isNote) {
    var svg;
    if (isNote) {
      svg = s('svg', { viewBox: '0 0 110 56', width: 104, height: 53, class: 'note', 'aria-hidden': 'true' });
      svg.appendChild(s('rect', { x: 2, y: 2, width: 106, height: 52, rx: 8, fill: m.fill, stroke: '#2a2522', 'stroke-width': 3 }));
      svg.appendChild(s('circle', { cx: 80, cy: 28, r: 13, fill: 'none', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 3 }));
    } else {
      var d = m.r * 2 + 6; svg = s('svg', { viewBox: '0 0 ' + d + ' ' + d, width: d, height: d, 'aria-hidden': 'true' });
      svg.appendChild(s('circle', { cx: d / 2, cy: d / 2, r: m.r, fill: m.fill, stroke: '#2a2522', 'stroke-width': 3 }));
      svg.appendChild(s('circle', { cx: d / 2, cy: d / 2, r: m.r - 6, fill: 'none', stroke: m.ring, 'stroke-width': 3 }));
    }
    var t = s('text', { x: isNote ? 38 : '50%', y: isNote ? 37 : '50%', 'text-anchor': 'middle', 'dominant-baseline': isNote ? 'auto' : 'central', 'font-size': isNote ? 22 : (m.label.length > 3 ? 15 : 18), 'font-weight': 800, fill: '#2a2522', 'font-family': 'Nunito, Trebuchet MS, Arial, sans-serif' });
    t.textContent = m.label; svg.appendChild(t);
    return svg;
  }

  function total() { return purse.reduce(function (a, p) { return a + p.v; }, 0); }

  function start() { done = 0; f.progress(0); round(); }

  function round() {
    var L = LEVELS[f.level], M = MONEY[L.cur];
    price = GK.rand(L.min, L.max);
    if (L.cur === 'usd' && L.notes) price = Math.round(price / 5) * 5;
    purse = [];
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('div', { class: 'gk-shop' }, [
      GK.el('span', { class: 'gk-item gk-wiggle', 'aria-hidden': 'true', text: GK.pick(ITEMS) }),
      GK.el('span', { class: 'gk-tag', text: M.show(price) }),
    ]));
    f.purseEl = GK.el('div', { class: 'gk-purse', 'aria-label': 'Your purse' });
    f.totalEl = GK.el('p', { class: 'gk-total' });
    f.area.appendChild(f.purseEl); f.area.appendChild(f.totalEl);
    var wallet = GK.el('div', { class: 'gk-wallet' });
    M.coins.concat(L.notes ? M.notes.map(function (n) { return Object.assign({ note: true }, n); }) : []).forEach(function (m) {
      var b = GK.el('button', { type: 'button', class: 'gk-coin' + (m.note ? ' note' : ''), 'aria-label': 'Add ' + M.show(m.v) });
      b.appendChild(art(m, m.note));
      b.addEventListener('click', function () { add(m); });
      wallet.appendChild(b);
    });
    f.area.appendChild(wallet);
    var undo = GK.el('button', { type: 'button', class: 'gk-tool', text: '↩ Undo' });
    var clear = GK.el('button', { type: 'button', class: 'gk-tool', text: 'Clear' });
    var pay = GK.el('button', { type: 'button', class: 'gk-big', text: 'Pay' });
    undo.addEventListener('click', function () { if (purse.length) { purse.pop(); GK.sfx.tap(); draw(); } });
    clear.addEventListener('click', function () { purse = []; GK.sfx.flip(); draw(); });
    pay.addEventListener('click', function () { payNow(pay); });
    f.area.appendChild(GK.el('div', { class: 'gk-tools' }, [undo, clear, pay]));
    f.say('Tap coins' + (L.notes ? ' and notes' : '') + ' to pay exactly ' + M.show(price) + '.');
    draw();
  }

  function add(m) {
    if (busy) return;
    purse.push(m); m.note ? GK.sfx.note() : GK.sfx.coin(); draw();
    var M = MONEY[LEVELS[f.level].cur], t = total();
    if (t > price) f.say('Oops, that is ' + M.show(t - price) + ' too much. Tap Undo.', 'bad');
    else if (t === price) f.say('That is exactly right. Tap Pay!', 'good');
    else f.say('');
  }

  function draw() {
    var M = MONEY[LEVELS[f.level].cur];
    f.purseEl.innerHTML = '';
    if (!purse.length) f.purseEl.appendChild(GK.el('span', { class: 'gk-small', text: 'Your purse is empty' }));
    purse.forEach(function (m) { f.purseEl.appendChild(art(m, m.note)); });
    f.totalEl.textContent = 'In your purse: ' + M.show(total()) + ' of ' + M.show(price);
  }

  function payNow(btn) {
    if (busy) return;
    var M = MONEY[LEVELS[f.level].cur], t = total();
    if (t < price) { GK.bad(); GK.flash(btn, false); f.say('You need ' + M.show(price - t) + ' more.', 'bad'); return; }
    if (t > price) { GK.bad(); GK.flash(btn, false); f.say('That is too much. Take some back with Undo.', 'bad'); return; }
    busy = true; done++; GK.good(btn); GK.sfx.coin(); f.progress(done);
    f.say(GK.pick(['Thank you, shopper! ', 'Paid in full! ', 'Perfect! ']) + M.show(price) + ' paid.', 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Shopping spree done!', text: 'You paid the exact price ' + ROUNDS + ' times. Try a bigger level next.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 1100);
  }

  GK.solve = function () {
    var left = price - total(); if (left < 0) { purse = []; draw(); left = price; }
    var btns = [].slice.call(f.area.querySelectorAll('.gk-coin'));
    var L = LEVELS[f.level], M = MONEY[L.cur];
    var all = M.coins.concat(L.notes ? M.notes.map(function (n) { return Object.assign({ note: true }, n); }) : []);
    all.map(function (m, i) { return [m, btns[i]]; }).sort(function (a, b) { return b[0].v - a[0].v; }).forEach(function (p) { while (left >= p[0].v) { p[1].click(); left -= p[0].v; } });
    f.area.querySelector('.gk-big').click();
  };

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'inr-s', label: '₹ Coins' }, { key: 'inr-b', label: '₹ Coins + notes' }, { key: 'usd-s', label: '$ Coins' }, { key: 'usd-b', label: '$ Coins + bills' }], onLevel: start });
  start();
})();
