#!/usr/bin/env python3
"""Static checks for the learning games. Run before every push that touches games.
  python3 scripts/check_games.py
Exit code 1 on any ERROR. WARN lines are advisory."""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUBJECTS = {'math', 'english', 'hindi-marathi', 'life', 'brain'}
AGES = {'3-5', '6-8', '9-10'}
BANNED = ['disney', 'pokemon', 'pokémon', 'marvel', 'paw patrol', 'peppa', 'bluey', 'mickey', 'elsa', 'sonic', 'minecraft', 'mario', 'barbie', 'spider-man', 'spiderman', 'roblox', 'fortnite', 'cocomelon']
CLICHES = ['delve', 'game-changer', 'it is worth noting', 'landscape', 'navigate the', 'unlock the', 'look no further', 'elevate your']
errors, warns = [], []
err = lambda m: errors.append('ERROR ' + m)
warn = lambda m: warns.append('WARN  ' + m)

src = open(os.path.join(ROOT, 'src/lib/games.ts'), encoding='utf-8').read()
body = src[src.index('export const GAMES'):]
blocks = re.split(r'\n  \{\n', body)[1:]
printables = {os.path.basename(p)[:-3] for p in glob.glob(os.path.join(ROOT, 'src/content/printables/*.md'))}
slugs = []

def field(b, k):
    m = re.search(rf"\b{k}: '((?:[^'\\]|\\.)*)'", b)
    return m.group(1).replace("\\'", "'") if m else None

for b in blocks:
    slug = field(b, 'slug')
    if not slug: err('a game entry has no slug'); continue
    slugs.append(slug)
    if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', slug): err(f'{slug}: bad slug')
    for k in ('name', 'blurb', 'ageLabel', 'sheet', 'sheetName', 'alt', 'title', 'description', 'keywords', 'h1', 'intro'):
        if not field(b, k): err(f'{slug}: missing {k}')
    t, d = field(b, 'title') or '', field(b, 'description') or ''
    if not 35 <= len(t) <= 60: warn(f'{slug}: title is {len(t)} chars (aim 40 to 60; " | PrintableSprout" is added)')
    if not 120 <= len(d) <= 155: err(f'{slug}: description is {len(d)} chars (must be 120 to 155)')
    ages = re.findall(r"'([0-9]+-[0-9]+)'", (re.search(r'ages: \[([^\]]*)\]', b) or [None, ''])[1])
    if not ages or not set(ages) <= AGES: err(f'{slug}: ages must be from {sorted(AGES)}')
    subs = re.findall(r"'([a-z-]+)'", (re.search(r'subjects: \[([^\]]*)\]', b) or [None, ''])[1])
    if not subs or not set(subs) <= SUBJECTS: err(f'{slug}: subjects must be from {sorted(SUBJECTS)}')
    sheet = field(b, 'sheet') or ''
    if sheet.startswith('/category/'):
        if not os.path.isdir(os.path.join(ROOT, 'src/pages/category')): err(f'{slug}: bad sheet link')
    elif sheet.strip('/') not in printables: err(f'{slug}: matching worksheet {sheet} is not a published printable')
    for r in re.findall(r"'([a-z0-9-]+)'", (re.search(r'related: \[([^\]]*)\]', b) or [None, ''])[1]):
        if r not in printables: err(f'{slug}: related printable {r} does not exist')
    for href in re.findall(r'href="([^"]+)"', b):
        if href.startswith('http'): err(f'{slug}: external link {href} (game pages are child directed: no external links)')
        elif href.startswith('/games/'):
            if href.strip('/').split('/')[-1] not in [field(x, 'slug') for x in blocks]: err(f'{slug}: link to missing game {href}')
        elif href.startswith('/category/') or href.startswith('/privacy'): pass
        elif href.strip('/') not in printables: err(f'{slug}: internal link to missing page {href}')
    if len(re.findall(r'\{ h: ', b)) < 3: err(f'{slug}: needs at least 3 text sections')
    if len(re.findall(r'\{ q: ', b)) < 3: err(f'{slug}: needs at least 3 FAQs')
    text = re.sub(r'<[^>]+>', ' ', b)
    words = len(re.findall(r"[A-Za-z0-9']+", ' '.join(re.findall(r"(?:intro|html|a|q): '((?:[^'\\]|\\.)*)'", b))))
    if words < 300: err(f'{slug}: page text has {words} words (minimum 300)')
    elif words < 380: warn(f'{slug}: page text has {words} words (aim 380 or more for new games)')
    low = text.lower()
    for c in CLICHES:
        if c in low: warn(f'{slug}: cliche "{c}"')
    for x in BANNED:
        if re.search(r'\b' + re.escape(x) + r'\b', low): err(f'{slug}: mentions "{x}" (no brands or characters)')
    js = os.path.join(ROOT, 'public/js/games', slug + '.js')
    if not os.path.exists(js): err(f'{slug}: missing public/js/games/{slug}.js')
    else:
        code = open(js, encoding='utf-8').read()
        if 'GK.solve' not in code: err(f'{slug}: game script must set GK.solve (test hook)')
        if 'GK.finish' not in code: err(f'{slug}: game script must end with GK.finish (win screen)')
        if re.search(r'https?://(?!www\.w3\.org/2000/svg)', code): err(f'{slug}: game script must not contain URLs')
        for bad in ('fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'document.cookie', 'navigator.sendBeacon', 'window.open', 'eval(', 'new Function'):
            if bad in code: err(f'{slug}: game script uses {bad} (games must not send, store or open anything)')
        if os.path.getsize(js) > 40000: warn(f'{slug}: game script is {os.path.getsize(js)} bytes (keep under 40 KB)')
    thumb = os.path.join(ROOT, 'public/images/games', slug + '.svg')
    if not os.path.exists(thumb): err(f'{slug}: missing public/images/games/{slug}.svg')
    elif re.search(r'<script|<image|href=|https?://(?!www\.w3\.org)', open(thumb, encoding='utf-8').read()): err(f'{slug}: thumbnail must be plain SVG (no scripts, images or links)')

if len(slugs) != len(set(slugs)): err('duplicate game slugs: ' + ', '.join(s for s in slugs if slugs.count(s) > 1))

files = [os.path.join(ROOT, 'src/lib/games.ts'), os.path.join(ROOT, 'src/pages/games/index.astro'), os.path.join(ROOT, 'src/pages/games/[slug].astro')]
files += glob.glob(os.path.join(ROOT, 'public/js/games/*.js')) + glob.glob(os.path.join(ROOT, 'public/images/games/*.svg'))
for f in files:
    if re.search('[–—]', open(f, encoding='utf-8').read()): err(f'{os.path.relpath(f, ROOT)}: contains an em dash or en dash')

for w in warns: print(w)
for e in errors: print(e)
print(f'{len(slugs)} games checked, {len(errors)} errors, {len(warns)} warnings')
if not errors: print('All game checks passed.')
sys.exit(1 if errors else 0)
