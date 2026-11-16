# PrintableSprout (printablesprout.com)

Static Astro site of free printables for US parents and teachers. Every push to `main` builds and deploys to Hostinger by FTP (`.github/workflows/deploy.yml`, secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` under Settings > Secrets and variables > Actions). Live about 2 minutes after push. This project is separate from every other site: never copy files, secrets or settings from other repos.

The daily publishing steps are in `DAILY_RUN.md`. Topics come from `TOPIC_QUEUE.md`.

## Repo layout
- `src/content/printables/<slug>.md` : one printable page (frontmatter + page text)
- `src/art/<slug>.svg` : the printable's original line art (inlined into the page, rendered to PNG/PDF)
- `public/images/<slug>.png`, `public/og/<slug>.png`, `public/pdf/<slug>-letter.pdf`, `public/pdf/<slug>-a4.pdf` : made by `python3 scripts/render.py <slug>`
- `src/content/pages/*.md` : trust pages (about, editorial policy, corrections, contact, privacy, terms, disclaimer)
- `src/lib/site.ts` : site name, categories, occasions (with next dates for the seasonal banner), nav, author, AdSense and GA4 ids
- `public/js/sprout.js` : the online coloring tool (tap to fill, crayon, undo, print, PNG download, name fields, versions)
- `scripts/check.py` : quality checks, must pass before every push
- `scripts/dupes.py` : duplicate check, run before every new topic

## Writing rules (follow every time)

1. **Volume: 3 printables per day, never more** (one run daily at 6 AM IST; decided 2026-11-16 to avoid scaled content risk). Publishing fewer is better than publishing weak ones. Skip a slot rather than fill it.
2. **One line value add before you start.** Write down what a parent gets here that other free printables do not give them. Every page needs at least one section the sources do not offer in that form: a step by step plan, an age table, a worked example, a checklist or a game built on the sheet.
3. **Facts only from sources read in this run.** Every fact, number, date and price must come from a source you actually read in this run, with at least 2 reliable sources for any page that states facts (official sites first: .gov, AAP healthychildren.org, CDC, NOAA, NASA, NPS, EPA, major museums and zoos; then major outlets). If it cannot be verified, leave it out. No invented quotes, statistics, testimonials or personal experiences ("my kids loved this" is never allowed).
4. **Length.** Printable pages: 500 to 900 words of page text including the FAQ (useful, not padded). Guide style pages (for example a chores by age guide): 900 to 1,500 words. Timely pages: 700 to 1,000 words.
5. **Style.** Simple American English. Specific headings ("A five minute gratitude round at the kids' table"), never generic AI headings such as Conclusion, Final Thoughts, Key Takeaways, Summary, Wrapping Up, The Bottom Line, Overview. No AI cliches (delve, game-changer, it is worth noting, landscape, navigate, look no further). **Absolutely no em dash or en dash characters** anywhere, including the SVG. Hyphens inside words are fine. Never start the body with an H1.
6. **Vary structure.** Do not give every page the same section pattern, the same table or the same closing line. No shared boilerplate paragraphs between pages (the layout already adds the author box and the license note).
7. **Links.** 2 or 3 external links to high authority sources only, written as `<a href="https://..." target="_blank" rel="noopener">specific anchor text</a>`. 2 or 3 internal links to existing printables only, written as `[anchor](/slug/)`. Never link to competitor printable blogs, Pinterest, Etsy or TpT.
8. **Sources in frontmatter, not on the page.** Keep every source in the `sources` field. Never add a Sources or References section.
9. **Named author** on every page: `author: "Santaji Gadepatil"` (the default).
10. **YMYL note.** Pages that touch health, sleep, behavior, development, safety or money end with one line: "General information, not professional advice." (add a short pointer to the pediatrician where relevant).
11. **Never copy or closely paraphrase competitors.** Use them only for topic ideas.
12. **Duplicate check before each run.** `python3 scripts/dupes.py` lists everything published; `python3 scripts/dupes.py "<topic>"` flags similar pages. Never cover the same topic twice unless there is a real update (then update the old page instead).

## Art rules (src/art/<slug>.svg)

- `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1100">`, portrait, black line art (`stroke="#222"`, 3 to 4 px), white fills. It must print well on US Letter and A4.
- Start with the dashed page border and end with the small `printablesprout.com` footer text, like the existing files.
- Every shape a child should be able to color has `class="f" fill="#fff"`. At least 8 fillable shapes; aim for 15 to 40. Details that should not be fillable (eyes, veins, lines) have no class.
- Title text: `data-field="name" data-tpl="{name}'s Snowman" data-empty="Build a Snowman"` with `class="f"`, white fill and a dark stroke (see existing files). Any other editable text uses `data-field="<key>"` and must be listed in the frontmatter `fields`.
- Every write-in line on the sheet (date, week, time, goal, prize) must be an editable field, with `data-empty` showing the blank line for printing. Routine and schedule charts get an editable time for each step.
- Alternative versions go in `<g data-variant="<key>">` groups (all but the first with `style="display:none"`) and are listed in `variants`.
- Fonts: `font-family="Trebuchet MS, Segoe UI, Arial, sans-serif"` only. No embedded images, no external links, no scripts.
- **Original designs only.** Never draw famous characters, mascots, logos or brands (Disney, Pokemon, Bluey, Paw Patrol, Minecraft, Mario and so on), even "inspired by". Real people and their likeness are not drawn either.
- Keep shapes big for ages 3 to 6. Leave space around lines so tap to fill hits the right shape.
- After writing the SVG, run `python3 scripts/render.py <slug>`, then open `public/images/<slug>.png` and look at it. Fix anything that overlaps, is cut off or looks wrong before writing the page.

## Frontmatter

```md
---
title: "Main Keyword First: Short Benefit (50 to 70 characters)"
slug: "lowercase-hyphenated-slug"
description: "Meta description, 140 to 160 characters, says what is on the sheet and that it is free"
date: 2026-11-16T05:00:00-05:00
category: "Coloring Pages"          # one of: Coloring Pages, Holiday Printables, Chore and Reward Charts, Daily Routines, Activities and Games, For Parents
occasion: "christmas"               # optional, one of the OCCASIONS slugs in src/lib/site.ts
tags: ["tag one", "tag two"]
keywords: "main keyword, secondary keyword"
ages: "3 to 8"
time: "15 to 30 minutes"
fields:
  - { key: "name", label: "Child's name", placeholder: "e.g. Emma", max: 14 }
variants:                           # optional, 2 or more
  - { key: "write", label: "Writing lines" }
  - { key: "pattern", label: "Patterns" }
image: "/images/<slug>.png"
imageAlt: "What the sheet shows, in plain words"
sources:
  - name: "Organization, page title"
    url: "https://..."
faq:                                # optional, only real questions with useful answers
  - q: "Question?"
    a: "Answer."
---
```
`date` is the current US Eastern time (`-05:00` in winter, `-04:00` in summer).

## Checks before every push

```
python3 scripts/render.py <slug> [<slug> ...]
python3 scripts/check.py
npm ci   # first time only
npm run build
```
`check.py` must print `All checks passed` (warnings are allowed but read them). Never push a failing build.

## Do not
- Do not edit the trust pages, workflows, `.htaccess`, `sprout.js` or design files during a publishing run unless something is broken.
- Do not delete or rename published printables (it breaks links); update them instead and set `updated:`.
- Do not add adult themes, scary content, weapons, brands or characters to any printable.
