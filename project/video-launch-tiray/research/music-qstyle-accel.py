"""Original track in the style of the reference: ~103 BPM electronic pop in E,
808 sub, syncopated kick, claps on 2&4, 16th hats, sidechained supersaw stabs,
risers + short stops before drops. Composition (progression, motif, patterns) is new."""
import sys, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import soundfile as sf

SR = 48000; BPM = 103.0; SPB = 60 / BPM; S16 = SPB / 4; BAR = SPB * 4
TOTAL = 57.0; N = int(TOTAL * SR)
rng = np.random.default_rng(int(sys.argv[2]) if len(sys.argv) > 2 else 7)
L = {k: np.zeros(N) for k in ['kick', 'sub', 'clap', 'hat', 'chord', 'pad', 'lead', 'arp', 'fx']}

def hz(n):  # note name -> Hz, e.g. 'E4'
    names = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
    p, o = n[:-1], int(n[-1]); return 440 * 2 ** ((names[p] + 12 * (o + 1) - 69) / 12)
def put(name, t, sig, g=1.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i < N: L[name][i:j] += g * sig[:j - i]
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def saw(f, n, ph=0): t = np.arange(n) / SR; return 2 * ((f * t + ph) % 1) - 1
def env(n, a, d, sus=0.0, rel=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * (sus + (1 - sus) * np.exp(-t / d))
    if rel: e *= np.clip((n / SR - t) / rel, 0, 1)
    return e

# ---------- instruments ----------
def kick(g=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    k = np.sin(ph) * np.exp(-t / 0.22); k += 0.4 * hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.004)
    return np.tanh(1.6 * k) * g
def sub(f, dur, glide_from=None):
    n = int(dur * SR); t = np.arange(n) / SR
    ff = f if glide_from is None else f + (glide_from - f) * np.exp(-t / 0.04)
    s = np.sin(2 * np.pi * np.cumsum(np.full(n, 1.0) * ff) / SR)
    return np.tanh(2.2 * s) * env(n, 0.004, 0.5, 0.55, 0.03)
def clap():
    n = int(0.35 * SR); t = np.arange(n) / SR; nz = bp(rng.standard_normal(n), 900, 5000)
    e = sum(np.exp(-np.maximum(0, t - d) / 0.008) * (t >= d) for d in (0, 0.011, 0.022)) * 0.5 + np.exp(-t / 0.09) * (t >= 0.03)
    return nz * e * 0.9
def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000, 3) * np.exp(-t / (0.07 if open_ else 0.012))
def supersaw(freqs, dur, bright=1.0, dec=0.18):
    n = int(dur * SR); x = np.zeros(n)
    for f in freqs:
        for dt in (-0.12, -0.05, 0, 0.05, 0.12):
            x += saw(f * 2 ** (dt / 12), n, rng.random())
    x /= len(freqs) * 5
    dark, br = lp(x, 2000), lp(x, 3000 + 9000 * bright)
    e = np.exp(-np.arange(n) / SR / dec)
    return (dark * (1 - e) + br * e) * env(n, 0.003, dec * 2.2, 0.25, 0.04)
def pluck(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = 0.6 * saw(f, n) + 0.4 * np.sign(np.sin(2 * np.pi * f * 2 * t))
    e = np.exp(-t / 0.09)
    return (lp(x, 2500) * (1 - e) + lp(x, 10000) * e) * env(n, 0.002, 0.2, 0.1, 0.03)
def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR; p = t / dur
    nz = rng.standard_normal(n); out = np.zeros(n); seg = 2400
    for i in range(0, n, seg):
        c = 400 * 30 ** p[i]; out[i:i + seg] = bp(nz[max(0, i - 2000):i + seg], c, min(c * 2.2, 20000))[-len(out[i:i + seg]):]
    sw = saw(1, n) * 0; f = 110 * 8 ** p; sw = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (out + sw) * p ** 2
def impact():
    n = int(2.5 * SR); t = np.arange(n) / SR
    b = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.7)
    return np.tanh(1.5 * b) + 0.3 * lp(rng.standard_normal(n), 2500) * np.exp(-t / 0.4)

# ---------- composition (bars) ----------
PROG = [  # (bass root, chord voicing) one bar each, loop of 4
    ('E1', ['E3', 'G#3', 'B3', 'E4', 'G#4']),
    ('C#2', ['C#3', 'G#3', 'C#4', 'E4', 'G#4']),
    ('A1', ['A2', 'E3', 'A3', 'C#4', 'E4']),
    ('B1', ['B2', 'F#3', 'B3', 'D#4', 'F#4']),
]
MOTIF = [  # lead per chord: (16th step, note, length in 16ths)
    [(0, 'B4', 2), (3, 'G#4', 2), (6, 'E5', 2), (8, 'F#5', 2), (10, 'E5', 3), (14, 'C#5', 2)],
    [(0, 'C#5', 2), (3, 'G#4', 2), (6, 'E5', 2), (8, 'F#5', 2), (10, 'G#5', 2), (12, 'F#5', 3)],
    [(0, 'E5', 2), (3, 'C#5', 2), (6, 'A4', 2), (8, 'B4', 2), (10, 'C#5', 4)],
    [(0, 'F#5', 2), (3, 'D#5', 2), (6, 'B4', 2), (8, 'C#5', 2), (10, 'D#5', 2), (13, 'F#5', 3)],
]
STAB = [0, 3, 6, 10, 12]  # syncopated chord stabs
KICK = [0, 7, 10]
# ---------- accelerating tempo map ----------
BPM0, BPM1, CURVE = 98.0, 132.0, 1.6
def bpm_at(t): return BPM0 + (BPM1 - BPM0) * min(1, t / 55.0) ** CURVE
TG = [0.0]
while TG[-1] < TOTAL + 2: TG.append(TG[-1] + 15.0 / bpm_at(TG[-1]))
NB = max(b for b in range(len(TG) // 16) if TG[b * 16] <= 55.6) + 1  # last bar = final hit
M = int(round(NB * 0.5))
def T(b, st): return TG[b * 16 + st]
def D(b, st, n): return TG[b * 16 + st + n] - TG[b * 16 + st]
print('bars', NB, 'break at bar', M, 't=%.1f' % T(M, 0), 'bpm end %.1f' % bpm_at(T(NB - 1, 0)))
SEC = {}
for b in range(NB):
    SEC[b] = 'intro' if b < 2 else 'dropA' if b < M else 'break' if b == M else 'build' if b == M + 1 else 'dropB' if b < NB - 3 else 'outro'
kick_times = []
for b in range(NB - 1):
    s = SEC[b]; t0 = b * BAR; root, chord = PROG[b % 4]; cf = [hz(n) for n in chord]
    gap = b in (1, M + 1)  # stop on the last beat before a drop
    last = (lambda st: gap and st >= 12)
    if s == 'intro':
        put('pad', T(b, 0), lp(supersaw(cf, D(b, 0, 16), 0.2, 1.5), 1200 + 1400 * b), 0.7 if not gap else 0.7)
        for st in range(0, 16, 2):
            if not last(st): put('hat', T(b, st), hat(), 0.18 + 0.1 * b)
        for st in (0, 8) if b == 1 else (0,):
            if not last(st): put('kick', T(b, st), kick(0.7)); kick_times.append(T(b, st))
        if b == 1: put('fx', T(b, 0), riser(D(b, 0, 12)), 0.5)
    elif s in ('dropA', 'dropB', 'outro'):
        lite = s == 'outro'
        if b in (2, M + 2): put('fx', T(b, 0), impact(), 0.6)
        for st in (KICK if not lite else [0, 10]) + ([14] if b % 2 and not lite else []):
            put('kick', T(b, st), kick()); kick_times.append(T(b, st))
        for st in (4, 12): put('clap', T(b, st), clap(), 0.55)
        for st in range(16):
            if st % 4 == 2: put('hat', T(b, st), hat(True), 0.22)
            else: put('hat', T(b, st), hat(), 0.32 if st % 2 == 0 else 0.14)
        # 808 follows the kick pattern on the root
        rf = hz(root); bst = KICK if not lite else [0]
        for i, st in enumerate(bst):
            nxt = (bst[i + 1] if i + 1 < len(bst) else 16)
            put('sub', T(b, st), sub(rf, D(b, st, nxt - st), rf * 1.5 if st == 0 and b % 4 == 0 else None), 0.8)
        for st in (STAB if not lite else [0, 6]):
            put('chord', T(b, st), supersaw(cf, D(b, st, 1) * 2.5, 0.9 if s == 'dropB' else 0.7, 0.12), 0.55)
        put('pad', T(b, 0), lp(supersaw(cf, D(b, 0, 16), 0.2, 2.0), 1800), 0.25)
        if s == 'dropA' and b >= 6:
            for st in range(16):
                put('arp', T(b, st), pluck(cf[(st * 3) % len(cf)] * 2, D(b, st, 1) * 1.2), 0.22)
        if s == 'dropB':
            for st, n_, ln in MOTIF[b % 4]:
                put('lead', T(b, st), pluck(hz(n_), D(b, st, ln)), 0.42)
    elif s == 'break':
        put('pad', T(b, 0), lp(supersaw(cf, D(b, 0, 16) * 1.2, 0.3, 3.0), 2200), 0.7)
        for st, n_, ln in MOTIF[b % 4][:3]:
            put('lead', T(b, st), pluck(hz(n_), D(b, st, ln)), 0.3)
    elif s == 'build':
        put('pad', T(b, 0), lp(supersaw(cf, D(b, 0, 12), 0.4, 3.0), 2600), 0.55)
        for st in range(0, 12, 4): put('kick', T(b, st), kick(0.75)); kick_times.append(T(b, st))
        for st in list(range(0, 8, 2)) + list(range(8, 12)):
            put('clap', T(b, st), clap(), 0.18 + 0.03 * st)
        put('fx', T(b, 0), riser(D(b, 0, 12)), 0.6)
# final hit
fb = T(NB - 1, 0); root, chord = PROG[0]
put('kick', fb, kick()); put('fx', fb, impact(), 0.7); kick_times.append(fb)
put('chord', fb, supersaw([hz(n) for n in chord], 3.0, 0.8, 0.9), 0.6)
put('sub', fb, sub(hz('E1'), 1.6), 0.8)

# ---------- sidechain + mix ----------
sc = np.ones(N); tt = np.arange(int(0.25 * SR)) / SR; duck = 1 - 0.65 * np.exp(-tt / 0.07)
for kt in kick_times:
    i = int(kt * SR); j = min(N, i + len(duck)); sc[i:j] = np.minimum(sc[i:j], duck[:j - i])
for k in ('chord', 'pad', 'arp', 'sub', 'fx'):
    if k != 'fx': L[k] *= sc if k != 'sub' else np.maximum(sc, 0.85)
ir_n = int(1.8 * SR); ir = rng.standard_normal((2, ir_n)) * np.exp(-np.arange(ir_n) / SR / 0.45)
ir[:, :int(0.012 * SR)] = 0
def stereo(x, w=0.0):
    return np.stack([x, x])
mix = np.zeros((2, N))
gains = {'kick': 0.7, 'sub': 0.45, 'clap': 0.95, 'hat': 1.1, 'chord': 1.5, 'pad': 0.8, 'lead': 1.1, 'arp': 0.75, 'fx': 0.6}
send = {'clap': 0.25, 'chord': 0.3, 'pad': 0.4, 'lead': 0.35, 'arp': 0.4, 'fx': 0.3}
wet_in = np.zeros(N)
for k, x in L.items():
    mix += gains[k] * stereo(x); wet_in += gains[k] * send.get(k, 0) * x
# small haas widening on chord/arp
d = int(0.012 * SR)
for k in ('chord', 'arp', 'pad'):
    w = gains[k] * 0.3 * L[k]; mix[0, d:] += w[:-d]; mix[1, :-d] += w[d:]
wet = np.stack([fftconvolve(wet_in, ir[c])[:N] for c in range(2)]) * 0.06
mix += hp(wet, 250)
mix = np.tanh(mix * 0.9) * 0.9
fade = np.ones(N); fo = int(1.2 * SR); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade
sf.write(sys.argv[1], mix.T.astype(np.float32), SR)
print('ok', round(N / SR, 2), 's', 'kicks', len(kick_times))
