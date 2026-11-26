import sys, math; sys.path.insert(0, 'scripts/stories'); from kit import *; from kit import _mix; from animals import *
SLUG = 'the-reindeer-who-was-late'
NORA = dict(skin='#e8b48f', hair='#c0662e', shirt='#d7263d', pants='#2e4a7a', shoes='#5a3a28', pony=True)
GRANDPA = dict(skin='#e2ad88', hair='#e3dfd8', top='#2e7d32', skirt='#4a3f35', glasses=True, bun=False)
MAPLE = dict(color='#8a5f3e', belly='#efe3d0', ears='pointy', tail_tip='#f4ece0')
BIRCH = dict(color='#9b7353', belly='#f2e8d8', ears='pointy', tail_tip='#f4ece0')
JUNIPER = dict(color='#b08765', belly='#f6eee2', ears='pointy', tail_tip='#ffffff')
ANTLER = '#d9c3a0'

def antlers(size=1):
    out = ''
    for sx in (-1, 1):
        bx = 104 + sx * 22
        k = size
        out += (f'<path d="M{bx} -238 Q {bx + sx*30*k:.0f} {-290*k + (1-k)*-238:.0f} {bx + sx*70*k:.0f} {-238 - 92*k:.0f}" stroke="{ANTLER}" stroke-width="{10*k+3:.0f}" fill="none" stroke-linecap="round"/>'
                f'<path d="M{bx + sx*22*k:.0f} {-238 - 34*k:.0f} Q {bx + sx*8*k:.0f} {-238 - 60*k:.0f} {bx + sx*6*k:.0f} {-238 - 76*k:.0f}" stroke="{ANTLER}" stroke-width="{8*k+2:.0f}" fill="none" stroke-linecap="round"/>'
                f'<path d="M{bx + sx*48*k:.0f} {-238 - 66*k:.0f} Q {bx + sx*40*k:.0f} {-238 - 92*k:.0f} {bx + sx*38*k:.0f} {-238 - 108*k:.0f}" stroke="{ANTLER}" stroke-width="{8*k+2:.0f}" fill="none" stroke-linecap="round"/>')
    return out

def reindeer(x, base, s=1, look=None, size=1, harness=True, low=0, closed=False, flip=False):
    look = look or MAPLE
    harn = (f'<path d="M-20 -178 Q -10 -120 -24 -82" stroke="#d7263d" stroke-width="14" fill="none" stroke-linecap="round"/>'
            + ''.join(f'<circle cx="{-18 + i*2}" cy="{-160 + i*26}" r="8" fill="{F("#ffd34d")}"/>' for i in range(3))) if harness else ''
    inner = antlers(size) + walker(0, 0, 1, low=low, closed=closed, snout=False, **look) + harn
    if flip: inner = f'<g transform="scale(-1,1)">{inner}</g>'
    return g(inner, x, base, s)

def grazing_reindeer(x, base, s=1, look=None, flip=False):
    """A reindeer with its head down, scraping snow to find lichen."""
    look = look or JUNIPER
    c, b = look['color'], look['belly']
    dk = _mix(c, -.2)
    leg = lambda lx, col: f'<rect x="{lx-12}" y="-110" width="24" height="110" rx="12" fill="{F(col, "cyl")}"/><ellipse cx="{lx+6}" cy="-4" rx="18" ry="10" fill="{F(_mix(col, -.3))}"/>'
    head = f'<g transform="translate(150,-46)">' + antlers_down() + f'<ellipse cx="0" cy="0" rx="48" ry="40" fill="{F(c)}"/><ellipse cx="22" cy="18" rx="30" ry="22" fill="{F(b)}"/><ellipse cx="34" cy="10" rx="10" ry="8" fill="{INK}"/><path d="M-14 -10 Q -6 -2 2 -10" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="-2" cy="8" r="7" fill="#f28b8b" opacity=".5"/></g>'
    inner = (shadow(0, -2, 130) +
             f'<path d="M-96 -128 Q -130 -150 -140 -170" stroke="{c}" stroke-width="30" fill="none" stroke-linecap="round"/><circle cx="-142" cy="-174" r="15" fill="{F(look["tail_tip"])}"/>'
             + leg(-58, dk) + leg(78, dk) +
             f'<ellipse cx="0" cy="-128" rx="112" ry="56" fill="{F(c)}"/><ellipse cx="14" cy="-100" rx="72" ry="22" fill="{F(b)}"/>'
             + leg(-78, c) + leg(58, c) +
             f'<path d="M70 -140 Q 130 -120 146 -70" stroke="{c}" stroke-width="56" fill="none" stroke-linecap="round"/>' + head)
    if flip: inner = f'<g transform="scale(-1,1)">{inner}</g>'
    return g(inner, x, base, s)

def antlers_down():
    out = ''
    for dx in (-18, 14):
        out += (f'<path d="M{dx} -30 Q {dx-30} -70 {dx-70} -80" stroke="{ANTLER}" stroke-width="11" fill="none" stroke-linecap="round"/>'
                f'<path d="M{dx-34} -64 Q {dx-40} -90 {dx-36} -104" stroke="{ANTLER}" stroke-width="9" fill="none" stroke-linecap="round"/>')
    return out

def pine(x, base, s=1):
    return g(f'<rect x="-12" y="-40" width="24" height="40" fill="{F("#6b4a2f", "cyl")}"/>'
             f'<path d="M-90 -30 L 0 -150 L 90 -30 Z" fill="{F("#2f6a3c")}"/><path d="M-70 -110 L 0 -230 L 70 -110 Z" fill="{F("#357a44")}"/><path d="M-50 -190 L 0 -290 L 50 -190 Z" fill="{F("#3d8a4c")}"/>'
             f'<path d="M-50 -190 L 0 -290 L 50 -190 Q 25 -205 0 -195 Q -25 -205 -50 -190 Z" fill="#ffffff" opacity=".85"/>'
             f'<path d="M-70 -110 Q -35 -126 0 -116 Q 35 -126 70 -110 L 40 -150 L -40 -150 Z" fill="#ffffff" opacity=".6"/>', x, base, s)

def barn(x, base, s=1):
    return g(f'<rect x="-150" y="-220" width="300" height="220" fill="{F("#b23a2e", "vert")}"/><path d="M-170 -210 L 0 -320 L 170 -210 Z" fill="{F("#7a2a22", "vert")}"/>'
             f'<path d="M-170 -210 L 0 -320 L 170 -210" stroke="#ffffff" stroke-width="14" fill="none" stroke-linejoin="round"/>'
             f'<rect x="-60" y="-130" width="120" height="130" fill="{F("#8a2e25", "vert")}"/><path d="M-60 -130 L 60 0 M60 -130 L -60 0" stroke="#ffffff" stroke-width="8"/><rect x="-60" y="-130" width="120" height="130" fill="none" stroke="#ffffff" stroke-width="8"/>', x, base, s)

def snowfall(n=36, seed=3):
    return ''.join(f'<circle cx="{(i*97 + seed*31) % 1200}" cy="{(i*61 + seed*17) % 560}" r="{3 + i % 3}" fill="#fff" opacity=".9"/>' for i in range(n))

def lantern():
    return (f'<path d="M54 -104 V -84" stroke="{INK}" stroke-width="3"/><rect x="38" y="-84" width="32" height="40" rx="6" fill="{F("#ffcf4d")}"/>'
            f'<circle cx="54" cy="-64" r="30" fill="#ffe9a3" opacity=".35"/><rect x="36" y="-88" width="36" height="8" rx="3" fill="#3a2a20"/>')

def sleigh(x, base, s=1):
    return g(f'<path d="M-120 -20 Q -150 -20 -150 -50 M-150 -50 Q -150 -70 -130 -70" stroke="#5a3a28" stroke-width="6" fill="none"/>'
             f'<path d="M-140 -10 H 120 Q 150 -10 150 -40" stroke="#5a3a28" stroke-width="8" fill="none" stroke-linecap="round"/>'
             f'<path d="M-110 -30 L -120 -110 Q -60 -90 0 -100 L 100 -100 Q 120 -60 110 -30 Z" fill="{F("#d7263d", "vert")}"/>'
             f'<path d="M-112 -40 H 108" stroke="#ffd34d" stroke-width="8"/>'
             f'<g transform="translate(66,-100) scale(.5)">' + pine(0, 0, 1) + '</g>', x, base, s)

# 1. Grandpa and Nora wait while little Juniper digs in the snow
s = Scene(sky='#bcd7ea')
s.add(cloud(120, 110, .9), cloud(760, 80, .7))
s.add('<path d="M0 460 Q 300 400 650 450 T 1200 430 V 800 H 0 Z" fill="%s"/>' % F('#e8f1f7', 'vert'))
s.add(barn(170, 520, .9), pine(1120, 520, .8), pine(1000, 500, .6))
s.add('<path d="M0 560 Q 600 520 1200 560 V 800 H 0 Z" fill="%s"/>' % F('#ffffff', 'vert'))
s.add('<path d="M300 540 H 1200 M300 500 H 1200" stroke="#9c7a5a" stroke-width="10"/>' + ''.join(f'<rect x="{x}" y="470" width="16" height="90" fill="{F("#8a6a4a", "cyl")}"/>' for x in (300, 520, 740, 960, 1180)))
s.add(grown_up(400, 720, .95, **GRANDPA), kid(505, 730, .8, **NORA))
s.add(reindeer(770, 680, .75, MAPLE, 1.1), reindeer(930, 720, .75, BIRCH, 1.0))
s.add('<ellipse cx="1150" cy="772" rx="46" ry="12" fill="#cfe0ea"/>')
s.add(grazing_reindeer(1060, 778, .5, JUNIPER))
s.add(snowfall(30, 1))
s.save(SLUG, 'girl-and-grandpa-waiting-for-little-reindeer-on-snowy-farm', 'Nora and Grandpa on a snowy reindeer farm with two reindeer ready in red harnesses while little Juniper digs in the snow')

# 2. Nora waits patiently while Juniper finds lichen
s = Scene(sky='#c7dcec')
s.add('<path d="M0 470 Q 300 420 650 460 T 1200 440 V 800 H 0 Z" fill="%s"/>' % F('#e8f1f7', 'vert'))
s.add(pine(120, 520, .9), pine(300, 500, .7), pine(1100, 520, .9))
s.add('<path d="M0 580 Q 600 540 1200 580 V 800 H 0 Z" fill="%s"/>' % F('#ffffff', 'vert'))
s.add(kid(420, 740, 1.0, **NORA))
s.add(grazing_reindeer(700, 740, .9, JUNIPER))
s.add('<ellipse cx="850" cy="740" rx="90" ry="22" fill="#b9cbd6"/>')
s.add(''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{F("#c8d27a")}"/>' for x, y, r in ((820, 738, 12), (842, 744, 10), (866, 736, 13), (888, 744, 9), (850, 730, 9))))
s.add(snowfall(26, 5))
s.save(SLUG, 'girl-waiting-patiently-while-little-reindeer-eats-lichen', 'Nora standing quietly in the snow while little Juniper the reindeer scrapes the snow and eats lichen')

# 3. The lantern parade on Main Street
s = Scene(sky='#24345e')
s.add(stars([(80, 50), (240, 110), (400, 40), (560, 90), (720, 30), (880, 100), (1040, 50), (1150, 140)]))
for i, (x, w, h, c) in enumerate(((0, 220, 300, '#7d4e3a'), (220, 200, 360, '#3f5f7f'), (420, 240, 320, '#8a6a4a'), (660, 200, 380, '#5a6e4a'), (860, 340, 330, '#7d4e3a'))):
    s.add(f'<rect x="{x}" y="{600-h}" width="{w}" height="{h}" fill="{F(c, "vert")}"/><rect x="{x}" y="{600-h-14}" width="{w}" height="18" fill="#ffffff"/>')
    s.add(''.join(f'<rect x="{x + 30 + j*70}" y="{600-h+50}" width="44" height="56" rx="4" fill="#ffd27a"/>' for j in range(int((w-30)/70))))
lights = ''.join(f'<circle cx="{40 + i*60}" cy="{300 + 30*math.sin(i*0.55)}" r="8" fill="{["#ff5a5a", "#ffd34d", "#6fd3ff", "#8be07a"][i % 4]}"/>' for i in range(20))
s.add('<path d="M0 300 ' + ' '.join(f'L {40 + i*60} {300 + 30*math.sin(i*0.55):.0f}' for i in range(20)) + '" stroke="#2a2a2a" stroke-width="3" fill="none"/>' + lights)
s.add('<rect y="600" width="1200" height="200" fill="%s"/>' % F('#eef4f8', 'vert'))
s.add(grown_up(120, 720, .62, **GRANDPA))
s.add(sleigh(170, 770, .9))
s.add(reindeer(430, 760, .62, BIRCH, 1.0), reindeer(640, 760, .52, JUNIPER, .7), reindeer(850, 760, .62, MAPLE, 1.1))
s.add('<path d="M161 630 Q 300 690 400 700 L 820 700" stroke="#d7263d" stroke-width="5" fill="none"/>')
s.add(kid(1040, 780, .72, **NORA, holding=lantern()))
s.add(snowfall(24, 9))
s.save(SLUG, 'reindeer-team-and-girl-with-lantern-in-christmas-parade', 'Three reindeer pulling a little red sleigh with a Christmas tree down a snowy Main Street while Nora leads with a glowing lantern')
print('ok')
