// Learning games: shared by /games/ and /games/<slug>/.
// No em dash or en dash characters anywhere in this file.

export const GAME_AGES = [
  { key: '3-5', label: 'Ages 3 to 5' },
  { key: '6-8', label: 'Ages 6 to 8' },
  { key: '9-10', label: 'Ages 9 to 10' },
];
export const GAME_SUBJECTS = [
  { key: 'math', label: 'Math' },
  { key: 'english', label: 'English' },
  { key: 'hindi-marathi', label: 'Hindi/Marathi' },
  { key: 'life', label: 'Life Skills' },
  { key: 'brain', label: 'Brain Games' },
];
export const SUBJECT_NAME: Record<string, string> = Object.fromEntries(GAME_SUBJECTS.map((s) => [s.key, s.label]));

export interface Game {
  slug: string; name: string; blurb: string; ageLabel: string; ages: string[]; minAge: number; maxAge: number;
  subjects: string[]; sheet: string; sheetName: string; alt: string;
  title: string; description: string; keywords: string; h1: string; intro: string;
  sections: { h: string; html: string }[];
  faq: { q: string; a: string }[];
  related: string[];
}

export const GAMES: Game[] = [
  {
    slug: 'counting-fun', name: 'Counting Fun', blurb: 'Count apples, stars and ducks, then tap the right number.',
    ageLabel: 'Ages 3 to 5', ages: ['3-5'], minAge: 3, maxAge: 5, subjects: ['math'],
    sheet: '/turkey-color-by-number/', sheetName: 'Turkey color by number',
    alt: 'Three apples numbered 1, 2 and 3 for a counting game',
    title: 'Counting Game for Kids: Count to 20 Online Free',
    description: 'Free counting game for kids aged 3 to 5. Count the pictures and tap the right number, from 1 to 5 up to 20. No sign-up, no ads, works on phones.',
    keywords: 'counting game for kids, math games for kids, count to 20 game, preschool counting game',
    h1: 'Counting Fun: a Free Counting Game for Kids',
    intro: 'Your child sees a group of friendly pictures, counts them, and taps the number that matches. Ten quick rounds, three levels, and nothing to download.',
    sections: [
      { h: 'How to play Counting Fun', html: '<ol><li>Pick a level: up to 5, up to 10 or up to 20.</li><li>Count the pictures in the box. Little ones can touch each picture on the screen as they count out loud.</li><li>Tap the number that matches. A right answer fills one dot at the top.</li><li>Fill all ten dots to finish the round and see the stars.</li></ol>' },
      { h: 'Make counting stick with three small habits', html: '<p><strong>Touch and say.</strong> Ask your child to point at each picture while saying the number. Pointing keeps them from counting the same apple twice.</p><p><strong>Say the last number again.</strong> After counting "one, two, three, four", ask "so how many?" The answer is the last number they said. This small step is the big idea behind counting.</p><p><strong>Move up slowly.</strong> Stay on "up to 5" until the answers come easily, then try 10. The 20 level is a good stretch for older preschoolers.</p>' },
      { h: 'Off screen: count the real thing', html: '<p>After a round, count spoons at dinner, steps on the stairs or socks in the laundry. Then print the <a href="/turkey-color-by-number/">turkey color by number sheet</a>, where each number tells your child which color to use.</p>' },
    ],
    faq: [
      { q: 'What age is this counting game for?', a: 'It is made for ages 3 to 5. The "up to 5" level suits younger preschoolers, and the "up to 20" level suits children getting ready for kindergarten.' },
      { q: 'What happens when my child taps a wrong number?', a: 'The button gives a gentle shake and the game asks them to count again. There is no penalty, and the same question stays until they find the answer.' },
      { q: 'Can my child play without reading?', a: 'Yes. The game uses pictures and numbers only, so a child who knows their numbers can play alone. Non readers may want a parent to read the level names the first time.' },
    ],
    related: ['turkey-color-by-number', 'mitten-matching-game'],
  },
  {
    slug: 'abc-tracing', name: 'ABC Tracing', blurb: 'Trace capital and small letters with a finger or mouse.',
    ageLabel: 'Ages 3 to 5', ages: ['3-5'], minAge: 3, maxAge: 6, subjects: ['english'],
    sheet: '/thanksgiving-word-search/', sheetName: 'Thanksgiving word search',
    alt: 'Letters A, B and C on writing lines with B and C dotted for tracing',
    title: 'ABC Tracing Game: Trace Letters Online Free for Kids',
    description: 'Free ABC tracing game for kids. Trace capital and small letters A to Z with a finger or mouse and earn a star for each letter. No sign-up, no ads.',
    keywords: 'ABC games, alphabet tracing game, letter tracing online, ABC games for kids',
    h1: 'ABC Tracing: Trace Letters A to Z Online',
    intro: 'A big letter appears on writing lines. Your child traces over the gray shape with a finger, stylus or mouse, and the game checks when the letter is covered well enough to earn a star.',
    sections: [
      { h: 'How ABC Tracing works', html: '<ol><li>Choose capital letters or small letters.</li><li>Trace over the light gray letter. Try to start at the top, the way letters are written on paper.</li><li>When enough of the letter is covered, a star pops up and the next letter is ready.</li><li>Use Clear to try again, or Skip to move on. The arrows go back and forward through A to Z.</li></ol>' },
      { h: 'Tips for small hands', html: '<p>A tablet works best for ages 3 and 4, because tracing with a finger is easier than steering a mouse. Hold the tablet flat on a table so it does not wobble.</p><p>Say the letter name and its sound while tracing: "B, buh, ball." Linking the shape, the name and the sound helps the letter stick.</p><p>Keep sessions short. Five letters a day is plenty for a preschooler, and stopping while it is still fun makes them want to come back.</p>' },
      { h: 'Move from screen to paper', html: '<p>Screen tracing builds the shape in memory, but pencil grip needs real paper. After a few letters, hand your child a crayon and the <a href="/thanksgiving-word-search/">Thanksgiving word search</a> for letter hunting, or let them write their name on the <a href="/mitten-matching-game/">mitten matching game</a>.</p>' },
    ],
    faq: [
      { q: 'Does the game teach capital or small letters?', a: 'Both. Use the "ABC" level for capital letters and the "abc" level for small letters. Many children start with capitals because they have more straight lines.' },
      { q: 'Why did my child get a star with a messy trace?', a: 'The game rewards covering most of the letter, not a perfect line. Young children are still building control, and a forgiving check keeps them trying.' },
      { q: 'Can I use it on a classroom smart board?', a: 'Yes. The tracing area works with touch screens, pens and mice, so it runs on smart boards, tablets, phones and laptops.' },
    ],
    related: ['thanksgiving-word-search', 'mitten-matching-game'],
  },
  {
    slug: 'times-table-race', name: 'Times Table Race', blurb: 'Answer times table questions to race your car to the flag.',
    ageLabel: 'Ages 6 to 10', ages: ['6-8', '9-10'], minAge: 7, maxAge: 10, subjects: ['math'],
    sheet: '/category/activities-games/', sheetName: 'Activity sheets',
    alt: 'A multiplication question 3 x 4 above a race car heading to a checkered flag',
    title: 'Times Table Game: Race to the Flag, Free Online for Kids',
    description: 'Free times table game for kids. Pick the 2 to 12 tables, answer fast and race your car to the flag. Beat your own time. No sign-up and no ads.',
    keywords: 'times table games, multiplication game for kids, times tables practice online, math games for kids',
    h1: 'Times Table Race: a Free Multiplication Game',
    intro: 'Each right answer moves the car closer to the finish flag. Ten right answers wins the race, and the clock shows how long it took so your child can try to beat their own time.',
    sections: [
      { h: 'How to race', html: '<ol><li>Choose a set: easy tables (2, 5 and 10), middle tables (3, 4 and 6), hard tables (7, 8, 9, 11 and 12) or all tables mixed.</li><li>Read the question and tap one of the four answers.</li><li>A right answer moves the car forward. A wrong answer keeps it still, and the right answer is shown so your child can learn it.</li><li>Reach the flag in ten right answers and see your time.</li></ol>' },
      { h: 'A practice plan that works', html: '<table><thead><tr><th>Week</th><th>Set to race</th><th>Goal</th></tr></thead><tbody><tr><td>1</td><td>Easy (2, 5, 10)</td><td>Finish without wrong answers</td></tr><tr><td>2</td><td>Middle (3, 4, 6)</td><td>Finish three races a day</td></tr><tr><td>3</td><td>Hard (7, 8, 9, 11, 12)</td><td>Learn one new fact a day</td></tr><tr><td>4</td><td>All tables mixed</td><td>Beat last week\'s best time</td></tr></tbody></table><p>Two or three races a day is enough. Short daily practice tends to beat one long session at the weekend.</p>' },
      { h: 'Turn mistakes into the next lesson', html: '<p>When the game shows a right answer after a miss, ask your child to say the whole fact out loud: "seven times eight is fifty six." Write the hard ones on a sticky note near the table. Then hand over a pencil and an <a href="/category/activities-games/">activity sheet</a> for a screen break.</p>' },
    ],
    faq: [
      { q: 'Which times tables does the game cover?', a: 'The 2 to 12 times tables, grouped into easy, middle and hard sets, plus a mixed level with all of them.' },
      { q: 'Is there a timer that rushes my child?', a: 'The clock only shows how long the race took. There is no time limit, so a child can think as long as they need.' },
      { q: 'What age should kids start times tables?', a: 'Many children meet multiplication around ages 7 and 8, and school plans differ by country. Start with the easy set and move up when your child feels ready.' },
    ],
    related: ['mitten-matching-game', 'thanksgiving-word-search'],
  },
  {
    slug: 'telling-time', name: 'Telling Time', blurb: 'Read the clock and pick the right time.',
    ageLabel: 'Ages 6 to 8', ages: ['6-8'], minAge: 5, maxAge: 8, subjects: ['math', 'life'],
    sheet: '/morning-routine-chart/', sheetName: 'Morning routine chart',
    alt: 'A friendly clock face with hour and minute hands',
    title: 'Telling Time Game for Kids: Read the Clock Online Free',
    description: 'Free telling time game for kids aged 5 to 8. Read the clock and pick the right time, from o\'clock to every 5 minutes. No sign-up, no ads.',
    keywords: 'telling time game, clock game for kids, learn to tell time, math games for kids',
    h1: 'Telling Time: a Free Clock Game for Kids',
    intro: 'A clock shows a time, and your child picks the matching digital time from three choices. Four levels take them from o\'clock all the way to every five minutes.',
    sections: [
      { h: 'How to play Telling Time', html: '<ol><li>Pick a level: o\'clock, half past, quarter past and quarter to, or every 5 minutes.</li><li>Look at the clock. The short hand shows the hour and the long hand shows the minutes.</li><li>Tap the time that matches. Ten right answers finishes the round.</li></ol>' },
      { h: 'Read a clock in two steps', html: '<p><strong>Step one: the short hand.</strong> Find the number it points to, or the number it has just passed. That is the hour.</p><p><strong>Step two: the long hand.</strong> Each number on the clock is worth five minutes. Count by fives from the 12: the 1 is 5 minutes, the 3 is 15 minutes, the 6 is 30 minutes.</p><p>Counting by fives is the key skill for the last level, so practice it out loud on the car ride: 5, 10, 15, 20.</p>' },
      { h: 'Use time in your real day', html: '<p>Kids learn time fastest when it matters to them. Put the clock times on a <a href="/morning-routine-chart/">morning routine chart</a> or a <a href="/bedtime-routine-chart/">bedtime routine chart</a>, then ask "what time does the clock say? Is it time to brush teeth yet?"</p>' },
    ],
    faq: [
      { q: 'What levels does the clock game have?', a: 'Four: o\'clock times, half past, quarter past and quarter to, and any time in 5 minute steps.' },
      { q: 'Does the game show digital or analog clocks?', a: 'The question is an analog clock with hands, and the answers are digital times. Matching the two is exactly the skill children need for school clocks and phones.' },
      { q: 'My child mixes up the hour and minute hands. What helps?', a: 'Point out that the hour hand is short and the minute hand is long, because minutes have more ground to cover. In the game the minute hand is also orange so it stands out.' },
    ],
    related: ['morning-routine-chart', 'bedtime-routine-chart'],
  },
  {
    slug: 'money-match', name: 'Money Match', blurb: 'Tap coins and notes to pay the exact price, in rupees or dollars.',
    ageLabel: 'Ages 6 to 8', ages: ['6-8'], minAge: 5, maxAge: 9, subjects: ['math', 'life'],
    sheet: '/reward-sticker-chart/', sheetName: 'Reward sticker chart',
    alt: 'A gold 5 rupee coin and a silver 10 cent coin with a dotted line between them',
    title: 'Money Game for Kids: Pay the Price in Rupees or Dollars',
    description: 'Free money game for kids. Tap coins and notes to pay the exact price in rupees or US dollars. Learn to count money with no sign-up and no ads.',
    keywords: 'money game for kids, counting money game, coin game rupees, learn coins for kids',
    h1: 'Money Match: a Free Counting Money Game',
    intro: 'A toy shop item shows a price. Your child taps coins and notes into the purse until the total matches the price exactly, then taps Pay. Play in Indian rupees or US dollars.',
    sections: [
      { h: 'How to play Money Match', html: '<ol><li>Choose rupees or dollars, then a small or big price level.</li><li>Look at the price tag on the item.</li><li>Tap coins and notes to add them to the purse. The purse shows the total so far.</li><li>Tapped too much? Use Undo. When the total matches the price, tap Pay.</li></ol>' },
      { h: 'The coins and notes in the game', html: '<table><thead><tr><th>Rupees</th><th>Dollars</th></tr></thead><tbody><tr><td>1, 2, 5 and 10 rupee coins</td><td>1 cent, 5 cents, 10 cents and 25 cents</td></tr><tr><td>10, 20 and 50 rupee notes on the big level</td><td>1 dollar and 5 dollar bills on the big level</td></tr></tbody></table><p>The coins are simple drawings, not photos of real money, so children learn the values first. Show them the real coins from your wallet afterwards and match them up.</p>' },
      { h: 'Start with the biggest coin that fits', html: '<p>Teach one trick: use the biggest coin or note that is not more than what is left to pay. For 17 rupees, that is a 10, then a 5, then a 2. This is how shopkeepers make change, and it keeps the number of coins small.</p><p>Back home, set up a pretend shop with price tags on toys, or let your child earn stickers on a <a href="/reward-sticker-chart/">reward sticker chart</a> and "spend" them on small treats.</p>' },
    ],
    faq: [
      { q: 'Can my child play with Indian rupees?', a: 'Yes. Choose rupees for 1, 2, 5 and 10 rupee coins, plus notes on the big level. Choose dollars to play with US coins and bills.' },
      { q: 'Does the game use real money or ask for payment?', a: 'No. It is pretend money only. There are no purchases, no payment screens and nothing to buy inside the game.' },
      { q: 'What if my child adds too much?', a: 'The purse shows the total, and the game says when it is over the price. Tap Undo to take back the last coin, or Clear to start again.' },
    ],
    related: ['reward-sticker-chart', 'weekly-chore-chart'],
  },
  {
    slug: 'memory-match', name: 'Memory Match', blurb: 'Flip the cards and find the pairs. Short, calm rounds.',
    ageLabel: 'Ages 3 to 8', ages: ['3-5', '6-8'], minAge: 3, maxAge: 8, subjects: ['brain'],
    sheet: '/mitten-matching-game/', sheetName: 'Mitten matching game',
    alt: 'Six memory cards with two flipped over showing matching stars',
    title: 'Memory Match Game for Kids: Find the Pairs Free Online',
    description: 'Free memory match game for kids aged 3 to 8. Flip two cards at a time and find the pairs, with 6, 12 or 16 cards. No sign-up, no ads, works on tablets.',
    keywords: 'memory match game for kids, memory game online, brain games for kids, matching game',
    h1: 'Memory Match: Find the Pairs',
    intro: 'Cards lie face down. Your child flips two at a time. A matching pair stays face up, and a mismatch turns back over. Remember where each picture was and clear the board.',
    sections: [
      { h: 'How to play Memory Match', html: '<ol><li>Pick a board: 6 cards for little ones, 12 for most kids, 16 for a challenge.</li><li>Tap a card to flip it, then tap a second card.</li><li>If the pictures match, both stay face up. If not, they flip back after a moment.</li><li>Find every pair to finish. The game counts your turns, so you can try to use fewer next time.</li></ol>' },
      { h: 'Play it together as a family game', html: '<p>Memory works well as a turn taking game. Pass the tablet: each player flips two cards, and a match earns a point and another go. It is a gentle way to practice waiting for a turn and losing nicely.</p><p>Talk while you play: "I saw the moon in the top corner." Naming what you see and where it was is a strategy children can copy.</p><p>For a younger child, keep the board small and let them win often. Clearing 6 cards in a few turns feels great, and that good feeling is what brings them back for 12. Older kids can race their own turn count: write it down, then try to beat it tomorrow.</p>' },
      { h: 'Matching on paper', html: '<p>For a screen free version, print the <a href="/mitten-matching-game/">mitten matching game</a> and let your child draw lines between the pairs, then color each pair the same. The <a href="/winter-scavenger-hunt/">winter scavenger hunt</a> is another good one for sharp eyes.</p>' },
    ],
    faq: [
      { q: 'How many cards are there?', a: 'You can choose 6, 12 or 16 cards. Start with 6 for ages 3 and 4, and move up when your child clears the board easily.' },
      { q: 'Is there a time limit?', a: 'No. The game only counts turns, so children can play at their own pace.' },
      { q: 'Can two children play together?', a: 'Yes. Take turns flipping two cards each on the same device, and keep score on paper.' },
    ],
    related: ['mitten-matching-game', 'winter-scavenger-hunt'],
  },
];

export const gameBySlug = (s: string) => GAMES.find((g) => g.slug === s);
