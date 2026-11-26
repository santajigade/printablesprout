import sys, math; sys.path.insert(0, 'scripts/stories'); from kit import *; from kit import _mix; from animals import *
SLUG = 'mowgli-learns-the-jungle-law'
# Same character colors as mowgli-joins-the-wolf-pack
MOWGLI = dict(skin='#a86b45', hair='#2a1a12', shirt='#d7263d', pants='#a86b45', shoes='#8a5535', pony=False)
BAGHEERA = dict(color='#2b2b33', chest='#3b3b46', ears='small', eye='#e8c547')
MONKEY = dict(color='#8a6a4a', chest='#e3c9a3', ears='round')
KAA = '#b59a4a'
NIGHT = '#2c3e66'

def palm(x, base, s=1, c='#2f5d3a'):
    fronds = ''.join(f'<ellipse cx="{dx}" cy="{dy}" rx="90" ry="22" fill="{F(c)}" transform="rotate({r} {dx} {dy})"/>' for dx, dy, r in ((-70, -330, 20), (70, -330, -20), (-60, -370, -25), (60, -370, 25), (0, -390, 90)))
    return g(f'<path d="M-14 0 Q -20 -180 -6 -340 L 8 -340 Q 0 -180 14 0 Z" fill="{F("#6b4a2f", "cyl")}"/>' + fronds, x, base, s)

def canopy(y, c1='#2f6a3c', c2='#3d8a4c'):
    return ''.join(f'<circle cx="{x}" cy="{y + (i % 2) * 30}" r="{90 + (i % 3) * 20}" fill="{F(c1 if i % 2 else c2)}"/>' for i, x in enumerate(range(-40, 1300, 140)))

def monkey(x, base, s=1, flip=False, closed=False):
    tail = f'<path d="M40 -30 Q 120 -20 110 -110 Q 104 -150 80 -140" stroke="{_mix(MONKEY["color"], -.15)}" stroke-width="14" fill="none" stroke-linecap="round"/>'
    inner = tail + sitter(0, 0, 1, tail=False, closed=closed, muzzle=MONKEY['chest'], **MONKEY)
    if flip: inner = f'<g transform="scale(-1,1)">{inner}</g>'
    return g(inner, x, base, s)

def hanging_monkey(x, y, s=1, flip=False, reach=None):
    """A monkey hanging from a branch at (x, y) by one arm; reach = (dx, dy) of its free hand."""
    c, ch = MONKEY['color'], MONKEY['chest']
    dk = _mix(c, -.15)
    rx, ry = reach or (60, 150)
    inner = (f'<path d="M0 0 Q -6 40 -4 80" stroke="{dk}" stroke-width="16" fill="none" stroke-linecap="round"/>'
             f'<path d="M10 110 Q {rx*0.6:.0f} {ry*0.85:.0f} {rx} {ry}" stroke="{dk}" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="{rx}" cy="{ry}" r="10" fill="{F(c)}"/>'
             f'<path d="M-10 190 Q -60 230 -40 280" stroke="{dk}" stroke-width="12" fill="none" stroke-linecap="round"/>'
             f'<ellipse cx="0" cy="150" rx="40" ry="56" fill="{F(c)}"/><ellipse cx="0" cy="158" rx="24" ry="38" fill="{F(ch)}"/>'
             f'<path d="M-16 196 Q -26 230 -20 250 M16 196 Q 26 230 20 250" stroke="{dk}" stroke-width="16" fill="none" stroke-linecap="round"/>'
             f'<circle cx="-4" cy="0" r="12" fill="{F(c)}"/>'
             + face(0, 74, 40, c, ch, 'round'))
    if flip: inner = f'<g transform="scale(-1,1)">{inner}</g>'
    return g(inner, x, y, s)

def kite_bird(x, y, s=1):
    return g(f'<path d="M0 0 Q -60 -40 -130 -10 Q -70 -6 -20 14 Z" fill="{F("#8a5a32")}"/><path d="M0 0 Q 60 -40 130 -10 Q 70 -6 20 14 Z" fill="{F("#8a5a32")}"/>'
             f'<ellipse cx="0" cy="8" rx="16" ry="30" fill="{F("#a8743f")}"/><path d="M-12 34 L 0 56 L 12 34 Z" fill="#8a5a32"/>'
             f'<circle cx="0" cy="-18" r="13" fill="{F("#c99a62")}"/><path d="M-4 -12 L 0 -2 L 4 -12 Z" fill="#ffcf4d"/><circle cx="-5" cy="-21" r="2.6" fill="{INK}"/><circle cx="5" cy="-21" r="2.6" fill="{INK}"/>', x, y, s)

def python_snake(x, y, s=1, flip=False):
    """Kaa: a big rock python in loose coils, head raised, friendly calm eyes."""
    c, dk, belly = KAA, _mix(KAA, -.3), '#e9dcaa'
    body = 'M-260 60 C -200 120 -60 120 -20 60 C 20 0 140 10 160 60 C 180 110 60 130 40 80 C 20 30 90 -60 120 -140'
    spots = ''.join(f'<ellipse cx="{px}" cy="{py}" rx="16" ry="10" fill="{dk}" opacity=".7" transform="rotate({r} {px} {py})"/>' for px, py, r in ((-220, 88, 20), (-150, 106, 5), (-80, 98, -10), (-10, 50, -50), (70, 22, 10), (140, 44, 60), (130, 104, 160), (60, 104, -150), (58, 20, -80), (90, -60, -70)))
    head = (f'<g transform="translate(124,-150) rotate(-10)"><ellipse cx="0" cy="0" rx="46" ry="34" fill="{F(c)}"/><ellipse cx="18" cy="14" rx="26" ry="14" fill="{F(belly)}"/>'
            f'<circle cx="-6" cy="-12" r="9" fill="#ffffff"/><circle cx="-4" cy="-12" r="5" fill="{INK}"/><circle cx="22" cy="-14" r="9" fill="#ffffff"/><circle cx="24" cy="-14" r="5" fill="{INK}"/>'
            f'<path d="M14 18 Q 26 24 38 16" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/></g>')
    inner = (shadow(-40, 130, 220, 30) + f'<path d="{body}" stroke="{dk}" stroke-width="64" fill="none" stroke-linecap="round"/>'
             f'<path d="{body}" stroke="{c}" stroke-width="54" fill="none" stroke-linecap="round"/>'
             f'<path d="{body}" stroke="{_mix(c, .35)}" stroke-width="14" fill="none" stroke-linecap="round" opacity=".5" transform="translate(-6,-12)"/>' + spots + head)
    if flip: inner = f'<g transform="scale(-1,1)">{inner}</g>'
    return g(inner, x, y, s)

# 1. Baloo teaches Mowgli the Master Words in a sunny clearing
s = Scene(sky='#bfe3c9')
s.add('<rect width="1200" height="800" fill="%s"/>' % F('#bfe3c9', 'sky'))
s.add(palm(90, 600, 1.0), palm(1110, 600, .95), palm(980, 560, .7, '#2a5636'))
s.add(canopy(-20))
s.add(ground('#7fb069', 560))
s.add('<path d="M720 250 Q 900 230 1200 260" stroke="#6b4a2f" stroke-width="26" fill="none" stroke-linecap="round"/>')
s.add(walker(960, 300, .55, low=1, closed=True, snout=False, color=BAGHEERA['color'], belly=BAGHEERA['chest'], ears='small'))
s.add(bear(420, 720, .95))
s.add(kid(700, 730, .85, arm_up=True, **MOWGLI))
s.add(''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="{c}"/><circle cx="{x}" cy="{y}" r="4" fill="#ffd34d"/>' for x, y, c in ((120, 720, '#f06292'), (240, 770, '#fff'), (900, 740, '#ba68c8'), (1060, 770, '#f06292'), (560, 780, '#fff'))))
s.save(SLUG, 'baloo-the-bear-teaching-mowgli-the-master-words', 'Baloo the brown bear sitting in a sunny jungle clearing teaching Mowgli while Bagheera the black panther naps on a branch')

# 2. The monkeys carry Mowgli away through the treetops, Rann the kite watches
s = Scene(sky='#a9d8ee')
s.add(cloud(880, 90, .8), kite_bird(980, 150, 1.0))
s.add(canopy(720, '#2f6a3c', '#3d8a4c'))
s.add('<path d="M-20 240 Q 300 200 640 250 Q 900 290 1220 230" stroke="#6b4a2f" stroke-width="30" fill="none" stroke-linecap="round"/>')
s.add('<path d="M-20 160 Q 160 140 330 180" stroke="#6b4a2f" stroke-width="22" fill="none" stroke-linecap="round"/>')
for x, y, r in ((80, 230, -20), (220, 215, 30), (520, 236, -30), (760, 262, 20), (1010, 262, -25), (1150, 240, 30), (260, 170, 10)):
    s.add(f'<ellipse cx="{x}" cy="{y}" rx="44" ry="16" fill="{F("#4c9a55")}" transform="rotate({r} {x} {y})"/>')
s.add(hanging_monkey(400, 232, .95, reach=(103, 250)))
s.add(hanging_monkey(640, 250, .95, flip=True, reach=(80, 170)))
s.add(g(kid(0, 0, .72, arm_up=True, **MOWGLI), 539, 586, 1, -8))
s.add(monkey(150, 214, .42), monkey(860, 262, .42, flip=True), monkey(1080, 254, .38))
s.save(SLUG, 'monkeys-carrying-mowgli-through-jungle-treetops', 'Two monkeys swinging from a branch carrying Mowgli through the jungle treetops while Rann the kite flies overhead')

# 3. Kaa helps Baloo and Bagheera bring Mowgli home from the Cold Lairs
s = Scene(sky=NIGHT)
s.add(stars([(80, 60), (220, 140), (330, 50), (480, 110), (610, 40), (700, 160), (820, 70), (1150, 230), (560, 200), (150, 250)]), moon(1040, 120, 62))
stone = '#9a8f84'
s.add(f'<path d="M0 560 V 300 L 60 280 L 90 320 L 150 300 V 560 Z" fill="{F(stone, "vert")}"/>')
s.add(f'<rect x="150" y="380" width="300" height="180" fill="{F("#8a8178", "vert")}"/>' + ''.join(f'<path d="M{170 + i*92} 560 V 450 A 36 36 0 0 1 {242 + i*92} 450 V 560 Z" fill="#2a2420"/>' for i in range(3)))
s.add(f'<path d="M150 380 L 190 360 L 230 384 L 300 350 L 360 380 L 410 362 L 450 380 Z" fill="{F("#8a8178", "vert")}"/>')
s.add(f'<rect x="830" y="330" width="250" height="230" fill="{F("#ece6dc", "vert")}"/><path d="M820 330 Q 955 180 1090 330 Z" fill="{F("#f4efe6")}"/><path d="M940 272 L 952 288 L 944 302 L 958 320" stroke="#a79e92" stroke-width="5" fill="none" stroke-linecap="round"/>')
s.add(''.join(f'<rect x="{850 + i*56}" y="380" width="40" height="140" rx="20" fill="#d6cfc3"/>' for i in range(4)))
s.add(ground('#556b4a', 580))
s.add(monkey(60, 290, .3), monkey(250, 372, .3, flip=True), monkey(400, 374, .28))
s.add(python_snake(560, 610, 1.0, flip=True))
s.add(bear(280, 760, .7))
s.add(kid(560, 770, .68, arm_up=True, **MOWGLI))
s.add(sitter(800, 770, .62, flip=True, **BAGHEERA))
s.save(SLUG, 'kaa-the-python-helps-baloo-and-bagheera-rescue-mowgli', 'Kaa the big rock python by moonlight in the old ruined city as Baloo the bear, Mowgli and Bagheera the panther stand together and the monkeys run away')
print('ok')
