import sys; sys.path.insert(0, 'scripts/stories'); from kit import *; from animals import *
SLUG = 'the-tortoise-and-the-hare'
HARE = dict(color='#c9a27e', belly='#f4e6d4')
TORT = dict(shell='#7cb342', skin='#b5d68a', rim='#4f7f26')
FOX = dict(color='#e8742c', chest='#fff3e6', ears='pointy', snout=True)
GREEN = ('#7cb342', '#9ccc65', '#689f38')
def path(y=640):
    return f'<path d="M0 {y} Q 600 {y-40} 1200 {y}" stroke="#e6cf9a" stroke-width="70" fill="none" stroke-linecap="round"/>'
def flowers(pts):
    return ''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="{c}"/><circle cx="{x}" cy="{y}" r="4" fill="#ffd34d"/>' for x, y, c in pts)
FL = [(90, 720, '#f06292'), (260, 760, '#fff'), (980, 735, '#ba68c8'), (1110, 770, '#f06292'), (540, 775, '#fff'), (700, 590, '#ba68c8'), (420, 585, '#fff')]
# 1. Start line: hare teasing, tortoise smiling, fox judge with a flag
s = Scene(sky='#cfe9f7')
s.add(sun(1060, 120, 52), cloud(150, 130, 1.0), cloud(640, 80, .7))
s.add('<path d="M0 470 Q 300 380 650 460 T 1200 430 V 800 H 0 Z" fill="%s"/>' % F('#b7dc8a', 'vert'))
s.add(ground('#a8d47a', 560), path(660), flowers(FL))
s.add(tree(1080, 560, .7, GREEN))
s.add('<rect x="150" y="600" width="900" height="10" rx="5" fill="#ffffff" opacity=".9"/>')
s.add(boulder(150, 610, 200, 110))
s.add(flag(930, 650, 220, left=True), sitter(1040, 660, 1.0, **FOX))
s.add(tortoise(330, 690, 1.15, **TORT), hare(690, 690, 1.15, **HARE))
s.save(SLUG, 'hare-teasing-tortoise-at-race-start-line-fox-judge', 'A tall hare and a smiling tortoise at the start line of a race while a fox holds a red flag')
# 2. Hare asleep under the oak, tortoise walking past
s = Scene(sky='#bfe3f5')
s.add(sun(150, 110, 60), cloud(820, 110, .9))
s.add(ground('#a8d47a', 540), path(650), flowers(FL))
s.add(tree(380, 640, 1.45, GREEN), bush(1000, 560, .9))
s.add(hare(400, 690, 1.15, sleep=True, **HARE))
s.add('<text x="560" y="520" font-family="Trebuchet MS, Arial" font-size="54" font-weight="bold" fill="#5a6b9a">z</text><text x="600" y="470" font-family="Trebuchet MS, Arial" font-size="40" font-weight="bold" fill="#5a6b9a">z</text><text x="632" y="430" font-family="Trebuchet MS, Arial" font-size="30" font-weight="bold" fill="#5a6b9a">z</text>')
s.add(tortoise(840, 720, 1.1, **TORT))
s.save(SLUG, 'sleeping-hare-under-oak-tree-tortoise-walking-past', 'The hare fast asleep under an oak tree while the tortoise walks steadily past him')
# 3. Finish: tortoise at the flag, hare running behind, fox cheering
s = Scene(sky='#cfe9f7')
s.add(cloud(140, 120, .9), cloud(900, 90, .8))
s.add('<path d="M0 620 Q 500 360 1200 420 V 800 H 0 Z" fill="%s"/>' % F('#a8d47a', 'vert'))
s.add('<path d="M40 760 Q 500 520 1100 470" stroke="#e6cf9a" stroke-width="64" fill="none" stroke-linecap="round"/>')
s.add('<path d="M880 560 L 900 410" stroke="#fff" stroke-width="8"/>', flag(940, 500, 200))
for x, y, c, r in [(820, 150, '#f06292', 20), (900, 120, '#ffd34d', -30), (980, 170, '#4fc3f7', 40), (760, 200, '#ba68c8', -10), (1040, 230, '#f06292', 60), (700, 260, '#ffd34d', 15), (1100, 140, '#ba68c8', -40)]:
    s.add(f'<rect x="{x}" y="{y}" width="16" height="26" rx="4" fill="{c}" transform="rotate({r} {x} {y})"/>')
s.add(tortoise(820, 560, 1.0, **TORT))
s.add(hare(260, 730, 1.0, run=1, **HARE))
s.add(sitter(1050, 610, .8, **FOX))
s.save(SLUG, 'tortoise-wins-race-at-red-flag-hare-running-behind', 'The tortoise crossing the finish line by the red flag as the hare races up behind him too late')
print('ok')
