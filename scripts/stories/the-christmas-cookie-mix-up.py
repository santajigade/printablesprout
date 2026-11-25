import sys, math; sys.path.insert(0, 'scripts/stories'); from kit import *; from kit import _mix; from animals import bush
SLUG = 'the-christmas-cookie-mix-up'
ELI = dict(shirt='#2e7d32', pants='#3d5a80', hair='#3a2a20', skin='#c68e63', pony=False)
ROSIE = dict(shirt='#f06292', pants='#7e57c2', hair='#3a2a20', skin='#c68e63', pony=False, bun=True)
DAD = dict(skin='#c68e63', hair='#3a2a20', top='#d7263d', skirt='#3d4f6b', glasses=False, bun=False)
ORTIZ = dict(skin='#e0ad86', hair='#dcd8d2', top='#8d6e63', skirt='#4a4a5a', glasses=True, bun=False)
def star(x, y, r=26, icing='#d7263d', rot=-90, sprinkles=True):
    pts = ' '.join(f'{x + (r if i % 2 == 0 else r*0.48)*math.cos(math.radians(rot + i*36)):.1f},{y + (r if i % 2 == 0 else r*0.48)*math.sin(math.radians(rot + i*36)):.1f}' for i in range(10))
    pts2 = ' '.join(f'{x + (r*0.78 if i % 2 == 0 else r*0.36)*math.cos(math.radians(rot + i*36)):.1f},{y + (r*0.78 if i % 2 == 0 else r*0.36)*math.sin(math.radians(rot + i*36)):.1f}' for i in range(10))
    sp = ''.join(f'<circle cx="{x+dx}" cy="{y+dy}" r="2.6" fill="#ffd34d"/>' for dx, dy in ((-6, -4), (5, -8), (7, 4), (-4, 7), (0, 0))) if sprinkles else ''
    return f'<polygon points="{pts}" fill="{F("#e3a35a")}"/><polygon points="{pts2}" fill="{F(icing)}"/>' + sp
def bell(x, y, s=1, icing='#f2b134'):
    return g(f'<path d="M-24 18 Q -24 -22 0 -26 Q 24 -22 24 18 Z" fill="{F("#e3a35a")}"/><path d="M-18 14 Q -18 -16 0 -20 Q 18 -16 18 14 Z" fill="{F(icing)}"/><circle cx="0" cy="22" r="7" fill="{F("#e3a35a")}"/>', x, y, s)
def tray(x, y, w=300):
    return f'<rect x="{x}" y="{y}" width="{w}" height="16" rx="8" fill="{F("#b0bec5", "vert")}"/>'
def bowl(x, y, c):
    return f'<path d="M{x-34} {y} Q {x-30} {y+34} {x} {y+36} Q {x+30} {y+34} {x+34} {y} Z" fill="{F("#ffffff", "cyl")}"/><ellipse cx="{x}" cy="{y}" rx="34" ry="9" fill="{c}"/>'
def box(x, y, w=150, h=90, c='#1e88e5', ribbon='#ffd34d', lid_open=False):
    out = (f'<rect x="{x-w/2}" y="{y-h}" width="{w}" height="{h}" rx="8" fill="{F(c, "cyl")}"/>'
           f'<rect x="{x-10}" y="{y-h}" width="20" height="{h}" fill="{ribbon}"/>')
    if lid_open:
        out = (f'<rect x="{x-w/2-4}" y="{y-h-58}" width="{w+8}" height="60" rx="8" fill="{F(_mix(c, -.15), "vert")}" transform="skewX(-8)" transform-origin="{x} {y-h}"/>' + out)
    else:
        out += f'<rect x="{x-w/2-6}" y="{y-h-14}" width="{w+12}" height="22" rx="6" fill="{F(_mix(c, .1), "vert")}"/><rect x="{x-10}" y="{y-h-14}" width="20" height="22" fill="{ribbon}"/>'
        out += f'<ellipse cx="{x-22}" cy="{y-h-20}" rx="22" ry="12" fill="{ribbon}" transform="rotate(-20 {x-22} {y-h-20})"/><ellipse cx="{x+22}" cy="{y-h-20}" rx="22" ry="12" fill="{ribbon}" transform="rotate(20 {x+22} {y-h-20})"/><circle cx="{x}" cy="{y-h-16}" r="9" fill="{_mix(ribbon, -.15)}"/>'
    return out
def xtree(x, base, s=1):
    lights = ''.join(f'<circle cx="{lx}" cy="{ly}" r="9" fill="{F(c)}"/>' for lx, ly, c in ((-40, -90, '#d7263d'), (30, -120, '#ffd34d'), (-20, -170, '#4fc3f7'), (44, -60, '#ba68c8'), (-60, -40, '#ffd34d'), (10, -220, '#d7263d'), (0, -40, '#4fc3f7')))
    inner = (shadow(0, 0, 90) + f'<rect x="-14" y="-30" width="28" height="30" fill="{F("#8d5a2b", "cyl")}"/>'
             f'<path d="M-100 -20 L 0 -150 L 100 -20 Z" fill="{F("#2e7d32")}"/><path d="M-80 -110 L 0 -230 L 80 -110 Z" fill="{F("#388e3c")}"/><path d="M-56 -190 L 0 -290 L 56 -190 Z" fill="{F("#43a047")}"/>'
             + lights + star(0, -298, 30, '#ffd34d', sprinkles=False))
    return g(inner, x, base, s)
def snowview(x, y, w=260, h=220):
    return window(x, y, w, h, view='#c9dcec') + ''.join(f'<circle cx="{x+20+((i*53) % (w-40))}" cy="{y+24+((i*37) % (h-50))}" r="4" fill="#fff"/>' for i in range(16)) + f'<rect x="{x+14}" y="{y+h-46}" width="{w-28}" height="32" fill="#fff"/>'
# 1. Eli and Dad decorating star cookies
s = Scene(bg='#fbe7cf')
s.add('<rect y="610" width="1200" height="190" fill="%s"/>' % F('#e2c29c', 'vert'))
s.add('<rect x="0" y="0" width="1200" height="40" fill="#e9cdb0"/>')
s.add(snowview(820, 90), '<path d="M40 60 Q 300 120 560 60" stroke="#2e7d32" stroke-width="10" fill="none"/>')
for i, c in enumerate(['#d7263d', '#ffd34d', '#4fc3f7', '#d7263d', '#ffd34d']):
    s.add(f'<circle cx="{100 + i*100}" cy="{80 + 24*math.sin(i*1.2)}" r="10" fill="{F(c)}"/>')
s.add(grown_up(390, 720, 1.0, **DAD), kid(700, 700, 1.05, arm_up=True, **ELI))
s.add(table(160, 560, 880))
s.add(tray(200, 532, 280), tray(730, 532, 260))
for i, c in enumerate(['#ffffff', '#d7263d', '#2e7d32', '#ffffff']):
    s.add(star(232 + i*72, 506, 24, c))
for i, c in enumerate(['#d7263d', '#ffffff', '#2e7d32', '#d7263d']):
    s.add(star(762 + i*64, 506, 24, c))
s.add(bowl(535, 524, '#ffffff'), bowl(610, 524, '#d7263d'), bowl(685, 524, '#2e7d32'))
s.add(star(772, 418, 30, '#d7263d'))   # the star Eli holds up
s.save(SLUG, 'boy-and-dad-decorating-christmas-star-cookies', 'Eli and Dad decorating star shaped Christmas cookies with icing and sprinkles at the kitchen table')
# 2. Mr. Ortiz opens the blue box at his snowy door
s = Scene(sky='#b9cfe0')
s.add('<rect x="250" y="80" width="700" height="560" fill="%s"/>' % F('#c97b5a', 'vert'))
s.add('<path d="M220 100 L 600 0 L 980 100 Z" fill="%s"/>' % F('#6d4c41', 'vert'))
s.add('<rect x="470" y="230" width="260" height="410" rx="10" fill="#f5efe6"/><rect x="490" y="250" width="220" height="390" fill="%s"/>' % F('#ffe9b8', 'vert'))
s.add(snowview(280, 250, 160, 150), snowview(760, 250, 160, 150))
s.add('<circle cx="600" cy="180" r="42" fill="none" stroke="#2e7d32" stroke-width="20"/><path d="M584 214 L 600 230 L 616 214" fill="#d7263d"/><circle cx="600" cy="214" r="9" fill="#d7263d"/>')
s.add('<path d="M0 640 Q 600 600 1200 640 V 800 H 0 Z" fill="%s"/>' % F('#f4f8fb', 'vert'))
s.add('<rect x="420" y="630" width="360" height="26" rx="6" fill="#e0e6ea"/>')
s.add(bush(130, 660, .9, '#3f7d4f'), bush(1010, 660, .9, '#3f7d4f'))
s.add('<path d="M70 600 Q 130 560 230 600" stroke="#fff" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M950 600 Q 1010 560 1110 600" stroke="#fff" stroke-width="22" stroke-linecap="round" fill="none"/>')
s.add(grown_up(600, 640, .95, **ORTIZ))
bx, by = 600, 520
s.add(box(bx, by, 150, 70, '#1e88e5', '#ffd34d', lid_open=True))
s.add(star(560, 462, 20, '#d7263d'), star(600, 456, 20, '#ffffff'), star(640, 462, 20, '#2e7d32'))
s.add(kid(330, 760, .95, **ELI), kid(870, 760, .76, arm_up=True, **ROSIE))
s.add(''.join(f'<circle cx="{(i*97) % 1200}" cy="{(i*61) % 600}" r="{3 + i % 3}" fill="#fff" opacity=".9"/>' for i in range(40)))
s.save(SLUG, 'neighbor-opening-blue-cookie-box-at-snowy-front-door', 'Mr. Ortiz smiling as he opens a blue box of fancy cookies at his snowy front door while Eli and Rosie watch')
# 3. Baking together
s = Scene(bg='#f9e2c8')
s.add('<rect y="610" width="1200" height="190" fill="%s"/>' % F('#e2c29c', 'vert'))
s.add(xtree(1060, 640, .95), snowview(80, 90, 240, 200))
s.add(grown_up(330, 720, 1.0, **ORTIZ), kid(620, 700, 1.0, **ELI), kid(890, 700, .78, arm_up=True, **ROSIE))
s.add(table(140, 560, 900))
s.add('<path d="M190 560 L 200 470 Q 240 450 280 470 L 290 560 Z" fill="%s"/><text x="240" y="530" text-anchor="middle" font-family="Trebuchet MS, Arial" font-size="22" font-weight="bold" fill="#8d5a2b">FLOUR</text>' % F('#f5efe6', 'cyl'))
s.add(tray(360, 532, 300))
s.add(bell(400, 508, 1, '#f2b134'), star(462, 508, 24, '#d7263d'), bell(524, 508, 1, '#4fc3f7'), star(586, 508, 24, '#ffffff'), bell(632, 508, .9, '#d7263d'))
s.add(box(755, 562, 110, 56, '#d7263d', '#ffffff'))
s.save(SLUG, 'boy-sister-and-neighbor-baking-christmas-cookies-together', 'Eli, Rosie and Mr. Ortiz baking bell and star cookies together in a warm kitchen with a Christmas tree')
print('ok')
