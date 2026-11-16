#!/usr/bin/env python3
"""Duplicate check. Run before writing anything new.

  python3 scripts/dupes.py                     list every published printable (newest first)
  python3 scripts/dupes.py "snowman coloring"  show published printables similar to a planned topic

A score of 0.5 or more means the topic is probably already covered: pick another,
or only go ahead if the new page is genuinely different (other theme, age or format)."""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STOP = {'free', 'printable', 'printables', 'for', 'kids', 'the', 'a', 'and', 'page', 'pages', 'to', 'of', 'with', 'it', 'or', 'online', 'print', 'your', 'you', 'can', 'color', 'coloring', 'chart', 'sheet'}

def toks(s):
    return {w for w in re.findall(r'[a-z0-9]+', s.lower()) if w not in STOP}

def items():
    out = []
    for p in glob.glob(os.path.join(ROOT, 'src/content/printables/*.md')):
        head = open(p, encoding='utf-8').read().split('\n---', 2)[0]
        g = lambda k: (re.search(rf'^{k}:\s*"?(.*?)"?\s*$', head, re.M) or [None, ''])[1]
        out.append({'slug': os.path.basename(p)[:-3], 'title': g('title'), 'date': g('date'), 'keywords': g('keywords'), 'cat': g('category')})
    return sorted(out, key=lambda x: x['date'], reverse=True)

def main():
    all_items = items()
    if len(sys.argv) < 2:
        for i in all_items:
            print(f"{i['date'][:10]}  {i['cat']:<24} {i['slug']}")
        print(f'{len(all_items)} published')
        return
    q = toks(' '.join(sys.argv[1:]))
    scored = []
    for i in all_items:
        t = toks(i['title'] + ' ' + i['slug'] + ' ' + i['keywords'])
        if not q or not t: continue
        score = len(q & t) / len(q)
        if score > 0: scored.append((score, i))
    scored.sort(key=lambda x: -x[0])
    if not scored:
        print('No similar printables. OK to write.')
    for s, i in scored[:10]:
        flag = 'LIKELY DUPLICATE' if s >= 0.5 else 'related'
        print(f"{s:.2f}  {flag:<16} {i['slug']}  ({i['title']})")

if __name__ == '__main__':
    main()
