/**
 * Tata letak diorama 3D + kamera + logika waktu aliran air.
 * Satuan dunia ~ meter diorama. Lantai y=0. Jaringan berjalan di bidang x=0 sepanjang sumbu z:
 * reservoir jauh & tinggi (z negatif), rumah pelanggan dekat & rendah (z positif).
 * Kamera berada di sisi +x atas, sehingga bidang potong [-1,0,0] membuang separuh pipa yang menghadap kamera.
 */
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

/* ---------------- waktu (selaras narasi) ---------------- */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export type Seg = [number, number];
/** Air mulai tampil (adegan pembuka belum ada air di jaringan) */
export const waterOpacityAt = (f: number) => lin(f, 188, 212);
/** Pembukaan katup: 1 = terbuka */
export const valveOpenAt = (f: number) => (f < 600 ? 1 - smooth(lin(f, 538, 562)) : smooth(lin(f, 632, 664)));
/** Jarak busur katup gerbang di pipa utama. Hulu katup selalu penuh. */
export const GATE_S = GATE_Z - MAIN[0][2];
/** Bagian hilir katup yang berisi air (jarak busur di MAIN) */
export function mainSeg(f: number): Seg {
  const span = MAIN_LEN - GATE_S;
  if (f < 545) return [GATE_S, MAIN_LEN];
  if (f < 640) return [GATE_S + smoother(lin(f, 545, 602)) * span, MAIN_LEN];
  return [GATE_S, GATE_S + smoother(lin(f, 640, 722)) * span];
}
export function distSeg(f: number): Seg {
  if (f < 545) return [0, DIST_LEN];
  if (f < 640) return [smoother(lin(f, 555, 612)) * DIST_LEN, DIST_LEN];
  return [0, smoother(lin(f, 722, 806)) * DIST_LEN];
}
export function pressureAt(f: number): number {
  if (f < 190) return 0.04;
  if (f < 545) return 0.04 + 0.74 * lin(f, 190, 214);
  if (f < 1090) return 0.78 * (1 - smoother(lin(f, 545, 605)));
  return 0.78 * expoOut(lin(f, 1090, 1150));
}
/** Kecepatan arus 0..1 (garis arus) */
export const flowOn = (f: number, startAfterRepair: number) =>
  f < 600 ? lin(f, 212, 232) * (1 - lin(f, 528, 545)) : lin(f, startAfterRepair, startAfterRepair + 20);
/** Bidang potong jaringan: 0 = utuh, 1 = terbelah di tengah */
export const cutAt = (f: number) => smooth(lin(f, 200, 222));
/** Keran: air mengalir lagi */
export const tapFlowAt = (f: number) => lin(f, 1170, 1180);
export const sinkFillAt = (f: number) => smooth(lin(f, 1180, 1240));

/* ---------------- kamera (C1 spline, tanpa shake) ---------------- */
type K7 = [number, number, number, number, number, number, number];
/** Kamera orbit: target, azimut (derajat dari +z ke +x), elevasi, jarak, fov */
function orbit(t: V3, az: number, el: number, d: number, fov: number): K7 {
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  return [t[0] + d * Math.cos(e) * Math.sin(a), t[1] + d * Math.sin(e), t[2] + d * Math.cos(e) * Math.cos(a), t[0], t[1], t[2], fov];
}
const lerpK = (a: K7, b: K7, t: number) => a.map((v, i) => v + (b[i] - v) * t) as K7;
/** Satu shot = dua waypoint + dua waypoint peredam, supaya spline tidak overshoot di dalam shot */
function shot(f0: number, f1: number, a: K7, b: K7): CamKey[] {
  const pad = Math.min(12, (f1 - f0) / 4);
  return [
    [f0, ...a],
    [f0 + pad, ...lerpK(a, b, pad / (f1 - f0))],
    [f1 - pad, ...lerpK(a, b, 1 - pad / (f1 - f0))],
    [f1, ...b],
  ];
}
const TAP_T: V3 = [-1.75, 0.74, HOUSE.z];
const WIDE_T: V3 = [-1.2, 1.45, -0.1];
const VALVE_T: V3 = [0, 2.45, -3.6];
const HUMP_T: V3 = [0, 1.8, -1.45];
const GAUGE_T: V3 = [0, 0.9, 1.25];
const FOLLOW_T: V3 = [-1.0, 0.6, 2.0];
export const CAM3D: CamKey[] = [
  ...shot(0, 148, orbit(TAP_T, 66, 13, 4.0, 42), orbit(TAP_T, 64, 13, 3.7, 42)),
  ...shot(205, 496, orbit(WIDE_T, 24, 32, 18.4, 44), orbit(WIDE_T, 20, 32, 17.8, 44)),
  ...shot(532, 646, orbit(VALVE_T, 68, 28, 5.6, 42), orbit(VALVE_T, 63, 28, 5.2, 42)),
  [705, ...orbit([0, 1.1, -0.4], 40, 42, 10.0, 44)],
  ...shot(758, 816, orbit(FOLLOW_T, 28, 50, 13.2, 44), orbit(FOLLOW_T, 25, 50, 12.6, 44)),
  ...shot(852, 1062, orbit(HUMP_T, 72, 18, 3.4, 42), orbit(HUMP_T, 66, 18, 3.1, 42)),
  ...shot(1096, 1140, orbit(GAUGE_T, 60, 12, 2.6, 42), orbit(GAUGE_T, 58, 12, 2.4, 42)),
  ...shot(1170, 1216, orbit(TAP_T, 66, 13, 3.9, 42), orbit(TAP_T, 64, 13, 3.7, 42)),
  ...shot(1256, 1885, orbit(WIDE_T, 24, 32, 18.4, 44), orbit(WIDE_T, 16, 33, 18.8, 44)),
];
