import { Easing, interpolate, spring } from 'remotion';
import type { MotionStylePreset } from './theme/styles-catalog';
import { SPRING_PRESETS } from './theme/easing-and-timing';

export interface Ctx {
  st: MotionStylePreset;
  p: MotionStylePreset['palette'];
  /** frame lokal scene (sudah dikuantisasi untuk gaya stop-motion) */
  t: number;
  fps: number;
  fH: string;
  fB: string;
  fM: string;
  hw: number;
  W: number;
  H: number;
  isV: boolean;
}

export const EO = Easing.bezier(0.16, 1, 0.3, 1);
export const EIO = Easing.bezier(0.45, 0, 0.15, 1);

export const ip = (t: number, i: number[], o: number[], easing: (n: number) => number = EO) =>
  interpolate(t, i, o, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

export const sp = (t: number, start: number, st: MotionStylePreset, fps = 30) =>
  spring({ frame: t - start, fps, config: SPRING_PRESETS[st.motion.springPreset] });

/** stroke draw-on: pakai pathLength=1 */
export const drawOn = (prog: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - prog });

export function rng(seed: number) {
  let a = seed | 0 || 1;
  return () => {
    let x = (a += 0x6d2b79f5);
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&/<>';
export function scramble(text: string, prog: number, t: number) {
  const n = Math.floor(text.length * prog);
  return text
    .split('')
    .map((ch, i) => (i < n || ch === ' ' ? ch : GLYPHS[(i * 7 + t * 3) % GLYPHS.length]))
    .join('');
}

/** jalur tangan (wobble) dari titik-titik, dengan seed per "boil" */
export function wobble(pts: [number, number][], seed: number, amp = 4, closed = false) {
  const r = rng(seed);
  const q = pts.map(([x, y]) => [x + (r() - 0.5) * amp, y + (r() - 0.5) * amp]);
  let d = `M${q[0][0].toFixed(1)},${q[0][1].toFixed(1)}`;
  for (let i = 1; i < q.length; i++) {
    const [x0, y0] = q[i - 1];
    const [x1, y1] = q[i];
    d += ` Q${x0.toFixed(1)},${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)},${((y0 + y1) / 2).toFixed(1)}`;
  }
  const last = q[q.length - 1];
  d += ` L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
  if (closed) d += ' Z';
  return d;
}

export function circlePts(cx: number, cy: number, r: number, n = 24, rx = r): [number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * r] as [number, number];
  });
}

/* ---------- kontras warna ---------- */
const lum = (hex: string) => {
  const h = hex.replace('#', '');
  const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
/** pilih warna teks paling kontras di atas `bg` dari kandidat palet */
export const onColor = (bg: string, cands: string[]) =>
  cands.reduce((best, c) => (contrast(bg, c) > contrast(bg, best) ? c : best), cands[0]);

export const isDark = (hex: string) => lum(hex) < 0.2;
