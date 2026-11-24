import sys; sys.path.insert(0, 'scripts/stories'); from kit import *
SLUG = 'maya-thankful-leaf-garland'
MAYA = dict(shirt='#e8742c', pants='#3d5a80', hair='#4a2c1d', skin='#f1c29b')
SAM = dict(shirt='#4fc3f7', pants='#5b6b7a', hair='#8d5a2b', skin='#f1c29b', pony=False)
# 1. Collecting leaves under the big tree
s = Scene(sky='#cfe9f7')
s.add(sun(1040, 130, 56), cloud(160, 140, 1.1), cloud(620, 90, .8))
s.add(ground('#a8d47a', 560), tree(330, 600, 1.35), tree(980, 580, .9, ('#f2b134', '#e8742c', '#f2b134')))
for x, y, r, c in [(520, 200, 20, '#d7263d'), (600, 320, -30, '#f2b134'), (450, 420, 60, '#e8742c'), (760, 260, 10, '#d7263d'), (820, 400, -50, '#f2b134'), (690, 470, 35, '#e8742c'), (560, 640, 80, '#d7263d'), (880, 660, -20, '#e8742c'), (420, 690, 10, '#f2b134')]:
    s.add(leaf(x, y, 1.1, r, c))
s.add(kid(680, 720, 1.2, arm_up=True, holding=g(basket(), -74, -100, 1), **MAYA))
s.save(SLUG, 1, 'Maya collecting autumn leaves in a basket under a big orange tree')
# 2. Writing thank yous on leaves at the kitchen table
s = Scene(bg='#fbe7cf')
s.add('<rect y="600" width="1200" height="200" fill="%s"/>' % F('#e9c9a3', 'vert'), window(820, 90), tree(950, 300, .5))
s.add(kid(430, 700, 1.05, **MAYA), kid(800, 700, .9, **SAM))
s.add(table(180, 540, 860))
for i, (c, r) in enumerate([('#d7263d', 10), ('#f2b134', -20), ('#e8742c', 30), ('#7cb342', -10), ('#d7263d', 25), ('#f2b134', 0)]):
    s.add(leaf(300 + i * 110, 528, 1.1, 90 + r, c))
s.add('<path d="M260 568 Q 600 600 960 566" stroke="#8d5a2b" stroke-width="4" fill="none"/>', '<rect x="520" y="512" width="90" height="16" rx="6" fill="#1e5aa8" transform="rotate(-12 565 520)"/>')
s.save(SLUG, 2, 'Maya and her little brother Sam writing thank yous on leaves at the kitchen table')
# 3. Grandma reads the garland over the Thanksgiving table
s = Scene(bg='#f7dcc0')
s.add('<rect y="620" width="1200" height="180" fill="%s"/>' % F('#d9a979', 'vert'), garland(60, 70, 1140, 70, 110))
s.add(grown_up(330, 720, 1.0), kid(760, 720, 1.0, arm_up=True, **MAYA), kid(980, 720, .85, **SAM))
s.add(table(140, 560, 920), pie(600, 545, 1.1))
s.save(SLUG, 3, 'Grandma smiling at the thankful leaf garland over the Thanksgiving table with Maya and Sam')
print('ok')
