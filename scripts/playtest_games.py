#!/usr/bin/env python3
"""Play-test learning games in a real browser. Run after `npm run build`.

  python3 scripts/playtest_games.py            # every game in src/lib/games.ts
  python3 scripts/playtest_games.py slug1 ...  # only these

For each game, at desktop (1366) and mobile (390) width:
  * the page loads with no JavaScript errors and sets no cookies
  * every level button renders something in the game area
  * on every level, GK.solve() (the game's test hook) plays it to the win screen (.gk-end)
  * nothing is wider than the screen on mobile
Screenshots go to /tmp/playtest/<slug>-<width>-{play,end}.png so you can look at them.
Exit code 1 if anything fails.
"""
import os, re, sys, time, subprocess, shutil
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
OUT = '/tmp/playtest'
PORT = 4391

def all_slugs():
    src = open(os.path.join(ROOT, 'src/lib/games.ts'), encoding='utf-8').read()
    return re.findall(r"^\s{4}slug: '([a-z0-9-]+)'", src, re.M)

def chrome():
    for p in ('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'):
        if os.path.exists(p): return p
    return None  # fall back to playwright's own chromium

def main():
    slugs = sys.argv[1:] or all_slugs()
    if not os.path.isdir(DIST): sys.exit('Run npm run build first')
    os.makedirs(OUT, exist_ok=True)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '-d', DIST], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    fails = []
    try:
        with sync_playwright() as p:
            exe = chrome()
            b = p.chromium.launch(executable_path=exe, args=['--no-sandbox']) if exe else p.chromium.launch(args=['--no-sandbox'])
            for slug in slugs:
                for w, h in ((1366, 900), (390, 844)):
                    tag = f'{slug} @{w}'
                    pg = b.new_page(viewport={'width': w, 'height': h})
                    errs = []
                    pg.on('pageerror', lambda e: errs.append(str(e)))
                    pg.on('console', lambda m: m.type == 'error' and 'Failed to load resource' not in m.text and errs.append(m.text))
                    pg.route('**/*', lambda r: r.abort() if 'fonts.g' in r.request.url else r.continue_())
                    resp = pg.goto(f'http://localhost:{PORT}/games/{slug}/', wait_until='load')
                    if not resp or resp.status != 200:
                        fails.append(f'{tag}: page not found (status {resp.status if resp else "none"})'); pg.close(); continue
                    time.sleep(0.5)
                    if not pg.evaluate('() => !!(window.GK && typeof GK.solve === "function")'):
                        fails.append(f'{tag}: game did not start or has no GK.solve test hook')
                    levels = pg.locator('.gk-lv').count()
                    if levels < 1: fails.append(f'{tag}: no level buttons')
                    pg.locator('#gk').screenshot(path=f'{OUT}/{slug}-{w}-play.png')
                    for i in range(max(levels, 1) if w > 600 else 1):  # every level on desktop, first level on mobile
                        if levels:
                            pg.locator('.gk-lv').nth(i).click(); time.sleep(0.4)
                        if not pg.evaluate("() => document.querySelector('.gk-area') && document.querySelector('.gk-area').children.length > 0"):
                            fails.append(f'{tag}: level {i + 1} shows an empty game area'); continue
                        won = False
                        t0 = time.time()
                        while time.time() - t0 < 150:
                            if pg.locator('.gk-end').count(): won = True; break
                            pg.evaluate('() => { try { GK.solve && GK.solve(); } catch (e) { console.error("solve: " + e.message); } }')
                            time.sleep(1.4)
                        if not won: fails.append(f'{tag}: level {i + 1} never reached the win screen with GK.solve()')
                        if i == 0: pg.locator('#gk').screenshot(path=f'{OUT}/{slug}-{w}-end.png')
                        if w == 390:
                            over = pg.evaluate('() => document.documentElement.scrollWidth - window.innerWidth')
                            if over > 2: fails.append(f'{tag}: page is {over}px wider than the phone screen')
                    if len(pg.context.cookies()): fails.append(f'{tag}: cookies were set')
                    if errs: fails.append(f'{tag}: JavaScript errors: {errs[:3]}')
                    print(('FAIL ' if any(f.startswith(tag) for f in fails) else 'ok   ') + tag)
                    pg.close()
            b.close()
    finally:
        srv.terminate()
    for f in fails: print('ERROR', f)
    print(f'{len(slugs)} games play-tested, {len(fails)} errors. Screenshots in {OUT}/')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
