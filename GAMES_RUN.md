# Daily games run (scheduled once a day, 8 AM IST)

Add **4 new learning games** to printablesprout.com/games/, never more (Santaji raised it from 2 to 4 on 2026-11-20). **At least 1 of the 4 must be a big, harder game for ages 9 to 10**: 3 or more levels, real multi step thinking, and enough play for 10 minutes or more (for example a canvas game or a multi step puzzle). Fewer is fine: skip a game rather than publish a weak or broken one. Read `CLAUDE.md` first; its style rules (simple American English, no AI cliches, no generic headings, **no em dash or en dash characters anywhere**, original art only, no brands or famous characters) apply to every game.

The games are child directed. Never break these rules:
- No tracking, analytics, ads, cookies, `localStorage`, `fetch`, network calls or `window.open` in a game.
- No external links on game pages or inside games. Internal links only.
- No chat, no sign-up, no text input that collects a child's name or details.
- No scary content, weapons, brands, characters or real people.

## 1. Set up
If the repo is not in the session, attach `santajigade/printablesprout` with push access (add_repo), then:
```
git clone --depth 1 https://github.com/santajigade/printablesprout && cd printablesprout
npm ci
pip install playwright --break-system-packages   # only if `python3 -c "import playwright"` fails
```
The play test needs Chrome or Chromium (`/usr/bin/google-chrome` is used when present; otherwise run `python3 -m playwright install chromium`).

## 2. Learn how the games work (every run)
Read these before writing anything:
- `src/lib/games.ts`: the data and page text for every game (one object per game).
- `src/pages/games/[slug].astro`: the game page template (you do not edit it).
- `public/js/games/kit.js`: the shared kit. Use it: `GK.frame` (levels bar, sound toggle, progress dots, message line), `GK.say` through the frame, `GK.sfx.*` sounds (tap, pop, good, bad, win, flip, match, coin, note, vroom, scratch, count), `GK.good(btn)`, `GK.bad()`, `GK.flash(btn, ok)`, `GK.burst`, `GK.confetti`, `GK.finish(f, {...})` for the win screen.
- Two existing games, for example `public/js/games/counting-fun.js` and `public/js/games/money-match.js`.
- `src/styles/games.css`.

Do not change existing games, `kit.js` behavior, the page template, the /games/ index page or the site layout. You may ADD a new helper or sound to `kit.js` only if two or more games need it; if you do, run the play test on every game (step 7).

## 3. Pick today's 4 games
1. From `GAME_QUEUE.md`, take the first 4 `todo` rows, covering at least 3 different subjects. If none of them is for ages 9 to 10, replace the last one with the first `todo` row whose ages include 9-10.
2. Read the live games list in `src/lib/games.ts`. If a row would be the same kind of play as a live game (same mechanic and same skill), mark it `skip (too close to <slug>)` and take the next row.
3. Write a one line value add for each game: what a child practices here that the other games on the site do not give them. If you cannot name one, skip it.

## 4. Research (only when the game states facts)
Games with real world facts (coins, road signs, recycling rules, Hindi or Marathi letters and words, calendar facts) need at least 2 reliable sources read in this run (official sites first: .gov, .gov.in, ncert.nic.in, epa.gov, nhtsa.gov, rbi.org.in, usmint.gov, major dictionaries and education bodies). Every letter, word, spelling and rule in the game must match those sources. If you cannot verify it, leave it out. Hindi and Marathi: use correct Devanagari Unicode, check every word twice, and show an English helper line for parents.

## 5. Build each game
1. **Script** `public/js/games/<slug>.js`, plain JavaScript in one IIFE, no libraries, under 40 KB:
   - Start with `var root = document.getElementById('gk'); if (!root || !window.GK) return;` and build with `GK.frame({ root, rounds, levels, onLevel })`.
   - 2 to 4 levels from easy to hard, 8 to 12 rounds per level (or a natural end like clearing a board), a win screen with `GK.finish(f, { title, text, sheet: root.dataset.sheet, onReplay })`.
   - Big tap targets (buttons at least 44 px, main answers 60 px or more), real `<button>` elements so it works with keyboard, gentle wrong answer feedback (never harsh, never lose progress), a short spoken style message with `f.say` after every action, sounds only through `GK.sfx`.
   - Works with touch, mouse and keyboard at 390 px and 1366 px wide. Canvas games must scale to the container width and use pointer events.
   - **Test hook (required):** set `GK.solve = function () { ... }` that makes one correct move (or finishes the current round). The play test calls it again and again until the win screen appears, on every level.
   - Art: emoji or simple inline SVG drawn for this game. No images from the web.
2. **Styles**: append a block to `src/styles/games.css` starting with the comment `/* <Game name> */`. Use class names starting with `gk-<short-name>-` so they never clash.
3. **Thumbnail** `public/images/games/<slug>.svg`: 400 x 300 viewBox, bright flat style like the existing thumbnails, plain SVG only (no scripts, images, links or web fonts), about 1 KB to 2 KB, no text other than numbers or letters the game uses.
4. **Data and page text**: append an object to the END of the `GAMES` array in `src/lib/games.ts` with every field the other games have:
   - `title` 40 to 60 characters, main keyword first (the site adds " | PrintableSprout"); `description` 120 to 155 characters, says it is free and who it is for; `keywords`; `h1` (different from the title); `intro` (2 sentences on what the child does).
   - `sections`: at least 3, with specific headings (never "Overview", "Conclusion" and the like), 380 or more words of real help in total: how to play as steps, a parent or teacher tip section that is different in shape from the other games (a table, a weekly plan, a family version, a classroom version), and an off screen section that links to the matching worksheet and one more related printable. Vary the structure from the existing games.
   - `faq`: 3 real questions with useful answers.
   - `sheet`, `sheetName`, `related` (2 existing printable slugs), `alt` text for the thumbnail, `ages`, `ageLabel`, `minAge`, `maxAge`, `subjects`.
   - Links in `html` only to existing printables (`/slug/`), `/category/...` or other `/games/...` pages. No external links.

## 6. Check
```
python3 scripts/check.py
python3 scripts/check_games.py
npm run build
python3 scripts/playtest_games.py <slug1> <slug2>
```
Every one must pass with zero errors. `playtest_games.py` plays each new game to the win screen on every level at desktop and on the first level at 390 px mobile, fails on any JavaScript error, cookie or sideways scrolling, and saves screenshots in `/tmp/playtest/`.

Then OPEN and LOOK at `/tmp/playtest/<slug>-1366-play.png`, `<slug>-390-play.png` and `<slug>-1366-end.png` for each game. Fix anything that overlaps, is cut off, is too small to tap or looks broken, rebuild and run the play test again. If a game still fails after real effort, delete all its files and its `games.ts` entry, mark the row `skip (<reason>)`, and publish the others.

## 7. Publish
1. Mark the published rows in `GAME_QUEUE.md` as `done YYYY-MM-DD`.
2. If fewer than 30 `todo` rows remain, append 20 new ideas (at least 6 of them big games for ages 9 to 10) that are different kinds of play from everything in the queue, covering all 5 subjects and all 3 age groups.
3. Commit and push (other daily runs also push to main, so rebase first):
```
git add -A && git commit -m "games: <Game One>, <Game Two>, <Game Three>, <Game Four>"
git pull --rebase origin main && git push origin HEAD:main
```
4. Wait for the "Build and deploy to Hostinger" GitHub Action to finish (`gh run list -R santajigade/printablesprout -L 1`, or poll `https://api.github.com/repos/santajigade/printablesprout/actions/runs?per_page=1`) and confirm `conclusion` is `success`. Do not fetch the live pages with WebFetch or any tool that asks the owner for permission: this run is unattended and must never stop on an approval prompt.

## 8. Report (one short message)
- The game names (up to 4) and live URLs (https://printablesprout.com/games/<slug>/)
- Anything skipped and why
- Reminder: request indexing for the new URLs in Google Search Console
- If anything failed (check, play test, build, push, deploy), say what and where
