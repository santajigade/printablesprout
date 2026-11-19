# Topic queue

The daily run takes topics from this table. Rules:

- **Focus: coloring pages and games.** Of the 3 printables each day, at least 2 should be Coloring Pages or Activities and Games (mazes, dot to dot, color by number, word search, bingo, spot the difference). Charts, routines and For Parents pages are at most 1 a day.
- Pick `todo` rows from the top, but **season first**: a row with an occasion whose date (see `OCCASIONS` in `src/lib/site.ts`) is 3 to 45 days away beats an evergreen row. Skip rows whose occasion has already passed this year and move them to the bottom for next year.
- Run `python3 scripts/dupes.py "<topic>"` before writing. If it says LIKELY DUPLICATE, mark the row `skip` and take the next.
- After publishing, change `todo` to `done YYYY-MM-DD`. When fewer than 30 `todo` rows remain, research and append 30 new ones (real search demand, no protected characters).

| # | Status | Slug | Category | Occasion | Target keyword | Value add |
|---|---|---|---|---|---|---|
| 1 | done 2026-11-16 | thankful-turkey | Holiday Printables | thanksgiving | thankful turkey printable | Name on the sheet, writing or pattern feathers, gratitude round plan |
| 2 | done 2026-11-16 | thanksgiving-kids-table-placemat | Activities and Games | thanksgiving | thanksgiving placemat printable | Four activities in boxes, kids' table setup plan by age |
| 3 | done 2026-11-16 | weekly-chore-chart | Chore and Reward Charts | | weekly chore chart for kids | Editable chores and reward printed on the sheet, starter chores by age |
| 4 | done 2026-11-16 | reward-sticker-chart | Chore and Reward Charts | | reward sticker chart printable | 20 star path, editable goal and prize, pace table |
| 5 | done 2026-11-16 | morning-routine-chart | Daily Routines | | morning routine chart for kids | Picture steps with editable text, Monday to Friday circles |
| 6 | done 2026-11-16 | bedtime-routine-chart | Daily Routines | | bedtime routine chart for kids | AAP Brush, Book, Bed order, every night circles |
| 7 | done 2026-11-16 | christmas-countdown-calendar | Holiday Printables | christmas | christmas countdown printable for kids | One ornament a day, activity idea table for 25 boxes |
| 8 | done 2026-11-16 | christmas-tree-coloring-page | Coloring Pages | christmas | christmas tree coloring page | Twelve fillable ornaments, counting game, group theme game |
| 9 | done 2026-11-16 | snowman-coloring-page | Coloring Pages | winter | snowman coloring page | Six-armed snowflake science moment with NOAA link |
| 10 | done 2026-11-16 | dinosaur-coloring-page | Coloring Pages | | dinosaur coloring page | Sauropod size facts from museums, story prompts |
| 11 | skip | thanksgiving-bingo | Activities and Games | thanksgiving | thanksgiving bingo printable | Four different cards so a family can play together, call list sheet |
| 12 | done 2026-11-16 | pumpkin-pie-coloring-page | Coloring Pages | thanksgiving | pumpkin pie coloring page | Pie slices as separate shapes for fraction talk with kids |
| 13 | done 2026-11-16 | gingerbread-house-coloring-page | Coloring Pages | christmas | gingerbread house coloring page | Many small candy shapes for tap to fill, design your own roof |
| 14 | skip | christmas-ornament-coloring-pages | Coloring Pages | christmas | christmas ornament coloring pages | Six ornaments to color, cut and hang, with hole punch marks |
| 15 | done 2026-11-16 | reindeer-coloring-page | Coloring Pages | christmas | reindeer coloring page | Original friendly reindeer (no named characters), antler counting |
| 16 | skip | christmas-bingo | Activities and Games | christmas | christmas bingo printable | Four cards plus caller sheet, picture squares for pre-readers |
| 17 | done 2026-11-17 | winter-scavenger-hunt | Activities and Games | winter | winter scavenger hunt printable | Indoor and outdoor versions, picture checklist |
| 18 | done 2026-11-18 | hot-cocoa-coloring-page | Coloring Pages | winter | hot cocoa coloring page | Marshmallow shapes to fill, winter vocabulary words |
| 19 | done 2026-11-18 | mitten-matching-game | Activities and Games | winter | mitten matching printable | Pattern matching for preschoolers, cut and play |
| 20 | done 2026-11-18 | snowflake-coloring-pages | Coloring Pages | winter | snowflake coloring pages | Six-sided designs with NOAA facts, draw-your-own template |
| 21 | todo | penguin-coloring-page | Coloring Pages | winter | penguin coloring page | Facts from an official zoo or NOAA source, simple shapes |
| 22 | todo | all-about-me-new-year | Activities and Games | new-year | all about me printable | Time capsule page with height, favorites, drawing box |
| 23 | todo | kindness-challenge-calendar | Activities and Games |  | kindness challenge for kids | 30 days of small kind acts, color one a day |
| 24 | todo | 100th-day-of-school-printable | Activities and Games |  | 100th day of school printable | Count to 100 chart, I can do 100 things page |
| 25 | todo | valentines-coloring-page | Coloring Pages | valentines-day | valentines day coloring page | Hearts and animals, write a kind message |
| 26 | todo | valentines-bingo | Activities and Games | valentines-day | valentines bingo printable | Four cards plus caller sheet for class parties |
| 27 | todo | heart-pattern-coloring-page | Coloring Pages | valentines-day | heart coloring page | Pattern practice, symmetry talk |
| 28 | todo | st-patricks-day-coloring-page | Coloring Pages | st-patricks-day | st patricks day coloring page | Shamrocks and rainbow, original art |
| 29 | todo | rainbow-coloring-page | Coloring Pages |  | rainbow coloring page | Color order lesson using NOAA rainbow facts |
| 30 | todo | spring-scavenger-hunt | Activities and Games |  | spring scavenger hunt printable | Nature checklist with pictures |
| 31 | todo | butterfly-coloring-page | Coloring Pages |  | butterfly coloring page | Symmetry activity, life cycle facts from an official source |
| 32 | todo | easter-egg-coloring-page | Coloring Pages | easter | easter egg coloring page | Six patterned eggs as fillable shapes |
| 33 | todo | bunny-coloring-page | Coloring Pages | easter | bunny coloring page | Original bunny with spring flowers |
| 34 | todo | easter-bingo | Activities and Games | easter | easter bingo printable | Four cards plus caller sheet |
| 35 | todo | earth-day-coloring-page | Coloring Pages | earth-day | earth day coloring page | Planet and recycling icons with EPA tips |
| 36 | todo | recycling-sorting-game | Activities and Games | earth-day | recycling sorting game printable | Cut and sort cards using EPA recycling basics |
| 37 | todo | garden-planting-chart-for-kids | Activities and Games |  | kids garden chart printable | Seed to sprout tracker with drawing boxes |
| 38 | todo | flower-coloring-page | Coloring Pages |  | flower coloring page | Flower parts labels for early science |
| 39 | todo | end-of-school-year-memory-page | Activities and Games |  | end of school year memory book | One page memory sheet with editable grade |
| 40 | todo | ocean-animals-coloring-page | Coloring Pages |  | ocean coloring page | Fish, turtle and whale with NOAA ocean facts |
| 41 | todo | camping-coloring-page | Coloring Pages |  | camping coloring page | Tent and campfire scene with safety tips link |
| 42 | todo | fourth-of-july-coloring-page | Coloring Pages |  | fourth of july coloring page | Fireworks and flag shapes, safety note |
| 43 | todo | road-trip-bingo | Activities and Games |  | road trip bingo printable | Four cards with car window sights |
| 44 | todo | back-to-school-all-about-me | Activities and Games | back-to-school | all about me back to school | Editable grade and name, favorites boxes |
| 45 | todo | apple-coloring-page | Coloring Pages |  | apple coloring page | Apple parts and counting seeds |
| 46 | todo | fall-leaves-coloring-page | Coloring Pages |  | fall leaves coloring page | Leaf shapes by tree type with USDA Forest Service facts |
| 47 | todo | fall-scavenger-hunt | Activities and Games |  | fall scavenger hunt printable | Nature checklist with pictures |
| 48 | todo | halloween-coloring-page | Coloring Pages | halloween | halloween coloring page | Friendly ghosts and cats, not scary |
| 49 | todo | halloween-bingo | Activities and Games | halloween | halloween bingo printable | Four cards plus caller sheet |
| 50 | todo | farm-animals-coloring-page | Coloring Pages |  | farm animals coloring page | Animal sounds matching game |
| 51 | todo | jungle-animals-coloring-page | Coloring Pages |  | jungle animals coloring page | Habitat facts from an official zoo source |
| 52 | todo | robot-coloring-page | Coloring Pages |  | robot coloring page | Design your own robot parts for STEM talk |
| 53 | todo | space-coloring-page | Coloring Pages |  | space coloring page | Planets in order with NASA facts |
| 54 | todo | truck-coloring-page | Coloring Pages |  | truck coloring page | Construction vehicles, what each one does |
| 55 | todo | alphabet-tracing-practice | Activities and Games |  | alphabet tracing printable | Upper and lower case with picture for each letter |
| 56 | todo | number-tracing-1-to-10 | Activities and Games |  | number tracing printable | Count and color objects for each number |
| 57 | todo | shapes-coloring-page | Coloring Pages |  | shapes coloring page | Shape names and sides to count |
| 58 | todo | birthday-coloring-page | Coloring Pages |  | birthday coloring page | Editable name and age on a cake to color |
| 59 | done 2026-11-17 | turkey-color-by-number | Activities and Games | thanksgiving | turkey color by number | Numbered shapes that work with tap to fill online, color key on the sheet |
| 60 | done 2026-11-17 | thanksgiving-word-search | Activities and Games | thanksgiving | thanksgiving word search printable | Big letters, circle words online with the pen, answer key version |
| 61 | skip | christmas-maze | Activities and Games | christmas | christmas maze printable | Easy and hard versions on one page, solve online with the pen |
| 62 | todo | christmas-color-by-number | Activities and Games | christmas | christmas color by number | Numbered shapes for tap to fill, color key on the sheet |
| 63 | todo | christmas-word-search | Activities and Games | christmas | christmas word search printable | Easy and hard grids as versions, answer key version |
| 64 | todo | christmas-dot-to-dot | Activities and Games | christmas | christmas dot to dot printable | Numbered dots 1 to 30, connect online with the pen, then color |
| 65 | todo | winter-spot-the-difference | Activities and Games | winter | spot the difference printable for kids | Two pictures, circle the differences with the pen, answer key version |
| 66 | todo | snowman-dot-to-dot | Activities and Games | winter | snowman dot to dot | Count to 20 and connect, then color the snowman |
| 67 | todo | dinosaur-maze | Activities and Games |  | dinosaur maze printable | Help the dinosaur find its egg, easy and hard versions |
| 68 | todo | animal-dot-to-dot | Activities and Games |  | animal dot to dot printable | Three animals from 1 to 25, color after connecting |
| 69 | todo | animal-color-by-number | Activities and Games |  | color by number for kids | Numbered shapes for tap to fill, simple 6 color key |
| 70 | todo | dots-and-boxes-game | Activities and Games |  | dots and boxes printable | Classic two player game, play online with the pen, rules by age |
| 71 | todo | tic-tac-toe-boards | Activities and Games |  | tic tac toe printable | Nine boards per sheet, scoreboard with editable player names |
| 72 | todo | ocean-maze | Activities and Games |  | ocean maze printable | Help the turtle reach the sea, easy and hard versions |
| 73 | todo | space-dot-to-dot | Activities and Games |  | space dot to dot printable | Rocket and planet dot to dots with NASA facts |
| 74 | todo | gratitude-jar-cards | Holiday Printables | thanksgiving | gratitude jar printable | Editable prompt cards, cut lines, how to run a family gratitude jar |
| 75 | todo | christmas-wish-list-for-kids | Holiday Printables | christmas | christmas wish list printable | Editable name, picture boxes for pre-writers, one gift for someone else line |
| 76 | todo | christmas-thank-you-notes-for-kids | Holiday Printables | christmas | kids thank you notes printable | Fill in the blank notes with editable name, drawing box |
| 77 | todo | new-year-goals-for-kids | Holiday Printables | new-year | new year goals for kids printable | Editable goal boxes, picture prompts, check-in dates |
| 78 | todo | new-years-eve-countdown-bags | Holiday Printables | new-year | new years eve countdown for kids | Hourly activity labels for an early kid countdown |
| 79 | todo | valentines-cards-for-kids | Holiday Printables | valentines-day | printable valentines for kids | Classroom cards with editable To and From, no candy needed |
| 80 | todo | easter-egg-hunt-clues | Holiday Printables | easter | easter egg hunt clues printable | Rhyming clue cards for indoor and outdoor hunts |
| 81 | todo | mothers-day-card-to-color | Holiday Printables | mothers-day | mothers day card printable | Fold-in-half card with editable name and message |
| 82 | todo | all-about-my-mom | Holiday Printables | mothers-day | all about my mom printable | Fill in the blank page with drawing box |
| 83 | todo | fathers-day-card-to-color | Holiday Printables | fathers-day | fathers day card printable | Fold card with editable name and message |
| 84 | todo | all-about-my-dad | Holiday Printables | fathers-day | all about my dad printable | Fill in the blank page with drawing box |
| 85 | todo | first-day-of-school-sign | Holiday Printables | back-to-school | first day of school sign printable | Editable grade, name and year for photos |
| 86 | todo | halloween-pumpkin-carving-stencil | Holiday Printables | halloween | pumpkin stencil printable | Not-scary stencils sized for real pumpkins |
| 87 | todo | potty-training-chart | Chore and Reward Charts |  | potty training chart printable | Picture steps, sticker spaces, link to AAP guidance |
| 88 | todo | screen-time-chart-for-kids | Chore and Reward Charts |  | screen time chart for kids | Earn and track screen time, editable rules, AAP media plan link |
| 89 | todo | homework-routine-chart | Daily Routines |  | homework routine chart | After school steps, editable times, focus tips |
| 90 | todo | after-school-routine-chart | Daily Routines |  | after school routine chart | Snack, unpack, homework, play steps with pictures |
| 91 | todo | toddler-daily-schedule | Daily Routines |  | toddler daily schedule printable | Picture schedule cards for ages 1 to 3, editable times |
| 92 | todo | reading-log-for-kids | Chore and Reward Charts |  | reading log printable for kids | Color a book spine per book, editable reading goal |
| 93 | todo | behavior-chart-for-kids | Chore and Reward Charts |  | behavior chart printable | Positive behavior focus with CDC praise tips |
| 94 | todo | allowance-chart-for-kids | Chore and Reward Charts |  | allowance chart printable | Save, spend, share jars to color, editable amounts |
| 95 | todo | summer-reading-challenge | Chore and Reward Charts |  | summer reading challenge printable | Color a square per day read, prize line |
| 96 | todo | school-morning-checklist | Daily Routines | back-to-school | school morning checklist printable | Tick boxes with pictures, editable times |
| 97 | todo | feelings-chart-for-kids | Daily Routines |  | feelings chart for kids | Faces to color, what helps when I feel this way |
| 98 | todo | winter-break-boredom-buster-list | For Parents | winter | winter break activities for kids | Checklist of screen-free ideas by age, editable |
| 99 | todo | family-meal-planner | For Parents |  | weekly meal planner printable | Editable week grid with grocery list strip |
| 100 | todo | family-cleaning-schedule | For Parents |  | family cleaning schedule printable | Who does what grid with kid friendly icons |
| 101 | todo | babysitter-information-sheet | For Parents |  | babysitter information sheet printable | Editable emergency and routine details |
| 102 | todo | lunchbox-notes | For Parents |  | lunchbox notes printable | Cut out notes with jokes kids can color |
| 103 | todo | summer-bucket-list-for-kids | For Parents |  | summer bucket list printable | Editable checklist, ideas by age |
| 104 | todo | school-supply-checklist | For Parents | back-to-school | school supply checklist printable | Editable list by grade band |
| 105 | todo | trick-or-treat-safety-checklist | For Parents | halloween | trick or treat safety checklist | Checklist built from official safety guidance |
