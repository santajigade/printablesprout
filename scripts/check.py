#!/usr/bin/env python3
"""Quality checks for printables. Run before every push: python3 scripts/check.py [slug ...]
Exits with code 1 if any ERROR is found. WARN lines are advisory."""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATS = ['Coloring Pages', 'Holiday Printables', 'Chore and Reward Charts', 'Daily Routines', 'Activities', 'For Parents']
BANNED_HEADINGS = ['conclusion', 'final thoughts', 'key takeaways', 'summary', 'wrapping up', 'the bottom line', 'in conclusion', 'final takeaway', 'overview']
CLICHES = ['delve', 'game-changer', "in today's fast-paced", 'it is worth noting', 'landscape', 'navigate the', 'unlock the', 'elevate your', 'look no further']
BANNED_ART = ['disney', 'pokemon', 'pokémon', 'marvel', 'paw patrol', 'peppa', 'bluey', 'mickey', 'elsa', 'sonic', 'minecraft', 'mario', 'barbie', 'spider-man', 'spiderman']
errors, warns = [], []

def err(slug, msg): errors.append(f'ERROR {slug}: {msg}')
def warn(slug, msg): warns.append(f'WARN  {slug}: {msg}')

def frontmatter(text):
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', text, re.S)
    return (m.group(1), m.group(2)) if m else ('', text)

def check(path):
    slug = os.path.basename(path)[:-3]
    text = open(path, encoding='utf-8').read()
    fm, body = frontmatter(text)
    get = lambda k: (re.search(rf'^{k}:\s*"?(.*?)"?\s*$', fm, re.M) or [None, None])[1]
    for k in ('title', 'slug', 'description', 'date', 'category', 'ages', 'time', 'image', 'imageAlt'):
        if not get(k): err(slug, f'missing frontmatter field {k}')
    if get('slug') and get('slug') != slug: err(slug, 'slug does not match file name')
    if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', slug): err(slug, 'slug must be lowercase a-z, 0-9 and hyphens')
    if get('category') and get('category') not in CATS: err(slug, f'unknown category {get("category")}')
    t, dsc = get('title') or '', get('description') or ''
    if not 40 <= len(t) <= 75: warn(slug, f'title is {len(t)} chars (aim 50 to 70)')
    if not 120 <= len(dsc) <= 165: warn(slug, f'description is {len(dsc)} chars (aim 140 to 160)')
    if re.search('[–—]', text): err(slug, 'contains an em dash or en dash')
    faq_text = ' '.join(re.findall(r'^\s+(?:- )?[qa]:\s*"(.*)"\s*$', fm, re.M))
    words = len(re.findall(r"[A-Za-z0-9']+", re.sub(r'<[^>]+>', ' ', body + ' ' + faq_text)))
    if words < 500: err(slug, f'page text has {words} words incl. FAQ (minimum 500)')
    if words > 1500: warn(slug, f'body has {words} words (printable pages aim for 500 to 900)')
    if re.search(r'^# ', body, re.M): err(slug, 'body must not contain an H1')
    for h in re.findall(r'^#{2,3}\s+(.+)$', body, re.M):
        if h.strip().lower().rstrip(':') in BANNED_HEADINGS: err(slug, f'generic heading "{h}"')
    low = body.lower()
    for c in CLICHES:
        if c in low: warn(slug, f'cliche "{c}"')
    if re.search(r'^##\s+(sources|references)\b', body, re.M | re.I): err(slug, 'no Sources section on the page (keep sources in frontmatter)')
    ext = re.findall(r'href="(https?://[^"]+)"', body)
    if not 1 <= len(ext) <= 3: warn(slug, f'{len(ext)} external links (aim 2 or 3, high authority only)')
    for u in ext:
        if 'target="_blank"' not in body: err(slug, 'external links need target="_blank" rel="noopener"')
    internal = re.findall(r'\]\((/[a-z0-9-]+/)\)', body)
    existing = {os.path.basename(p)[:-3] for p in glob.glob(os.path.join(ROOT, 'src/content/printables/*.md'))}
    pages = {os.path.basename(p)[:-3] for p in glob.glob(os.path.join(ROOT, 'src/content/pages/*.md'))}
    if len(existing) > 3 and len(internal) < 2: warn(slug, f'{len(internal)} internal links (aim 2 or 3)')
    for u in internal:
        s = u.strip('/')
        if s not in existing and s not in pages: err(slug, f'internal link to missing page {u}')
    if 'sources:' not in fm: warn(slug, 'no sources in frontmatter')
    # Art
    art = os.path.join(ROOT, 'src/art', slug + '.svg')
    if not os.path.exists(art):
        err(slug, 'missing art src/art/%s.svg' % slug)
    else:
        svg = open(art, encoding='utf-8').read()
        if 'viewBox="0 0 850 1100"' not in svg: err(slug, 'art must use viewBox="0 0 850 1100"')
        n = svg.count('class="f"')
        if n < 8: err(slug, f'art has only {n} fillable shapes (class="f"), minimum 8')
        if re.search('[–—]', svg): err(slug, 'art text contains an em dash or en dash')
        for b in BANNED_ART:
            if b in svg.lower() or b in low: err(slug, f'mentions protected character or brand "{b}"')
        fsec = re.search(r'^fields:\n((?:  .*\n?)*)', fm, re.M)
        for f in re.findall(r'key:\s*"(\w+)"', fsec.group(1) if fsec else ''):
            if f'data-field="{f}"' not in svg: err(slug, f'field {f} has no data-field="{f}" in the art')
        for v in re.findall(r'\{\s*key:\s*"(\w+)",\s*label:\s*"[^"]*"\s*\}', fm.split('variants:')[1] if 'variants:' in fm else ''):
            if f'data-variant="{v}"' not in svg: err(slug, f'variant {v} missing in the art')
        if re.search(r'<image|xlink:href|https?://', svg.replace('http://www.w3.org/2000/svg', '')): err(slug, 'art must not embed images or links')
    for f in (f'public/images/{slug}.png', f'public/og/{slug}.png', f'public/pins/{slug}.png', f'public/pdf/{slug}-letter.pdf', f'public/pdf/{slug}-a4.pdf'):
        if not os.path.exists(os.path.join(ROOT, f)): err(slug, f'missing {f} (run python3 scripts/render.py {slug})')

def check_story(path):
    """Stories: src/content/stories/<slug>.md with 2 to 5 illustrations in public/stories/<slug>/."""
    slug = os.path.basename(path)[:-3]; text = open(path).read(); fm, body = frontmatter(text)
    get = lambda k: (re.search(rf'^{k}:\s*"?(.*?)"?\s*$', fm, re.M) or [None, None])[1]
    for k in ('title', 'slug', 'description', 'date', 'level', 'ages', 'hero', 'image', 'imageAlt'):
        if not get(k): err(slug, f'missing frontmatter field {k}')
    if get('slug') != slug: err(slug, 'slug does not match the file name')
    if re.search('[\u2013\u2014]', text): err(slug, 'em or en dash found')
    if re.search(r'^# ', body, re.M): err(slug, 'H1 in the body')
    if re.search(r'^##+\s*(Sources|References)\b', body, re.M | re.I): err(slug, 'Sources section on the page')
    try:
        import yaml
        data = yaml.safe_load(fm) or {}
        quiz = data.get('quiz') or []
        if not 4 <= len(quiz) <= 5: err(slug, f'Question Time needs 4 or 5 quiz questions, found {len(quiz)}')
        for i, item in enumerate(quiz):
            if len(item.get('options') or []) != 4: err(slug, f'quiz question {i+1} needs exactly 4 options')
            if item.get('answer') not in (0, 1, 2, 3): err(slug, f'quiz question {i+1} needs answer 0 to 3')
        if quiz and len({item.get('answer') for item in quiz}) == 1: warn(slug, 'all quiz answers are in the same position; mix them up')
        if not 2 <= len(data.get('lesson') or []) <= 4: err(slug, 'What We Learn needs 2 to 4 lesson points')
    except ImportError:
        warn(slug, 'PyYAML missing, quiz not checked')
    if '<section class="story-activity">' not in body: err(slug, 'wrap the closing activity in <section class="story-activity"> ... </section>')
    figs = re.findall(r'<img src="(/stories/[^"]+)"', body)
    if not 2 <= len(figs) <= 5: err(slug, f'needs 2 to 5 illustrations in the text, found {len(figs)}')
    for f in figs:
        if re.search(r'/\d+\.svg$', f): err(slug, f'{f}: use a descriptive keyword file name, not a number')
    for f in figs + [get('image') or '']:
        if f and not os.path.exists(os.path.join(ROOT, 'public' + f)): err(slug, f'missing image {f}')
    for f in (f'public/og/stories-{slug}.png', f'public/pins/stories-{slug}.png'):
        if not os.path.exists(os.path.join(ROOT, f)): err(slug, f'missing {f} (run python3 scripts/stories/render_story.py {slug})')
    hero = get('hero') or ''
    if hero and body.count(hero) < 3: err(slug, f'hero name "{hero}" should appear in the story text at least 3 times')
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    if words < 300: err(slug, f'only {words} words of story text (minimum 300)')
    if words > 1400: warn(slug, f'{words} words is long for a kids story')
    for f in figs:
        svg = open(os.path.join(ROOT, 'public' + f)).read() if os.path.exists(os.path.join(ROOT, 'public' + f)) else ''
        if re.search(r'<script|<image|href="http', svg): err(slug, f'{f} has scripts, embedded images or links')
        if re.search('[\u2013\u2014]', svg): err(slug, f'{f} has an em or en dash')
    for u in re.findall(r'\]\((/[^)]+)\)', body):
        if not os.path.exists(os.path.join(ROOT, 'src/content/printables', u.strip('/') + '.md')) and not u.startswith('/stories/') and not u.startswith('/games/'):
            err(slug, f'internal link to missing page {u}')

def main():
    slugs = sys.argv[1:]
    paths = [os.path.join(ROOT, 'src/content/printables', s + '.md') for s in slugs] if slugs else sorted(glob.glob(os.path.join(ROOT, 'src/content/printables/*.md')))
    for p in paths:
        if not os.path.exists(p): errors.append(f'ERROR {p}: file not found'); continue
        check(p)
    stories = [] if slugs else sorted(glob.glob(os.path.join(ROOT, 'src/content/stories/*.md')))
    for p in stories: check_story(p)
    print('\n'.join(warns + errors) or 'All checks passed.')
    print(f'{len(paths)} printables and {len(stories)} stories checked, {len(errors)} errors, {len(warns)} warnings')
    sys.exit(1 if errors else 0)

if __name__ == '__main__':
    main()
