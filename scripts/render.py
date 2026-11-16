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

    # Social image
    t = html.escape(title_of(slug))
    og = f'''<div style="width:1200px;height:630px;background:#fde8d8;display:flex;align-items:center;gap:48px;padding:0 60px;box-sizing:border-box;font-family:Trebuchet MS,Segoe UI,Arial,sans-serif">
      <div style="background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(120,60,20,.18);padding:8px;flex:none">{sheet.replace('id="s"', 'style="width:400px;height:518px;display:block"')}</div>
      <div style="display:flex;flex-direction:column;gap:18px;color:#2a2522">
        <div style="font-size:26px;font-weight:700">Printable<span style="color:#c2541b">Sprout</span></div>
        <div style="font-size:54px;font-weight:700;line-height:1.1">{t}</div>
        <div style="font-size:26px;color:#5e554d">Free printable. Color online or print on Letter and A4.</div>
      </div></div>'''
    pw_page.set_viewport_size({'width': 1200, 'height': 630})
    pw_page.set_content(page_html(og, ''))
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
