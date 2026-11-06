import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { getStyleById, MotionStylePreset } from './theme/styles-catalog';
import { quantizeFrame, splineAt } from './theme/easing-and-timing';
import { ProceduralBackground } from './components/ProceduralBackground';
import { KaraokePillCaption, WordItem } from './components/BedahOverlay';
import { BEDAH44_CAPTION, BEDAH44_SFX, Bedah44Scene } from './Bedah44';
import { loadFamily, nearestWeight } from './fonts';
import { Ctx, EIO, EO, ip, onColor, scramble, sp } from './helpers';
import { MOTIFS } from './motifs';
import taglines from './taglines.json';

export const DURATION = 300;
const T1 = 102; // S1 -> S2
const T2 = 210; // S2 -> S3
const S2_START = 96;
const S3_START = 204;

const TRANS_SFX: Record<string, string> = {
  'color-flood': 'transition-whoosh-soft',
  'zoom-through': 'transition-whoosh-soft',
  'whip-pan': 'transition-swoosh',
  'diagonal-wipe': 'transition-swipe',
  'paper-tear': 'transition-swipe',
  'shutter-slats': 'transition-chop',
  'iris-mask': 'transition-maximize',
  'glitch-slice': 'transition-glitch',
};

const tagline = (id: number) =>
  id === 44 ? 'cara kerja benda, layanan publik, infrastruktur' : (taglines as Record<string, string>)[String(id)] ?? '';

type Entrance = 'rise' | 'scramble' | 'type' | 'slap' | 'pop' | 'flap' | 'neon';
const entranceOf = (st: MotionStylePreset): Entrance => {
  if (st.id === 26) return 'type';
  if (st.id === 29) return 'neon';
  switch (st.motion.springPreset) {
    case 'criticalLock':
      return 'scramble';
    case 'brutalSlap':
      return 'slap';
    case 'playfulPop':
      return 'pop';
    case 'mechanicalClack':
      return 'flap';
    default:
      return 'rise';
  }
};
const ENTRANCE_SFX: Record<Entrance, [string, number, number?]> = {
  rise: ['transition-whoosh-soft', 0.45],
  scramble: ['typing-digital', 0.5, 22],
  type: ['typing-loop', 0.6, 26],
  slap: ['impact-soft', 0.8],
  pop: ['pop-in', 0.7],
  flap: ['m1', 0.5],
  neon: ['tick', 0.6],
};

/* ------------------------------------------------------------------ */
const Title: React.FC<{ c: Ctx; text: string; size: number; t: number; mode: Entrance; color: string }> = ({ c, text, size, t, mode, color }) => {
  const { st, p, fH, hw } = c;
  const shadow = st.shape.hardShadow ? `${st.shape.shadowOffset + 2}px ${st.shape.shadowOffset + 2}px 0 ${p.accent === color ? p.ink : p.accent}` : undefined;
  const base: React.CSSProperties = {
    fontFamily: fH,
    fontWeight: hw,
    fontSize: size,
    lineHeight: 1.02,
    color,
    textTransform: st.typography.uppercaseHeading ? 'uppercase' : 'none',
    textShadow: shadow,
    letterSpacing: st.typography.uppercaseHeading ? '0.01em' : '-0.02em',
    whiteSpace: 'pre-wrap',
  };
  if (mode === 'scramble') return <div style={base}>{scramble(text, ip(t, [6, 34], [0, 1], (x) => x), t)}</div>;
  if (mode === 'type') {
    const n = Math.min(text.length, Math.floor(Math.max(0, t - 6) / 2.2));
    return (
      <div style={base}>
        {text.slice(0, n)}
        <span style={{ opacity: Math.floor(t / 8) % 2 ? 0 : 1, color: p.accent }}>_</span>
      </div>
    );
  }
  if (mode === 'slap') {
    const k = sp(t, 6, st);
    return <div style={{ ...base, transform: `scale(${1.5 - 0.5 * k}) rotate(${(1 - k) * -4}deg)`, opacity: t >= 6 ? 1 : 0, transformOrigin: 'left center' }}>{text}</div>;
  }
  if (mode === 'neon') {
    const seq = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1];
    const on = t < 6 ? 0 : t < 16 ? seq[t - 6] : 1;
    return <div style={{ ...base, opacity: on ? 1 : 0.08, textShadow: `0 0 12px ${p.accent}, 0 0 36px ${p.accent}, 0 0 70px ${p.accentSecondary}` }}>{text}</div>;
  }
  const chars = text.split('');
  return (
    <div style={base}>
      {mode === 'rise'
        ? text.split(' ').map((w, i) => {
            const k = ip(t, [6 + i * 5, 30 + i * 5], [0, 1], EO);
            return (
              <span key={i} style={{ display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 40}px)`, filter: `blur(${(1 - k) * 8}px)`, marginRight: '0.25em' }}>
                {w}
              </span>
            );
          })
        : chars.map((ch, i) => {
            const k = sp(t, 6 + i * (mode === 'flap' ? 1.5 : 1.8), st);
            const tr = mode === 'pop' ? `scale(${k}) rotate(${(1 - k) * (i % 2 ? 20 : -20)}deg)` : `perspective(400px) rotateX(${(1 - k) * -90}deg)`;
            return (
              <span key={i} style={{ display: 'inline-block', transform: tr, transformOrigin: mode === 'flap' ? 'center top' : 'center bottom', opacity: Math.min(1, k * 2), whiteSpace: 'pre' }}>
                {ch}
              </span>
            );
          })}
    </div>
  );
};

const HudBrackets: React.FC<{ c: Ctx; t: number; inset: number }> = ({ c, t, inset }) => {
  const len = 70;
  const k = ip(t, [0, 20], [0, 1], EO);
  const col = c.p.accent;
  const corner = (s: React.CSSProperties, bt: string[]) => (
    <div style={{ position: 'absolute', width: len * k, height: len * k, ...s, ...Object.fromEntries(bt.map((b) => [b, `3px solid ${col}`])) }} />
  );
  return (
    <>
      {corner({ left: inset, top: inset }, ['borderLeft', 'borderTop'])}
      {corner({ right: inset, top: inset }, ['borderRight', 'borderTop'])}
      {corner({ left: inset, bottom: inset }, ['borderLeft', 'borderBottom'])}
      {corner({ right: inset, bottom: inset }, ['borderRight', 'borderBottom'])}
    </>
  );
};

/* ------------------------------ S1 -------------------------------- */
const SceneTitle: React.FC<{ c: Ctx; t: number; mode: Entrance; textCol: string }> = ({ c, t, mode, textCol }) => {
  const { st, p, fB, fM, W, H, isV } = c;
  const pad = isV ? 80 : 140;
  const maxW = W - pad * 2;
  const base = isV ? 132 : 168;
  const longest = Math.max(...st.name.split(' ').map((w) => w.length));
  const size = Math.min(base, (maxW / Math.max(4, isV ? longest : st.name.length)) * 1.55);
  const mono = { fontFamily: fM, fontSize: isV ? 26 : 24, letterSpacing: '0.14em', color: p.muted, textTransform: 'uppercase' as const };
  const k = ip(t, [30, 52], [0, 1], EO);
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: isV ? 150 : 90, left: pad, right: pad, display: 'flex', justifyContent: 'space-between', opacity: ip(t, [0, 14], [0, 1]) }}>
        <span style={mono}>motion-craft / style sample</span>
        <span style={{ ...mono, color: p.accent }}>{`#${String(st.id).padStart(2, '0')} / 44`}</span>
      </div>
      <div style={{ ...mono, color: p.accent, marginBottom: 28, opacity: ip(t, [2, 14], [0, 1]) }}>{`gaya ${String(st.id).padStart(2, '0')}`}</div>
      <Title c={c} text={st.name} size={size} t={t} mode={mode} color={textCol} />
      <div style={{ height: 6, width: ip(t, [26, 50], [0, isV ? 360 : 520], EO), background: p.accent, marginTop: 36, marginBottom: 36 }} />
      <div style={{ fontFamily: fB, fontSize: isV ? 40 : 38, color: textCol, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, maxWidth: isV ? maxW : maxW * 0.7, lineHeight: 1.35 }}>
        {`Cocok untuk ${tagline(st.id)}.`}
      </div>
      <div style={{ ...mono, position: 'absolute', bottom: H * 0.15 + 20, left: pad, opacity: ip(t, [44, 60], [0, 1]) }}>
        {`${st.typography.heading} · ${st.typography.body} · ${st.motion.bpm} BPM`}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------ S2 -------------------------------- */
const SceneMotif: React.FC<{ c: Ctx; t: number; textCol: string }> = ({ c, t, textCol }) => {
  const { st, p, fH, fB, fM, hw, W, H, isV } = c;
  const m = MOTIFS[st.id];
  // #44: objek 3D penuh layar (Bedah3D), bukan motif SVG dalam kotak
  if (st.id === 44) return <Bedah44Scene c={{ ...c, t }} t={t} globalStart={S2_START} />;
  const box = isV ? W * 0.92 : Math.min(H * 0.8, W * 0.46);
  const ctx: Ctx = { ...c, t };
  const k = ip(t, [10, 34], [0, 1], EO);
  const text = (
    <div style={{ opacity: k, transform: `translateY(${(1 - k) * 24}px)`, maxWidth: isV ? W - 160 : W * 0.36 }}>
      <div style={{ fontFamily: fM, fontSize: 24, letterSpacing: '0.14em', color: p.accent, textTransform: 'uppercase', marginBottom: 20 }}>02 — gerak khas</div>
      <div style={{ fontFamily: fH, fontWeight: hw, fontSize: isV ? 64 : 64, lineHeight: 1.08, color: textCol, textTransform: st.typography.uppercaseHeading ? 'uppercase' : 'none' }}>{m.title}</div>
      <div style={{ fontFamily: fB, fontSize: isV ? 32 : 30, lineHeight: 1.4, color: textCol, opacity: 0.82, marginTop: 24 }}>
        {`Spring ${st.motion.springPreset}, transisi ${st.motion.defaultTransition}${st.shape.quantizedFps ? `, stop-motion ${st.shape.quantizedFps} fps` : ''}.`}
      </div>
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        flexDirection: isV ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isV ? 40 : 90,
        paddingBottom: isV ? H * 0.15 : H * 0.08,
        paddingTop: isV ? 60 : 0,
      }}
    >
      <div style={{ width: box, height: box, flexShrink: 0 }}>{m.render(ctx)}</div>
      {text}
    </AbsoluteFill>
  );
};

/* ------------------------------ S3 -------------------------------- */
const SceneSpec: React.FC<{ c: Ctx; t: number; textCol: string }> = ({ c, t, textCol }) => {
  const { st, p, fH, fB, fM, hw, W, H, isV } = c;
  const roles: [keyof MotionStylePreset['palette'], string, number][] = [
    ['bg', 'latar', 60],
    ['surface', 'permukaan', 20],
    ['ink', 'tinta', 10],
    ['accent', 'aksen', 7],
    ['accentSecondary', 'aksen 2', 3],
    ['muted', 'redup', 0],
  ];
  const pad = isV ? 80 : 140;
  const inner = W - pad * 2;
  const mono = { fontFamily: fM, fontSize: isV ? 22 : 20, letterSpacing: '0.1em', color: p.muted, textTransform: 'uppercase' as const };
  const cols = isV ? 3 : 6;
  const gap = 24;
  const sw = (inner - gap * (cols - 1)) / cols;
  const barK = ip(t, [30, 60], [0, 1], EIO);
  const meta: [string, string][] = [
    ['BPM', String(st.motion.bpm)],
    ['Backsound', st.audio.backsound],
    ['Pola latar', st.shape.bgPattern],
    ['Transisi', st.motion.defaultTransition],
  ];
  return (
    <AbsoluteFill style={{ padding: pad, paddingTop: isV ? 170 : 90, paddingBottom: H * 0.15 + 10 }}>
      <div style={{ ...mono, color: p.accent, opacity: ip(t, [4, 16], [0, 1]) }}>03 — sistem visual</div>
      <div style={{ fontFamily: fH, fontWeight: hw, fontSize: isV ? 60 : 58, color: textCol, marginTop: 14, marginBottom: isV ? 40 : 36, textTransform: st.typography.uppercaseHeading ? 'uppercase' : 'none', opacity: ip(t, [6, 20], [0, 1]) }}>
        Palet & tipografi
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap }}>
        {roles.map(([key, label], i) => {
          const k = sp(t, 8 + i * 4, st);
          const col = p[key];
          return (
            <div key={key} style={{ width: sw, transform: `translateY(${(1 - k) * 40}px)`, opacity: Math.min(1, k * 1.5) }}>
              <div style={{ height: isV ? 150 : 130, background: col, border: `2px solid ${onColor(p.bg, [p.ink, p.muted, '#FFFFFF', '#111111'])}`, borderRadius: Math.min(st.shape.borderRadius, 14) }} />
              <div style={{ ...mono, marginTop: 12, color: textCol }}>{label}</div>
              <div style={{ ...mono, marginTop: 4 }}>{col.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', height: 22, marginTop: isV ? 44 : 34, width: inner * barK, overflow: 'hidden', border: `2px solid ${p.muted}` }}>
        {roles.slice(0, 5).map(([key, , pct]) => (
          <div key={key} style={{ width: `${pct}%`, background: p[key] }} />
        ))}
      </div>
      <div style={{ ...mono, marginTop: 10, opacity: barK }}>proporsi 60 · 20 · 10 · 7 · 3</div>
      <div style={{ display: 'flex', flexDirection: isV ? 'column' : 'row', gap: isV ? 26 : 70, marginTop: isV ? 50 : 40, alignItems: isV ? 'flex-start' : 'flex-end' }}>
        {[
          [fH, st.typography.heading, 'judul', hw, isV ? 96 : 84],
          [fB, st.typography.body, 'isi', 400, isV ? 60 : 52],
          [fM, st.typography.mono, 'mono', 400, isV ? 44 : 38],
        ].map(([fam, name, lbl, w, s], i) => {
          const k = ip(t, [40 + i * 6, 58 + i * 6], [0, 1], EO);
          return (
            <div key={i} style={{ opacity: k, transform: `translateX(${(1 - k) * 30}px)` }}>
              <div style={{ fontFamily: fam as string, fontWeight: w as number, fontSize: s as number, color: i === 0 ? p.accent : textCol, lineHeight: 1.1 }}>Aa Gg 2026</div>
              <div style={{ ...mono, marginTop: 8 }}>{`${lbl} — ${name}`}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: isV ? 40 : 70, marginTop: isV ? 50 : 40, flexWrap: 'wrap' }}>
        {meta.map(([k, v], i) => (
          <div key={k} style={{ opacity: ip(t, [58 + i * 4, 70 + i * 4], [0, 1]) }}>
            <div style={mono}>{k}</div>
            <div style={{ fontFamily: fB, fontWeight: 700, fontSize: isV ? 34 : 30, color: textCol, marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- Transition --------------------------- */
const useTransition = (type: string, f: number, T: number, W: number, H: number, p: MotionStylePreset['palette']) => {
  const k = ip(f, [T - 9, T + 9], [0, 1], EIO);
  const active = f >= T - 9 && f <= T + 9;
  let outStyle: React.CSSProperties = {};
  let inStyle: React.CSSProperties = {};
  let overlay: React.ReactNode = null;
  const showOut = f < T;
  const bell = Math.sin(k * Math.PI);
  switch (type) {
    case 'whip-pan':
      outStyle = { transform: `translateX(${-k * W}px)`, filter: `blur(${bell * 14}px)` };
      inStyle = { transform: `translateX(${(1 - k) * W}px)`, filter: `blur(${bell * 14}px)` };
      return { outStyle, inStyle, overlay, both: active };
    case 'zoom-through':
      outStyle = { transform: `scale(${1 + k * 2.2})`, opacity: 1 - k };
      inStyle = { transform: `scale(${0.7 + k * 0.3})`, opacity: k };
      return { outStyle, inStyle, overlay, both: active };
    case 'iris-mask':
      inStyle = { clipPath: `circle(${k * 75}% at 50% 50%)` };
      overlay = active ? (
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: k * Math.hypot(W, H) * 1.5, height: k * Math.hypot(W, H) * 1.5, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `6px solid ${p.accent}`, opacity: 1 - k }} />
      ) : null;
      return { outStyle, inStyle, overlay, both: active };
    case 'color-flood': {
      const y = ip(f, [T - 9, T, T + 9], [H, 0, -H], EIO);
      overlay = active ? <div style={{ position: 'absolute', left: 0, top: y, width: W, height: H, background: p.accent }} /> : null;
      break;
    }
    case 'diagonal-wipe': {
      const x = ip(f, [T - 9, T + 9], [-1.6, 1.6], EIO) * W;
      overlay = active ? <div style={{ position: 'absolute', left: x - W * 0.3, top: -H * 0.5, width: W * 1.6, height: H * 2, background: p.accent, transform: 'skewX(-24deg)' }} /> : null;
      break;
    }
    case 'shutter-slats': {
      const n = 8;
      overlay = active
        ? Array.from({ length: n }, (_, i) => {
            const s = ip(f, [T - 9 + i * 0.6, T - 2 + i * 0.6, T + 2 + i * 0.6, T + 9 + i * 0.6], [0, 1, 1, 0], EIO);
            return <div key={i} style={{ position: 'absolute', left: 0, top: (H / n) * i, width: W, height: H / n + 1, background: i % 2 ? p.accent : p.ink, transform: `scaleY(${s})` }} />;
          })
        : null;
      break;
    }
    case 'glitch-slice': {
      overlay = active
        ? Array.from({ length: 10 }, (_, i) => {
            const r = Math.sin(i * 91.7 + f * 13.3) * 0.5 + 0.5;
            const cover = Math.max(0, 1 - Math.abs(f - T) / 9);
            return <div key={i} style={{ position: 'absolute', left: (r - 0.5) * W * 0.4, top: (H / 10) * i, width: W * 1.2, height: (H / 10) * cover + 1, background: i % 3 === 0 ? p.accentSecondary : i % 3 === 1 ? p.accent : p.bg }} />;
          })
        : null;
      break;
    }
    case 'paper-tear': {
      const y = ip(f, [T - 9, T, T + 9], [H * 1.1, -40, -H * 1.3], EIO);
      let d = `M0,40`;
      for (let x = 0; x <= W; x += 40) d += ` L${x},${40 + ((x * 37) % 53) - 26}`;
      d += ` V${H + 200} H0 Z`;
      overlay = active ? (
        <svg style={{ position: 'absolute', left: 0, top: y, width: W, height: H + 300 }} viewBox={`0 0 ${W} ${H + 300}`}>
          <path d={d} fill={p.surface} stroke={p.ink} strokeWidth={3} />
        </svg>
      ) : null;
      break;
    }
  }
  return { outStyle: {}, inStyle: {}, overlay, both: false, showOut };
};

/* ------------------------------ Caption ---------------------------- */
const CAPTIONS = (st: MotionStylePreset): [number, number, string][] => [
  [8, 100, `Gaya ${st.name}, cocok untuk ${tagline(st.id).split(',')[0]}.`],
  [112, 206, `${MOTIFS[st.id].title}, gerak khas gaya ini.`],
  [216, 292, `Palet enam warna, tiga huruf, ritme ${st.motion.bpm} BPM.`],
];

const Caption: React.FC<{ c: Ctx; f: number }> = ({ c, f }) => {
  const { st, p, fB } = c;
  const caps = CAPTIONS(st);
  const cur = caps.find(([a, b]) => f >= a && f <= b + 4);
  if (!cur) return null;
  const [a, b, s] = cur;
  const words = s.split(' ');
  const per = (b - a - 20) / words.length;
  const col = onColor(p.bg, [p.ink, '#FFFFFF', '#111111']);
  const shadowCol = col === '#111111' || col === p.ink && !isLight(col) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.65)';
  const fade = ip(f, [b - 4, b + 4], [1, 0]);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, bottom: 44, textAlign: 'center', fontFamily: fB, fontSize: 28, fontWeight: 600, lineHeight: 1.3, color: col, textShadow: `0 2px 8px ${shadowCol}`, opacity: fade }}>
      {words.map((w, i) => {
        const ws = a + i * per;
        const k = ip(f, [ws, ws + 6], [0, 1]);
        const activeW = f >= ws && f < ws + per + 4;
        return (
          <span key={i} style={{ opacity: 0.25 + k * 0.75, color: activeW ? p.accent : col }}>
            {w}{' '}
          </span>
        );
      })}
    </div>
  );
};
const isLight = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
};

const bedahWords = (st: MotionStylePreset): WordItem[] => {
  const out: WordItem[] = [];
  for (const [a, b, s] of CAPTIONS(st)) {
    const ws = s.split(' ');
    const per = ((b - a - 20) / ws.length / 30) * 1000;
    ws.forEach((w, i) => out.push({ text: w, startMs: Math.round((a / 30) * 1000 + i * per), endMs: Math.round((a / 30) * 1000 + (i + 1) * per) }));
  }
  return out;
};

/** Caption #44: 10 frame (0,33 dtk) per kata, sesuai aturan tayang min 0,3 dtk/kata. */
const bedah44Words = (): WordItem[] =>
  BEDAH44_CAPTION.flatMap(([at, s]) =>
    s.split(' ').map((w, i) => ({ text: w, startMs: Math.round(((at + i * 10) / 30) * 1000), endMs: Math.round(((at + (i + 1) * 10) / 30) * 1000) }))
  );

/* =============================== MAIN ============================== */
export const StyleSample: React.FC<{ styleId: number }> = ({ styleId }) => {
  const st = getStyleById(styleId);
  const p = st.palette;
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const isV = H > W;
  const qf = st.shape.quantizedFps ? quantizeFrame(f, st.shape.quantizedFps, fps) : f;

  const H1 = loadFamily(st.typography.heading, [400, st.typography.headingWeight, 700]);
  const B1 = loadFamily(st.typography.body, [400, 600, 700]);
  const M1 = loadFamily(st.typography.mono, [400]);
  const hw = nearestWeight(H1.weights, st.typography.headingWeight);
  const c: Ctx = {
    st,
    p,
    t: qf,
    fps,
    fH: `"${H1.family}", sans-serif`,
    fB: `"${B1.family}", sans-serif`,
    fM: `"${M1.family}", monospace`,
    hw,
    W,
    H,
    isV,
  };
  const textCol = onColor(p.bg, [p.ink, p.surface, '#FFFFFF', '#111111']);
  const mode = entranceOf(st);

  // Kamera C1 tenang: push pelan, kembali 1.0 di setiap transisi
  const [scale, ty] = splineAt<[number, number]>(f, [
    [0, 1.0, 0],
    [92, 1.035, -6],
    [T1, 1.035, -6],
    [T1 + 8, 1.0, 0],
    [200, 1.03, -4],
    [T2, 1.03, -4],
    [T2 + 8, 1.0, 0],
    [300, 1.02, 0],
  ]);

  const tr1 = useTransition(st.motion.defaultTransition, f, T1, W, H, p);
  const tr2 = useTransition(st.motion.defaultTransition, f, T2, W, H, p);

  const scene = (node: React.ReactNode, style: React.CSSProperties, key: string) => (
    <AbsoluteFill key={key} style={style}>
      {node}
    </AbsoluteFill>
  );
  const show1 = tr1.both ? f <= T1 + 9 : f < T1;
  const show2 = (tr1.both ? f >= T1 - 9 : f >= T1) && (tr2.both ? f <= T2 + 9 : f < T2);
  const show3 = tr2.both ? f >= T2 - 9 : f >= T2;

  const [esfx, evol, elen] = ENTRANCE_SFX[mode];
  const motif = MOTIFS[st.id];
  const tsfx = TRANS_SFX[st.motion.defaultTransition] ?? 'transition-swoosh';

  // #44: satu ruang 3D berkelanjutan selama 10 dtk (tanpa kartu judul/spec, tanpa transisi potong)
  if (st.id === 44) {
    return (
      <AbsoluteFill style={{ background: p.bg, overflow: 'hidden' }}>
        <Bedah44Scene c={c} t={f} globalStart={0} />
        <KaraokePillCaption words={bedah44Words()} stylePreset={st} fontSize={isV ? 46 : 36} maxWordsPerLine={isV ? 4 : 6} />
        <Audio src={staticFile(`music/${st.audio.backsound}.wav`)} volume={(fr) => 0.42 * ip(fr, [0, 10, 280, 300], [0, 1, 1, 0], (x) => x)} />
        {BEDAH44_SFX.map(([at, name, vol, len], i) => (
          <Sequence key={i} from={at} durationInFrames={len}>
            <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={vol} />
          </Sequence>
        ))}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: p.bg, overflow: 'hidden' }}>
      <ProceduralBackground stylePreset={st} driftSpeed={0.8} />
      <AbsoluteFill style={{ transform: `scale(${scale}) translateY(${ty}px)` }}>
        {show1 && scene(<SceneTitle c={c} t={qf} mode={mode} textCol={textCol} />, tr1.both ? tr1.outStyle : {}, 's1')}
        {show2 &&
          scene(
            <SceneMotif c={c} t={Math.max(0, qf - S2_START)} textCol={textCol} />,
            { ...(tr1.both && f <= T1 + 9 ? tr1.inStyle : {}), ...(tr2.both && f >= T2 - 9 ? tr2.outStyle : {}) },
            's2'
          )}
        {show3 && scene(<SceneSpec c={c} t={Math.max(0, qf - S3_START)} textCol={textCol} />, tr2.both ? tr2.inStyle : {}, 's3')}
      </AbsoluteFill>
      {st.shape.hudFrame && <HudBrackets c={c} t={f} inset={isV ? 40 : 36} />}
      {tr1.overlay}
      {tr2.overlay}
      {st.id === 44 ? (
        <KaraokePillCaption words={bedahWords(st)} stylePreset={st} fontSize={isV ? 46 : 36} maxWordsPerLine={isV ? 4 : 6} />
      ) : (
        <Caption c={c} f={f} />
      )}

      {/* ---- audio ---- */}
      <Audio src={staticFile(`music/${st.audio.backsound}.wav`)} volume={(fr) => 0.42 * ip(fr, [0, 10, 280, 300], [0, 1, 1, 0], (x) => x)} />
      <Sequence from={6} durationInFrames={elen ?? 60}>
        <Audio src={staticFile(`audio/sfx/${esfx}.wav`)} volume={evol} />
      </Sequence>
      {[T1, T2].map((T) => (
        <Sequence key={T} from={T - 9} durationInFrames={45}>
          <Audio src={staticFile(`audio/sfx/${tsfx}.wav`)} volume={0.65} />
        </Sequence>
      ))}
      {motif.cues.map(([at, name, vol, len], i) => (
        <Sequence key={i} from={S2_START + at} durationInFrames={len ?? 60}>
          <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={vol ?? 0.6} />
        </Sequence>
      ))}
      <Sequence from={S3_START + 8} durationInFrames={60}>
        <Audio src={staticFile('audio/sfx/data-reveal.wav')} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
