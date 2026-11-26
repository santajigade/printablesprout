# Story queue

The daily story run takes 3 rows a day. Rules:

- **Mix every day:** no two stories with the same theme on one day, and at least 1 original story (with the name swap). Holiday rows go first when the holiday is 3 to 30 days away.
- **Classics** (`classic: <source>`) are retold in our own words from public domain tales only (published before 1929, or traditional folk tales). Never use film versions, their songs, character designs or added characters. Set `type: "classic"` and `retoldFrom`.
- Run `python3 scripts/dupes.py "<title>"` and check `src/content/stories/` before writing. After publishing change `todo` to `done YYYY-MM-DD`. When fewer than 30 rows are `todo`, add 30 new rows across all themes.

| # | Status | Slug | Theme | Type | Level | Idea and value add |
|---|---|---|---|---|---|---|
| 0 | done 2026-11-24 | maya-thankful-leaf-garland | Holiday Stories | original | Early reader | Thankful garland, Thanksgiving |
| 1 | done 2026-11-25 | the-tortoise-and-the-hare | Classic Tales | classic: Aesop's Fables | Early reader | Slow and steady wins; talk about not giving up |
| 2 | done 2026-11-26 | the-lion-and-the-mouse | Classic Tales | classic: Aesop's Fables | Read aloud | Small friends can help in big ways |
| 3 | todo | the-ant-and-the-grasshopper | Classic Tales | classic: Aesop's Fables | Early reader | Planning ahead and hard work |
| 4 | todo | the-boy-who-cried-wolf | Classic Tales | classic: Aesop's Fables | Early reader | Why telling the truth matters |
| 5 | todo | the-crow-and-the-pitcher | Classic Tales | classic: Aesop's Fables | Read aloud | Thinking smart to solve a problem, with a water and pebbles try-it activity |
| 6 | todo | the-town-mouse-and-the-country-mouse | Classic Tales | classic: Aesop's Fables | Early reader | Being happy with what you have |
| 7 | todo | the-north-wind-and-the-sun | Classic Tales | classic: Aesop's Fables | Early reader | Kindness works better than force |
| 8 | todo | the-fox-and-the-grapes | Classic Tales | classic: Aesop's Fables | Read aloud | Being honest about disappointment |
| 9 | todo | the-monkey-and-the-crocodile | Classic Tales | classic: Panchatantra | Early reader | Quick thinking and true friendship |
| 10 | todo | the-clever-rabbit-and-the-lion | Classic Tales | classic: Panchatantra | Early reader | Brains over strength |
| 11 | todo | the-talkative-tortoise | Classic Tales | classic: Panchatantra | Early reader | Knowing when to stay quiet |
| 12 | todo | the-blue-jackal | Classic Tales | classic: Panchatantra | Confident reader | Being yourself |
| 13 | todo | the-monkey-king-bridge | Classic Tales | classic: Jataka Tales | Confident reader | A leader who cares for others |
| 14 | todo | the-elves-and-the-shoemaker | Classic Tales | classic: Brothers Grimm | Early reader | Gratitude and giving back |
| 15 | todo | the-ugly-duckling | Classic Tales | classic: Hans Christian Andersen | Early reader | Everyone grows in their own time |
| 16 | todo | the-emperors-new-clothes | Classic Tales | classic: Hans Christian Andersen | Confident reader | Speaking up honestly |
| 17 | todo | birbal-and-the-crows | Classic Tales | classic: Akbar and Birbal folk tales | Confident reader | Clever answers and good humor |
| 18 | todo | tenali-rama-and-the-thieves | Classic Tales | classic: Tenali Rama folk tales | Confident reader | Smart thinking to stay safe |
| 19 | done 2026-11-25 | mowgli-joins-the-wolf-pack | Jungle Tales | classic: Rudyard Kipling, The Jungle Book (1894) | Confident reader | Belonging and family, told gently; our own character designs only |
| 20 | done 2026-11-26 | mowgli-learns-the-jungle-law | Jungle Tales | classic: Rudyard Kipling, The Jungle Book (1894) | Confident reader | Listening to teachers and following good rules |
| 21 | todo | toomai-of-the-elephants | Jungle Tales | classic: Rudyard Kipling, The Jungle Book (1894) | Confident reader | Courage and caring for animals |
| 22 | todo | how-the-elephant-got-its-trunk | Jungle Tales | classic: Rudyard Kipling, Just So Stories (1902) | Early reader | Curiosity and asking questions |
| 23 | todo | how-the-camel-got-its-hump | Jungle Tales | classic: Rudyard Kipling, Just So Stories (1902) | Early reader | Why everyone should help with the work |
| 24 | todo | how-the-leopard-got-its-spots | Jungle Tales | classic: Rudyard Kipling, Just So Stories (1902) | Confident reader | Animal camouflage, with facts from a zoo source |
| 25 | todo | leo-and-the-sparkly-teeth | Good Habits | original | Read aloud | Brushing twice a day, AAP tooth care facts |
| 26 | todo | mia-and-the-messy-room | Good Habits | original | Early reader | Tidying up in small steps, with a cleanup game |
| 27 | todo | sam-goes-to-bed-on-time | Good Habits | original | Read aloud | Bedtime routine, links to bedtime chart |
| 28 | todo | rainbow-plate-day | Good Habits | original | Early reader | Trying colorful fruits and vegetables, MyPlate facts |
| 29 | todo | the-piggy-bank-plan | Good Habits | original | Confident reader | Saving money for a goal |
| 30 | todo | the-screen-time-timer | Good Habits | original | Early reader | Balancing screens and play |
| 31 | todo | washing-hands-superhero | Good Habits | original | Read aloud | Handwashing steps from the CDC |
| 32 | todo | helping-dad-in-the-kitchen | Family and Respect | original | Early reader | Helping parents and saying thank you |
| 33 | todo | grandpas-garden-secret | Family and Respect | original | Early reader | Respecting elders and learning from them |
| 34 | todo | listening-to-mom | Family and Respect | original | Read aloud | Why we listen to parents, gently told |
| 35 | todo | the-family-chore-team | Family and Respect | original | Early reader | Everyone helps at home, links to chore chart |
| 36 | todo | a-letter-for-grandma | Family and Respect | original | Confident reader | Showing love to grandparents |
| 37 | todo | the-new-baby-sister | Family and Respect | original | Early reader | Big sibling feelings and helping |
| 38 | todo | the-magic-words | Good Communication | original | Read aloud | Please, thank you and sorry |
| 39 | todo | the-big-sorry | Good Communication | original | Early reader | How to say sorry and fix it |
| 40 | todo | the-listening-ears | Good Communication | original | Read aloud | Taking turns to talk and listen |
| 41 | todo | the-truth-about-the-broken-vase | Good Communication | original | Early reader | Telling the truth even when it is hard |
| 42 | todo | using-words-not-shouts | Good Communication | original | Early reader | Naming feelings and calming down |
| 43 | todo | asking-for-help-is-brave | Good Communication | original | Early reader | When and how to ask a grown up for help |
| 44 | todo | the-new-kid-at-school | Kindness and Friends | original | Early reader | Making a new friend feel welcome |
| 45 | todo | sharing-the-red-bike | Kindness and Friends | original | Read aloud | Sharing and taking turns |
| 46 | todo | the-kindness-jar | Kindness and Friends | original | Early reader | Small kind acts add up, with a kindness jar activity |
| 47 | todo | the-lonely-bench | Kindness and Friends | original | Confident reader | Including others at recess |
| 48 | todo | the-raindrop-who-traveled | Learning and Science | original | Early reader | The water cycle, NOAA facts |
| 49 | todo | the-little-seed | Learning and Science | original | Read aloud | How seeds grow, with a bean in a jar activity |
| 50 | todo | the-trip-to-the-planets | Learning and Science | original | Confident reader | The planets in order, NASA facts |
| 51 | todo | the-four-seasons-tree | Learning and Science | original | Read aloud | Seasons through one tree's year |
| 52 | todo | the-recycling-robot | Learning and Science | original | Early reader | Sorting recycling, EPA facts |
| 53 | todo | the-busy-bees | Learning and Science | original | Early reader | How bees help flowers, USDA facts |
| 54 | todo | counting-stars-at-the-campout | Learning and Science | original | Read aloud | Counting to 10 and night sky facts |
| 55 | todo | the-snowflake-who-was-different | Holiday Stories | original | Read aloud | Every snowflake is unique, NOAA facts |
| 56 | done 2026-11-25 | the-christmas-cookie-mix-up | Holiday Stories | original | Early reader | Sharing and giving at Christmas |
| 57 | done 2026-11-26 | the-reindeer-who-was-late | Holiday Stories | original | Early reader | Patience and teamwork (our own reindeer, no famous ones) |
| 58 | todo | the-new-years-promise | Holiday Stories | original | Early reader | Setting a small goal for the new year |
| 59 | todo | the-valentines-surprise | Holiday Stories | original | Read aloud | Showing kindness to classmates |
| 60 | todo | the-hundredth-day-party | Holiday Stories | original | Early reader | Counting to 100 at school |
