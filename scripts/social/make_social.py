"""Make social media videos and thumbnails for new printables.

Usage:
  python3 scripts/social/make_social.py                 # printables added by today's daily run (git, last 22 hours)
  python3 scripts/social/make_social.py slug1 slug2     # specific printables
Output: social-out/<YYYY-MM-DD>/<slug>.mp4 (1080x1320, 13 s, music) and <slug>-thumbnail.png
Needs: playwright + Chrome/Chromium, ffmpeg, numpy, Pillow.
"""
import os, re, sys, json, subprocess, datetime, shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
FONTS = ROOT / 'scripts/fonts'
KIDS = ['Emma', 'Leo', 'Mia', 'Noah', 'Ava', 'Liam', 'Zoe', 'Eli', 'Lily', 'Max', 'Ruby', 'Sam']

def chrome():
    for p in ('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'):
        if os.path.exists(p): return p
    return None

def fm(slug):
    t = (ROOT / 'src/content/printables' / (slug + '.md')).read_text()
    title = re.search(r'^title:\s*"(.*)"', t, re.M).group(1)
    date = re.search(r'^date:\s*(\S+)', t, re.M).group(1)
    a, _, b = title.partition(':')
    return a.strip(), b.strip(), date

def all_slugs_by_date():
    out = []
    for p in (ROOT / 'src/content/printables').glob('*.md'):
        out.append((fm(p.stem)[2], p.stem))
    return [s for _, s in sorted(out, reverse=True)]

def new_slugs():
    r = subprocess.run(['git', '-C', str(ROOT), 'log', '--since=22 hours ago', '--grep=^printables:', '--diff-filter=A', '--name-only', '--pretty=format:',
                        '--', 'src/content/printables/'], capture_output=True, text=True)
    slugs = []
    for line in r.stdout.split():
        if line.endswith('.md'):
            s = Path(line).stem
            if s not in slugs and (ROOT / line).exists(): slugs.append(s)
    return slugs

def art(slug, id):
    return (ROOT / 'src/art' / (slug + '.svg')).read_text().replace('<svg ', f'<svg id="{id}" ', 1)

BADGE = (ROOT / 'public/favicon.svg').read_text()
CSS = f"""@font-face{{font-family:Fredoka;src:url(file://{FONTS}/fredoka-latin-600-normal.woff2)}}
@font-face{{font-family:Nunito;src:url(file://{FONTS}/nunito-latin-700-normal.woff2)}}
html,body{{margin:0;width:1080px;height:1320px;overflow:hidden;background:#fff3e6}}
#stage{{position:relative;width:1080px;height:1320px;overflow:hidden;font-family:Nunito,sans-serif;color:#2b2420}}
.abs{{position:absolute;left:0;top:0}}.blob{{position:absolute;border-radius:50%}}
.card{{position:absolute;background:#fff;border-radius:14px;box-shadow:0 18px 40px rgba(80,40,10,.22);overflow:hidden}}.card svg{{width:100%;height:100%;display:block}}
.logo{{font-family:Fredoka;font-size:84px;line-height:1;white-space:nowrap}}.logo span{{color:#c2541b}}
.cap{{font-family:Fredoka;font-size:76px;text-align:center;width:1080px}}.sub{{font-size:38px;color:#5a4a3f;text-align:center;width:1080px}}
.ttl{{font-family:Fredoka;text-align:center;width:1080px;white-space:nowrap}}
.chip{{background:#fff;border:3px solid #f0d9c4;border-radius:999px;padding:14px 30px;font-size:36px;color:#5a4a3f;white-space:nowrap}}.chip b{{color:#c2541b}}
.ripple{{position:absolute;border-radius:50%;border:6px solid #c2541b}}.url{{background:#c2541b;color:#fff;border-radius:999px;padding:18px 40px;font-size:40px;font-family:Fredoka}}"""
COMMON_JS = """const $=id=>document.getElementById(id),clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),p=(t,a,b)=>clamp((t-a)/(b-a)),eo=x=>1-Math.pow(1-x,3),
back=x=>{const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)},lerp=(a,b,x)=>a+(b-a)*x;
function set(id,x,y,s=1,r=0,o=1){const e=$(id);e.style.transform=`translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;e.style.opacity=o}
const soft=['#9fd8f5','#ffd970','#b5dd96','#f7b3c2','#d4b8ec'],pal=['#e8742c','#f2b134','#7cb342','#4fc3f7','#f48fb1','#8e44ad','#ffe066','#d7263d','#2e7d32','#1e5aa8','#8d5a2b','#ffd3a8'];
function shapes(svg){svg.querySelectorAll('[data-variant]').forEach(g=>{if((g.getAttribute('style')||'').replace(/ /g,'').includes('display:none'))g.remove()});
 const out=[];let k=0;svg.querySelectorAll('.f').forEach(el=>{if(el.tagName==='text')return;const b=el.getBBox();if(b.width>600||b.height>700)return;
 out.push({el,col:b.width*b.height>45000?soft[k++%soft.length]:pal[k++%pal.length],cx:b.x+b.width/2,cy:b.y+b.height/2})});return out}
function nameIt(svg,kid,n){svg.querySelectorAll('[data-field="name"]').forEach(el=>{el.textContent=n?el.dataset.tpl.replace('{name}',kid.slice(0,n)):el.dataset.empty})}
"""
def ttl_size(title): return 58 if len(title) < 30 else 48

def video_html(slug, others, kid):
    title, sub, _ = fm(slug)
    b300 = BADGE.replace('<svg ', '<svg width="300" height="300" ', 1)
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div id="stage">
<div class="blob" id="b1" style="width:900px;height:900px;background:#ffe1c7;left:420px;top:-380px"></div>
<div class="blob" id="b2" style="width:600px;height:600px;background:#e6f4ea;left:-260px;top:980px"></div>
<div class="abs" id="badge" style="left:390px;top:300px;width:300px;height:300px">{b300}</div>
<div class="abs logo" id="word">Printable<span>Sprout</span></div>
<div class="abs ttl" id="ttl" style="font-size:{ttl_size(title)}px">{title}</div>
<div class="card" id="c2" style="width:420px;height:543px">{art(others[0],'s2')}</div>
<div class="card" id="c3" style="width:420px;height:543px">{art(others[1],'s3')}</div>
<div class="card" id="c1" style="width:600px;height:776px">{art(slug,'s1')}</div>
<div class="ripple" id="rip"></div>
<div class="abs cap" id="cap0">Add a name.</div><div class="abs cap" id="cap1">Color it online.</div><div class="abs cap" id="cap2">Print it free.</div>
<div class="abs" id="chips" style="display:flex;gap:18px"><div class="chip"><b>US</b> Letter</div><div class="chip"><b>A4</b> paper</div><div class="chip"><b>Free</b> PDF</div></div>
<div class="abs ttl" id="endttl" style="font-size:{ttl_size(title)}px">{title}</div><div class="abs sub" id="endsub">{sub}</div>
<div class="abs" id="url"><div class="url">printablesprout.com</div></div>
</div><script>{COMMON_JS}
const S1=shapes($('s1'));[shapes($('s2')),shapes($('s3'))].forEach(L=>L.forEach(s=>s.el.setAttribute('fill',s.col)));
const KID={json.dumps(kid)};nameIt($('s2'),'',0);nameIt($('s3'),'',0);
const F0=3.9,F1=6.9,FT=S1.map((s,i)=>F0+i*(F1-F0)/Math.max(1,S1.length));
window.render=function(t){{
 const w=$('word'),ww=w.offsetWidth;w.style.left=((1080-ww)/2)+'px';w.style.transformOrigin='50% 0';
 const tot=75+16+ww*0.5,hbx=540-tot/2+37.5,hwx=540-tot/2+75+16+ww*0.25,end=eo(p(t,10.2,10.9)),hin=back(p(t,0.1,0.6));
 const H={{bx:hbx-540,by:80-450,bs:0.25,wx:hwx-540,wy:58,ws:0.5}},E={{bx:0,by:-60,bs:0.85,wx:0,wy:520,ws:0.9}};
 const m=k=>t<10.2?H[k]:lerp(H[k],E[k],end);
 set('badge',m('bx'),m('by'),m('bs')*(t<10.2?hin:1));set('word',m('wx'),m('wy'),m('ws'),0,eo(p(t,0.3,0.8)));
 set('ttl',0,150+(1-eo(p(t,0.5,1.0)))*20,1,0,eo(p(t,0.5,1.0))*(1-p(t,7.5,7.8)));
 const cin=eo(p(t,1.0,1.6)),cmove=eo(p(t,7.6,8.4)),cout=p(t,10.0,10.4);
 const cx=240+lerp(0,-150,cmove),cy=lerp(1400,240,cin)+lerp(0,90,cmove),cr=lerp(0,-8,cmove),cs=lerp(1,0.78,cmove);
 const c1=$('c1');c1.style.left=cx+'px';c1.style.top=cy+'px';c1.style.transform=`rotate(${{cr}}deg) scale(${{cs}})`;c1.style.opacity=1-cout;c1.style.zIndex=2;
 nameIt($('s1'),KID,Math.floor(clamp((t-2.3)/0.22,0,KID.length)));
 let tap=null;S1.forEach((s,i)=>{{const ft=FT[i];s.el.setAttribute('fill',t>=ft?s.col:'#fff');if(t>=ft&&t<ft+0.35)tap={{s,q:(t-ft)/0.35}}}});
 const rip=$('rip');if(tap&&t<7.6){{const r=10+tap.q*50,sc=600/850,px=cx+tap.s.cx*sc,py=cy+tap.s.cy*sc;rip.style.left=(px-r)+'px';rip.style.top=(py-r)+'px';rip.style.width=rip.style.height=(2*r)+'px';rip.style.opacity=1-tap.q}}else rip.style.opacity=0;
 set('cap0',0,1110+(1-eo(p(t,2.0,2.4)))*30,1,0,eo(p(t,2.0,2.4))*(1-p(t,3.5,3.7)));
 set('cap1',0,1110+(1-eo(p(t,3.7,4.1)))*30,1,0,eo(p(t,3.7,4.1))*(1-p(t,7.4,7.7)));
 const f2=eo(p(t,7.8,8.5)),f3=eo(p(t,8.0,8.7)),c2=$('c2'),c3=$('c3');
 c2.style.left=lerp(1200,560,f2)+'px';c2.style.top=lerp(380,300,f2)+'px';c2.style.transform=`rotate(${{lerp(20,4,f2)}}deg)`;c2.style.opacity=1-cout;c2.style.zIndex=1;
 c3.style.left=lerp(1300,600,f3)+'px';c3.style.top=lerp(560,500,f3)+'px';c3.style.transform=`rotate(${{lerp(25,10,f3)}}deg) scale(.9)`;c3.style.opacity=1-cout;c3.style.zIndex=0;
 set('cap2',0,1060+(1-eo(p(t,7.7,8.2)))*30,1,0,eo(p(t,7.7,8.2))*(1-p(t,10.0,10.3)));
 const ch=$('chips');ch.style.left=((1080-ch.offsetWidth)/2)+'px';set('chips',0,1170+(1-back(p(t,8.4,9.0)))*40,1,0,clamp(p(t,8.4,8.8))*(1-p(t,10.0,10.3)));
 set('endttl',0,690+(1-eo(p(t,10.6,11.1)))*30,1,0,eo(p(t,10.6,11.1)));
 set('endsub',0,775+(1-eo(p(t,10.8,11.3)))*30,1,0,eo(p(t,10.8,11.3)));
 const u=$('url');u.style.left=((1080-u.offsetWidth)/2)+'px';set('url',0,880,back(p(t,11.0,11.6)),0,clamp(p(t,11.0,11.3)));
 $('b1').style.transform=`translate(${{Math.sin(t*.6)*30}}px,${{Math.cos(t*.5)*20}}px)`;$('b2').style.transform=`translate(${{Math.cos(t*.5)*25}}px,${{Math.sin(t*.7)*20}}px)`;
}};</script></body></html>'''

def thumb_html(slug, kid):
    title, sub, _ = fm(slug)
    b62 = BADGE.replace('<svg ', '<svg width="62" height="62" style="margin-right:12px" ', 1)
    size = 76 if len(title) < 26 else 64 if len(title) < 34 else 54
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
.card svg{{width:100%;height:100%}}</style></head><body><div id="stage">
<div class="blob" style="width:900px;height:900px;background:#ffe1c7;left:420px;top:-380px"></div>
<div class="blob" style="width:600px;height:600px;background:#e6f4ea;left:-260px;top:980px"></div>
<div style="position:absolute;left:0;width:1080px;top:50px;display:flex;justify-content:center"><div class="logo" style="font-size:52px;display:flex;align-items:center">{b62}Printable<span>Sprout</span></div></div>
<div class="card" style="width:600px;height:776px;left:240px;top:150px;transform:rotate(-3deg)">{art(slug,'s1')}</div>
<div style="position:absolute;right:70px;top:150px;background:#c2541b;color:#fff;font-family:Fredoka;font-size:40px;border-radius:999px;padding:14px 30px;transform:rotate(6deg);box-shadow:0 8px 20px rgba(80,40,10,.25)">FREE</div>
<div class="ttl" style="position:absolute;left:0;top:975px;font-size:{size}px;line-height:1.05">{title}</div>
<div class="sub" style="position:absolute;left:0;top:1075px;font-size:36px">{sub}</div>
<div style="position:absolute;left:0;width:1080px;top:1150px;display:flex;justify-content:center;gap:16px">
<div class="chip" style="font-size:32px;padding:12px 26px"><b>Color</b> online</div><div class="chip" style="font-size:32px;padding:12px 26px"><b>Add</b> a name</div><div class="chip" style="font-size:32px;padding:12px 26px"><b>Print</b> free</div></div>
</div><script>{COMMON_JS}
shapes($('s1')).forEach(s=>s.el.setAttribute('fill',s.col));nameIt($('s1'),{json.dumps(kid)},99);</script></body></html>'''

def render_scene(html, t0, t1, out):
    from playwright.sync_api import sync_playwright
    fps = 30; n = round((t1 - t0) * fps); tmp = str(out) + '.part.mp4'
    ff = subprocess.Popen(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(fps), tmp], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=chrome()); pg = b.new_page(viewport={'width': 1080, 'height': 1320})
        pg.goto('file://' + str(html)); pg.wait_for_timeout(500)
        for i in range(n):
            pg.evaluate(f'render({t0 + i / fps})'); ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
        b.close()
    ff.stdin.close()
    if ff.wait() != 0: raise RuntimeError('ffmpeg failed for ' + str(out))
    os.replace(tmp, out)

def main():
    slugs = sys.argv[1:] or new_slugs()
    if not slugs:
        print('No new printables found.'); return
    day = datetime.date.today().isoformat()
    out = ROOT / 'social-out' / day; work = out / '_work'; work.mkdir(parents=True, exist_ok=True)
    music = work / 'music.wav'
    subprocess.run([sys.executable, str(HERE / 'music.py'), str(music)], check=True, capture_output=True)
    pool = all_slugs_by_date()
    from playwright.sync_api import sync_playwright
    for i, slug in enumerate(slugs):
        kid = KIDS[(i + len(day)) % len(KIDS)]
        others = [s for s in slugs if s != slug] + [s for s in pool if s not in slugs]
        html = work / f'{slug}.html'; html.write_text(video_html(slug, others[:2], kid))
        parts = [(0, 3.2), (3.2, 7.6), (7.6, 10.2), (10.2, 13.0)]
        files = [work / f'{slug}_{k}.mp4' for k in range(4)]
        with ThreadPoolExecutor(4) as ex:
            list(ex.map(lambda a: render_scene(html, a[0][0], a[0][1], a[1]), zip(parts, files)))
        (work / 'list.txt').write_text(''.join(f"file '{f}'\n" for f in files))
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(work / 'list.txt'), '-c', 'copy', str(work / 'v.mp4')], check=True)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(work / 'v.mp4'), '-i', str(music), '-map', '0:v', '-map', '1:a',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(out / f'{slug}.mp4')], check=True)
        th = work / f'{slug}-thumb.html'; th.write_text(thumb_html(slug, kid))
        with sync_playwright() as p:
            b = p.chromium.launch(executable_path=chrome()); pg = b.new_page(viewport={'width': 1080, 'height': 1320})
            pg.goto('file://' + str(th)); pg.wait_for_timeout(500); pg.screenshot(path=str(out / f'{slug}-thumbnail.png')); b.close()
        print('made', out / f'{slug}.mp4', 'and thumbnail (name:', kid + ')')
    shutil.rmtree(work)

if __name__ == '__main__':
    main()
