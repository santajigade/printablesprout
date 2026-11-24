"""Drawing kit for story illustrations (flat, colored, original SVG scenes, 1200x800).

Use it from a small per-story script:
    import sys; sys.path.insert(0, 'scripts/stories'); from kit import *
    s = Scene(sky='#cfe9f7')
    s.add(ground('#9ccf6e', 560)); s.add(tree(260, 560, 1.2)); s.add(kid(620, 600, shirt='#e8742c'))
    s.save('maya-thankful-garland', 1)        # -> public/stories/<slug>/1.svg

Characters are simple and friendly: round heads, dot eyes, rosy cheeks. Never draw famous characters,
brands or real people. Keep the same colors for a character in every picture of one story.
"""
import math, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
INK = '#3a2a20'

class Scene:
    def __init__(self, sky='#cfe9f7', w=1200, h=800, bg=None):
        self.w, self.h, self.parts = w, h, [f'<rect width="{w}" height="{h}" fill="{bg or sky}"/>']
    def add(self, *svg):
        self.parts.extend(svg); return self
    def svg(self, title=''):
        t = f'<title>{title}</title>' if title else ''
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" role="img">{t}' + ''.join(self.parts) + '</svg>'
    def save(self, slug, n, title=''):
        d = os.path.join(ROOT, 'public/stories', slug); os.makedirs(d, exist_ok=True)
        p = os.path.join(d, f'{n}.svg'); open(p, 'w').write(self.svg(title)); return p

def g(inner, x=0, y=0, s=1, r=0):
    return f'<g transform="translate({x},{y}) rotate({r}) scale({s})">{inner}</g>'

def ground(color='#9ccf6e', y=560, w=1200, h=800, wave=18):
    return f'<path d="M0 {y} Q {w*0.25} {y-wave} {w*0.5} {y} T {w} {y} V {h} H 0 Z" fill="{color}"/>'

def sun(x, y, r=60, color='#ffd34d'):
    rays = ''.join(f'<line x1="{x+math.cos(a)*(r+12):.1f}" y1="{y+math.sin(a)*(r+12):.1f}" x2="{x+math.cos(a)*(r+34):.1f}" y2="{y+math.sin(a)*(r+34):.1f}" stroke="{color}" stroke-width="8" stroke-linecap="round"/>' for a in [i*math.pi/6 for i in range(12)])
    return rays + f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>'

def cloud(x, y, s=1, color='#ffffff'):
    return g(f'<g fill="{color}"><circle cx="0" cy="0" r="34"/><circle cx="40" cy="-14" r="44"/><circle cx="88" cy="0" r="34"/><rect x="0" y="0" width="88" height="34"/></g>', x, y, s)

def leaf(x, y, s=1, r=0, color='#e8742c', vein='#b4501f'):
    return g(f'<path d="M0 -30 C 18 -18 20 10 0 30 C -20 10 -18 -18 0 -30 Z" fill="{color}"/><path d="M0 -24 V 26" stroke="{vein}" stroke-width="2.5" stroke-linecap="round"/>', x, y, s, r)

def tree(x, base, s=1, crown=('#e8742c', '#f2b134', '#d7263d'), trunk='#8d5a2b'):
    c = crown
    inner = (f'<path d="M-22 0 L-14 -170 L14 -170 L22 0 Z" fill="{trunk}"/>'
             f'<circle cx="-70" cy="-200" r="80" fill="{c[0]}"/><circle cx="60" cy="-215" r="85" fill="{c[1]}"/>'
             f'<circle cx="0" cy="-290" r="90" fill="{c[2]}"/><circle cx="-10" cy="-190" r="70" fill="{c[1]}"/>')
    return g(inner, x, base, s)

def kid(x, base, s=1, skin='#f1c29b', hair='#4a2c1d', shirt='#e8742c', pants='#3d5a80', shoes='#3a2a20', bun=False, pony=True, arm_up=False, holding=''):
    """A child standing; base = y of the feet. About 330 px tall at s=1."""
    pony_svg = f'<path d="M38 -300 C 70 -300 76 -262 62 -240 C 58 -262 50 -276 34 -282 Z" fill="{hair}"/>' if pony else ''
    arm_r = (f'<path d="M30 -170 L64 -230" stroke="{skin}" stroke-width="18" stroke-linecap="round"/>' if arm_up
             else f'<path d="M30 -170 L52 -110" stroke="{skin}" stroke-width="18" stroke-linecap="round"/>')
    inner = (f'<rect x="-26" y="-90" width="20" height="80" rx="9" fill="{pants}"/><rect x="6" y="-90" width="20" height="80" rx="9" fill="{pants}"/>'
             f'<ellipse cx="-16" cy="-8" rx="20" ry="10" fill="{shoes}"/><ellipse cx="16" cy="-8" rx="20" ry="10" fill="{shoes}"/>'
             f'<path d="M-30 -110 Q 0 -100 30 -110" stroke="{pants}" stroke-width="0"/>'
             f'<path d="M-30 -186 Q 0 -200 30 -186 L 40 -84 Q 0 -74 -40 -84 Z" fill="{shirt}"/>'
             f'<path d="M-30 -170 L-52 -110" stroke="{skin}" stroke-width="18" stroke-linecap="round"/>{arm_r}'
             f'<rect x="-9" y="-206" width="18" height="22" fill="{skin}"/>'
             f'{pony_svg}<circle cx="0" cy="-252" r="50" fill="{skin}"/>'
             f'<path d="M-50 -258 C -50 -310 50 -310 50 -258 C 30 -284 -10 -290 -50 -258 Z" fill="{hair}"/>'
             + (f'<circle cx="0" cy="-312" r="20" fill="{hair}"/>' if bun else '') +
             f'<circle cx="-17" cy="-252" r="5" fill="{INK}"/><circle cx="17" cy="-252" r="5" fill="{INK}"/>'
             f'<circle cx="-30" cy="-236" r="8" fill="#f29b9b" opacity=".7"/><circle cx="30" cy="-236" r="8" fill="#f29b9b" opacity=".7"/>'
             f'<path d="M-12 -232 Q 0 -222 12 -232" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>{holding}')
    return g(inner, x, base, s)

def grown_up(x, base, s=1, skin='#e7b48c', hair='#b9b4ae', top='#8e6bbf', skirt='#5b4a7a', glasses=True, bun=True):
    """A grown up (grandparent or parent); about 430 px tall at s=1."""
    inner = (f'<rect x="-30" y="-120" width="24" height="112" rx="10" fill="{skirt}"/><rect x="6" y="-120" width="24" height="112" rx="10" fill="{skirt}"/>'
             f'<ellipse cx="-18" cy="-8" rx="24" ry="11" fill="{INK}"/><ellipse cx="18" cy="-8" rx="24" ry="11" fill="{INK}"/>'
             f'<path d="M-44 -250 Q 0 -266 44 -250 L 56 -110 Q 0 -98 -56 -110 Z" fill="{top}"/>'
             f'<path d="M-44 -236 L-66 -150" stroke="{skin}" stroke-width="20" stroke-linecap="round"/><path d="M44 -236 L66 -150" stroke="{skin}" stroke-width="20" stroke-linecap="round"/>'
             f'<rect x="-10" y="-272" width="20" height="24" fill="{skin}"/><circle cx="0" cy="-322" r="54" fill="{skin}"/>'
             f'<path d="M-54 -326 C -54 -386 54 -386 54 -326 C 34 -354 -14 -358 -54 -326 Z" fill="{hair}"/>'
             + (f'<circle cx="0" cy="-384" r="22" fill="{hair}"/>' if bun else '') +
             (f'<circle cx="-19" cy="-322" r="13" fill="none" stroke="{INK}" stroke-width="3"/><circle cx="19" cy="-322" r="13" fill="none" stroke="{INK}" stroke-width="3"/><path d="M-6 -322 H 6" stroke="{INK}" stroke-width="3"/>' if glasses else '') +
             f'<circle cx="-19" cy="-322" r="4" fill="{INK}"/><circle cx="19" cy="-322" r="4" fill="{INK}"/>'
             f'<circle cx="-34" cy="-304" r="8" fill="#f29b9b" opacity=".6"/><circle cx="34" cy="-304" r="8" fill="#f29b9b" opacity=".6"/>'
             f'<path d="M-14 -298 Q 0 -286 14 -298" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>')
    return g(inner, x, base, s)

def basket(color='#c98b4b'):
    return (f'<path d="M-40 0 H 40 L 30 40 H -30 Z" fill="{color}"/><path d="M-34 0 Q 0 -50 34 0" stroke="{color}" stroke-width="7" fill="none"/>'
            + leaf(-14, -6, .5, -30, '#d7263d') + leaf(8, -10, .5, 20, '#f2b134') + leaf(22, -2, .45, 50, '#e8742c'))

def garland(x1, y1, x2, y2, sag=60, colors=('#d7263d', '#f2b134', '#e8742c', '#7cb342'), n=9):
    mx, my = (x1 + x2) / 2, max(y1, y2) + sag
    out = f'<path d="M{x1} {y1} Q {mx} {my} {x2} {y2}" stroke="#8d5a2b" stroke-width="5" fill="none"/>'
    for i in range(1, n + 1):
        t = i / (n + 1); x = (1-t)**2*x1 + 2*(1-t)*t*mx + t**2*x2; y = (1-t)**2*y1 + 2*(1-t)*t*my + t**2*y2
        out += leaf(x, y + 30, .9, (i % 3 - 1) * 15, colors[i % len(colors)])
    return out

def table(x, y, w, color='#b97a45', top='#d39a62'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="28" rx="8" fill="{top}"/>'
            f'<rect x="{x+30}" y="{y+28}" width="24" height="200" fill="{color}"/><rect x="{x+w-54}" y="{y+28}" width="24" height="200" fill="{color}"/>')

def window(x, y, w=260, h=220, frame='#ffffff', view='#bfe3f5'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{frame}"/><rect x="{x+14}" y="{y+14}" width="{w-28}" height="{h-28}" rx="6" fill="{view}"/>'
            f'<rect x="{x+w/2-5}" y="{y+14}" width="10" height="{h-28}" fill="{frame}"/><rect x="{x+14}" y="{y+h/2-5}" width="{w-28}" height="10" fill="{frame}"/>')

def pie(x, y, s=1):
    return g('<ellipse cx="0" cy="10" rx="80" ry="22" fill="#ffffff"/><ellipse cx="0" cy="0" rx="70" ry="20" fill="#d9822b"/><ellipse cx="0" cy="-4" rx="58" ry="14" fill="#e8a14d"/>'
             '<path d="M0 -4 L 58 -4 A 58 14 0 0 1 30 8 Z" fill="#f3c27a"/>', x, y, s)
