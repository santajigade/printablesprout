"""Drawing kit for story illustrations (flat, colored, original SVG scenes, 1200x800).

Use it from a small per-story script:
    import sys; sys.path.insert(0, 'scripts/stories'); from kit import *
    s = Scene(sky='#cfe9f7')
    s.add(ground('#9ccf6e', 560)); s.add(tree(260, 560, 1.2)); s.add(kid(620, 600, shirt='#e8742c'))
    s.save('maya-thankful-leaf-garland', 'girl-collecting-autumn-leaves')   # -> public/stories/<slug>/girl-collecting-autumn-leaves.svg

Characters are simple and friendly: round heads, dot eyes, rosy cheeks. Never draw famous characters,
brands or real people. Keep the same colors for a character in every picture of one story.
"""
import math, os, re

STYLE = {'mode': '3d'}   # '3d' = soft shaded toy look (default), 'flat' = plain flat colors
_DEFS = {}

def _mix(c, t):
    """Lighten (t>0) or darken (t<0) a #rrggbb color."""
    r, g_, b = (int(c[i:i+2], 16) for i in (1, 3, 5))
    f = (lambda v: v + (255 - v) * t) if t > 0 else (lambda v: v * (1 + t))
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(f(v)))) for v in (r, g_, b))

def F(c, kind='ball'):
    """Fill for a shape: a shaded gradient in 3d mode. kind: ball (round, light from top left), cyl (left to right), vert (top to bottom)."""
    if STYLE['mode'] != '3d' or not c.startswith('#') or len(c) != 7: return c
    gid = f'{kind}{c[1:]}'
    if gid not in _DEFS:
        if kind == 'ball':
            _DEFS[gid] = f'<radialGradient id="{gid}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="{_mix(c, .45)}"/><stop offset=".45" stop-color="{c}"/><stop offset="1" stop-color="{_mix(c, -.32)}"/></radialGradient>'
        elif kind == 'cyl':
            _DEFS[gid] = f'<linearGradient id="{gid}" x1="0" x2="1"><stop offset="0" stop-color="{_mix(c, .3)}"/><stop offset=".4" stop-color="{c}"/><stop offset="1" stop-color="{_mix(c, -.35)}"/></linearGradient>'
        elif kind == 'sky':
            _DEFS[gid] = f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{_mix(c, -.12)}"/><stop offset="1" stop-color="{_mix(c, .45)}"/></linearGradient>'
        else:
            _DEFS[gid] = f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{_mix(c, .25)}"/><stop offset="1" stop-color="{_mix(c, -.18)}"/></linearGradient>'
    return f'url(#{gid})'

def shadow(x, y, rx=60, ry=None, o=.25):
    """Soft ground shadow under a character or object (3d mode only)."""
    if STYLE['mode'] != '3d': return ''
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry or rx*0.22:.0f}" fill="#3a2a20" opacity="{o}" filter="url(#soft)"/>'

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
INK = '#3a2a20'

class Scene:
    def __init__(self, sky='#cfe9f7', w=1200, h=800, bg=None):
        _DEFS.clear()
        self.w, self.h, self.parts = w, h, [f'<rect width="{w}" height="{h}" fill="{F(bg or sky, "sky")}"/>']
    def add(self, *svg):
        self.parts.extend(svg); return self
    def svg(self, title=''):
        t = f'<title>{title}</title>' if title else ''
        defs = '<defs><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter><filter id="blush" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>' + ''.join(_DEFS.values()) + '</defs>'
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" role="img">{t}{defs}' + ''.join(self.parts) + '</svg>'
    def save(self, slug, name, title=''):
        """name: a short descriptive keyword file name, e.g. 'girl-collecting-autumn-leaves' (no numbers like 1.svg)."""
        name = re.sub(r'[^a-z0-9-]+', '-', str(name).lower()).strip('-')
        d = os.path.join(ROOT, 'public/stories', slug); os.makedirs(d, exist_ok=True)
        p = os.path.join(d, f'{name}.svg'); open(p, 'w').write(self.svg(title)); return p

def g(inner, x=0, y=0, s=1, r=0):
    return f'<g transform="translate({x},{y}) rotate({r}) scale({s})">{inner}</g>'

def ground(color='#9ccf6e', y=560, w=1200, h=800, wave=18):
    return f'<path d="M0 {y} Q {w*0.25} {y-wave} {w*0.5} {y} T {w} {y} V {h} H 0 Z" fill="{F(color, "vert")}"/>'

def sun(x, y, r=60, color='#ffd34d'):
    rays = ''.join(f'<line x1="{x+math.cos(a)*(r+12):.1f}" y1="{y+math.sin(a)*(r+12):.1f}" x2="{x+math.cos(a)*(r+34):.1f}" y2="{y+math.sin(a)*(r+34):.1f}" stroke="{color}" stroke-width="8" stroke-linecap="round"/>' for a in [i*math.pi/6 for i in range(12)])
    return rays + f'<circle cx="{x}" cy="{y}" r="{r}" fill="{F(color)}"/>'

def cloud(x, y, s=1, color='#ffffff'):
    return g(f'<g fill="{color}"><circle cx="0" cy="0" r="34"/><circle cx="40" cy="-14" r="44"/><circle cx="88" cy="0" r="34"/><rect x="0" y="0" width="88" height="34"/></g>', x, y, s)

def leaf(x, y, s=1, r=0, color='#e8742c', vein='#b4501f'):
    return g(f'<path d="M0 -30 C 18 -18 20 10 0 30 C -20 10 -18 -18 0 -30 Z" fill="{F(color)}"/><path d="M0 -24 V 26" stroke="{vein}" stroke-width="2.5" stroke-linecap="round"/>', x, y, s, r)

def tree(x, base, s=1, crown=('#e8742c', '#f2b134', '#d7263d'), trunk='#8d5a2b'):
    c = crown
    inner = (shadow(0, 4, 120) + f'<path d="M-22 0 L-14 -170 L14 -170 L22 0 Z" fill="{F(trunk, "cyl")}"/>'
             f'<circle cx="-70" cy="-200" r="80" fill="{F(c[0])}"/><circle cx="60" cy="-215" r="85" fill="{F(c[1])}"/>'
             f'<circle cx="0" cy="-290" r="90" fill="{F(c[2])}"/><circle cx="-10" cy="-190" r="70" fill="{F(c[1])}"/>')
    return g(inner, x, base, s)

def _eyes(y, dx=19, rx=7, ry=10):
    hl = '' if STYLE['mode'] != '3d' else f'<circle cx="{-dx+2.5}" cy="{y-4}" r="2.8" fill="#fff"/><circle cx="{dx+2.5}" cy="{y-4}" r="2.8" fill="#fff"/>'
    return f'<ellipse cx="{-dx}" cy="{y}" rx="{rx}" ry="{ry}" fill="{INK}"/><ellipse cx="{dx}" cy="{y}" rx="{rx}" ry="{ry}" fill="{INK}"/>' + hl

def _cheeks(y, dx=34, r=10):
    f = ' filter="url(#blush)"' if STYLE['mode'] == '3d' else ''
    return f'<circle cx="{-dx}" cy="{y}" r="{r}" fill="#f28b8b" opacity=".55"{f}/><circle cx="{dx}" cy="{y}" r="{r}" fill="#f28b8b" opacity=".55"{f}/>'

def _shine(y, r):
    if STYLE['mode'] != '3d': return ''
    return f'<path d="M{-r*0.55:.0f} {y-r*0.62:.0f} Q {-r*0.1:.0f} {y-r*0.95:.0f} {r*0.4:.0f} {y-r*0.78:.0f}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35"/>'

def kid(x, base, s=1, skin='#f1c29b', hair='#4a2c1d', shirt='#e8742c', pants='#3d5a80', shoes='#3a2a20', bun=False, pony=True, arm_up=False, holding=''):
    """A child standing, toy-like proportions (big head); base = y of the feet. About 340 px tall at s=1."""
    dk = _mix(skin, -.12) if skin.startswith('#') else skin
    pony_svg = f'<path d="M44 -318 C 84 -318 92 -272 74 -246 C 68 -272 58 -290 38 -298 Z" fill="{F(hair)}"/>' if pony else ''
    arm_r = (f'<path d="M34 -168 Q 56 -196 68 -232" stroke="{dk}" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="68" cy="-236" r="13" fill="{F(skin)}"/>' if arm_up
             else f'<path d="M34 -168 Q 52 -140 54 -108" stroke="{dk}" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="54" cy="-104" r="13" fill="{F(skin)}"/>')
    inner = (shadow(0, -2, 62) +
             f'<rect x="-28" y="-92" width="24" height="80" rx="12" fill="{F(pants, "cyl")}"/><rect x="4" y="-92" width="24" height="80" rx="12" fill="{F(pants, "cyl")}"/>'
             f'<ellipse cx="-18" cy="-10" rx="22" ry="12" fill="{F(shoes)}"/><ellipse cx="18" cy="-10" rx="22" ry="12" fill="{F(shoes)}"/>'
             f'<path d="M-34 -150 Q -38 -170 -26 -188 Q 0 -200 26 -188 Q 38 -170 34 -150 L 44 -86 Q 0 -70 -44 -86 Z" fill="{F(shirt)}"/>'
             f'<path d="M-34 -168 Q -52 -140 -54 -108" stroke="{dk}" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="-54" cy="-104" r="13" fill="{F(skin)}"/>{arm_r}'
             f'<rect x="-11" y="-212" width="22" height="26" rx="6" fill="{dk}"/>'
             f'{pony_svg}<circle cx="0" cy="-268" r="62" fill="{F(skin)}"/>'
             f'<path d="M-62 -276 C -64 -344 64 -344 62 -276 C 40 -308 -12 -316 -62 -276 Z" fill="{F(hair)}"/>' + _shine(-300, 52)
             + (f'<circle cx="0" cy="-338" r="24" fill="{F(hair)}"/>' if bun else '')
             + _eyes(-266) + _cheeks(-246) +
             f'<path d="M-13 -242 Q 0 -230 13 -242" stroke="{INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>{holding}')
    return g(inner, x, base, s)

def grown_up(x, base, s=1, skin='#e7b48c', hair='#b9b4ae', top='#8e6bbf', skirt='#5b4a7a', glasses=True, bun=True):
    """A grown up (grandparent or parent); about 440 px tall at s=1."""
    dk = _mix(skin, -.12) if skin.startswith('#') else skin
    inner = (shadow(0, -2, 74) +
             f'<rect x="-32" y="-122" width="28" height="112" rx="13" fill="{F(skirt, "cyl")}"/><rect x="4" y="-122" width="28" height="112" rx="13" fill="{F(skirt, "cyl")}"/>'
             f'<ellipse cx="-20" cy="-10" rx="26" ry="12" fill="{F(INK)}"/><ellipse cx="20" cy="-10" rx="26" ry="12" fill="{F(INK)}"/>'
             f'<path d="M-46 -230 Q -48 -252 -30 -262 Q 0 -272 30 -262 Q 48 -252 46 -230 L 58 -112 Q 0 -96 -58 -112 Z" fill="{F(top)}"/>'
             f'<path d="M-46 -236 Q -66 -196 -66 -152" stroke="{dk}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="-66" cy="-146" r="14" fill="{F(skin)}"/>'
             f'<path d="M46 -236 Q 66 -196 66 -152" stroke="{dk}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="66" cy="-146" r="14" fill="{F(skin)}"/>'
             f'<rect x="-12" y="-286" width="24" height="28" rx="6" fill="{dk}"/><circle cx="0" cy="-334" r="60" fill="{F(skin)}"/>'
             f'<path d="M-60 -338 C -62 -404 62 -404 60 -338 C 38 -370 -14 -376 -60 -338 Z" fill="{F(hair)}"/>' + _shine(-362, 50)
             + (f'<circle cx="0" cy="-402" r="26" fill="{F(hair)}"/>' if bun else '')
             + _eyes(-332, 21, 6, 8) +
             (f'<circle cx="-21" cy="-332" r="15" fill="none" stroke="{INK}" stroke-width="3"/><circle cx="21" cy="-332" r="15" fill="none" stroke="{INK}" stroke-width="3"/><path d="M-6 -332 H 6" stroke="{INK}" stroke-width="3"/>' if glasses else '')
             + _cheeks(-308, 38, 11) +
             f'<path d="M-15 -304 Q 0 -290 15 -304" stroke="{INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>')
    return g(inner, x, base, s)

def basket(color='#c98b4b'):
    return (f'<path d="M-40 0 H 40 L 30 40 H -30 Z" fill="{F(color, "cyl")}"/><path d="M-34 0 Q 0 -50 34 0" stroke="{color}" stroke-width="7" fill="none"/>'
            + leaf(-14, -6, .5, -30, '#d7263d') + leaf(8, -10, .5, 20, '#f2b134') + leaf(22, -2, .45, 50, '#e8742c'))

def garland(x1, y1, x2, y2, sag=60, colors=('#d7263d', '#f2b134', '#e8742c', '#7cb342'), n=9):
    mx, my = (x1 + x2) / 2, max(y1, y2) + sag
    out = f'<path d="M{x1} {y1} Q {mx} {my} {x2} {y2}" stroke="#8d5a2b" stroke-width="5" fill="none"/>'
    for i in range(1, n + 1):
        t = i / (n + 1); x = (1-t)**2*x1 + 2*(1-t)*t*mx + t**2*x2; y = (1-t)**2*y1 + 2*(1-t)*t*my + t**2*y2
        out += leaf(x, y + 30, .9, (i % 3 - 1) * 15, colors[i % len(colors)])
    return out

def table(x, y, w, color='#b97a45', top='#d39a62'):
    return (shadow(x + w / 2, y + 228, w * 0.55, 18, .18) +
            f'<rect x="{x+30}" y="{y+28}" width="24" height="200" fill="{F(color, "cyl")}"/><rect x="{x+w-54}" y="{y+28}" width="24" height="200" fill="{F(color, "cyl")}"/>'
            f'<rect x="{x}" y="{y}" width="{w}" height="30" rx="10" fill="{F(top, "vert")}"/><rect x="{x}" y="{y+22}" width="{w}" height="10" rx="5" fill="{_mix(top, -.2)}"/>')

def window(x, y, w=260, h=220, frame='#ffffff', view='#bfe3f5'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{frame}"/><rect x="{x+14}" y="{y+14}" width="{w-28}" height="{h-28}" rx="6" fill="{view}"/>'
            f'<rect x="{x+w/2-5}" y="{y+14}" width="10" height="{h-28}" fill="{frame}"/><rect x="{x+14}" y="{y+h/2-5}" width="{w-28}" height="10" fill="{frame}"/>')

def pie(x, y, s=1):
    return g('<ellipse cx="0" cy="10" rx="80" ry="22" fill="#ffffff"/><ellipse cx="0" cy="0" rx="70" ry="20" fill="#d9822b"/><ellipse cx="0" cy="-4" rx="58" ry="14" fill="#e8a14d"/>'
             '<path d="M0 -4 L 58 -4 A 58 14 0 0 1 30 8 Z" fill="#f3c27a"/>', x, y, s)
