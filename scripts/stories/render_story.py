"""Share images for a story: public/og/stories-<slug>.png (1200x630) and public/pins/stories-<slug>.png (1000x1500).
Usage: python3 scripts/stories/render_story.py <slug> [<slug> ...] | --all
"""
import os, re, sys, glob, base64, html
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
def font(name, f):
    d = base64.b64encode(open(os.path.join(ROOT, 'scripts/fonts', f), 'rb').read()).decode()
    return f"@font-face{{font-family:{name};src:url(data:font/woff2;base64,{d}) format('woff2')}}"
FONTS = font('Fredoka', 'fredoka-latin-600-normal.woff2') + font('Nunito', 'nunito-latin-700-normal.woff2')
BADGE = open(os.path.join(ROOT, 'public/favicon.svg')).read()
def chrome():
    for p in ('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'):
        if os.path.exists(p): return p
def render(pg, slug):
    md = open(os.path.join(ROOT, 'src/content/stories', slug + '.md')).read()
    full = re.search(r'^title:\s*"(.*)"', md, re.M).group(1); level = re.search(r'^level:\s*"(.*)"', md, re.M).group(1)
    ages = re.search(r'^ages:\s*"(.*)"', md, re.M).group(1)
    t, _, sub = full.partition(':'); t, sub = html.escape(t.strip()), html.escape(sub.strip())
    img = 'data:image/svg+xml;base64,' + base64.b64encode(open(os.path.join(ROOT, 'public/stories', slug, '1.svg'), 'rb').read()).decode()
    b = lambda n: BADGE.replace('<svg ', f'<svg width="{n}" height="{n}" style="margin-right:10px" ', 1)
    css = f'<style>{FONTS} body{{margin:0}} .t{{font-family:Fredoka,Arial}} .c{{background:#fff;color:#c2541b;border-radius:999px;padding:10px 22px;font-size:26px}}</style>'
    og = f'''{css}<div style="position:relative;width:1200px;height:630px;overflow:hidden;background:#fff3e6;font-family:Nunito,Arial;color:#2b2420">
      <img src="{img}" style="position:absolute;left:560px;top:55px;width:600px;height:400px;border-radius:22px;box-shadow:0 14px 34px rgba(80,40,10,.22)">
      <div style="position:absolute;left:60px;top:0;bottom:0;width:470px;display:flex;flex-direction:column;justify-content:center;gap:18px">
        <div class="t" style="display:flex;align-items:center;font-size:30px">{b(40)}Printable<span style="color:#c2541b">Sprout</span></div>
        <div class="t" style="font-size:{54 if len(t) < 34 else 44}px;line-height:1.08">{t}</div>
        <div style="font-size:24px;color:#5a4a3f">{sub}</div></div>
      <div class="t" style="position:absolute;left:560px;top:490px;width:600px;display:flex;gap:10px;justify-content:center"><div class="c" style="background:#c2541b;color:#fff">Free story</div><div class="c">Ages {ages}</div><div class="c">{level}</div></div></div>'''
    pg.set_viewport_size({'width': 1200, 'height': 630}); pg.set_content(og); pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(ROOT, 'public/og', f'stories-{slug}.png'))
    pin = f'''{css}<div style="position:relative;width:1000px;height:1500px;overflow:hidden;background:#fff3e6;font-family:Nunito,Arial;color:#2b2420">
      <div style="position:absolute;width:820px;height:820px;border-radius:50%;background:#ffe1c7;left:420px;top:-300px"></div>
      <div class="t" style="position:absolute;top:44px;left:0;width:1000px;display:flex;justify-content:center;align-items:center;font-size:44px">{b(54)}Printable<span style="color:#c2541b">Sprout</span></div>
      <div style="position:absolute;top:130px;left:50px;width:900px;height:280px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px;text-align:center">
        <div class="t" style="font-size:{72 if len(t) < 30 else 60}px;line-height:1.06">{t}</div><div style="font-size:34px;color:#5a4a3f">{sub}</div></div>
      <img src="{img}" style="position:absolute;left:60px;top:450px;width:880px;height:587px;border-radius:26px;box-shadow:0 18px 44px rgba(80,40,10,.22)">
      <div class="t" style="position:absolute;top:1080px;left:0;width:1000px;display:flex;justify-content:center;gap:14px;font-size:30px"><div class="c" style="font-size:30px">Ages {ages}</div><div class="c" style="font-size:30px">{level}</div><div class="c" style="font-size:30px">Reading questions</div></div>
      <div style="position:absolute;left:0;top:1230px;width:1000px;height:270px;background:#c2541b"></div>
      <div class="t" style="position:absolute;left:0;top:1270px;width:1000px;text-align:center;color:#fff;font-size:60px">Free Story for Kids</div>
      <div class="t" style="position:absolute;left:0;top:1380px;width:1000px;text-align:center;color:#ffe1c7;font-size:40px">printablesprout.com</div></div>'''
    pg.set_viewport_size({'width': 1000, 'height': 1500}); pg.set_content(pin); pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(ROOT, 'public/pins', f'stories-{slug}.png'))
    print('rendered story', slug)
if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    slugs = [os.path.basename(p)[:-3] for p in glob.glob(os.path.join(ROOT, 'src/content/stories/*.md'))] if a == ['--all'] else a
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=chrome()); pg = br.new_page()
        for s in slugs: render(pg, s)
        br.close()
