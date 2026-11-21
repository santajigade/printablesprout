(function () {
  var root = document.getElementById('gk'); if (!root || !window.GK) return;
  var ROUNDS = 10;
  // Easy level: groups that are clearly different
  var GROUPS = [
    { k: 'fruits', one: 'fruit', items: [['🍎', 'apple'], ['🍌', 'banana'], ['🍇', 'grapes'], ['🍓', 'strawberry'], ['🍐', 'pear'], ['🍊', 'orange'], ['🍉', 'watermelon'], ['🍒', 'cherries']] },
    { k: 'vehicles', one: 'vehicle', items: [['🚗', 'car'], ['🚌', 'bus'], ['🚲', 'bike'], ['🚂', 'train'], ['🚜', 'tractor'], ['✈️', 'plane'], ['🚒', 'fire truck'], ['🚤', 'boat']] },
    { k: 'farm animals', one: 'farm animal', items: [['🐮', 'cow'], ['🐷', 'pig'], ['🐑', 'sheep'], ['🐴', 'horse'], ['🐔', 'hen'], ['🐐', 'goat']] },
    { k: 'clothes', one: 'piece of clothing', items: [['👕', 'T-shirt'], ['👖', 'jeans'], ['🧦', 'socks'], ['🧢', 'cap'], ['👗', 'dress'], ['🧤', 'gloves'], ['🧣', 'scarf']] },
    { k: 'vegetables', one: 'vegetable', items: [['🥕', 'carrot'], ['🥦', 'broccoli'], ['🌽', 'corn'], ['🥒', 'cucumber'], ['🥔', 'potato'], ['🧅', 'onion']] },
    { k: 'music makers', one: 'music maker', items: [['🥁', 'drum'], ['🎸', 'guitar'], ['🎺', 'trumpet'], ['🎻', 'violin'], ['🎹', 'keyboard']] },
    { k: 'balls for games', one: 'ball', items: [['⚽', 'soccer ball'], ['🏀', 'basketball'], ['🏈', 'football'], ['🎾', 'tennis ball'], ['🏐', 'volleyball']] },
    { k: 'flowers', one: 'flower', items: [['🌷', 'tulip'], ['🌻', 'sunflower'], ['🌹', 'rose'], ['🌼', 'daisy'], ['🌸', 'blossom']] },
    { k: 'school things', one: 'school thing', items: [['✏️', 'pencil'], ['📏', 'ruler'], ['📚', 'books'], ['🖍️', 'crayon'], ['✂️', 'scissors'], ['🎒', 'backpack']] },
  ];
  // Think level: a hidden rule. The odd one breaks the rule, and the game says why.
  var THINK = [
    { set: [['🐟', 'fish'], ['🐙', 'octopus'], ['🐬', 'dolphin']], odd: ['🐄', 'cow'], why: 'The cow lives on land. The fish, octopus and dolphin live in water.' },
    { set: [['🔥', 'fire'], ['☀️', 'sun'], ['☕', 'hot drink']], odd: ['🧊', 'ice'], why: 'Ice is cold. The others are hot.' },
    { set: [['🚗', 'car'], ['🚲', 'bike'], ['🛒', 'cart']], odd: ['🛶', 'canoe'], why: 'The canoe has no wheels. The others roll on wheels.' },
    { set: [['👟', 'sneaker'], ['🧦', 'sock'], ['👢', 'boot']], odd: ['🧢', 'cap'], why: 'A cap goes on your head. The others go on your feet.' },
    { set: [['🍎', 'apple'], ['🍐', 'pear'], ['🍒', 'cherries']], odd: ['🥕', 'carrot'], why: 'A carrot grows under the ground. Apples, pears and cherries grow on trees.' },
    { set: [['🐦', 'bird'], ['🦋', 'butterfly'], ['🐝', 'bee']], odd: ['🐌', 'snail'], why: 'The snail has no wings. The bird, butterfly and bee have wings.' },
    { set: [['🥄', 'spoon'], ['🍴', 'fork and knife'], ['🥢', 'chopsticks']], odd: ['✏️', 'pencil'], why: 'A pencil is for writing. The others help you eat.' },
    { set: [['⚽', 'ball'], ['🍊', 'orange'], ['🌕', 'full moon']], odd: ['📦', 'box'], why: 'The box has corners. The others are round.' },
    { set: [['🍌', 'banana'], ['🌻', 'sunflower'], ['🐤', 'chick']], odd: ['🍎', 'red apple'], why: 'The apple is red. The others are yellow.' },
    { set: [['💡', 'light bulb'], ['📺', 'TV'], ['📱', 'phone']], odd: ['📚', 'books'], why: 'Books need no power. The others need electricity to work.' },
    { set: [['🐜', 'ant'], ['🐝', 'bee'], ['🐞', 'ladybug']], odd: ['🕷️', 'spider'], why: 'A spider has 8 legs, so it is not an insect. Insects have 6 legs.' },
    { set: [['🥛', 'milk'], ['🧃', 'juice'], ['💧', 'water']], odd: ['🍞', 'bread'], why: 'Bread is food you chew. The others are drinks.' },
    { set: [['🐶', 'puppy'], ['🐱', 'kitten'], ['🐹', 'hamster']], odd: ['🦁', 'lion'], why: 'A lion is a wild animal. The others can be pets at home.' },
    { set: [['❄️', 'snowflake'], ['⛄', 'snowman'], ['🧤', 'mittens']], odd: ['🏖️', 'beach'], why: 'The beach is for warm days. The others go with snowy winter.' },
  ];
  var f, done, busy = false, order;

  function easyRound() {
    var g, a, b;
    do { g = GK.shuffle(GROUPS); a = g[0]; b = g[1]; } while ((a.k + b.k).indexOf('fruits') >= 0 && (a.k + b.k).indexOf('vegetables') >= 0);
    var three = GK.shuffle(a.items).slice(0, 3), odd = GK.pick(b.items);
    return { items: three, odd: odd, why: 'Odd one out: ' + odd[1] + ' (' + b.one + '). The others are all ' + a.k + '.' };
  }
  function numRound() {
    var t = GK.rand(1, 5), set = [], odd, why, n;
    function uniq(gen, test) { while (set.length < 3) { n = gen(); if (test(n) && set.indexOf(n) < 0) set.push(n); } }
    if (t === 1) { uniq(function () { return GK.rand(1, 49) * 2; }, function () { return true; }); odd = GK.rand(0, 49) * 2 + 1; why = odd + ' is odd. The others are even: they split into two equal groups.'; }
    else if (t === 2) { uniq(function () { return GK.rand(1, 19) * 5; }, function () { return true; }); do { odd = GK.rand(6, 99); } while (odd % 5 === 0); why = odd + ' is not in the count by 5s. The others end in 0 or 5.'; }
    else if (t === 3) { uniq(function () { return GK.rand(51, 99); }, function () { return true; }); odd = GK.rand(10, 49); why = odd + ' is less than 50. The others are more than 50.'; }
    else if (t === 4) { uniq(function () { return GK.rand(1, 9) * 10; }, function () { return true; }); do { odd = GK.rand(11, 99); } while (odd % 10 === 0); why = odd + ' does not end in 0. The others are tens: 10, 20, 30 and so on.'; }
    else { uniq(function () { return GK.rand(100, 999); }, function () { return true; }); odd = GK.rand(10, 99); why = odd + ' has two digits. The others have three digits.'; }
    return { items: set.map(function (x) { return [String(x), String(x)]; }), odd: [String(odd), String(odd)], why: why, num: true };
  }

  function start() {
    done = 0; f.progress(0); order = GK.shuffle(THINK);
    f.say(f.level === 'think' ? 'Find the one that breaks the secret rule.' : f.level === 'num' ? 'Three numbers share a rule. Which one does not?' : 'Three go together. Tap the one that does not belong.');
    round();
  }

  function round() {
    var r;
    if (f.level === 'easy') r = easyRound();
    else if (f.level === 'think') { var t = order[done % order.length]; r = { items: t.set, odd: t.odd, why: t.why }; }
    else r = numRound();
    var all = GK.shuffle(r.items.concat([r.odd]));
    f.area.innerHTML = '';
    f.area.appendChild(GK.el('p', { class: 'gk-q', text: 'Which one does not belong?' }));
    var grid = GK.el('div', { class: 'gk-oo-grid' });
    all.forEach(function (it) {
      var b = GK.el('button', { type: 'button', class: 'gk-choice gk-oo-btn' + (r.num ? ' gk-oo-num' : ''), 'aria-label': it[1] });
      b.appendChild(GK.el('span', { class: 'gk-oo-pic', 'aria-hidden': 'true', text: it[0] }));
      if (!r.num) b.appendChild(GK.el('span', { class: 'gk-oo-name', text: it[1] }));
      b.addEventListener('click', function () { answer(b, it === r.odd, r, it); });
      grid.appendChild(b);
    });
    f.area.appendChild(grid);
    GK.solve = function () { if (busy) return; var bs = grid.querySelectorAll('button'); bs[all.indexOf(r.odd)].click(); };
  }

  function answer(btn, ok, r, it) {
    if (busy) return;
    GK.flash(btn, ok);
    if (!ok) {
      GK.bad();
      f.say('The ' + it[1] + ' fits with some of the others. Look for what three of them share.', 'bad');
      return;
    }
    busy = true; GK.good(btn); done++; f.progress(done);
    f.say('Yes! ' + r.why, 'good');
    setTimeout(function () {
      busy = false;
      if (done >= ROUNDS) GK.finish(f, { title: 'Sharp eyes!', text: 'You found ten odd ones out and said why. That is real sorting thinking.', sheet: root.dataset.sheet, onReplay: start });
      else round();
    }, 2200);
  }

  f = GK.frame({ root: root, rounds: ROUNDS, levels: [{ key: 'easy', label: 'Easy groups' }, { key: 'think', label: 'Secret rule' }, { key: 'num', label: 'Number rules' }], onLevel: start });
  start();
})();
