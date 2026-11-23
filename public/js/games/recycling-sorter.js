(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10;
  // Rules follow the EPA recycling and home composting pages and a big city curbside list.
  // Only items where those sources agree are used. Local rules can differ.
  var BINS = {
    rec: { icon: '♻️', name: 'Recycle', cls: 'rec' },
    com: { icon: '🌱', name: 'Compost', cls: 'com' },
    tra: { icon: '🗑️', name: 'Trash', cls: 'tra' },
    drop: { icon: '🏪', name: 'Drop-off', cls: 'drop' },
  };
  var ITEMS = [
    ['📦', 'Cardboard box', 'rec', 'Flatten the box so it fits in the recycling bin.'],
    ['📰', 'Newspaper', 'rec', 'Clean, dry paper is great for recycling.'],
    ['✉️', 'Junk mail', 'rec', 'Mail and envelopes go in recycling, even ones with little windows.'],
    ['🥫', 'Soup can', 'rec', 'Empty and rinse metal cans, then recycle them.'],
    ['🫙', 'Glass jar', 'rec', 'Empty glass jars go in recycling.'],
    ['🧴', 'Shampoo bottle', 'rec', 'Empty plastic bottles can be recycled. Leave the cap on.'],
    ['📖', 'Paperback book', 'rec', 'Paperback books can go in recycling. Better yet, give it to a friend!'],
    ['📄', 'Scrap paper', 'rec', 'Paper from drawing or homework can be recycled.'],
    ['🍌', 'Banana peel', 'com', 'Fruit scraps turn into rich soil in a compost pile.'],
    ['🍎', 'Apple core', 'com', 'Fruit scraps are compost food.'],
    ['🥕', 'Carrot tops', 'com', 'Vegetable scraps are perfect for compost.'],
    ['🍂', 'Dry leaves', 'com', 'Dry leaves are a brown that helps compost breathe.'],
    ['☕', 'Coffee grounds', 'com', 'Coffee grounds and paper filters can go in compost.'],
    ['🥚', 'Eggshells', 'com', 'Crush the eggshells first, then add them to compost.'],
    ['🌿', 'Twigs', 'com', 'Small twigs and plant stalks can be composted.'],
    ['🌱', 'Grass clippings', 'com', 'Grass clippings are a green for the compost pile.'],
    ['🦴', 'Meat bone', 'tra', 'Bones and meat attract animals, so keep them out of a home compost pile.'],
    ['🧀', 'Cheese', 'tra', 'Cheese and other dairy foods attract animals, so not in home compost. Food is not recyclable.'],
    ['🍴', 'Plastic fork', 'tra', 'Plastic forks and spoons cannot be recycled.'],
    ['🤧', 'Used tissue', 'tra', 'Used tissues go in the trash, not recycling.'],
    ['🥤', 'Foam cup', 'tra', 'Very few places recycle foam, so it usually goes in the trash.'],
    ['🔋', 'Battery', 'drop', 'Batteries never go in the trash or recycling bin. Take them to a battery drop-off.'],
    ['📱', 'Old phone', 'drop', 'Electronics cannot go in the curbside bin. Take them to an electronics drop-off.'],
    ['🛍️', 'Plastic bag', 'drop', 'Plastic bags jam the sorting machines. Many grocery stores collect them.'],
    ['💡', 'Light bulb', 'drop', 'Some light bulbs need a special drop-off. A grown-up can check the local rules.'],
    ['💻', 'Old laptop', 'drop', 'Computers are electronics, so they go to an electronics drop-off.'],
  ];
  var LV = {
    two: { bins: ['rec', 'tra'], say: 'Recycle or trash? Tap the right bin.' },
    three: { bins: ['rec', 'com', 'tra'], say: 'Now there is a compost bin for food scraps and leaves.' },
    four: { bins: ['rec', 'com', 'tra', 'drop'], say: 'Tricky items! Some things need a special drop-off.' },
  };
  var f, done, deck, item, busy = false, tries;

  function start() {
    done = 0; f.progress(0);
    var L = LV[f.level];
    var pool = ITEMS.filter(function (it) { return L.bins.indexOf(it[2]) >= 0; });
    if (f.level === 'four') { // make sure the drop-off items show up
      var drop = GK.shuffle(pool.filter(function (it) { return it[2] === 'drop'; })).slice(0, 4);
      var rest = GK.shuffle(pool.filter(function (it) { return it[2] !== 'drop'; })).slice(0, ROUNDS - drop.length);
      deck = GK.shuffle(drop.concat(rest));
    } else {
      deck = GK.shuffle(pool).slice(0, ROUNDS);
      while (deck.length < ROUNDS) deck.push(GK.pick(pool));
    }
    f.say(L.say);
    round();
  }

  function round() {
    item = deck[done]; tries = 0;
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'Where does it go?' }));
    var card = GK.el('div', { class: 'gk-rs-card' }, [
      GK.el('span', { class: 'gk-rs-pic', 'aria-hidden': 'true', text: item[0] }),
      GK.el('span', { class: 'gk-rs-name', text: item[1] }),
    ]);
    f.area.appendChild(card);
    var row = GK.el('div', { class: 'gk-rs-bins gk-rs-n' + LV[f.level].bins.length });
    var btns = {};
    LV[f.level].bins.forEach(function (k) {
      var B = BINS[k];
      var b = GK.el('button', { type: 'button', class: 'gk-rs-bin gk-rs-' + B.cls, 'aria-label': B.name }, [
        GK.el('span', { class: 'gk-rs-bi', 'aria-hidden': 'true', text: B.icon }),
        GK.el('span', { text: B.name }),
      ]);
      b.addEventListener('click', function () { answer(b, k, card); });
      btns[k] = b; row.appendChild(b);
    });
    f.area.appendChild(row);
    GK.sfx.flip();
    GK.solve = function () { if (!busy) btns[item[2]].click(); };
  }

  function hint(k) {
    if (item[2] === 'drop') return 'Hmm. This one is special. It should not go in a home bin at all.';
    if (item[2] === 'com') return k === 'tra' ? 'Close! Food scraps and yard bits can become soil. Try again.' : 'Hmm. Is it food or something from the yard? Try again.';
    if (item[2] === 'rec') return 'Hmm. Is it clean paper, a box, a can, a jar or a bottle? Try again.';
    return k === 'com' ? 'Not this one. It would attract animals or will not break down in a home pile.' : 'Not this one. The recycling machines cannot use it. Try again.';
  }

  function answer(btn, k, card) {
    if (busy) return;
    if (k !== item[2]) { tries++; GK.bad(); GK.flash(btn, false); f.say(hint(k), 'bad'); return; }
    busy = true; done++; GK.good(btn); GK.flash(btn, true); f.progress(done);
    card.classList.add('gk-rs-gone');
    f.say((tries ? 'Yes, ' : 'Yes! ') + BINS[k].name + '. ' + item[3], 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Super sorter!', text: 'You sorted ten things. Rules change from town to town, so check your own bins at home with a grown-up.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 2300);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'two', label: 'Recycle or trash' }, { key: 'three', label: 'Add compost' }, { key: 'four', label: 'Tricky items' }], onLevel: start });
  start();
})();
