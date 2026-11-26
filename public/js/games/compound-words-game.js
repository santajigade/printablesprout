(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  /* Word Glue: in Gloop's lab, drop two word halves into the glue machine and pull the lever. Real compound words pop out as capsules that fill the word jar. Four levels, from one-step glue to planning whole word chains. */
  var NS = 'http://www.w3.org/2000/svg';
  // every compound word the game knows (checked in a dictionary), with a short meaning
  var M = {
    rainbow: 'Bands of color in the sky when the sun shines through rain.', sunflower: 'A tall flower with a big yellow head.', starfish: 'A sea animal shaped like a star.',
    cupcake: 'A small cake baked in a paper cup.', snowman: 'A figure of a person made of snow.', toothbrush: 'A small brush for cleaning your teeth.',
    popcorn: 'Corn kernels that puff open when they are heated.', butterfly: 'An insect with large, colorful wings.', goldfish: 'A small orange fish often kept as a pet.',
    mailbox: 'A box where letters are delivered.', backpack: 'A bag you carry on your back.', seashell: 'The hard shell of a sea animal, found on the beach.',
    ladybug: 'A small round beetle, often red with black spots.', watermelon: 'A big juicy fruit, green outside and red inside.', airplane: 'A machine with wings that flies through the air.',
    snowflake: 'A tiny piece of ice that falls as snow.',
    raincoat: 'A coat that keeps you dry in the rain.', bedroom: 'A room with a bed for sleeping.', sunshine: 'The light and warmth of the sun.', teapot: 'A pot for making and pouring tea.',
    sunroom: 'A room with lots of windows to let the sun in.', tearoom: 'A small cafe that serves tea and light meals.',
    firefly: 'A flying beetle whose body glows at night.', homework: 'Schoolwork you do at home.', footprint: 'The mark a foot or shoe leaves behind.', doorbell: 'A bell you ring at a door.',
    firework: 'A burst of bright sparks and color in the night sky.', footwork: 'The way you move your feet, like in a dance or a sport.',
    cowboy: 'A rider who looks after cattle on a ranch.', bookshelf: 'A shelf for books.', hairbrush: 'A brush for your hair.', campfire: 'A fire made outdoors at a campsite.',
    moonlight: 'The light of the moon.', keyhole: 'The hole in a lock where the key goes.', grasshopper: 'An insect with long back legs for jumping.', bathtub: 'A tub you sit in to take a bath.',
    houseboat: 'A boat made for people to live on.', boathouse: 'A building where boats are kept.', lighthouse: 'A tower with a strong light that guides ships.', waterfall: 'Water falling over the edge of a cliff or rock.',
    flowerpot: 'A pot to grow a plant in.', pothole: 'A hole in the surface of a road.', shellfish: 'A water animal with a shell, like a crab or a clam.', fishbowl: 'A glass bowl for pet fish.',
    birthday: 'The day you were born, celebrated every year.', daylight: 'The light of day.', buttermilk: 'The milk left over after butter is made.', milkshake: 'A cold drink of milk and ice cream mixed together.',
    workshop: 'A room or building where things are made or fixed.', cornfield: 'A field where corn grows.', sunlight: 'The light of the sun.',
  };
  var EMO = { rainbow: '🌈', sunflower: '🌻', cupcake: '🧁', snowman: '⛄', popcorn: '🍿', butterfly: '🦋', goldfish: '🐠', mailbox: '📬', backpack: '🎒', seashell: '🐚', ladybug: '🐞', watermelon: '🍉', airplane: '✈️', snowflake: '❄️', sunshine: '☀️', doorbell: '🔔', firework: '🎆', cowboy: '🤠', campfire: '🔥', bathtub: '🛁', waterfall: '💧', birthday: '🎂', milkshake: '🥤', cornfield: '🌽', moonlight: '🌙' };
  var L1 = [['rain', 'bow', 'cat desk spoon'], ['sun', 'flower', 'boot lamp sock'], ['star', 'fish', 'cup hat drum'], ['cup', 'cake', 'bird pen rope'], ['snow', 'man', 'sock pen chair'],
    ['tooth', 'brush', 'kite frog bell'], ['pop', 'corn', 'desk ship sock'], ['butter', 'fly', 'lamp sock rope'], ['gold', 'fish', 'spoon nose rope'], ['mail', 'box', 'frog cake pen'],
    ['back', 'pack', 'nose spoon cup'], ['sea', 'shell', 'desk sock kite'], ['lady', 'bug', 'lamp desk rope'], ['water', 'melon', 'sock desk kite'], ['air', 'plane', 'frog spoon nose'], ['snow', 'flake', 'cup rope nose']];
  var L2 = [['rain|coat', 'bed|room', 'sun|shine', 'tea|pot'], ['fire|fly', 'home|work', 'foot|print', 'door|bell'], ['cow|boy', 'book|shelf', 'hair|brush', 'camp|fire'], ['moon|light', 'key|hole', 'grass|hopper', 'bath|tub']];
  var L3 = [['house|boat', 'A boat made for people to live on.'], ['boat|house', 'A building where boats are kept.'], ['light|house', 'A tall tower with a bright light that guides ships at night.'],
    ['fire|fly', 'A flying beetle whose body glows in the dark.'], ['water|fall', 'Water tumbling over the edge of a cliff.'], ['foot|print', 'The mark your shoe leaves in mud or snow.'],
    ['snow|flake', 'A tiny piece of ice that drifts down from a winter cloud.'], ['grass|hopper', 'A green insect with long back legs, great at jumping.'], ['home|work', 'Schoolwork you do at home.']];
  var DIST = ['frog', 'sock', 'desk', 'kite', 'jam', 'drum', 'mop', 'owl'];
  var L4 = [['sun', ['flower', 'milk shell'], ['pot', 'day shake'], ['hole', 'work field']], ['sea', ['shell', 'corn band'], ['fish', 'room day'], ['bowl', 'yard light']],
    ['birth', ['day', 'pot corn'], ['light', 'band shake'], ['house', 'mate hole']], ['butter', ['milk', 'room yard'], ['shake', 'corn flower']],
    ['home', ['work', 'shell bowl'], ['shop', 'flower milk']], ['pop', ['corn', 'hole mate'], ['field', 'shell boat']]];
  var ROUNDS = { glue: 10, pile: 4, riddle: 8, chain: 6 };
  var CAPS = ['#e0574a', '#f2a541', '#7bb661', '#2f7fd0', '#d62976', '#8e6bd1', '#3bb3a6', '#f2c14e'];
  var f, done, busy, slots, els = {}, item, list, made, wrong, board, chain, link, drag = null, skipClick = false;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function E(t, a, k) { return GK.el(t, a, k); }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }

  function gloopSvg() {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 120 130'); s.setAttribute('class', 'gk-wg-gloop'); s.setAttribute('aria-hidden', 'true');
    var K = 'stroke="#2a2522" stroke-width="4" stroke-linejoin="round"';
    s.innerHTML = '<ellipse cx="60" cy="122" rx="40" ry="6" fill="rgba(0,0,0,.15)"/>' +
      '<path d="M18 116 Q12 70 30 46 Q46 24 60 24 Q74 24 90 46 Q108 70 102 116 Q96 122 88 116 Q82 124 74 118 Q66 126 58 118 Q48 126 42 118 Q30 124 18 116Z" fill="#7bd36a" ' + K + '/>' +
      '<path d="M34 60 Q38 44 50 38" fill="none" stroke="#c8f5b8" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M24 58 Q60 48 96 58" fill="none" stroke="#2a2522" stroke-width="5"/>' +
      '<g class="gk-wg-eyes"><circle cx="45" cy="60" r="13" fill="#d6f0ff" ' + K + '/><circle cx="75" cy="60" r="13" fill="#d6f0ff" ' + K + '/><circle cx="47" cy="62" r="5.5" fill="#2a2522"/><circle cx="77" cy="62" r="5.5" fill="#2a2522"/><circle cx="49" cy="60" r="2" fill="#fff"/><circle cx="79" cy="60" r="2" fill="#fff"/></g>' +
      '<path class="gk-wg-mouth" d="M48 88 Q60 98 72 88" fill="none" stroke="#2a2522" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="34" cy="84" r="5" fill="#f7a0b8" opacity=".7"/><circle cx="86" cy="84" r="5" fill="#f7a0b8" opacity=".7"/>' +
      '<path d="M60 24 Q58 12 66 8" fill="none" stroke="#2a2522" stroke-width="3.5" stroke-linecap="round"/><circle cx="67" cy="8" r="5" fill="#ffd23f" stroke="#2a2522" stroke-width="3"/>';
    return s;
  }
  function labSvg() {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 800 300'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('class', 'gk-wg-bg'); s.setAttribute('aria-hidden', 'true');
    var tiles = ''; for (var x = 0; x < 800; x += 50) for (var y = 0; y < 230; y += 50) tiles += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="46" height="46" rx="4" fill="' + ((x + y) % 100 ? '#e4ecfb' : '#dde6f8') + '"/>';
    s.innerHTML = '<rect width="800" height="300" fill="#cfdaf2"/>' + tiles +
      '<rect x="20" y="70" width="150" height="8" rx="3" fill="#a8743a"/><rect x="630" y="60" width="150" height="8" rx="3" fill="#a8743a"/>' +
      '<g stroke="#2a2522" stroke-width="2.5"><path d="M40 70 v-22 l-8 -18 h24 l-8 18 v22z" fill="#f27eb0"/><rect x="80" y="40" width="20" height="30" rx="6" fill="#ffd23f"/><path d="M120 70 q-14 0 -14 -14 q0 -12 14 -16 q14 4 14 16 q0 14 -14 14z" fill="#7bd36a"/>' +
      '<path d="M660 60 v-22 l-8 -18 h24 l-8 18 v22z" fill="#5aa0e6"/><rect x="700" y="30" width="20" height="30" rx="6" fill="#f2a541"/><path d="M750 60 q-14 0 -14 -14 q0 -12 14 -16 q14 4 14 16 q0 14 -14 14z" fill="#d6b4ff"/></g>' +
      '<rect y="230" width="800" height="70" fill="#a7b4cf"/><path d="M0 230 H800" stroke="#2a2522" stroke-width="3"/>';
    return s;
  }

  function levelIntro() {
    return { glue: 'Drop a word into the empty funnel, then pull the lever to glue them!', pile: 'Glue all the halves into real words. Careful: one wrong word can leave a half with no partner.', riddle: 'Read the clue, then glue two halves in the right order.', chain: 'The end of each word starts the next one. Build the whole chain!' }[f.level];
  }

  var gen = 0;
  function start() {
    gen++; done = 0; busy = false; made = []; wrong = 0;
    f.progress(0, ROUNDS[f.level]);
    if (f.level === 'glue') list = GK.shuffle(L1).slice(0, ROUNDS.glue);
    if (f.level === 'pile') list = L2.slice();
    if (f.level === 'riddle') {
      list = GK.shuffle(L3.slice(2)).slice(0, ROUNDS.riddle - 2);
      list.splice(GK.rand(0, 2), 0, L3[0]); list.splice(GK.rand(4, list.length), 0, L3[1]);
    }
    if (f.level === 'chain') list = GK.shuffle(L4.slice(0, 3)).concat(GK.shuffle(L4.slice(3)));
    f.area.innerHTML = '';
    els.task = E('div', { class: 'gk-wg-task', 'aria-live': 'polite' });
    f.area.appendChild(els.task);
    var scene = E('div', { class: 'gk-wg-scene' });
    scene.appendChild(labSvg());
    els.gloop = E('div', { class: 'gk-wg-gwrap' }, [gloopSvg()]);
    // machine
    els.slots = [E('button', { type: 'button', class: 'gk-wg-slot', 'aria-label': 'First funnel' }), E('button', { type: 'button', class: 'gk-wg-slot', 'aria-label': 'Second funnel' })];
    els.slots.forEach(function (b, i) { b.addEventListener('click', function () { unslot(i); }); });
    var hopper = E('div', { class: 'gk-wg-hopper' }, [els.slots[0], E('span', { class: 'gk-wg-plus', 'aria-hidden': 'true', text: '+' }), els.slots[1]]);
    els.win = E('div', { class: 'gk-wg-window', 'aria-live': 'polite' });
    els.lever = E('button', { type: 'button', class: 'gk-wg-lever', 'aria-label': 'Pull the glue lever' }, [E('span', { class: 'gk-wg-stick' }), E('span', { class: 'gk-wg-knob' })]);
    bindLever(els.lever);
    els.bubbles = E('div', { class: 'gk-wg-bubbles', 'aria-hidden': 'true' });
    els.machine = E('div', { class: 'gk-wg-machine' }, [hopper, E('div', { class: 'gk-wg-pipe', 'aria-hidden': 'true' }), els.win, els.bubbles, els.lever,
      null]);
    els.jarCount = E('span', { class: 'gk-wg-jarn', text: '0' });
    els.caps = E('div', { class: 'gk-wg-caps' });
    els.jar = E('div', { class: 'gk-wg-jar', 'aria-label': 'Word jar' }, [E('span', { class: 'gk-wg-lid', 'aria-hidden': 'true' }), els.caps, els.jarCount]);
    scene.appendChild(els.gloop); scene.appendChild(els.machine); scene.appendChild(els.jar);
    f.area.appendChild(scene);
    els.chain = E('div', { class: 'gk-wg-chain', 'aria-live': 'polite' });
    f.area.appendChild(els.chain);
    els.tray = E('div', { class: 'gk-wg-tray', role: 'group', 'aria-label': 'Word halves' });
    f.area.appendChild(els.tray);
    round();
    f.say(levelIntro());
  }

  function tile(w) {
    var b = E('button', { type: 'button', class: 'gk-wg-tile', text: w });
    b.dataset.w = w; bindTile(b); return b;
  }
  function setSlot(i, w, locked) {
    slots[i] = w ? { w: w, locked: !!locked } : null;
    var s = els.slots[i]; s.textContent = w || '?'; s.classList.toggle('full', !!w); s.classList.toggle('locked', !!locked);
    s.disabled = !!locked;
    if (w) { s.classList.remove('gk-wg-drop'); void s.offsetWidth; s.classList.add('gk-wg-drop'); }
  }
  function fillTray(words) { els.tray.innerHTML = ''; GK.shuffle(words).forEach(function (w) { els.tray.appendChild(tile(w)); }); }

  function round() {
    busy = false; wrong = 0; slots = [null, null];
    els.win.innerHTML = ''; els.win.appendChild(E('span', { class: 'gk-wg-wait', text: '?' }));
    els.gloop.classList.remove('gk-wg-yay', 'gk-wg-hmm');
    var L = f.level; els.chain.innerHTML = ''; els.chain.style.display = 'none';
    if (L === 'glue') {
      item = list[done];
      els.task.innerHTML = 'Glue a word onto <strong>' + item[0].toUpperCase() + '</strong>';
      setSlot(0, item[0], true); setSlot(1, null);
      fillTray([item[1]].concat(item[2].split(' ')));
    } else if (L === 'pile') {
      board = list[done].map(function (p) { return p.split('|'); });
      els.task.innerHTML = 'Board ' + (done + 1) + ' of 4: glue all 8 halves into <strong>4 real words</strong>';
      setSlot(0, null); setSlot(1, null);
      var all = []; board.forEach(function (p) { all.push(p[0], p[1]); });
      fillTray(all);
    } else if (L === 'riddle') {
      item = list[done]; var p = item[0].split('|');
      els.task.innerHTML = '<span class="gk-wg-clue">Clue</span> ' + item[1];
      setSlot(0, null); setSlot(1, null);
      fillTray(p.concat(GK.shuffle(DIST).slice(0, 4)));
    } else {
      chain = list[done]; link = 1; chainStep();
    }
  }
  function chainStep() {
    var left = link === 1 ? chain[0] : chain[link - 1][0], step = chain[link];
    els.task.innerHTML = 'Chain ' + (done + 1) + ' of 6: what can follow <strong>' + left.toUpperCase() + '</strong>?';
    setSlot(0, left, true); setSlot(1, null);
    fillTray([step[0]].concat(step[1].split(' ')));
    drawChain();
  }
  function drawChain() {
    els.chain.style.display = ''; els.chain.innerHTML = '';
    for (var i = 1; i < chain.length; i++) {
      var left = i === 1 ? chain[0] : chain[i - 1][0];
      var c = E('span', { class: 'gk-wg-link' + (i < link ? ' on' : ''), text: i < link ? left + chain[i][0] : '?' });
      if (i > 1) els.chain.appendChild(E('span', { class: 'gk-wg-arrow', 'aria-hidden': 'true', text: '→' }));
      els.chain.appendChild(c);
    }
  }

  function place(b) {
    if (busy) return;
    var i = slots[0] ? (slots[1] ? -1 : 1) : 0;
    if (i < 0) { // both full: swap out the second one
      if (slots[1].locked) return;
      unslot(1); i = 1;
    }
    putIn(i, b);
  }
  function putIn(i, b) {
    if (slots[i] && slots[i].locked) i = 1 - i;
    if (slots[i] && slots[i].locked) return;
    if (slots[i]) unslot(i);
    setSlot(i, b.dataset.w); b.remove(); GK.sfx.pop();
    if (slots[0] && slots[1]) { f.say('Ready! Pull the lever to glue ' + slots[0].w + ' + ' + slots[1].w + '.'); els.lever.classList.add('gk-wg-ready'); }
    else f.say('Now pick the other half.');
  }
  function unslot(i) {
    if (busy || !slots[i] || slots[i].locked) return;
    els.tray.appendChild(tile(slots[i].w)); setSlot(i, null); GK.sfx.tap(); els.lever.classList.remove('gk-wg-ready');
  }

  function bindTile(b) {
    b.addEventListener('click', function () { if (skipClick) { skipClick = false; return; } place(b); });
    b.addEventListener('pointerdown', function (e) { if (busy || e.button > 0) return; drag = { b: b, x: e.clientX, y: e.clientY, g: null }; try { b.setPointerCapture(e.pointerId); } catch (x) {} });
    b.addEventListener('pointermove', function (e) {
      if (!drag || drag.b !== b) return;
      if (!drag.g && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8) {
        var r = b.getBoundingClientRect(); drag.g = b.cloneNode(true); drag.g.classList.add('gk-wg-ghost'); drag.g.style.width = r.width + 'px';
        drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; document.body.appendChild(drag.g); b.classList.add('gk-wg-lift'); GK.sfx.tap();
      }
      if (drag.g) { drag.g.style.left = (e.clientX - drag.dx) + 'px'; drag.g.style.top = (e.clientY - drag.dy) + 'px'; var h = over(e); els.slots.forEach(function (s, i) { s.classList.toggle('hover', i === h); }); }
    });
    function end(e) {
      if (!drag || drag.b !== b) return;
      var d = drag; drag = null;
      if (d.g) {
        skipClick = true; setTimeout(function () { skipClick = false; }, 60); d.g.remove(); b.classList.remove('gk-wg-lift');
        els.slots.forEach(function (s) { s.classList.remove('hover'); });
        var h = over(e); if (h >= 0 && !busy) putIn(h, b);
      }
    }
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  }
  function over(e) {
    for (var i = 0; i < 2; i++) { var r = els.slots[i].getBoundingClientRect(); if (e.clientX > r.left - 16 && e.clientX < r.right + 16 && e.clientY > r.top - 30 && e.clientY < r.bottom + 30) return i; }
    return -1;
  }
  function bindLever(l) {
    var y0 = null, pulled = false;
    l.addEventListener('pointerdown', function (e) { y0 = e.clientY; pulled = false; try { l.setPointerCapture(e.pointerId); } catch (x) {} });
    l.addEventListener('pointermove', function (e) { if (y0 != null && !pulled && e.clientY - y0 > 26) { pulled = true; y0 = null; skipClick = true; setTimeout(function () { skipClick = false; }, 80); pull(); } });
    l.addEventListener('pointerup', function () { y0 = null; });
    l.addEventListener('click', function () { if (skipClick) { skipClick = false; return; } pull(); });
  }

  // can these halves all be glued into known words?
  function solvable(h) {
    if (!h.length) return true;
    var a = h[0];
    for (var i = 1; i < h.length; i++) {
      var rest = h.slice(1, i).concat(h.slice(i + 1));
      if ((M[a + h[i]] || M[h[i] + a]) && solvable(rest)) return true;
    }
    return false;
  }
  function trayWords() { return Array.prototype.map.call(els.tray.children, function (t) { return t.dataset.w; }); }

  function pull() {
    if (busy) return;
    els.lever.classList.remove('gk-wg-pull'); void els.lever.offsetWidth; els.lever.classList.add('gk-wg-pull');
    if (!slots[0] || !slots[1]) { GK.sfx.tap(); f.say('Fill both funnels first, then pull the lever.'); return; }
    busy = true; els.lever.classList.remove('gk-wg-ready');
    var a = slots[0].w, b = slots[1].w, w = a + b, L = f.level, ok = false, why = '';
    if (L === 'glue') ok = b === item[1];
    else if (L === 'riddle') { ok = item[0] === a + '|' + b; if (!ok && M[w]) why = w === 'boathouse' || w === 'houseboat' ? 'order' : 'clue'; }
    else if (L === 'chain') ok = b === chain[link][0];
    else if (L === 'pile') {
      if (M[w]) { ok = solvable(trayWords()); if (!ok) why = 'block'; }
    }
    GK.sfx.vroom();
    els.machine.classList.remove('gk-wg-shake'); void els.machine.offsetWidth; els.machine.classList.add('gk-wg-shake');
    bubble(ok ? 8 : 4, ok);
    var g = gen;
    setTimeout(function () { if (g !== gen) return; ok ? success(w) : fail(a, b, w, why); }, still ? 200 : 650);
  }
  function bubble(n, ok) {
    els.bubbles.innerHTML = '';
    if (still) return;
    for (var i = 0; i < n; i++) { var s = E('span', { class: 'gk-wg-bub' + (ok ? '' : ' bad') }); s.style.left = (10 + Math.random() * 80) + '%'; s.style.animationDelay = (i * 0.07) + 's'; els.bubbles.appendChild(s); }
  }

  function success(w) {
    made.push(w); wrong = 0;
    els.win.innerHTML = '';
    els.win.appendChild(E('div', { class: 'gk-wg-out' }, [E('strong', { text: (EMO[w] ? EMO[w] + ' ' : '') + w }), E('span', { text: M[w] || '' })]));
    els.gloop.classList.remove('gk-wg-hmm'); els.gloop.classList.add('gk-wg-yay');
    GK.good(els.win);
    var c = E('span', { class: 'gk-wg-cap' }); c.style.background = CAPS[made.length % CAPS.length]; c.title = w;
    els.caps.appendChild(c); els.jarCount.textContent = made.length;
    setTimeout(function () { GK.sfx.coin(); }, 350);
    var L = f.level, next = null;
    if (L === 'pile') {
      setSlot(0, null); setSlot(1, null);
      f.say(cap(w) + '! ' + (els.tray.children.length ? 'Keep gluing.' : 'Board cleared!'), 'good');
      if (!els.tray.children.length) { done++; f.progress(done, ROUNDS.pile); next = round; }
      else next = function () { busy = false; els.gloop.classList.remove('gk-wg-yay'); };
    } else if (L === 'chain') {
      link++;
      if (link >= chain.length) {
        drawChain(); done++; f.progress(done, ROUNDS.chain);
        f.say('Chain complete: ' + made.slice(-(chain.length - 1)).join(', ') + '!', 'good'); next = round;
      } else { f.say(cap(w) + '! Now ' + chain[link - 1][0] + ' starts the next word.', 'good'); next = function () { busy = false; els.gloop.classList.remove('gk-wg-yay'); chainStep(); }; }
    } else {
      done++; f.progress(done, ROUNDS[L]);
      f.say(cap(w) + '! ' + (L === 'riddle' ? 'That matches the clue.' : GK.pick(['Gloop loves it!', 'A real word!', 'Perfect glue!'])), 'good');
      els.tray.innerHTML = '';
      next = round;
    }
    var g = gen;
    setTimeout(function () { if (g !== gen) return; if (done >= ROUNDS[L] && next === round) return end(); next(); }, still ? 1200 : 2100);
  }

  function fail(a, b, w, why) {
    busy = false; wrong++;
    GK.bad();
    els.gloop.classList.remove('gk-wg-hmm'); void els.gloop.offsetWidth; els.gloop.classList.add('gk-wg-hmm');
    els.win.innerHTML = ''; els.win.appendChild(E('div', { class: 'gk-wg-blorp', text: 'BLORP!' }));
    if (why === 'block') {
      f.say(cap(w) + ' is a real word! But then the other halves cannot all pair up. Try a different match.', 'bad');
      unslot(1); unslot(0);
    } else if (why === 'order') {
      f.say(cap(w) + ' is a real word: ' + M[w].toLowerCase() + ' The clue wants the other order. Try swapping!', 'bad');
      unslot(1); unslot(0);
    } else if (why === 'clue') {
      f.say(cap(w) + ' is a real word, but it does not match the clue.', 'bad');
      unslot(1); unslot(0);
    } else {
      f.say(cap(a) + ' + ' + b + ' does not make a real word. Try another half.', 'bad');
      unslot(1); if (f.level === 'riddle' || f.level === 'pile') unslot(0);
    }
    if (wrong >= 2 && (f.level === 'glue' || f.level === 'chain')) {
      var want = f.level === 'glue' ? item[1] : chain[link][0];
      Array.prototype.forEach.call(els.tray.children, function (t) { t.classList.toggle('gk-wg-hint', t.dataset.w === want); });
      f.say('Hint: say each word out loud after ' + slots[0].w + '. Which one sounds like a real thing?', 'bad');
    }
  }

  function end() {
    var txt = { glue: 'You glued 10 compound words.', pile: 'You cleared 4 boards and planned 16 words without leaving a half behind.', riddle: 'You solved 8 clue riddles, even the order traps.', chain: 'You built 6 word chains, ' + made.length + ' words in all.' }[f.level];
    var words = made.slice();
    GK.finish(f, { title: 'The word jar is full!', text: txt, sheet: root.dataset.sheet, onReplay: start });
    var box = f.area.querySelector('.gk-end');
    if (box) { var row = E('div', { class: 'gk-wg-made' }); words.forEach(function (w, i) { var s = E('span', { text: w }); s.style.borderColor = CAPS[(i + 1) % CAPS.length]; row.appendChild(s); }); box.insertBefore(row, box.children[1]); }
  }

  GK.solve = function () {
    if (busy || !slots) return;
    var L = f.level, a, b;
    if (L === 'glue') { a = null; b = item[1]; }
    else if (L === 'chain') { a = null; b = chain[link][0]; }
    else if (L === 'riddle') { var p = item[0].split('|'); a = p[0]; b = p[1]; }
    else {
      var tw = trayWords().concat(slots[0] ? [slots[0].w] : [], slots[1] ? [slots[1].w] : []);
      var pr = board.filter(function (x) { return tw.indexOf(x[0]) >= 0 && tw.indexOf(x[1]) >= 0; })[0]; if (!pr) return;
      a = pr[0]; b = pr[1];
    }
    if (a) { unslot(0); unslot(1); }
    else unslot(1);
    function find(w) { return Array.prototype.filter.call(els.tray.children, function (t) { return t.dataset.w === w; })[0]; }
    if (a) putIn(0, find(a));
    putIn(1, find(b));
    pull();
  };

  f = GK.frame({ root: root, rounds: ROUNDS.glue, levels: [{ key: 'glue', label: 'Glue a word' }, { key: 'pile', label: 'Clear the board' }, { key: 'riddle', label: 'Clue riddles' }, { key: 'chain', label: 'Word chains' }], onLevel: start });
  start();
})();
