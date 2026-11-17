"""Original PrintableSprout jingle (13 s), synthesized so it is free to use anywhere.
Usage: python3 music.py <out.wav>"""
import sys, numpy as np, wave
SR=44100; DUR=13.0; N=int(SR*DUR)
L=np.zeros(N); R=np.zeros(N)
def hz(n): return 440*2**((n-69)/12)
NOTE={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def m(s): return 12*(int(s[-1])+1)+NOTE[s[0]]+(1 if '#' in s else 0)
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*SR); j=min(N,i+len(sig)); 
    if i>=N: return
    s=sig[:j-i]*g; L[i:j]+=s*(1-pan)/1; R[i:j]+=s*(1+pan)/1
def env(n,a,d): 
    t=np.arange(n)/SR; e=np.minimum(1,t/a)*np.exp(-t/d); return e
def marimba(f,dur=0.6):
    n=int(SR*dur); t=np.arange(n)/SR
    return (np.sin(2*np.pi*f*t)+0.35*np.sin(2*np.pi*f*4*t)*np.exp(-t/0.05)+0.15*np.sin(2*np.pi*f*10*t)*np.exp(-t/0.02))*env(n,0.003,0.28)
def bell(f,dur=1.6):
    n=int(SR*dur); t=np.arange(n)/SR
    return sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t/(d)) for r,a,d in ((1,1,.9),(2.76,.4,.4),(5.4,.2,.2),(8.9,.1,.1)))*np.minimum(1,t/0.002)
def pad(fs,dur):
    n=int(SR*dur); t=np.arange(n)/SR; s=np.zeros(n)
    for f in fs:
        for det in (-0.6,0.6): s+=np.sin(2*np.pi*(f+det)*t)+0.3*np.sin(2*np.pi*2*(f+det)*t)
    e=np.minimum(1,t/0.25)*np.minimum(1,(dur-t)/0.3); return s*e/len(fs)
def bass(f,dur=0.45):
    n=int(SR*dur); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t)+0.2*np.sin(2*np.pi*2*f*t))*env(n,0.005,0.25)
def kick():
    n=int(SR*0.25); t=np.arange(n)/SR; f=110*np.exp(-t/0.04)+45; ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.09)
rng=np.random.default_rng(3)
def shaker():
    n=int(SR*0.07); x=rng.standard_normal(n); x=np.diff(np.concatenate([[0],x])); return x*env(n,0.004,0.02)
def pop(f):
    n=int(SR*0.12); t=np.arange(n)/SR; ff=f*(1+1.5*np.exp(-t/0.02)); return np.sin(2*np.pi*np.cumsum(ff)/SR)*env(n,0.002,0.04)
BEAT=0.5
chords=[('C',['C4','E4','G4']),('G',['B3','D4','G4']),('A',['A3','C4','E4']),('F',['A3','C4','F4']),('C',['C4','E4','G4']),('G',['B3','D4','G4'])]
roots={'C':'C2','G':'G2','A':'A2','F':'F2'}
mel=[['E5','G5','A5','G5','E5',None,'D5',None],['D5','G5','B5','A5','G5',None,'D5',None],
     ['C5','E5','A5','G5','E5',None,'C5','D5'],['C5','F5','A5','G5','F5',None,'E5',None],
     ['E5','G5','C6','A5','G5',None,'E5','G5'],['D5','G5','B5','D6','B5',None,'G5',None]]
start=0.5  # music body starts after the logo chime
for bi,((name,notes),line) in enumerate(zip(chords,mel)):
    t0=start+bi*4*BEAT
    add(pad([hz(m(n)) for n in notes],4*BEAT+0.3),t0,0,0.10)
    for b in range(4):
        tb=t0+b*BEAT
        if b in (0,2): add(kick(),tb,0,0.55); add(bass(hz(m(roots[name]))),tb,0,0.45)
        else: add(bass(hz(m(roots[name])+7)),tb,0,0.3)
        for h in (0,1): add(shaker(),tb+h*BEAT/2+0.01,0.3,0.12 if h else 0.07)
    if bi>=1 or True:
        for k,n in enumerate(line):
            if n: add(marimba(hz(m(n))),t0+k*BEAT/2,-0.25,0.32 if bi>0 else 0.22)
# logo chime, then end chord with chime
for k,n in enumerate(['C6','E6','G6','C7']): add(bell(hz(m(n))),0.15+k*0.07,0.2,0.16)
for k,n in enumerate(['G5','C6','E6','G6','C7']): add(bell(hz(m(n))),10.2+k*0.08,-0.1,0.15)
add(pad([hz(m(n)) for n in ['C4','E4','G4','C5']],2.6),10.4,0,0.14)
add(bass(hz(m('C2')),1.2),10.4,0,0.5); add(kick(),10.4,0,0.6)
# soft pops as the turkey colors in (every 3rd fill)
penta=['C6','D6','E6','G6','A6']
fills=np.linspace(3.9,6.9,36)[:35]
for i,ft in enumerate(fills):
    if i%3==0: add(pop(hz(m(penta[(i//3)%5]))),ft,0.35,0.12)
# master: fade out, soft limit, normalize
t=np.arange(N)/SR; fade=np.clip((DUR-t)/1.0,0,1); fin=np.clip(t/0.02,0,1)
for ch in (L,R): ch*=fade*fin
st=np.stack([L,R],1); st=np.tanh(st*1.3); st/=np.abs(st).max()/0.89
w=wave.open(sys.argv[1] if len(sys.argv)>1 else 'music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
print('ok', st.shape)
