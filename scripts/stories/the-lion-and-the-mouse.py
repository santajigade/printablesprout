import sys; sys.path.insert(0, 'scripts/stories'); from kit import *; from kit import _mix; from animals import *
SLUG = 'the-lion-and-the-mouse'
LION = dict(color='#e0a84c', belly='#f6dfb0', ears='round', tail_tip='#a5652a', snout=True)
MANE = '#a5652a'
MOUSE = dict(color='#9e9aa6', chest='#ece4dc', ears='round')
SAVANNA = ('#8fb24a', '#a6c35a', '#7ea13f')

def lion(x, base, s=1, low=0, closed=False, flip=False, sad=False):
    """Our own friendly lion: a side view walker with a round mane drawn behind the head."""
    lift = low * 70
    mane = ''.join(f'<circle cx="{104 + 70*__import__("math").cos(a/8*6.283):.0f}" cy="{-196 + lift + 70*__import__("math").sin(a/8*6.283):.0f}" r="34" fill="{F(MANE)}"/>' for a in range(8))
    mane += f'<circle cx="104" cy="{-196 + lift}" r="78" fill="{F(MANE)}"/>'
    body = walker(0, 0, 1, low=low, closed=closed, **LION)
    brow = (f'<path d="M78 {-216+lift} Q 86 {-224+lift} 96 {-220+lift}" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>'
            f'<path d="M112 {-220+lift} Q 122 {-224+lift} 130 {-216+lift}" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>') if sad else ''
    inner = mane + body + brow
    if flip: inner = f'<g transform="scale(-1,1)">{inner}</g>'
    return g(inner, x, base, s)

def mouse(x, base, s=1, flip=False, closed=False):
    tail = f'<path d="M40 -20 Q 110 -10 120 -70" stroke="#c9a6a6" stroke-width="8" fill="none" stroke-linecap="round"/>'
    inner = tail + sitter(0, 0, 1, tail=False, closed=closed, **MOUSE)
    if flip: inner = f'<g transform="scale(-1,1)">{inner}</g>'
    return g(inner, x, base, s)

def acacia(x, base, s=1):
    return g(f'<path d="M-16 0 Q -10 -120 -6 -200 L 8 -200 Q 10 -120 18 0 Z" fill="{F("#7a5232", "cyl")}"/>'
             f'<path d="M0 -150 Q -60 -190 -90 -230" stroke="#7a5232" stroke-width="14" fill="none" stroke-linecap="round"/>'
             f'<path d="M4 -160 Q 60 -200 96 -236" stroke="#7a5232" stroke-width="14" fill="none" stroke-linecap="round"/>'
             f'<ellipse cx="0" cy="-250" rx="190" ry="46" fill="{F("#6f9a3a")}"/><ellipse cx="-70" cy="-266" rx="110" ry="36" fill="{F("#7fae44")}"/><ellipse cx="80" cy="-262" rx="100" ry="34" fill="{F("#7fae44")}"/>', x, base, s)

def grass(pts):
    return ''.join(f'<path d="M{x} {y} l -8 -26 M{x} {y} l 0 -32 M{x} {y} l 9 -26" stroke="#6f9a3a" stroke-width="4" stroke-linecap="round"/>' for x, y in pts)

GR = [(60, 720), (180, 770), (320, 700), (480, 780), (900, 760), (1040, 715), (1150, 780), (700, 790)]

# 1. The little mouse runs over the sleeping lion
s = Scene(sky='#f8d9a0')
s.add(sun(1030, 140, 60, '#ffcf4d'), cloud(140, 120, .8, '#fff6e6'))
s.add('<path d="M0 480 Q 300 420 650 470 T 1200 450 V 800 H 0 Z" fill="%s"/>' % F('#c9c26a', 'vert'))
s.add(ground('#b5b55a', 580), grass(GR))
s.add(acacia(250, 600, 1.1))
s.add(lion(560, 720, 1.35, low=1, closed=True))
s.add(mouse(560, 570, .32))
s.add('<text x="760" y="380" font-family="Trebuchet MS, Arial" font-size="40" font-weight="bold" fill="#8a5a2b" opacity=".7">z z z</text>')
s.save(SLUG, 'little-mouse-running-over-sleeping-lion', 'A tiny grey mouse running across the back of a big sleeping lion under a tree on the grassland')

# 2. The lion holds the mouse under his paw and lets it go
s = Scene(sky='#f8d9a0')
s.add(sun(170, 140, 56, '#ffcf4d'), cloud(800, 110, .8, '#fff6e6'))
s.add('<path d="M0 480 Q 300 420 650 470 T 1200 450 V 800 H 0 Z" fill="%s"/>' % F('#c9c26a', 'vert'))
s.add(ground('#b5b55a', 580), grass(GR))
s.add(acacia(1020, 600, 1.0))
s.add(lion(420, 720, 1.4, low=1))
s.add(f'<ellipse cx="640" cy="704" rx="46" ry="20" fill="{F(LION["color"])}"/>')   # the lion's big front paw
s.add(mouse(720, 716, .36, flip=True))
s.add('<path d="M790 600 C 770 580 780 556 800 568 C 820 556 830 580 810 600 L 800 610 Z" fill="%s"/>' % F('#f06292'))
s.save(SLUG, 'lion-letting-little-mouse-go-from-under-paw', 'A big lion lying on the grass lifting his paw to let a tiny mouse go free')

# 3. The mouse chews the ropes and frees the lion
s = Scene(sky='#cfe2f0')
s.add(cloud(120, 110, .9), cloud(900, 80, .7))
s.add('<path d="M0 480 Q 300 420 650 470 T 1200 450 V 800 H 0 Z" fill="%s"/>' % F('#a7c26a', 'vert'))
s.add(ground('#a0b85a', 580), grass(GR))
s.add(acacia(1000, 640, 1.35))
s.add(lion(640, 740, 1.25, low=1, sad=True, flip=True))
rope = '#c9a86a'
for bx in (600, 720):   # ropes wrapped around the lion's body
    s.add(f'<path d="M{bx-12} 600 Q {bx+14} 660 {bx} 735" stroke="{rope}" stroke-width="13" fill="none" stroke-linecap="round"/>')
s.add(f'<path d="M728 650 Q 860 620 985 560" stroke="{rope}" stroke-width="12" fill="none" stroke-linecap="round"/>')   # rope to the tree
s.add(f'<rect x="976" y="530" width="24" height="60" rx="8" fill="none" stroke="{rope}" stroke-width="12"/>')
s.add(f'<path d="M872 616 l -14 -26 M950 590 l 12 -28" stroke="{rope}" stroke-width="10" stroke-linecap="round"/>')   # the chewed, broken ends
s.add(mouse(915, 640, .3))
s.add(''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="#c9a86a"/>' for x, y in ((830, 660), (910, 650), (870, 668))))
s.save(SLUG, 'brave-mouse-chewing-ropes-to-free-lion', 'The little mouse chewing through the hunters ropes to set the trapped lion free beside a tree')
print('ok')
