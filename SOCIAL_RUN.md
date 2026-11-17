# Social run (scheduled daily at 7 AM IST, after the 6 AM publishing run)

Makes a short video, a thumbnail and post text for each printable that the daily run published. Nothing from this run is committed or pushed; the files go to the user.

## 1. Set up
Attach `santajigade/printablesprout` (read access is enough) and clone with history for the last day:
```
git clone --depth 30 https://github.com/santajigade/printablesprout && cd printablesprout
python3 -c "import playwright, numpy, PIL" || pip install playwright numpy pillow --break-system-packages
```
Chrome or Chromium and ffmpeg are needed (`/usr/bin/google-chrome`, `ffmpeg -version`).

## 2. Make the videos and thumbnails
```
python3 scripts/social/make_social.py
```
It finds the printables added by today's `printables:` commit (last 22 hours) and writes, per printable, to `social-out/<date>/`:
- `<slug>.mp4`: 13 s, 1080 x 1320, 30 fps, original jingle (name typed on the sheet, sheet colors itself in, print scene, end card)
- `<slug>-thumbnail.png`: 1080 x 1320 cover

If it prints `No new printables found.`, the 6 AM run published nothing: report that in one line and stop. To redo specific pages: `python3 scripts/social/make_social.py <slug> <slug>`.

Check one frame of each video (`ffmpeg -ss 5.5 -i <slug>.mp4 -frames:v 1 f.jpg`) and each thumbnail. If a sheet looks wrong (shapes missing, text cut off), say so in the report instead of sending it.

## 3. Write the posts
Read each new page (`src/content/printables/<slug>.md`) and write `social-out/<date>/posts.md` with, for each printable:
- **Facebook / LinkedIn:** 2 to 4 short lines with one or two emoji, what the sheet is and what kids do with it, then `👉 printablesprout.com/<slug>/` and 3 to 5 hashtags.
- **Instagram:** the same idea, ending with `🔗 Link in bio` instead of the URL, and 8 to 12 hashtags.

Rules: facts only from the page itself, no invented claims, no em or en dash characters, simple American English, vary the opening line between posts.

## 4. Deliver
Send all files with SendUserFile (videos, thumbnails, posts.md), then one short message listing the titles and saying the posts are ready to copy.
