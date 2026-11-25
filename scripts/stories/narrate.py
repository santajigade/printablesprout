"""Record the Read Story narration for a story in a cute child-like voice (Kokoro TTS, pitched up).

Usage: python3 scripts/stories/narrate.py <slug> [<slug> ...] | --all [--voice af_heart --pitch 1.28]
Writes public/stories/<slug>/<slug>-read-aloud.mp3 and read-aloud.json (start/end seconds per block:
the title, then every story paragraph and ## heading before <section class="story-activity">).
The voice model (about 120 MB) is downloaded once from GitHub into ~/.cache/kokoro.
"""
import os, re, sys, json, glob, subprocess, tempfile, urllib.request
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.expanduser('~/.cache/kokoro')
BASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
VOICE, PITCH, SPEED, GAP = 'hf_alpha', 1.25, 0.92, 0.55   # owner chose sample D (Indian, child-like) on 2026-11-25

def model():
    os.makedirs(CACHE, exist_ok=True)
    for f, url in (('kokoro.onnx', BASE + 'kokoro-v1.0.int8.onnx'), ('voices.bin', BASE + 'voices-v1.0.bin')):
        p = os.path.join(CACHE, f)
        if not os.path.exists(p) or os.path.getsize(p) < 1_000_000:
            subprocess.run(['curl', '-sL', '-m', '600', '-o', p, url], check=True)
    from kokoro_onnx import Kokoro
    return Kokoro(os.path.join(CACHE, 'kokoro.onnx'), os.path.join(CACHE, 'voices.bin'))

def clean(t):
    t = re.sub(r'<[^>]+>', '', t); t = re.sub(r'[*_`#]', '', t)
    t = t.replace('“', '"').replace('”', '"').replace('’', "'").replace('‘', "'")
    return re.sub(r'\s+', ' ', t).strip()

def blocks(slug):
    md = open(os.path.join(ROOT, 'src/content/stories', slug + '.md')).read()
    fm, body = md.split('---', 2)[1:]
    title = re.search(r'^title:\s*"(.*)"', fm, re.M).group(1).split(':')[0].strip()
    body = body.split('<section class="story-activity">')[0]
    out = [title]
    for b in re.split(r'\n\s*\n', body.strip()):
        b = b.strip()
        if not b or b.startswith('<figure') or b.startswith('<section') or b.startswith('</'): continue
        out.append(clean(b))
    return [b for b in out if b]

def narrate(k, slug, voice=VOICE, pitch=PITCH):
    import numpy as np, soundfile as sf
    parts, times, t = [], [], 0.3
    sr = 24000
    parts.append(np.zeros(int(0.3 * sr), np.float32))
    for b in blocks(slug):
        a, sr = k.create(b.replace('"', ''), voice=voice, speed=SPEED, lang='en-us')
        a = a.astype(np.float32); d = len(a) / sr
        times.append({'start': round(t, 2), 'end': round(t + d, 2)})
        parts += [a, np.zeros(int(GAP * sr), np.float32)]; t += d + GAP
    raw = tempfile.mktemp(suffix='.wav'); sf.write(raw, np.concatenate(parts), sr)
    d = os.path.join(ROOT, 'public/stories', slug); mp3 = os.path.join(d, f'{slug}-read-aloud.mp3')
    # pitch up for a younger voice; atempo keeps the timing the same, so the block times stay valid
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af',
                    f'asetrate={sr}*{pitch},aresample=44100,atempo={1/pitch:.5f},loudnorm=I=-16:TP=-1.5',
                    '-ac', '1', '-b:a', '64k', mp3], check=True)
    os.remove(raw)
    json.dump({'voice': voice, 'pitch': pitch, 'blocks': times}, open(os.path.join(d, 'read-aloud.json'), 'w'))
    print('narrated', slug, len(times), 'blocks,', round(t, 1), 's')

if __name__ == '__main__':
    a = sys.argv[1:]
    voice = a[a.index('--voice') + 1] if '--voice' in a else VOICE
    pitch = float(a[a.index('--pitch') + 1]) if '--pitch' in a else PITCH
    a = [x for i, x in enumerate(a) if not x.startswith('--') and (i == 0 or a[i - 1] not in ('--voice', '--pitch'))]
    if not a and '--all' not in sys.argv: sys.exit(__doc__)
    slugs = [os.path.basename(p)[:-3] for p in glob.glob(os.path.join(ROOT, 'src/content/stories/*.md'))] if '--all' in sys.argv else a
    k = model()
    for s in slugs: narrate(k, s, voice, pitch)
