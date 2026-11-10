/**
 * Tata letak diorama 3D + kamera + logika waktu aliran air.
 * Satuan dunia ~ meter diorama. Lantai y=0. Jaringan berjalan di bidang x=0 sepanjang sumbu z:
 * reservoir jauh & tinggi (z negatif), rumah pelanggan dekat & rendah (z positif).
 * Kamera berada di sisi +x atas, sehingga bidang potong [-1,0,0] membuang separuh pipa yang menghadap kamera.
 */
import { T } from './timeline';

export type V3 = [number, number, number];
export type CamKey = [number, number, number, number, number, number, number, number];

/* ---------------- jaringan ---------------- */
export const PIPE_R_OUT = 0.16;
export const PIPE_R_IN = 0.125;
export const DIST_R_OUT = 0.12;
export const DIST_R_IN = 0.092;

export const MAIN: V3[] = [
  [0, 2.62, -5.05], // A: keluar reservoir
  [0, 2.62, -3.5], // B
  [0, 1.2, -2.2], // C: titik rendah
  [0, 1.55, -1.45], // D: punuk (katup udara)
  [0, 0.36, -0.35], // E
  [0, 0.36, 0.7], // J: awal distribusi
];
export const DIST: V3[] = [
  [0, 0.36, 0.7],
  [0, 0.36, 5.3],
];

export const TANK = { z: -6.0, y: 2.4, r: 0.95, h: 1.3 };
export const GATE_Z = -4.3;
export const GATE_SCALE = 0.4;
export const HUMP: V3 = MAIN[3];
export const AIR_VALVE_TOP: V3 = [0, HUMP[1] + 0.72, HUMP[2]];
export const GAUGE_POS: V3 = [0, 0.98, 1.25];

export const HOUSE = { x: -1.4, z: 4.35, w: 1.4, d: 1.3, h: 1.15 };
export const NEIGHBOURS = [
  { x: -1.4, z: 1.75, w: 1.1, d: 1.0, h: 0.95, wall: '#F2E3C6', roof: '#B9543C' },
  { x: -1.4, z: 3.0, w: 1.1, d: 1.0, h: 0.95, wall: '#DDE8EF', roof: '#5E6B7A' },
];
export const HOUSE_CUT_X = -1.32;
export const SPOUT_TIP: V3 = [-1.74, 0.86, HOUSE.z];
export const SINK_Y = 0.6;

export function polyLen(p: V3[]) {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += dist(p[i - 1], p[i]);
  return L;
}
export function dist(a: V3, b: V3) {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}
export function pointAt(p: V3[], s: number): V3 {
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const l = dist(p[i - 1], p[i]);
    if (s <= acc + l || i === p.length - 1) {
      const t = Math.max(0, Math.min(1, (s - acc) / l));
      const a = p[i - 1];
      const b = p[i];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    acc += l;
  }
  return p[p.length - 1];
}
export function arcAtVertex(p: V3[], idx: number) {
  let acc = 0;
  for (let i = 1; i <= idx; i++) acc += dist(p[i - 1], p[i]);
  return acc;
}
export const MAIN_LEN = polyLen(MAIN);
export const DIST_LEN = polyLen(DIST);
export const COUPLING: V3 = pointAt(MAIN, arcAtVertex(MAIN, 1) + dist(MAIN[1], MAIN[2]) / 2);

/* ---------------- waktu (selaras narasi, jadwal di timeline.ts) ---------------- */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const span = (f: number, s: readonly [number, number]) => lin(f, s[0], s[1]);
const smooth = (t: number) => t * t * (3 - 2 * t);
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export type Seg = [number, number];
/** Air mulai tampil bersamaan dengan cutaway */
export const waterOpacityAt = (f: number) => smooth(span(f, T.cut));
/** Pembukaan katup: 1 = terbuka */
export const valveOpenAt = (f: number) =>
  f < T.valveOpen[0] ? 1 - smooth(span(f, T.valveClose)) : smooth(span(f, T.valveOpen));
/** Jarak busur katup gerbang di pipa utama. Hulu katup selalu penuh. */
export const GATE_S = GATE_Z - MAIN[0][2];
/** Bagian hilir katup yang berisi air (jarak busur di MAIN) */
export function mainSeg(f: number): Seg {
  const len = MAIN_LEN - GATE_S;
  if (f < T.recedeMain[0]) return [GATE_S, MAIN_LEN];
  if (f < T.fillMain[0]) return [GATE_S + smoother(span(f, T.recedeMain)) * len, MAIN_LEN];
  return [GATE_S, GATE_S + smoother(span(f, T.fillMain)) * len];
}
export function distSeg(f: number): Seg {
  if (f < T.recedeDist[0]) return [0, DIST_LEN];
  if (f < T.fillMain[0]) return [smoother(span(f, T.recedeDist)) * DIST_LEN, DIST_LEN];
  return [0, smoother(span(f, T.fillDist)) * DIST_LEN];
}
/** Muka air saat mengisi: [jaringan, jarak busur] untuk FlowArrow yang mengikuti air */
export function fillFront(f: number): { net: 'main' | 'dist'; s: number } {
  if (f < T.fillDist[0]) return { net: 'main', s: mainSeg(f)[1] };
  return { net: 'dist', s: distSeg(f)[1] };
}
export function pressureAt(f: number): number {
  if (f < T.cut[0]) return 0.04;
  if (f < T.recedeMain[0]) return 0.04 + 0.74 * span(f, T.cut);
  if (f < T.pressureUp[0]) return 0.78 * (1 - smoother(span(f, T.recedeMain)));
  return 0.78 * expoOut(span(f, T.pressureUp));
}
/** Kecepatan arus 0..1 (garis arus) */
export const flowOn = (f: number, startAfterRepair: number) =>
  f < T.valveOpen[0]
    ? span(f, T.flowLines) * (1 - span(f, [T.valveClose[0] + 12, T.valveClose[1]]))
    : lin(f, startAfterRepair, startAfterRepair + 20);
/** Bidang potong jaringan: 0 = utuh, 1 = terbelah di tengah */
export const cutAt = (f: number) => smooth(span(f, T.cut));
/** Keran: air mengalir lagi */
export const tapFlowAt = (f: number) => span(f, T.tapFlow);
export const sinkFillAt = (f: number) => smooth(span(f, T.sinkFill));

/* ---------------- kamera (C1 spline, tanpa shake) ---------------- */
type K7 = [number, number, number, number, number, number, number];
/** Kamera orbit: target, azimut (derajat dari +z ke +x), elevasi, jarak, fov */
function orbit(t: V3, az: number, el: number, d: number, fov: number): K7 {
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  return [t[0] + d * Math.cos(e) * Math.sin(a), t[1] + d * Math.sin(e), t[2] + d * Math.cos(e) * Math.cos(a), t[0], t[1], t[2], fov];
}
const TAP_T: V3 = [-1.75, 0.74, HOUSE.z];
const WIDE_T: V3 = [-0.7, 1.45, -0.1];
const TANK_T: V3 = [0, TANK.y + 0.6, TANK.z];
const VALVE_T: V3 = [0, 2.45, -3.6];
const HUMP_T: V3 = [0, 1.8, -1.45];
const GAUGE_T: V3 = [0, 0.9, 1.25];

export const POSE = {
  TAP: orbit(TAP_T, 65, 13, 3.8, 42),
  O: orbit(WIDE_T, 18, 32, 18.4, 44),
  TANK: orbit(TANK_T, 50, 24, 6.0, 42),
  VALVE: orbit(VALVE_T, 66, 28, 5.4, 42),
  HUMP: orbit(HUMP_T, 70, 18, 3.3, 42),
  GAUGE: orbit(GAUGE_T, 60, 12, 2.5, 42),
};
type PoseName = keyof typeof POSE;

/**
 * Kamera diam-gerak-diam. Tiap gerak dari satu pose diam ke pose diam berikutnya; dua key identik
 * berturut-turut membuat tangen nol, jadi gerak = smoothstep tanpa overshoot. Tidak ada zoom antarbagian:
 * semua bab lewat O.
 */
function moves(start: PoseName, list: [readonly [number, number], PoseName][]): CamKey[] {
  const keys: CamKey[] = [[0, ...POSE[start]]];
  let cur = start;
  for (const [[a, b], to] of list) {
    keys.push([a, ...POSE[cur]]);
    keys.push([b, ...POSE[to]]);
    cur = to;
  }
  keys.push([100000, ...POSE[cur]]);
  return keys;
}
export const CAM3D: CamKey[] = moves('TAP', [
  [T.camToO1, 'O'],
  [T.camToTank, 'TANK'],
  [T.camTankToO, 'O'],
  [T.camToValve, 'VALVE'],
  [T.camValveToO, 'O'],
  [T.camToHump, 'HUMP'],
  [T.camHumpToO, 'O'],
  [T.camToGauge, 'GAUGE'],
  [T.camGaugeToO, 'O'],
  [T.camToTap, 'TAP'],
  [T.camTapToO, 'O'],
]);
/** true saat kamera sedang bergerak (aturan satu penggerak per beat) */
export const camMoving = (f: number) =>
  [T.camToO1, T.camToTank, T.camTankToO, T.camToValve, T.camValveToO, T.camToHump, T.camHumpToO, T.camToGauge, T.camGaugeToO, T.camToTap, T.camTapToO].some(
    ([a, b]) => f > a && f < b,
  );
