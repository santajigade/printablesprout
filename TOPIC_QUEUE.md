# Topic queue

The daily run takes topics from this table. Rules:

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
| 11 | todo | thanksgiving-bingo | Activities and Games | thanksgiving | thanksgiving bingo printable | Four different cards so a family can play together, call list sheet |
| 12 | todo | pumpkin-pie-coloring-page | Coloring Pages | thanksgiving | pumpkin pie coloring page | Pie slices as separate shapes for fraction talk with kids |
| 13 | todo | gratitude-jar-cards | Holiday Printables | thanksgiving | gratitude jar printable | Editable prompt cards, cut lines, how to run a family gratitude jar |
| 14 | todo | christmas-wish-list-for-kids | Holiday Printables | christmas | christmas wish list printable | Editable name, picture boxes for pre-writers, one gift for someone else line |
| 15 | todo | gingerbread-house-coloring-page | Coloring Pages | christmas | gingerbread house coloring page | Many small candy shapes for tap to fill, design your own roof |
| 16 | todo | christmas-ornament-coloring-pages | Coloring Pages | christmas | christmas ornament coloring pages | Six ornaments to color, cut and hang, with hole punch marks |
| 17 | todo | reindeer-coloring-page | Coloring Pages | christmas | reindeer coloring page | Original friendly reindeer (no named characters), antler counting |
| 18 | todo | christmas-bingo | Activities and Games | christmas | christmas bingo printable | Four cards plus caller sheet, picture squares for pre-readers |
| 19 | todo | christmas-thank-you-notes-for-kids | Holiday Printables | christmas | kids thank you notes printable | Fill in the blank notes with editable name, drawing box |
| 20 | todo | winter-scavenger-hunt | Activities and Games | winter | winter scavenger hunt printable | Indoor and outdoor versions, picture checklist |
| 21 | todo | hot-cocoa-coloring-page | Coloring Pages | winter | hot cocoa coloring page | Marshmallow shapes to fill, winter vocabulary words |
| 22 | todo | mitten-matching-game | Activities and Games | winter | mitten matching printable | Pattern matching for preschoolers, cut and play |
| 23 | todo | winter-break-boredom-buster-list | For Parents | winter | winter break activities for kids | Checklist of screen-free ideas by age, editable |
| 24 | todo | snowflake-coloring-pages | Coloring Pages | winter | snowflake coloring pages | Six-sided designs with NOAA facts, draw-your-own template |
| 25 | todo | penguin-coloring-page | Coloring Pages | winter | penguin coloring page | Facts from an official zoo or NOAA source, simple shapes |
| 26 | todo | new-year-goals-for-kids | Holiday Printables | new-year | new year goals for kids printable | Editable goal boxes, picture prompts, check-in dates |
| 27 | todo | new-years-eve-countdown-bags | Holiday Printables | new-year | new years eve countdown for kids | Hourly activity labels for an early kid countdown |
| 28 | todo | all-about-me-new-year | Activities and Games | new-year | all about me printable | Time capsule page with height, favorites, drawing box |
| 29 | todo | kindness-challenge-calendar | Activities and Games | | kindness challenge for kids | 30 days of small kind acts, color one a day |
| 30 | todo | 100th-day-of-school-printable | Activities and Games | | 100th day of school printable | Count to 100 chart, I can do 100 things page |
| 31 | todo | valentines-cards-for-kids | Holiday Printables | valentines-day | printable valentines for kids | Classroom cards with editable To and From, no candy needed |
| 32 | todo | valentines-coloring-page | Coloring Pages | valentines-day | valentines day coloring page | Hearts and animals, write a kind message |
| 33 | todo | valentines-bingo | Activities and Games | valentines-day | valentines bingo printable | Four cards plus caller sheet for class parties |
| 34 | todo | heart-pattern-coloring-page | Coloring Pages | valentines-day | heart coloring page | Pattern practice, symmetry talk |
| 35 | todo | potty-training-chart | Chore and Reward Charts | | potty training chart printable | Picture steps, sticker spaces, link to AAP guidance |
| 36 | todo | screen-time-chart-for-kids | Chore and Reward Charts | | screen time chart for kids | Earn and track screen time, editable rules, AAP media plan link |
| 37 | todo | homework-routine-chart | Daily Routines | | homework routine chart | After school steps, editable times, focus tips |
| 38 | todo | after-school-routine-chart | Daily Routines | | after school routine chart | Snack, unpack, homework, play steps with pictures |
| 39 | todo | toddler-daily-schedule | Daily Routines | | toddler daily schedule printable | Picture schedule cards for ages 1 to 3, editable times |
| 40 | todo | reading-log-for-kids | Chore and Reward Charts | | reading log printable for kids | Color a book spine per book, editable reading goal |
| 41 | todo | behavior-chart-for-kids | Chore and Reward Charts | | behavior chart printable | Positive behavior focus with CDC praise tips |
| 42 | todo | allowance-chart-for-kids | Chore and Reward Charts | | allowance chart printable | Save, spend, share jars to color, editable amounts |
| 43 | todo | family-meal-planner | For Parents | | weekly meal planner printable | Editable week grid with grocery list strip |
| 44 | todo | family-cleaning-schedule | For Parents | | family cleaning schedule printable | Who does what grid with kid friendly icons |
| 45 | todo | babysitter-information-sheet | For Parents | | babysitter information sheet printable | Editable emergency and routine details |
| 46 | todo | lunchbox-notes | For Parents | | lunchbox notes printable | Cut out notes with jokes kids can color |
| 47 | todo | st-patricks-day-coloring-page | Coloring Pages | st-patricks-day | st patricks day coloring page | Shamrocks and rainbow, original art |
| 48 | todo | rainbow-coloring-page | Coloring Pages | | rainbow coloring page | Color order lesson using NOAA rainbow facts |
| 49 | todo | spring-scavenger-hunt | Activities and Games | | spring scavenger hunt printable | Nature checklist with pictures |
| 50 | todo | butterfly-coloring-page | Coloring Pages | | butterfly coloring page | Symmetry activity, life cycle facts from an official source |
| 51 | todo | easter-egg-coloring-page | Coloring Pages | easter | easter egg coloring page | Six patterned eggs as fillable shapes |
| 52 | todo | easter-egg-hunt-clues | Holiday Printables | easter | easter egg hunt clues printable | Rhyming clue cards for indoor and outdoor hunts |
| 53 | todo | bunny-coloring-page | Coloring Pages | easter | bunny coloring page | Original bunny with spring flowers |
| 54 | todo | easter-bingo | Activities and Games | easter | easter bingo printable | Four cards plus caller sheet |
| 55 | todo | earth-day-coloring-page | Coloring Pages | earth-day | earth day coloring page | Planet and recycling icons with EPA tips |
| 56 | todo | recycling-sorting-game | Activities and Games | earth-day | recycling sorting game printable | Cut and sort cards using EPA recycling basics |
| 57 | todo | garden-planting-chart-for-kids | Activities and Games | | kids garden chart printable | Seed to sprout tracker with drawing boxes |
| 58 | todo | mothers-day-card-to-color | Holiday Printables | mothers-day | mothers day card printable | Fold-in-half card with editable name and message |
| 59 | todo | all-about-my-mom | Holiday Printables | mothers-day | all about my mom printable | Fill in the blank page with drawing box |
| 60 | todo | flower-coloring-page | Coloring Pages | | flower coloring page | Flower parts labels for early science |
| 61 | todo | end-of-school-year-memory-page | Activities and Games | | end of school year memory book | One page memory sheet with editable grade |
| 62 | todo | summer-bucket-list-for-kids | For Parents | | summer bucket list printable | Editable checklist, ideas by age |
| 63 | todo | summer-reading-challenge | Chore and Reward Charts | | summer reading challenge printable | Color a square per day read, prize line |
| 64 | todo | fathers-day-card-to-color | Holiday Printables | fathers-day | fathers day card printable | Fold card with editable name and message |
| 65 | todo | all-about-my-dad | Holiday Printables | fathers-day | all about my dad printable | Fill in the blank page with drawing box |
| 66 | todo | ocean-animals-coloring-page | Coloring Pages | | ocean coloring page | Fish, turtle and whale with NOAA ocean facts |
| 67 | todo | camping-coloring-page | Coloring Pages | | camping coloring page | Tent and campfire scene with safety tips link |
| 68 | todo | fourth-of-july-coloring-page | Coloring Pages | | fourth of july coloring page | Fireworks and flag shapes, safety note |
| 69 | todo | road-trip-bingo | Activities and Games | | road trip bingo printable | Four cards with car window sights |
| 70 | todo | back-to-school-all-about-me | Activities and Games | back-to-school | all about me back to school | Editable grade and name, favorites boxes |
| 71 | todo | first-day-of-school-sign | Holiday Printables | back-to-school | first day of school sign printable | Editable grade, name and year for photos |
| 72 | todo | school-morning-checklist | Daily Routines | back-to-school | school morning checklist printable | Tick boxes with pictures, editable times |
| 73 | todo | school-supply-checklist | For Parents | back-to-school | school supply checklist printable | Editable list by grade band |
| 74 | todo | apple-coloring-page | Coloring Pages | | apple coloring page | Apple parts and counting seeds |
| 75 | todo | fall-leaves-coloring-page | Coloring Pages | | fall leaves coloring page | Leaf shapes by tree type with USDA Forest Service facts |
| 76 | todo | fall-scavenger-hunt | Activities and Games | | fall scavenger hunt printable | Nature checklist with pictures |
| 77 | todo | halloween-pumpkin-carving-stencil | Holiday Printables | halloween | pumpkin stencil printable | Not-scary stencils sized for real pumpkins |
| 78 | todo | halloween-coloring-page | Coloring Pages | halloween | halloween coloring page | Friendly ghosts and cats, not scary |
| 79 | todo | halloween-bingo | Activities and Games | halloween | halloween bingo printable | Four cards plus caller sheet |
| 80 | todo | trick-or-treat-safety-checklist | For Parents | halloween | trick or treat safety checklist | Checklist built from official safety guidance |
| 81 | todo | farm-animals-coloring-page | Coloring Pages | | farm animals coloring page | Animal sounds matching game |
| 82 | todo | jungle-animals-coloring-page | Coloring Pages | | jungle animals coloring page | Habitat facts from an official zoo source |
| 83 | todo | robot-coloring-page | Coloring Pages | | robot coloring page | Design your own robot parts for STEM talk |
| 84 | todo | space-coloring-page | Coloring Pages | | space coloring page | Planets in order with NASA facts |
| 85 | todo | truck-coloring-page | Coloring Pages | | truck coloring page | Construction vehicles, what each one does |
| 86 | todo | alphabet-tracing-practice | Activities and Games | | alphabet tracing printable | Upper and lower case with picture for each letter |
| 87 | todo | number-tracing-1-to-10 | Activities and Games | | number tracing printable | Count and color objects for each number |
| 88 | todo | shapes-coloring-page | Coloring Pages | | shapes coloring page | Shape names and sides to count |
| 89 | todo | feelings-chart-for-kids | Daily Routines | | feelings chart for kids | Faces to color, what helps when I feel this way |
| 90 | todo | birthday-coloring-page | Coloring Pages | | birthday coloring page | Editable name and age on a cake to color |
