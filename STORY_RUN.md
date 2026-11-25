# Story run (scheduled daily: 3 stories)

Read `CLAUDE.md` first: the **Story rules** and the style, facts and "no dashes" rules apply to every story.

## 1. Set up
Attach `santajigade/printablesprout` with push access and clone it (`git clone --depth 30`), then `npm ci`. Python needs `playwright`, `pyyaml`, `kokoro-onnx` and `soundfile` (`pip install ... --break-system-packages` if missing).

## 2. Pick 3 topics
From `STORY_QUEUE.md` take 3 `todo` rows: holiday rows first when the holiday is 3 to 30 days away, then from the top. Never two of the same theme on one day, and at least 1 `original`. For each, run `python3 scripts/dupes.py "<title>"` and look in `src/content/stories/`; skip anything already covered.

## 3. Research (only where facts appear)
- Classics: read the public domain source text (for example Project Gutenberg) so the retelling follows the real tale. Retell it in your own words, kinder for small children where the original is harsh. Never borrow from film versions.
- Learning and Science or habit stories that state facts: read at least 2 official sources (NOAA, NASA, CDC, AAP healthychildren.org, EPA, USDA, major museums and zoos) and keep them in `sources`.

## 4. Write the story
`src/content/stories/<slug>.md` with this frontmatter:
```md
---
title: "Story Name: A Short <Theme> Story for Kids"     # 50 to 75 characters, keyword first
slug: "<slug>"
description: "140 to 160 characters: what happens and what kids learn"
date: <current US Eastern time, e.g. 2026-11-25T01:30:00-05:00>
level: "Read aloud" | "Early reader" | "Confident reader"
ages: "3 to 5" | "4 to 8" | "8 to 10"
theme: "<theme from the queue>"
type: "original" | "classic"
retoldFrom: "Aesop's Fables"          # classics only
hero: "Leo"                           # originals only
heroIs: "boy"                         # originals only
tags: [...]
keywords: "main keyword, second keyword"
image: "/stories/<slug>/<first-picture-keyword-name>.svg"
imageAlt: "..."
lesson: [2 to 4 short points]
quiz: [4 or 5 items: q, 4 options, answer 0 to 3, right answers in mixed positions]
words: [2 or 3 { word, meaning }]
questions: [optional talk prompts]
sources: [only when the story states real facts]
---
```
Body: story text with 3 or 4 specific `##` headings and 2 to 4 pictures, then the closing activity wrapped in `<section class="story-activity">` (blank line, `## Heading`, steps, blank line, `</section>`). Originals mark every hero pronoun with `<span data-p="subj|obj|poss">`.

## 5. Draw the pictures
Write `scripts/stories/<slug>.py` using `scripts/stories/kit.py` (3D style is the default), like `scripts/stories/maya-thankful-leaf-garland.py`. Animal heroes: build friendly original animals from simple shapes (body, head, ears, eyes with highlights) with `F()` shading; `scripts/stories/animals.py` already has a sitting wolf/fox/cat/panther (`sitter`), `bear`, side view `walker`, `hare`, `tortoise`, plus `boulder`, `bush`, `flag`, `moon` and `stars`. Save each scene with a descriptive keyword file name. Run it, open the SVGs as PNG (Playwright screenshot) and look at every picture; fix overlaps or cut-off parts. Then:
```
python3 scripts/stories/render_story.py <slug>
python3 scripts/stories/narrate.py <slug>
```
`narrate.py` records the Read Story narration in the cute child-like voice (Kokoro voice `af_heart`, pitched up); the model downloads once from GitHub. It takes several minutes per story, so start it in the background as soon as the story text is final. If the text changes later, run it again: the page only uses the recording when its paragraph count matches the story.

## 6. Check, build, publish
```
python3 scripts/check.py
npm run build
```
Fix every error; never push a failing build. Mark the rows `done YYYY-MM-DD` in `STORY_QUEUE.md`, then commit `stories: <titles>` and push to main. Confirm the GitHub Actions deploy finished with `success` (GitHub API). Pins are created automatically from `/pins.xml`.

## 7. Report (one short message)
Titles and live URLs (`https://printablesprout.com/stories/<slug>/`), anything skipped and why, and a reminder to request indexing in Search Console. If something failed, say what and where.
