"""Friendly original animals for story pictures, built from simple shapes with kit.F() shading.

    import sys; sys.path.insert(0, 'scripts/stories'); from kit import *; from animals import *
    s.add(sitter(400, 600, 1, '#8f8f99', '#e6e2dc', ears='pointy'))      # a sitting wolf, facing you
    s.add(walker(700, 620, 1, '#e8742c', '#fff3e6', ears='pointy', tail_tip='#fff'))   # a fox walking right

All functions take x, base (the y of the feet) and s (scale). flip=True mirrors the animal (faces left).
Never draw famous film or cartoon versions of animals; these are our own simple designs.
"""
from kit import F, g, shadow, _mix, INK

def _flip(inner, flip):
    return f'<g transform="scale(-1,1)">{inner}</g>' if flip else inner

def face(x, y, r, color, muzzle, ears='pointy', eye='#3a2a20', closed=False, smile=True, nose=INK, inner_ear='#f2a7a7', snout=False):
    """A front facing animal head centered at x, y. ears: pointy, round, long, small or none."""
    e = ''
    if ears == 'pointy':
        for sx in (-1, 1):
            e += (f'<path d="M{sx*r*0.2:.0f} {-r*0.7:.0f} L {sx*r*0.78:.0f} {-r*1.35:.0f} L {sx*r*0.95:.0f} {-r*0.35:.0f} Z" fill="{F(color)}"/>'
                  f'<path d="M{sx*r*0.38:.0f} {-r*0.72:.0f} L {sx*r*0.76:.0f} {-r*1.15:.0f} L {sx*r*0.84:.0f} {-r*0.5:.0f} Z" fill="{inner_ear}"/>')
    elif ears == 'round' or ears == 'small':
        k = 0.34 if ears == 'round' else 0.24
        for sx in (-1, 1):
            e += f'<circle cx="{sx*r*0.72:.0f}" cy="{-r*0.72:.0f}" r="{r*k:.0f}" fill="{F(color)}"/><circle cx="{sx*r*0.72:.0f}" cy="{-r*0.72:.0f}" r="{r*k*0.55:.0f}" fill="{inner_ear}"/>'
    elif ears == 'long':
        for sx in (-1, 1):
            e += (f'<ellipse cx="{sx*r*0.42:.0f}" cy="{-r*1.55:.0f}" rx="{r*0.28:.0f}" ry="{r*0.95:.0f}" fill="{F(color)}" transform="rotate({sx*10} {sx*r*0.42:.0f} {-r*0.8:.0f})"/>'
                  f'<ellipse cx="{sx*r*0.42:.0f}" cy="{-r*1.5:.0f}" rx="{r*0.14:.0f}" ry="{r*0.72:.0f}" fill="{inner_ear}" transform="rotate({sx*10} {sx*r*0.42:.0f} {-r*0.8:.0f})"/>')
    dx, ey = r * 0.38, -r * 0.12
    if closed:
        eyes = ''.join(f'<path d="M{sx*dx - r*0.14:.0f} {ey:.0f} Q {sx*dx:.0f} {ey + r*0.12:.0f} {sx*dx + r*0.14:.0f} {ey:.0f}" stroke="{INK}" stroke-width="{max(2.5, r*0.07):.1f}" fill="none" stroke-linecap="round"/>' for sx in (-1, 1))
    else:
        er = r * 0.13
        eyes = ''.join(f'<ellipse cx="{sx*dx:.0f}" cy="{ey:.0f}" rx="{er:.1f}" ry="{er*1.25:.1f}" fill="{eye}"/>' for sx in (-1, 1))
        if eye != INK:
            eyes += ''.join(f'<ellipse cx="{sx*dx:.0f}" cy="{ey:.0f}" rx="{er*0.45:.1f}" ry="{er*1.0:.1f}" fill="{INK}"/>' for sx in (-1, 1))
        eyes += ''.join(f'<circle cx="{sx*dx + er*0.35:.1f}" cy="{ey - er*0.45:.1f}" r="{er*0.38:.1f}" fill="#fff"/>' for sx in (-1, 1))
    k = 1.55 if snout else 1
    mz = f'<ellipse cx="0" cy="{r*0.42*k:.0f}" rx="{r*0.52:.0f}" ry="{r*0.38*k:.0f}" fill="{F(muzzle)}"/>' if muzzle else ''
    mouth = (f'<path d="M{-r*0.2:.0f} {r*0.5*k:.0f} Q 0 {r*0.66*k:.0f} {r*0.2:.0f} {r*0.5*k:.0f}" stroke="{INK}" stroke-width="{max(2.5, r*0.06):.1f}" fill="none" stroke-linecap="round"/>' if smile
             else f'<path d="M0 {r*0.36:.0f} V {r*0.52:.0f}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>')
    cheeks = ''.join(f'<circle cx="{sx*r*0.66:.0f}" cy="{r*0.25:.0f}" r="{r*0.15:.0f}" fill="#f28b8b" opacity=".45" filter="url(#blush)"/>' for sx in (-1, 1))
    shine = f'<path d="M{-r*0.55:.0f} {-r*0.6:.0f} Q {-r*0.1:.0f} {-r*0.95:.0f} {r*0.4:.0f} {-r*0.78:.0f}" stroke="#fff" stroke-width="{max(3, r*0.08):.0f}" fill="none" stroke-linecap="round" opacity=".3"/>'
    tufts = ''.join(f'<path d="M{sx*r*0.7:.0f} {-r*0.2:.0f} L {sx*r*1.22:.0f} {r*0.42:.0f} L {sx*r*0.86:.0f} {r*0.38:.0f} L {sx*r*0.98:.0f} {r*0.7:.0f} L {sx*r*0.45:.0f} {r*0.62:.0f} Z" fill="{F(color)}"/>' for sx in (-1, 1)) if snout else ''
    head = (e + tufts + f'<circle cx="0" cy="0" r="{r}" fill="{F(color)}"/>' + shine + mz + eyes + cheeks +
            f'<ellipse cx="0" cy="{r*0.24*k:.0f}" rx="{r*0.17*k:.0f}" ry="{r*0.12*k:.0f}" fill="{nose}"/>' + mouth)
    return g(head, x, y)

def sitter(x, base, s=1, color='#8f8f99', chest='#e6e2dc', ears='pointy', eye=INK, tail=True, closed=False, flip=False, muzzle=None, snout=False):
    """A four legged animal sitting and facing the viewer (wolf, fox, panther, cub). About 290 px tall at s=1."""
    dk = _mix(color, -.18)
    t = (f'<path d="M48 -24 Q 130 -30 118 -110" stroke="{dk}" stroke-width="{34 if snout else 26}" fill="none" stroke-linecap="round"/>' if tail else '')
    inner = (shadow(0, -2, 80) + t +
             f'<ellipse cx="-46" cy="-44" rx="34" ry="42" fill="{F(dk)}"/><ellipse cx="46" cy="-44" rx="34" ry="42" fill="{F(dk)}"/>'
             f'<ellipse cx="0" cy="-95" rx="62" ry="88" fill="{F(color)}"/>'
             f'<ellipse cx="0" cy="-110" rx="36" ry="60" fill="{F(chest)}"/>'
             f'<rect x="-36" y="-80" width="24" height="76" rx="12" fill="{F(color, "cyl")}"/><rect x="12" y="-80" width="24" height="76" rx="12" fill="{F(color, "cyl")}"/>'
             f'<ellipse cx="-26" cy="-8" rx="22" ry="12" fill="{F(color)}"/><ellipse cx="26" cy="-8" rx="22" ry="12" fill="{F(color)}"/>'
             + face(0, -205, 54, color, muzzle or chest, ears, eye, closed, snout=snout))
    return g(_flip(inner, flip), x, base, s)

def bear(x, base, s=1, color='#8d5a2b', belly='#d9b48a', closed=False, flip=False):
    """A big friendly bear sitting and facing the viewer. About 380 px tall at s=1."""
    inner = (shadow(0, -2, 120) +
             f'<ellipse cx="0" cy="-120" rx="100" ry="118" fill="{F(color)}"/>'
             f'<ellipse cx="0" cy="-105" rx="62" ry="78" fill="{F(belly)}"/>'
             f'<path d="M-86 -170 Q -122 -120 -96 -78" stroke="{_mix(color, -.12)}" stroke-width="40" fill="none" stroke-linecap="round"/>'
             f'<path d="M86 -170 Q 122 -120 96 -78" stroke="{_mix(color, -.12)}" stroke-width="40" fill="none" stroke-linecap="round"/>'
             f'<ellipse cx="-54" cy="-16" rx="42" ry="22" fill="{F(color)}"/><ellipse cx="54" cy="-16" rx="42" ry="22" fill="{F(color)}"/>'
             f'<ellipse cx="-54" cy="-16" rx="22" ry="12" fill="{belly}"/><ellipse cx="54" cy="-16" rx="22" ry="12" fill="{belly}"/>'
             + face(0, -268, 70, color, belly, 'round', INK, closed, inner_ear=belly))
    return g(_flip(inner, flip), x, base, s)

def walker(x, base, s=1, color='#8f8f99', belly='#e6e2dc', ears='pointy', eye=INK, tail_tip=None, run=0, low=0, closed=False, flip=False, snout=True):
    """A four legged animal seen from the side, walking to the right, head turned to the viewer.
    run: 0 standing, 1 running (legs stretched). low: 0 standing, 1 lying down. About 280 px tall at s=1."""
    dk = _mix(color, -.2)
    lift = low * 70
    def leg(lx, ang, far=False):
        c = dk if far else color
        if low: return f'<ellipse cx="{lx + 14}" cy="-10" rx="38" ry="14" fill="{F(c)}"/>'
        return f'<g transform="rotate({ang} {lx} -110)"><rect x="{lx-12}" y="-110" width="24" height="110" rx="12" fill="{F(c, "cyl")}"/><ellipse cx="{lx+6}" cy="-4" rx="18" ry="10" fill="{F(c)}"/></g>'
    a = 28 * run
    tail = f'<path d="M-96 {-128+lift} Q -170 {-130+lift} -184 {-200+lift*0.6}" stroke="{color}" stroke-width="36" fill="none" stroke-linecap="round"/>'
    if tail_tip: tail += f'<circle cx="-184" cy="{-204+lift*0.6}" r="17" fill="{F(tail_tip)}"/>'
    inner = (shadow(0, -2, 130) + tail + leg(-58, a, True) + leg(78, -a, True) +
             f'<ellipse cx="0" cy="{-128+lift}" rx="112" ry="56" fill="{F(color)}"/>'
             f'<ellipse cx="14" cy="{-100+lift}" rx="72" ry="22" fill="{F(belly)}"/>'
             + leg(-78, -a) + leg(58, a) +
             f'<path d="M60 {-140+lift} Q 92 {-160+lift} 100 {-186+lift}" stroke="{color}" stroke-width="58" fill="none" stroke-linecap="round"/>' +
             face(104, -196 + lift, 52, color, belly, ears, eye, closed, snout=snout))
    return g(_flip(inner, flip), x, base, s)

def hare(x, base, s=1, color='#c9a27e', belly='#f4e6d4', run=0, sleep=False, flip=False):
    """A hare from the side with long ears, head turned to the viewer. sleep=True lies it down with closed eyes."""
    if sleep:
        inner = (shadow(0, -2, 120) +
                 f'<ellipse cx="0" cy="-48" rx="105" ry="46" fill="{F(color)}"/><ellipse cx="10" cy="-30" rx="70" ry="16" fill="{F(belly)}"/>'
                 f'<circle cx="-104" cy="-62" r="20" fill="{F("#ffffff")}"/>'
                 f'<ellipse cx="-56" cy="-10" rx="52" ry="14" fill="{F(_mix(color, -.15))}"/><ellipse cx="70" cy="-10" rx="34" ry="12" fill="{F(_mix(color, -.15))}"/>'
                 + f'<ellipse cx="30" cy="-96" rx="80" ry="17" fill="{F(color)}" transform="rotate(-8 30 -96)"/><ellipse cx="30" cy="-96" rx="62" ry="8" fill="#f2a7a7" transform="rotate(-8 30 -96)"/>'
                 + f'<ellipse cx="18" cy="-74" rx="72" ry="15" fill="{F(_mix(color, .06))}" transform="rotate(-4 18 -74)"/><ellipse cx="18" cy="-74" rx="56" ry="7" fill="#f2a7a7" transform="rotate(-4 18 -74)"/>'
                 + face(112, -52, 46, color, belly, 'none', closed=True))
        return g(_flip(inner, flip), x, base, s)
    a = 34 * run
    inner = (shadow(0, -2, 110) +
             f'<g transform="rotate({-a*1.6} 30 -80)"><rect x="20" y="-86" width="22" height="86" rx="11" fill="{F(_mix(color, -.15), "cyl")}"/></g>'
             f'<circle cx="-92" cy="-112" r="22" fill="{F("#ffffff")}"/>'
             f'<ellipse cx="-10" cy="-100" rx="88" ry="54" fill="{F(color)}" transform="rotate({-8 - 6*run} -10 -100)"/>'
             f'<ellipse cx="0" cy="-78" rx="56" ry="20" fill="{F(belly)}"/>'
             + (f'<ellipse cx="-92" cy="-40" rx="56" ry="16" fill="{F(_mix(color, -.08))}" transform="rotate(-24 -92 -40)"/>' if run else f'<ellipse cx="-60" cy="-12" rx="56" ry="16" fill="{F(_mix(color, -.08))}"/>')
             + f'<g transform="rotate({-a*1.3} 50 -80)"><rect x="40" y="-86" width="22" height="86" rx="11" fill="{F(color, "cyl")}"/><ellipse cx="56" cy="-4" rx="18" ry="9" fill="{F(color)}"/></g>'
             + face(86, -178, 50, color, belly, 'long'))
    return g(_flip(inner, flip), x, base, s)

def tortoise(x, base, s=1, shell='#7cb342', skin='#a5c97a', rim='#5b8a2e', flip=False):
    """A tortoise from the side walking right, with a patterned dome shell and a front facing head."""
    pat = ''.join(f'<path d="{d}" stroke="{rim}" stroke-width="5" fill="none" stroke-linejoin="round"/>' for d in (
        'M-34 -112 L 0 -126 L 34 -112 L 30 -78 L -30 -78 Z', 'M-30 -78 L -64 -60', 'M30 -78 L 64 -60', 'M-34 -112 L -58 -118', 'M34 -112 L 58 -118', 'M0 -126 V -146'))
    inner = (shadow(0, -2, 120) +
             f'<path d="M-96 -46 L -122 -40 L -96 -34 Z" fill="{skin}"/>'
             f'<rect x="-66" y="-60" width="34" height="60" rx="16" fill="{F(_mix(skin, -.15), "cyl")}"/><rect x="40" y="-60" width="34" height="60" rx="16" fill="{F(_mix(skin, -.15), "cyl")}"/>'
             f'<path d="M80 -56 Q 110 -70 118 -100" stroke="{skin}" stroke-width="36" fill="none" stroke-linecap="round"/>'
             f'<path d="M-100 -40 Q -100 -160 0 -160 Q 100 -160 100 -40 Z" fill="{F(shell)}"/>' + pat +
             f'<rect x="-108" y="-50" width="216" height="20" rx="10" fill="{F(rim, "vert")}"/>'
             f'<rect x="-48" y="-40" width="34" height="40" rx="16" fill="{F(skin, "cyl")}"/><rect x="58" y="-40" width="34" height="40" rx="16" fill="{F(skin, "cyl")}"/>'
             + face(124, -118, 42, skin, None, 'none', inner_ear=skin))
    return g(_flip(inner, flip), x, base, s)

def boulder(x, base, w=300, h=150, color='#9a8f84'):
    return (shadow(x, base, w * 0.55, 18, .2) +
            f'<path d="M{x-w/2} {base} C {x-w/2} {base-h*0.9} {x-w*0.25} {base-h} {x-w*0.05} {base-h} C {x+w*0.3} {base-h} {x+w/2} {base-h*0.75} {x+w/2} {base} Z" fill="{F(color)}"/>')

def bush(x, base, s=1, color='#5f9e45'):
    return g(f'<circle cx="-50" cy="-40" r="48" fill="{F(color)}"/><circle cx="20" cy="-62" r="60" fill="{F(_mix(color, .1))}"/><circle cx="80" cy="-36" r="44" fill="{F(color)}"/><ellipse cx="15" cy="-26" rx="98" ry="28" fill="{F(_mix(color, -.08))}"/>', x, base, s)

def flag(x, base, h=180, color='#d7263d', left=False):
    d = -1 if left else 1
    return (f'<rect x="{x-5}" y="{base-h}" width="10" height="{h}" fill="{F("#8d5a2b", "cyl")}"/>'
            f'<path d="M{x+5*d} {base-h} L {x+90*d} {base-h+28} L {x+5*d} {base-h+56} Z" fill="{F(color)}"/>')

def moon(x, y, r=60):
    return f'<circle cx="{x}" cy="{y}" r="{r*1.7}" fill="#fff8d6" opacity=".18"/><circle cx="{x}" cy="{y}" r="{r}" fill="{F("#fff4c2")}"/><circle cx="{x-18}" cy="{y+10}" r="{r*0.16}" fill="#efe2a8"/><circle cx="{x+20}" cy="{y-16}" r="{r*0.1}" fill="#efe2a8"/>'

def stars(points, r=4):
    return ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff8d6"/>' for x, y in points)
