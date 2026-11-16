#!/usr/bin/env python3
"""Render a printable's art into the files the site needs.

Usage: python3 scripts/render.py <slug> [<slug> ...]     (or --all)

Reads src/art/<slug>.svg and the title from src/content/printables/<slug>.md, then writes:
  public/images/<slug>.png      card thumbnail, 600 x 776
  public/og/<slug>.png          social image, 1200 x 630
  public/pdf/<slug>-letter.pdf  blank printable, US Letter
  public/pdf/<slug>-a4.pdf      blank printable, A4
Needs Python Playwright with a Chromium or Chrome browser.
"""
import os, re, sys, glob, html
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def chrome_path():
    for p in ('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'):
        if os.path.exists(p):
            return p
    return None

def title_of(slug):
    p = os.path.join(ROOT, 'src/content/printables', slug + '.md')
    if not os.path.exists(p):
        return slug.replace('-', ' ').title()
    m = re.search(r'^title:\s*"?(.*?)"?\s*$', open(p).read(), re.M)
    return m.group(1).split(':')[0] if m else slug

import base64
def _font(name, file):
    data = base64.b64encode(open(os.path.join(ROOT, 'scripts/fonts', file), 'rb').read()).decode()
    return f"@font-face{{font-family:{name};src:url(data:font/woff2;base64,{data}) format('woff2')}}"
FONTS = _font('Fredoka', 'fredoka-latin-600-normal.woff2') + _font('Nunito', 'nunito-latin-700-normal.woff2')

# Colors the front sheet of the social image so shares show a finished page
COLOR_JS = """() => {
  const soft = ['#9fd8f5','#ffd970','#b5dd96','#f7b3c2','#d4b8ec'];
  const pal = ['#e8742c','#f2b134','#7cb342','#4fc3f7','#f48fb1','#8e44ad','#ffe066','#d7263d','#2e7d32','#1e5aa8','#8d5a2b','#ffd3a8'];
  const svg = document.getElementById('og1'); if (!svg) return;
  let k = 0;
  svg.querySelectorAll('.f').forEach(el => {
    if (el.tagName === 'text' || el.closest('[style*="display:none"],[style*="display: none"]')) return;
    const b = el.getBBox();
    if (b.width > 600 || b.height > 700) return;
    el.setAttribute('fill', b.width * b.height > 45000 ? soft[k++ % soft.length] : pal[k++ % pal.length]);
  });
}"""

def page_html(svg, css):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>html,body{{margin:0;background:#fff}}{css}</style></head><body>{svg}</body></html>'

def render(pw_page, slug):
    svg = open(os.path.join(ROOT, 'src/art', slug + '.svg')).read()
    svg = re.sub(r'<\?xml[^>]*>', '', svg)
    sheet = svg.replace('<svg ', '<svg id="s" ', 1)
    for d in ('images', 'og', 'pdf'):
        os.makedirs(os.path.join(ROOT, 'public', d), exist_ok=True)

    # Thumbnail
    pw_page.set_viewport_size({'width': 600, 'height': 776})
    pw_page.set_content(page_html(sheet, '#s{width:600px;height:776px;display:block}'))
    pw_page.screenshot(path=os.path.join(ROOT, 'public/images', slug + '.png'))

    # Social image: a colored copy in front of the blank sheet, brand fonts
    t = html.escape(title_of(slug))
    def sh(i, style):
        return sheet.replace('id="s"', f'id="og{i}" style="width:100%;height:100%;display:block"').join(['<div style="' + style + '">', '</div>'])
    card = 'position:absolute;width:330px;height:427px;background:#fff;border-radius:10px;box-shadow:0 14px 34px rgba(80,40,10,.22);overflow:hidden;'
    og = f'''<style>{FONTS}
      .t{{font-family:Fredoka,Arial,sans-serif}} .c{{background:#fff;border:2px solid #f0d9c4;border-radius:999px;padding:8px 18px;font-size:22px;color:#5a4a3f}} .c b{{color:#c2541b}}</style>
      <div style="position:relative;width:1200px;height:630px;overflow:hidden;background:#fff3e6;font-family:Nunito,Arial,sans-serif;color:#2b2420">
        <div style="position:absolute;width:560px;height:560px;border-radius:50%;background:#ffe1c7;left:-120px;top:-60px"></div>
        {sh(0, card + 'left:60px;top:120px;transform:rotate(-7deg)')}
        {sh(1, card + 'left:200px;top:95px;transform:rotate(4deg)')}
        <div style="position:absolute;left:600px;top:0;bottom:0;width:540px;display:flex;flex-direction:column;justify-content:center;gap:22px">
          <div class="t" style="font-size:34px">Printable<span style="color:#c2541b">Sprout</span></div>
          <div class="t" style="font-size:58px;line-height:1.08">{t}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap"><div class="c"><b>Color</b> online</div><div class="c"><b>Add</b> a name</div><div class="c"><b>Print</b> free</div></div>
        </div></div>'''
    pw_page.set_viewport_size({'width': 1200, 'height': 630})
    pw_page.set_content(page_html(og, ''))
    pw_page.evaluate(COLOR_JS)
    pw_page.wait_for_timeout(150)
    pw_page.screenshot(path=os.path.join(ROOT, 'public/og', slug + '.png'))

    # PDFs (blank sheet, scaled to fit the printable area)
    for size, w, h in (('letter', '8.5in', '11in'), ('a4', '210mm', '297mm')):
        css = f'@page{{size:{w} {h};margin:0.35in}}#s{{display:block;width:100%;height:calc({h} - 0.7in);margin:0 auto}}'
        pw_page.set_content(page_html(sheet, css))
        pw_page.pdf(path=os.path.join(ROOT, 'public/pdf', f'{slug}-{size}.pdf'), prefer_css_page_size=True, print_background=True)
    print('rendered', slug)

def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    slugs = [os.path.basename(p)[:-4] for p in glob.glob(os.path.join(ROOT, 'src/art/*.svg'))] if args == ['--all'] else args
    with sync_playwright() as p:
        exe = chrome_path()
        browser = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
        page = browser.new_page()
        for s in slugs:
            render(page, s)
        browser.close()

if __name__ == '__main__':
    main()
