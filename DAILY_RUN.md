# Daily run (scheduled once a day)

Follow these steps exactly. Read `CLAUDE.md` first; its writing and art rules apply to every step.

## 1. Set up
If the repo is not in the session, attach `santajigade/printablesprout` with push access (add_repo), then:
```
git clone --depth 1 https://github.com/santajigade/printablesprout && cd printablesprout
npm ci
pip install playwright --break-system-packages   # only if `python3 -c "import playwright"` fails
```
Render needs Chrome or Chromium (`/usr/bin/google-chrome` is used when present; otherwise run `python3 -m playwright install chromium`).

## 2. Check the season
Open `src/lib/site.ts`. If any `OCCASIONS.next` date is in the past, set it to the next year's date (verify the date from an official source such as an opm.gov or uscourts.gov holiday schedule, or the occasion's official site) and update its `label`.

## 3. Pick today's topics (4, never more)
1. `python3 scripts/dupes.py` to see what is published.
2. From `TOPIC_QUEUE.md`, take `todo` rows: occasions 3 to 45 days away first, then evergreen rows from the top. At least 3 of the 4 must be Coloring Pages or Activities.
3. A fresh timely topic not in the queue is allowed only if it adds real value (for example a newly announced event date) and passes the duplicate check.
4. For each topic: `python3 scripts/dupes.py "<topic>"`. LIKELY DUPLICATE means mark it `skip` and take the next.
5. Write down the one line value add for each topic before starting. If you cannot name one, skip the topic.
6. **Color, play, level up.** For every Coloring Page and Activity, also write down in one line each: what kids color, what they do or play with the sheet, and the harder mode or second version (see the rule in `CLAUDE.md`). Redesign plain queue rows into something creative; skip a topic that still would not keep a child engaged.

## 4. Research
For each topic, search the web and read at least 2 reliable sources for any fact the page will state (official sites first). Note the URLs for the frontmatter `sources`. Use competitor printable sites only to see what already exists, never as a source and never to copy.

## 5. Make the art
Write `src/art/<slug>.svg` following the art rules in `CLAUDE.md`. Then:
```
python3 scripts/render.py <slug>
```
Open `public/images/<slug>.png` and look at it carefully. Fix overlaps, cut off shapes, tiny areas and anything that looks wrong, then render again.

## 6. Write the page
Create `src/content/printables/<slug>.md` with the frontmatter from `CLAUDE.md` and 500 to 900 words of useful text: what is on the sheet, how to use it, an age table or step plan, and 2 or 3 internal links to related printables. Add 2 or 3 external links to the sources you read. Add the YMYL line where needed.

## 7. Check and build
```
python3 scripts/check.py
npm run build
```
Fix every ERROR. Never push a failing build. If a printable cannot be fixed, delete its files and publish the rest.

## 8. Publish
1. Mark the published rows in `TOPIC_QUEUE.md` as `done YYYY-MM-DD`.
2. If fewer than 30 `todo` rows remain, research real search demand and append 30 new rows (with slug, category, occasion, target keyword and value add), avoiding protected characters and duplicates.
3. Commit and push:
```
git add -A && git commit -m "printables: <short list of titles>" && git push origin main
```
4. Wait for the "Build and deploy to Hostinger" GitHub Action to finish (poll `https://api.github.com/repos/santajigade/printablesprout/actions/runs?per_page=1` until `status` is `completed`) and confirm `conclusion` is `success`. The successful deploy run is the confirmation. Do not fetch the live pages with WebFetch or any other tool that asks the owner for permission: these runs are unattended and must never stop on an approval prompt.

## 9. Report (one short message)
- Titles and live URLs of what was published
- Anything skipped and why
- Reminder: request indexing for the new URLs in Google Search Console
- If anything failed (build, deploy, page not live), say what and where
